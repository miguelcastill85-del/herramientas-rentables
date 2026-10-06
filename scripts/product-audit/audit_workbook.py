"""Independent source audit + adversarial recalculation and economic invariants.

Requires openpyxl and an installed soffice. No network, paid service or macros.
Usage: python audit_workbook.py WORKBOOK OUTPUT_DIRECTORY
"""
from pathlib import Path
import copy, hashlib, json, math, os, random, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import openpyxl
from openpyxl.formula import Tokenizer
from openpyxl.utils.cell import range_boundaries

def cycles(w):
    formulas={(s.title,c.coordinate):c.value for s in w for row in s for c in row if c.data_type=='f'}
    edges={k:set() for k in formulas}
    for key,formula in formulas.items():
        for t in Tokenizer(formula).items:
            if t.type!='OPERAND' or t.subtype!='RANGE': continue
            sn,ref=(t.value.rsplit('!',1) if '!' in t.value else (key[0],t.value))
            sn=sn.strip("'").replace("''", "'")
            if '[' in sn: raise AssertionError('External workbook reference')
            try: x1,y1,x2,y2=range_boundaries(ref.replace('$',''))
            except ValueError: continue
            if None in (x1,y1,x2,y2): continue
            for row in w[sn].iter_rows(min_row=y1,max_row=y2,min_col=x1,max_col=x2):
                for c in row:
                    if (sn,c.coordinate) in formulas: edges[key].add((sn,c.coordinate))
    state={}; path=[]; found=[]
    def visit(k):
        if state.get(k)==1:
            found.append(path[path.index(k):]+[k]); return
        if state.get(k)==2:return
        state[k]=1;path.append(k)
        for n in edges[k]:visit(n)
        path.pop();state[k]=2
    for k in edges:visit(k)
    return found

def calculation_cells(w):
    """Every formula and every cell referenced by one, including range inputs.
    Cosmetic copy/layout changes may reuse results; business inputs may not.
    """
    relevant=set()
    for s in w:
        for row in s:
            for c in row:
                if c.data_type!='f':continue
                relevant.add((s.title,c.coordinate))
                for t in Tokenizer(c.value).items:
                    if t.type!='OPERAND' or t.subtype!='RANGE':continue
                    sn,ref=(t.value.rsplit('!',1) if '!' in t.value else (s.title,t.value))
                    sn=sn.strip("'").replace("''", "'")
                    try:x1,y1,x2,y2=range_boundaries(ref.replace('$',''))
                    except ValueError:continue
                    if None in (x1,y1,x2,y2):continue
                    for rr in w[sn].iter_rows(min_row=y1,max_row=y2,min_col=x1,max_col=x2):
                        for cc in rr:relevant.add((sn,cc.coordinate))
    return relevant

def audit(source,out):
    source=Path(source);out=Path(out);out.mkdir(parents=True,exist_ok=True)
    inputs=out/'inputs';results=out/'recalculated';inputs.mkdir(exist_ok=True);results.mkdir(exist_ok=True)
    w=openpyxl.load_workbook(source)
    receipt={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'engine':'LibreOffice headless XLSX recalculation; native Microsoft Excel not executed','formula_count':sum(c.data_type=='f' for s in w for row in s for c in row),'cycles':cycles(w),'cases':[],'checks':[]}
    def expect(name,condition,detail=None):
        receipt['checks'].append({'name':name,'pass':bool(condition),'detail':detail})
    expect('source has no circular formula dependency',not receipt['cycles'],receipt['cycles'])
    missing=[f'{c}{r}' for r in range(5,105) for c in ['L','M','N','O','P','Q','V','W','X','Y','Z','AA','AB'] if w['PROJECTS'][f'{c}{r}'].data_type!='f']
    expect('all 100 tracker rows have all 13 formulas',not missing,missing)
    expect('19 modules preserved',len(w.sheetnames)==19)
    expect('fresh defaults present',all(w['SETUP'][c].value is not None for c in ['B18','B19','B20','B22']))
    expect('calculation is automatic and iterative calculation disabled',w.calculation.calcMode=='auto' and not w.calculation.iterate)
    for s in w:
        expect(s.title+' has no overlapping merged regions', all(not (max(a.min_row,b.min_row)<=min(a.max_row,b.max_row) and max(a.min_col,b.min_col)<=min(a.max_col,b.max_col)) for i,a in enumerate(s.merged_cells.ranges) for b in list(s.merged_cells.ranges)[i+1:]))
    cases=[]
    def case(name,changes=None,kind=None):
        # Preserve every input/formula exactly. Presentation, charts and empty
        # styled cells are irrelevant to calculation and very slow in headless
        # export. A separate full-source recalculation checks the buyer file.
        clone=openpyxl.Workbook(); clone.remove(clone.active)
        for s in w:
            dest=clone.create_sheet(s.title)
            for row in s:
                for x in row:
                    if x.value is not None: dest[x.coordinate]=x.value
        clone.calculation=copy.copy(w.calculation)
        for sn,items in (changes or {}).items():
            for c,v in items.items(): clone[sn][c]=v
        path=inputs/(name+'.xlsx');clone.save(path)
        cases.append({'name':name,'kind':kind,'changes':changes or {}})
    case('baseline',kind='baseline')
    invalids=[('SETUP',c,v) for c,v in [('B6',-1),('B6',None),('B7','text'),('B8',.7),('B12',0),('B12',1.1),('B26',0),('B22',0),('B22',2.5),('B23',.5),('B20','unknown')]]
    invalids += [('QUOTE BUILDER',c,v) for c,v in [('B8',-1),('B9','text'),('B17',-1),('B18',1),('B19',-1),('B21',1),('B23',1.2),('B24',-1),('B26',0),('B13','bad'),('B15','bad')]]
    invalids += [('SCENARIO LAB','B5',0),('OFFER ARCHITECT','C8',1),('NEGOTIATION LAB','B8',1.1),('SCOPE GUARD','B5',-1),('RATE BUILDER','B5',-1)]
    for i,(sn,c,v) in enumerate(invalids):case(f'invalid_{i:02}',{sn:{c:v}},'invalid')
    for name,budget in [('below',2500),('between',4500),('fit',5300)]:case('budget_'+name,{'QUOTE BUILDER':{'B24':budget}},'budget')
    case('scope_hours',{'SCOPE GUARD':{'B5':8}},'scope')
    case('scope_cost',{'SCOPE GUARD':{'B9':5000}},'scope')
    case('scope_none',kind='scope')
    case('zero_revenue',{'PROJECTS':{'D5':'Web Design','E5':'Completed','G5':20,'H5':3000,'I5':20,'J5':0,'K5':0,'S5':0,'T5':0,'U5':0}},'project')
    case('hidden_only_actual',{'PROJECTS':{'D5':'Web Design','E5':'Completed','G5':0,'H5':3000,'I5':0,'J5':0,'K5':2000,'S5':20,'T5':20,'U5':0}},'project')
    mixed={}
    for r,rev in [(5,0),(6,2000)]:
        mixed.update({f'{c}{r}':v for c,v in {'D':'Web Design','E':'Completed','G':20,'H':3000,'I':20,'J':0,'K':rev,'S':0,'T':0,'U':0}.items()})
    mixed.update({'D7':'Web Design','E7':'Completed'})
    case('mixed_history',{'PROJECTS':mixed},'project')
    history={}
    for r in range(5,105):
        vals={'D':'Web Design','E':'Completed','G':20,'H':5000,'I':25,'J':50,'K':4000+r,'S':5,'T':7,'U':30}
        history.update({f'{c}{r}':v for c,v in vals.items()})
    case('all_100_rows',{'PROJECTS':history},'project')
    case('benchmark_filter',{'MARKET BENCHMARK':{'H6':'2026-10-06','I6':'https://example.org/a','J6':'Graphic Design','K6':100,'H7':'2026-10-06','I7':'https://example.org/b','J7':'Graphic Design','K7':-90,'J8':'Graphic Design','K8':900}},'benchmark')
    case('currency_fx',{'SETUP':{'B25':'CLP','B26':900}},'fx')
    case('discount_below_floor',{'QUOTE BUILDER':{'B22':.3}},'discount')
    case('multiplier_offer',{'QUOTE BUILDER':{'B26':1.5}},'multiplier')
    rng=random.Random(20261006)
    for i in range(24):
        vals={'B8':rng.uniform(10,120),'B9':1,'B10':1,'B11':1,'B12':0,'B17':rng.uniform(0,5000),'B18':rng.uniform(0,.75),'B19':rng.uniform(0,15),'B20':rng.uniform(0,.8),'B21':rng.uniform(0,.8),'B22':0,'B23':rng.uniform(0,1),'B26':rng.uniform(1,3)}
        case(f'economics_{i:02}',{'QUOTE BUILDER':vals},'invariants')
    # Resume complete results only when every input/formula matches this run.
    # LibreOffice expands the equivalent FALSE literal to FALSE().
    def equivalent(a,b):
        if isinstance(a,(int,float)) and isinstance(b,(int,float)):
            # Excel-compatible engines store 15 significant decimal digits.
            return math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-12)
        def normal(v):
            return re.sub(r'\b(TRUE|FALSE)\(\)',r'\1',v) if isinstance(v,str) and v.startswith('=') else v
        return normal(a)==normal(b)
    referenced=calculation_cells(w)
    def reusable(c):
        rp=results/(c['name']+'.xlsx')
        if not rp.exists():return False
        try:
            rw=openpyxl.load_workbook(rp)
            iw=openpyxl.load_workbook(inputs/(c['name']+'.xlsx'))
            relevant=referenced | {(sn,cell) for sn,items in c['changes'].items() for cell in items}
            return iw.sheetnames==rw.sheetnames and all(equivalent(iw[sn][cell].value,rw[sn][cell].value) for sn,cell in relevant)
        except Exception:return False
    pending=[c for c in cases if not reusable(c)]
    receipt['reuse_policy']='Every formula and referenced input is equal; numeric inputs within 1e-12 relative/absolute tolerance. Presentation-only changes excluded.'
    receipt['reused_cases']=len(cases)-len(pending)
    (out/'run_manifest.json').write_text(json.dumps({'source_sha256':receipt['source_sha256'],'cases':cases,'reused':len(cases)-len(pending)},indent=2))
    print(f"Reusing {len(cases)-len(pending)} verified results; recalculating {len(pending)} cases",flush=True)
    # Independent workers. A fresh process for each workbook bounds memory
    # accumulation in the headless engine across many adversarial scenarios.
    workers=int(os.environ.get('PRODUCT_AUDIT_WORKERS','1'))
    assert 1<=workers<=2
    batches=[pending[i::workers] for i in range(workers)]
    def calculate(i,batch):
        if not batch:return i,0,''
        logs=[];code=0
        for c in batch:
            stage=out/'staging'/c['name'];stage.mkdir(parents=True,exist_ok=True)
            staged=stage/(c['name']+'.xlsx')
            if staged.exists():staged.unlink()
            command=['soffice',f'-env:UserInstallation=file://{out.resolve()}/lo-profile-case-{i}','--headless','--convert-to','xlsx','--outdir',str(stage),str(inputs/(c['name']+'.xlsx'))]
            p=subprocess.run(command,capture_output=True,text=True,timeout=180)
            logs.append(p.stdout+'\n'+p.stderr)
            result_code=p.returncode
            if result_code==0:
                try:
                    openpyxl.load_workbook(staged).close()
                    staged.replace(results/staged.name)
                except Exception:result_code=1
            if result_code:code=result_code
            (out/f'engine-{i}.log').write_text('\n'.join(logs))
            print(f"Recalculated {c['name']} (worker {i}, code {result_code})",flush=True)
        log='\n'.join(logs)
        (out/f'engine-{i}.log').write_text(log)
        return i,code,log
    logs=[]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for task in as_completed([pool.submit(calculate,i,b) for i,b in enumerate(batches)]):
            i,code,log=task.result();logs.append(log)
            expect(f'calculation worker {i} succeeded',code==0)
            print(f'Calculation worker {i} completed with code {code}',flush=True)
    (out/'engine.log').write_text('\n'.join(logs))
    for c in cases:
        rp=results/(c['name']+'.xlsx')
        if not rp.exists(): expect(c['name']+' recalculation produced a file',False);continue
        d=openpyxl.load_workbook(rp,data_only=True)
        errors=[(s.title,x.coordinate,x.value) for s in d for row in s for x in row if x.data_type=='e']
        expect(c['name']+' has no formula errors',not errors,errors)
        health=d['SYSTEM CHECK']['B19'].value; decision=d['DECISION CENTER']['B16'].value
        receipt['cases'].append({**c,'model_health':health,'decision':decision,'error_count':len(errors)})
        q=d['QUOTE BUILDER']; s=d['SCOPE GUARD']; cal=d['CALIBRATION ENGINE']
        if c['kind']=='invalid':
            expect(c['name']+' blocks client readiness',health=='FAIL' and decision=='STOP',(health,decision))
        if c['kind'] in ['baseline','invariants']:
            expect(c['name']+' structural model passes',health=='PASS')
            price=q['E14'].value;net=price*(1-q['B18'].value)-q['B19'].value;cost=q['E12'].value
            expect(c['name']+' target meets selected net margin',math.isclose((net-cost)/net,q['B21'].value,abs_tol=1e-9))
            floor_net=q['E13'].value*(1-q['B18'].value)-q['B19'].value
            expect(c['name']+' walk-away covers protected costs',math.isclose(floor_net,cost,rel_tol=1e-9))
            discounted=price*(1-q['E17'].value)
            expect(c['name']+' maximum safe discount meets floor',math.isclose(discounted,q['E13'].value,rel_tol=1e-9))
            expect(c['name']+' deposit plus balance equals price',math.isclose(q['E19'].value+q['E20'].value,q['E15'].value,rel_tol=1e-9))
        if c['name']=='baseline':expect('default release decision is GO',decision=='GO')
        if c['kind']=='budget':expect(c['name']+' returns correct verdict',q['E24'].value=={'budget_below':'WALK AWAY','budget_between':'NEGOTIATE','budget_fit':'FIT'}[c['name']])
        if c['name']=='scope_cost':expect('cost-only change reduces effective rate and cannot be absorbed',s['E13'].value<s['E12'].value and s['E16'].value=='DO NOT ABSORB')
        if c['name']=='scope_hours':expect('hours-only change has positive fee',s['E10'].value>0)
        if c['name']=='scope_none':expect('no change has no fabricated fee',s['E16'].value=='NO CHANGE' and s['E10'].value in (None,''))
        if c['name']=='zero_revenue':expect('first project retains zero revenue and shows underpricing',d['PROJECTS']['L5'].value==0 and d['PROJECTS']['Q5'].value=='UNDERPRICED')
        if c['name']=='hidden_only_actual':expect('hidden-hours-only project still calculates rate',d['PROJECTS']['L5'].value==100)
        if c['name']=='mixed_history':
            expect('zero rate is included and incomplete rows excluded from average',d['DASHBOARD']['B8'].value==50)
            expect('confidence counts usable hours only',cal['J5'].value==2 and cal['H5'].value=='LOW')
        if c['name']=='all_100_rows':
            for r in range(5,105):expect(f'tracker row {r} independently calculated',math.isclose(d['PROJECTS'][f'L{r}'].value,(4000+r-30-50)/32,rel_tol=1e-9))
            expect('full history sample count',cal['J5'].value==100 and cal['H5'].value=='HIGH')
        if c['name']=='benchmark_filter':expect('custom benchmark excludes negative and unsourced rows',d['MARKET BENCHMARK']['E9'].value==100)
        if c['name']=='currency_fx':expect('USD benchmark converts to requested workbook currency',d['MARKET BENCHMARK']['E7'].value==22500)
        if c['name']=='discount_below_floor':expect('underpricing causes STOP',q['E26'].value=='UNDERPRICED' and decision=='STOP')
        if c['name']=='multiplier_offer':expect('recommended offer preserves calibrated hours',math.isclose(d['OFFER ARCHITECT']['C17'].value,q['E5'].value,rel_tol=1e-9))
    receipt['passed']=sum(x['pass'] for x in receipt['checks']);receipt['failed']=sum(not x['pass'] for x in receipt['checks'])
    receipt['status']='PASS' if receipt['failed']==0 else 'FAIL'
    (out/'receipt.json').write_text(json.dumps(receipt,indent=2))
    print(json.dumps({'status':receipt['status'],'cases':len(cases),'passed':receipt['passed'],'failed':receipt['failed'],'failures':[x for x in receipt['checks'] if not x['pass']]}))
    return receipt['failed']

if __name__=='__main__':sys.exit(bool(audit(sys.argv[1],sys.argv[2])))
