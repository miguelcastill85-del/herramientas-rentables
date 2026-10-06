"""Repair the unreleased v2.1 package, preserving its layout and business model.

Usage: python patch_v2_2.py INPUT_XLSX OUTPUT_XLSX
The input identity is frozen. This is a patch, not a product regeneration.
"""
from pathlib import Path
from copy import copy
import hashlib
import sys
import openpyxl
from openpyxl.styles import Protection, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import TableColumn
from openpyxl.workbook.properties import CalcProperties
from openpyxl.cell.cell import MergedCell

BASE_SHA = "f82b410774891e9b3e63ef3876b8133a52e0886d4c5deff925d77d6bcfa66a8f"

def ready(conditions):
    return '=IFERROR(IF(AND(' + ','.join(conditions) + '),"READY","INPUT ERROR"),"INPUT ERROR")'

def gate(sheet, cells, status):
    for address in cells:
        c = sheet[address]
        if c.data_type == 'f':
            c.value = '=IFERROR(IF(' + status + '="READY",' + c.value[1:] + ',""),"")'

def bounds(cell, lo, hi=None):
    result = [f'ISNUMBER({cell})', f'{cell}>={lo}']
    if hi is not None: result.append(f'{cell}<={hi}')
    return result

def validation(sheet, address, kind='decimal', lo=0, hi=None, choices=None):
    kw = {'type':kind, 'allow_blank':False, 'showErrorMessage':True, 'errorStyle':'stop',
          'errorTitle':'Check input', 'error':'Use a valid value in the documented range.'}
    if kind == 'list': kw['formula1'] = '"' + choices + '"'
    else:
        kw.update(operator='between' if hi is not None else 'greaterThanOrEqual', formula1=str(lo))
        if hi is not None: kw['formula2'] = str(hi)
    dv = DataValidation(**kw); sheet.add_data_validation(dv); dv.add(address)

def patch(source, target):
    assert hashlib.sha256(Path(source).read_bytes()).hexdigest() == BASE_SHA
    w = openpyxl.load_workbook(source)
    setup = w['SETUP']; quote = w['QUOTE BUILDER']
    # Old decorative merges had erased several input/output cells. Restore cells,
    # not merely their cached values. Keep header/guide merges elsewhere intact.
    for sn, merged in {'SETUP':['A18:F18','A19:F22'], 'SYSTEM CHECK':['A20:F20'], 'CLIENT SUMMARY':['A16:H16','A17:H20']}.items():
        for area in merged: w[sn].unmerge_cells(area)
    w['EXAMPLE'].unmerge_cells('A27:H27')
    w['EXAMPLE']['B27']=.25
    w['EXAMPLE']['B27']._style=copy(w['EXAMPLE']['B26']._style)
    w['CLIENT SUMMARY'].merge_cells('A16:C16')
    w['CLIENT SUMMARY'].merge_cells('A17:C20')
    w['CLIENT SUMMARY'].merged_cells.ranges.remove(next(x for x in w['CLIENT SUMMARY'].merged_cells.ranges if str(x)=='D22:J22'))
    for key,c in list(w['CLIENT SUMMARY']._cells.items()):
        if isinstance(c,MergedCell) and c.row==22 and c.column>8: del w['CLIENT SUMMARY']._cells[key]
    for r in [16,17,18]:
        w['CLIENT SUMMARY'].merge_cells(f'D{r}:F{r}')
        w['CLIENT SUMMARY'].merge_cells(f'G{r}:H{r}')
    # Missing input anchors must be restored before any recalculation.
    for c,v in {'B18':0.07,'B19':0.3,'B20':'Graphic Design','B21':'Base','B22':3,'B24':'2.2'}.items(): setup[c]=v
    for r,label in {20:'Benchmark discipline',21:'Default scenario label',22:'Calibration minimum samples'}.items(): setup[f'A{r}']=label
    for r in range(18,23):
        setup[f'B{r}']._style=copy(setup['B17']._style)
        setup.row_dimensions[r].height=32
    setup['B19'].number_format='#,##0.00'
    for r in [20,21]: setup[f'B{r}'].number_format='General'
    setup['B22'].number_format='0'
    setup['A19']='Total fixed payment fees per project'
    setup['E17']='Total fixed payment charges expected for this project; sum charges across planned payments.'
    conditions = []
    for c,lo,hi in [('B6',0,None),('B7',0,None),('B8',0,.6),('B9',0,.4),('B10',0,20),('B11',1,80),('B12',.01,1),('B13',0,1),('B14',0,.8),('B15',0,1),('B16',0,1),('B17',0,1),('B18',0,.8),('B19',0,None),('B22',1,20),('B23',1,3)]:
        conditions += bounds(c,lo,hi)
    conditions += ['B6+B7>0','B8+B9<0.9','B22=INT(B22)','COUNTIF(\'MARKET BENCHMARK\'!A16:A24,B20)=1','B25<>""','ISNUMBER(B26)','B26>0']
    setup['E11']=ready(conditions)
    gate(setup,['E5','E6','E7','E8','E9','E10'],'E11')
    quote['A28']='Input status'
    conditions=['SETUP!E11="READY"','COUNT(B8:B12)=5','MIN(B8:B12)>=0','SUM(B8:B12)>0','OR(B13="Recommended",B13="Sustainable Floor",B13="Custom")','OR(B15="Standard",B15="Elevated",B15="High")','OR(B16="No",B16="Moderate",B16="Urgent")','OR(B13<>"Custom",B14>0)']
    for c,lo,hi in [('B14',0,None),('B17',0,None),('B18',0,.8),('B19',0,None),('B20',0,1),('B21',0,.8),('B22',0,1),('B23',0,1),('B24',0,None),('B25',0,1),('B26',1,3)]: conditions += bounds(c,lo,hi)
    quote['B28']=ready(conditions)
    quote['A19']='Total fixed payment fees per project'
    gate(quote,[f'E{r}' for r in range(5,26)],'B28')
    quote['E26']='=IF(B28<>"READY","INPUT ERROR",IF(E15<E13,"UNDERPRICED",IF(OR(E18<B21-0.005,E25="SCOPE RISK"),"REVIEW","HEALTHY")))'
    rate=w['RATE BUILDER']; rate['A12']='Input status'
    rate['B12']=ready(['SETUP!E11="READY"']+bounds('B5',0)+bounds('B6',.01,24)+bounds('B7',0,744)+bounds('B8',0,.5))
    gate(rate,[f'E{r}' for r in range(5,11)],'B12')
    rate['E11']='=IF(B12<>"READY","INPUT ERROR",IF(AND(B5>0,B5<E5),"UNDERPRICED",IF(AND(B5>0,B5<E6),"REVIEW","HEALTHY")))'
    scope=w['SCOPE GUARD']; scope['A12']='Input status'
    scope['B12']=ready(['\'QUOTE BUILDER\'!B28="READY"','COUNT(B5:B9)=5','MIN(B5:B9)>=0','OR(B10="No",B10="Moderate",B10="Urgent")'])
    scope['E8']='=IF(AND(E5=0,B9=0),"",((E5*E6*\'QUOTE BUILDER\'!E9*E7)+B9)*(1+\'QUOTE BUILDER\'!B20))'
    scope['E13']='=IF(AND(E5=0,B9=0),"",(\'QUOTE BUILDER\'!E16-\'QUOTE BUILDER\'!B17-B9)/(\'QUOTE BUILDER\'!E5+E5))'
    gate(scope,[f'E{r}' for r in range(5,16)],'B12')
    scope['E16']='=IF(B12<>"READY","INPUT ERROR",IF(AND(E5=0,B9=0),"NO CHANGE",IF(E13<SETUP!E9,"DO NOT ABSORB",IF(E13<SETUP!E10,"REVIEW","ABSORBABLE"))))'
    scope['H6']='Uses the original complexity, margin, contingency and fee assumptions. Fixed fees assume an additional charge; check your actual payment plan.'
    neg=w['NEGOTIATION LAB']; neg['A12']='Input status'
    neg['B12']=ready(['\'QUOTE BUILDER\'!B28="READY"']+bounds('B8',0,1))
    neg['B10']='=IFERROR(IF(\'QUOTE BUILDER\'!B28="READY",\'QUOTE BUILDER\'!E8*\'QUOTE BUILDER\'!E9*\'QUOTE BUILDER\'!E10,""),"")'
    gate(neg,[f'E{r}' for r in range(5,16)],'B12')
    neg['E16']='=IF(B12<>"READY","INPUT ERROR",IF(OR(E6="WALK AWAY",E8="WALK AWAY"),"WALK AWAY",IF(OR(E6="NEGOTIATE",E8="NEGOTIATE"),"NEGOTIATE",IF(AND(E6="NO PRESSURE",E8="NO BUDGET"),"NO PRESSURE","FIT"))))'
    offer=w['OFFER ARCHITECT']; offer['A15']='Input status'
    for col,scale in [('B',.8),('C',1),('D',1.15)]:
        offer[f'{col}5']=f"='QUOTE BUILDER'!B8*'QUOTE BUILDER'!B26*{scale}"
        offer[f'{col}6']=f'=IFERROR(IF(\'QUOTE BUILDER\'!B28="READY",\'QUOTE BUILDER\'!E6*{scale},""),"")'
        conditions=['\'QUOTE BUILDER\'!B28="READY"',f'COUNT({col}5:{col}11)=7',f'{col}5+{col}6>0']
        for r,lo,hi in [(5,0,None),(6,0,None),(7,0,None),(8,0,.8),(9,0,1),(10,0,.8),(11,0,None)]: conditions+=bounds(f'{col}{r}',lo,hi)
        offer[f'{col}15']=ready(conditions)
        gate(offer,[f'{col}{r}' for r in range(17,24)],f'{col}15')
        offer[f'{col}24']=f'=IF({col}15<>"READY","INPUT ERROR",IF({col}20<{col}18,"UNDERPRICED",IF({col}21<{col}8-0.005,"REVIEW","HEALTHY")))'
    scenario=w['SCENARIO LAB']; scenario['A13']='Input status'
    for col in 'BCD':
        conditions=['SETUP!E11="READY"','\'QUOTE BUILDER\'!B28="READY"']
        for r,lo,hi in [(5,.01,1),(6,0,1),(7,0,.8),(8,0,1),(9,.01,3),(10,0,.8),(11,0,None)]: conditions+=bounds(f'{col}{r}',lo,hi)
        scenario[f'{col}13']=ready(conditions)
        gate(scenario,[f'{col}{r}' for r in range(15,25)],f'{col}13')
    # Restore all 100 rows and use per-metric completeness flags. Zero cash is data.
    p=w['PROJECTS']
    for col,label in {'Y':'Usable estimate sample','Z':'Usable rate sample','AA':'Usable margin sample','AB':'Usable hidden-hours sample'}.items():
        p[f'{col}4']=label; p.column_dimensions[col].hidden=True
    for r in range(5,105):
        b=lambda c:f'{c}{r}'
        actual=f'AND(COUNT(I{r},T{r})=2,MIN(I{r},T{r})>=0,I{r}+T{r}>0)'
        estimate=f'AND(COUNT(G{r},S{r},I{r},T{r})=4,MIN(G{r},S{r},I{r},T{r})>=0,G{r}+S{r}>0)'
        cash=f'AND(COUNT(J{r},K{r},U{r})=3,MIN(J{r},K{r},U{r})>=0)'
        p[f'Y{r}']=f'=IFERROR(IF(AND(E{r}="Completed",{estimate}),1,0),0)'
        p[f'Z{r}']=f'=IFERROR(IF(AND(E{r}="Completed",{actual},{cash},SETUP!E11="READY"),1,0),0)'
        p[f'AA{r}']=f'=IF(AND(Z{r}=1,V{r}>0),1,0)'
        p[f'AB{r}']=f'=IFERROR(IF(AND(E{r}="Completed",COUNT(S{r},T{r})=2,S{r}>0,T{r}>=0),1,0),0)'
        p[f'V{r}']=f'=IFERROR(IF({cash},K{r}-U{r},""),"")'
        p[f'L{r}']=f'=IF(Z{r}=1,(V{r}-J{r})/(I{r}+T{r}),"")'
        p[f'M{r}']=f'=IF(Z{r}=1,V{r}-J{r}-(I{r}+T{r})*SETUP!$E$9,"")'
        p[f'N{r}']=f'=IF(AA{r}=1,M{r}/V{r},"")'
        p[f'O{r}']=f'=IF(Y{r}=1,(I{r}+T{r})/(G{r}+S{r})-1,"")'
        p[f'P{r}']=f'=IFERROR(IF(AND(ISNUMBER(H{r}),H{r}>0,ISNUMBER(K{r}),K{r}>=0),K{r}/H{r}-1,""),"")'
        p[f'W{r}']=f'=IF(AB{r}=1,T{r}/S{r}-1,"")'
        p[f'X{r}']=f'=IFERROR(IF(E{r}<>"Completed","",IF(AND(COUNT(S{r},T{r})=2,MIN(S{r},T{r})>=0),IF(T{r}>S{r}*(1+SETUP!$B$16),"LEAK","CONTROLLED"),"INCOMPLETE")),"INPUT ERROR")'
        numeric='OR('+','.join(f'AND(ISNUMBER({c}{r}),{c}{r}<0)' for c in ['G','H','I','J','K','S','T','U'])+')'
        p[f'Q{r}']=f'=IFERROR(IF(E{r}<>"Completed","",IF(OR({numeric},AND(COUNT(I{r},T{r})=2,I{r}+T{r}<=0)),"INPUT ERROR",IF(Z{r}=0,"INCOMPLETE",IF(OR(L{r}<SETUP!$E$9,M{r}<0),"UNDERPRICED",IF(L{r}<SETUP!$E$10,"REVIEW","HEALTHY"))))),"INPUT ERROR")'
        for col in ['L','M','N','O','P','Q']:
            p[f'{col}{r}']._style=copy(p[f'{col}8']._style)
    p['A2']='Enter explicit zero for no costs/fees/hidden hours. Missing values are incomplete evidence, never fabricated zero performance.'
    for table in p.tables.values():
        table.ref='A4:AB104'
        table.tableColumns=[TableColumn(id=i,name=str(p.cell(4,i).value)) for i in range(1,29)]
        if table.autoFilter: table.autoFilter.ref=table.ref
    ranges={c:f'PROJECTS!${c}$5:${c}$104' for c in ['D','E','H','I','L','N','O','Q','W','Y','Z','AA','AB']}
    def avg(metric, flag, service=None):
        criteria=f'{ranges[flag]},1'+(f',{ranges["D"]},{service}' if service else '')
        return f'=IFERROR(SUMIFS({ranges[metric]},{criteria})/COUNTIFS({criteria}),"")'
    memory=w['PRICING MEMORY']; cal=w['CALIBRATION ENGINE']
    for r in range(5,15):
        for col,metric,flag in [('C','H','Z'),('D','I','Z'),('E','O','Y'),('F','L','Z'),('G','N','AA'),('J','W','AB')]: memory[f'{col}{r}']=avg(metric,flag,f'A{r}')
        memory[f'H{r}']=f'=IF(E{r}="","",MAX(0,E{r}))'
        memory[f'I{r}']=f'=IF(F{r}="","NO DATA",IF(OR(F{r}<SETUP!$E$9,G{r}<0),"UNDERPRICED",IF(F{r}<SETUP!$E$10,"REVIEW","HEALTHY")))'
        memory[f'K{r}']=f'=IF(J{r}="","NO DATA",IF(J{r}>SETUP!$B$16,"SCOPE LEAK","CONTROLLED"))'
        cal[f'J{r}']=f'=COUNTIFS({ranges["D"]},A{r},{ranges["Y"]},1)'
        cal[f'K{r}']=f'=COUNTIFS({ranges["D"]},A{r},{ranges["Z"]},1)'
        for col,metric,flag in [('C','O','Y'),('D','W','AB'),('E','L','Z')]: cal[f'{col}{r}']=avg(metric,flag,f'A{r}')
        cal[f'F{r}']=f'=IF(K{r}=0,"",COUNTIFS({ranges["D"]},A{r},{ranges["Z"]},1,{ranges["Q"]},"UNDERPRICED")/K{r})'
        cal[f'G{r}']=f'=IF(J{r}<SETUP!$B$22,1,MIN(SETUP!$B$23,MAX(1,1+C{r})))'
        cal[f'H{r}']=f'=IF(J{r}=0,"NO DATA",IF(J{r}<SETUP!$B$22,"LOW",IF(J{r}<SETUP!$B$22*2,"MEDIUM","HIGH")))'
        cal[f'I{r}']=f'=IF(AND(J{r}=0,K{r}=0),"NO DATA",IF(F{r}>=0.34,"PRICING LEAK",IF(OR(C{r}>0.15,D{r}>SETUP!$B$16),"ESTIMATE LEAK","STABLE")))'
    cal['J4']='Usable hours samples'; cal['K4']='Usable rate samples'
    cal.column_dimensions['K'].width=21
    cal['A18']='Usable hours samples'; cal['B18']=f'=COUNTIF({ranges["Y"]},1)'
    cal['B19']=avg('O','Y'); cal['B20']=avg('W','AB'); cal['B21']=avg('L','Z')
    gate(cal,[f'G{r}' for r in range(5,15)]+['B22'],'SETUP!E11')
    for r in range(5,15):
        cal[f'H{r}']='=IF(SETUP!E11<>"READY","INPUT ERROR",'+cal[f'H{r}'].value[1:]+')'
    cal['B23']='=IF(SETUP!E11<>"READY","INPUT ERROR",'+cal['B23'].value[1:]+')'
    dash=w['DASHBOARD']; dash['B8']=avg('L','Z'); dash['E8']=avg('O','Y'); dash['H8']=avg('N','AA'); dash['B11']=avg('W','AB')
    dash['H11']='=IF(COUNTIFS(PROJECTS!E5:E104,"Completed",PROJECTS!Z5:Z104,1)=0,"",SUMIFS(PROJECTS!V5:V104,PROJECTS!E5:E104,"Completed",PROJECTS!Z5:Z104,1))'
    market=w['MARKET BENCHMARK']; market['O5']='Usable evidence'
    for r in range(6,16):
        market[f'O{r}']=f'=IFERROR(IF(AND(H{r}<>"",I{r}<>"",COUNTIF($A$16:$A$24,J{r})=1,ISNUMBER(K{r}),K{r}>0),1,0),0)'
    market['E9']='=IFERROR(SUMIFS($K$6:$K$15,$J$6:$J$15,B5,$O$6:$O$15,1)/COUNTIFS($J$6:$J$15,B5,$O$6:$O$15,1),"")'
    market['E12']='=IF(COUNTA(H6:N15)>0,IF(SUM(O6:O15)=0,"NO USABLE CUSTOM EVIDENCE",IF(E9="","REFERENCE ONLY","REFERENCE + CUSTOM EVIDENCE")),"REFERENCE ONLY")'
    market.column_dimensions['O'].hidden=True
    for r in range(16,25):
        market[f'D{r}']=str(market[f'D{r}'].value).rstrip('/')+'/'
        if r==18: market[f'D{r}']='https://www.upwork.com/hire/copywriters/cost/'
        market[f'E{r}']='2026-10-06'
    check=w['SYSTEM CHECK']
    check['B10']='=IF(AND(COUNTIF(\'SCENARIO LAB\'!B13:D13,"READY")=3,COUNT(\'SCENARIO LAB\'!B21:D21)=3,MIN(\'SCENARIO LAB\'!B21:D21)>0),"PASS","FAIL")'
    check['B11']='=IF(AND(COUNTIF(\'OFFER ARCHITECT\'!B15:D15,"READY")=3,COUNT(\'OFFER ARCHITECT\'!B19:D19)=3,MIN(\'OFFER ARCHITECT\'!B19:D19)>0),"PASS","FAIL")'
    check['B13']='=IF(AND(COUNT(\'CLIENT SUMMARY\'!B9)=1,\'CLIENT SUMMARY\'!B9>0),"PASS","FAIL")'
    check['A14']='Negotiation inputs'; check['B14']='=IF(\'NEGOTIATION LAB\'!B12="READY","PASS","FAIL")'
    check['C14']='Input readiness, independent of Decision Center; no circular dependency.'
    check['B15']='=IF(SETUP!B24="2.2","PASS","FAIL")'; check['C15']='Workbook must match v2.2 assets.'
    check['A17']='Rate inputs'; check['B17']='=IF(\'RATE BUILDER\'!B12="READY","PASS","FAIL")'
    check['A20']='Completed project records'; check['B20']='=IF(COUNTIF(PROJECTS!Q5:Q104,"INPUT ERROR")>0,"FAIL",IF(COUNTIF(PROJECTS!Q5:Q104,"INCOMPLETE")>0,"REVIEW","PASS"))'
    check['C20']='Incomplete records are excluded from affected metrics. Enter explicit zeros when appropriate.'
    check['B19']='=IF(COUNTIF(B5:B17,"FAIL")+COUNTIF(B20,"FAIL")>0,"FAIL","PASS")'
    decision=w['DECISION CENTER']; decision['B12']='=IF(COUNTIF(\'OFFER ARCHITECT\'!B24:D24,"INPUT ERROR")>0,"INPUT ERROR",IF(COUNTIF(\'OFFER ARCHITECT\'!B24:D24,"UNDERPRICED")>0,"REVIEW","HEALTHY"))'
    summary=w['CLIENT SUMMARY']; summary['B9']='=IF(\'QUOTE BUILDER\'!B28<>"READY","",IF(B8="Final Proposed",\'QUOTE BUILDER\'!E15,IF(B8="Premium",\'QUOTE BUILDER\'!E21,IF(B8="Target",\'QUOTE BUILDER\'!E14,""))))'
    summary['B10']='=IF(B9="","",B9*\'QUOTE BUILDER\'!B23)'; summary['B11']='=IF(B9="","",B9-B10)'
    summary['A14']='Currency'; summary['B14']='=SETUP!B25'
    # A comparison header without content was not a usable client output.
    for r,c in [(16,'B'),(17,'C'),(18,'D')]:
        summary[f'D{r}']=f"='OFFER ARCHITECT'!{c}12"
        summary[f'G{r}']=f"='OFFER ARCHITECT'!{c}19"
        summary[f'G{r}'].number_format='#,##0.00'
    # Replace overlapping intro merges with non-overlapping workflow rows.
    intro=w['START HERE']
    for merge in list(intro.merged_cells.ranges):
        if merge.min_row>=12 and merge.min_row<28: intro.merged_cells.ranges.remove(merge)
    for key,c in list(intro._cells.items()):
        if isinstance(c,MergedCell) and 12<=c.row<28: del intro._cells[key]
    for r,n,where,meaning in [(12,'PRESENT','CLIENT SUMMARY','Export only this sheet as PDF; never give clients the internal workbook.'),(13,'LEARN','PROJECTS + CALIBRATION ENGINE','Enter actual hours, collections and fees; incomplete records do not inflate confidence.')]:
        intro[f'B{r}']=n; intro[f'C{r}']=where; intro[f'D{r}']=meaning
    intro['B19']='Edit Lean / Base / Protected assumptions to compare capacity, hours, margin and payment fees.'
    intro['B23']='Input checks and independent engine health prevent invalid assumptions from appearing client-ready.'
    for r in [12,13]:
        for col in 'BCD':intro[f'{col}{r}']._style=copy(intro[f'{col}11']._style)
    intro['A16']='HOW THE MODULES WORK TOGETHER';intro.merge_cells('A16:G16')
    intro['A16']._style=copy(intro['A4']._style)
    for r in range(18,24):
        detail=intro[f'B{r}'].value
        intro[f'B{r}']=None;intro[f'D{r}']=detail
        intro.merge_cells(f'A{r}:C{r}');intro.merge_cells(f'D{r}:G{r}')
        intro[f'A{r}'].alignment=Alignment(horizontal='left',vertical='center',wrap_text=True)
        intro[f'D{r}'].alignment=Alignment(horizontal='left',vertical='center',wrap_text=True)
        intro[f'D{r}']._style=copy(intro['D11']._style)
        intro.row_dimensions[r].height=38
    intro['A24']='v2.2 audit repair: complete tracker formulas, independent input gates, valid historical samples, cost-only scope analysis and recalculation without circular dependencies.'
    intro.merge_cells('A24:G26'); intro['A24'].alignment=Alignment(wrap_text=True,vertical='top')
    for s in w:
        for row in s:
            for c in row:
                if isinstance(c.value,str) and c.data_type!='f': c.value=c.value.replace('v2.1','v2.2')
    # Rebuild validation on the actual current cells; inherited ranges were obsolete.
    disciplines=','.join(str(market[f'A{r}'].value) for r in range(16,25))
    for s in [setup,quote,rate,scope,neg,offer,scenario,p,market,summary]: s.data_validations.dataValidation=[]
    for c,lo,hi in [('B6',0,None),('B7',0,None),('B8',0,.6),('B9',0,.4),('B10',0,20),('B11',1,80),('B12',.01,1),('B13',0,1),('B14',0,.8),('B15',0,1),('B16',0,1),('B17',0,1),('B18',0,.8),('B19',0,None),('B23',1,3),('B26',.000001,None)]: validation(setup,c,lo=lo,hi=hi)
    validation(setup,'B22',kind='whole',lo=1,hi=20); validation(setup,'B20',kind='list',choices=disciplines)
    validation(setup,'B21',kind='list',choices='Lean,Base,Protected')
    validation(setup,'B25',kind='list',choices='USD,EUR,GBP,CAD,AUD,NZD,CLP,MXN,BRL,OTHER')
    for address in ['B8:B12','B14','B17','B19','B24']: validation(quote,address)
    for c,hi in [('B18',.8),('B20',1),('B21',.8),('B22',1),('B23',1),('B25',1)]: validation(quote,c,hi=hi)
    validation(quote,'B26',lo=1,hi=3)
    for address,options in [('B13','Recommended,Sustainable Floor,Custom'),('B15','Standard,Elevated,High'),('B16','No,Moderate,Urgent')]: validation(quote,address,kind='list',choices=options)
    for c,lo,hi in [('B5',0,None),('B6',.01,24),('B7',0,744),('B8',0,.5)]: validation(rate,c,lo=lo,hi=hi)
    validation(scope,'B5:B9'); validation(scope,'B10',kind='list',choices='No,Moderate,Urgent'); validation(neg,'B8',hi=1)
    for col in 'BCD':
        for row,lo,hi in [(5,.01,1),(6,0,1),(7,0,.8),(8,0,1),(9,.01,3),(10,0,.8),(11,0,None)]: validation(scenario,f'{col}{row}',lo=lo,hi=hi)
        for row,lo,hi in [(5,0,None),(6,0,None),(7,0,None),(8,0,.8),(9,0,1),(10,0,.8),(11,0,None)]: validation(offer,f'{col}{row}',lo=lo,hi=hi)
    validation(p,'E5:E104',kind='list',choices='Planned,Active,Completed,Cancelled')
    for col in ['G','H','I','J','K','S','T','U']: validation(p,f'{col}5:{col}104')
    validation(market,'B5',kind='list',choices=disciplines); validation(market,'J6:J15',kind='list',choices=disciplines)
    validation(market,'M6:M15',kind='list',choices='Low,Medium,High'); validation(market,'K6:K15',lo=.000001)
    validation(summary,'B8',kind='list',choices='Final Proposed,Target,Premium')
    editable={'SETUP':['B5:B23','B25:B26'],'RATE BUILDER':['B5:B8'],'QUOTE BUILDER':['B5:B26'],'PROJECTS':['A5:K104','R5:U104'], 'SCOPE GUARD':['B5:B10'],'CLIENT SUMMARY':['B8','B12:B13','A17','A23'],'MARKET BENCHMARK':['B5','H6:N15'],'SCENARIO LAB':['B5:D11'],'OFFER ARCHITECT':['B5:D13'],'NEGOTIATION LAB':['B8']}
    for s in w:
        for address in editable.get(s.title,[]):
            for row in s[address] if ':' in address else [[s[address]]]:
                for c in row: c.protection=Protection(locked=False)
        s.protection.sheet=True; s.protection.selectLockedCells=False; s.protection.selectUnlockedCells=False
    setup['B24'].protection=Protection(locked=True)
    w.calculation=CalcProperties(calcMode='auto',fullCalcOnLoad=True,forceFullCalc=True,iterate=False)
    for s in w:
        used=[c for row in s for c in row if c.value is not None]
        maxrow=max([c.row for c in used]+[m.max_row for m in s.merged_cells.ranges])
        maxcol=max([c.column for c in used]+[m.max_col for m in s.merged_cells.ranges])
        if s.title=='PROJECTS': maxcol=24
        if s.title=='MARKET BENCHMARK': maxcol=14
        s.print_area=f'A1:{openpyxl.utils.get_column_letter(maxcol)}{maxrow}'
        s.page_setup.orientation='landscape'; s.page_setup.paperSize=s.PAPERSIZE_A4
        s.page_setup.fitToWidth=1; s.page_setup.fitToHeight=0
        s.page_setup.scale=None
        s.sheet_properties.pageSetUpPr.fitToPage=True
    w['CLIENT SUMMARY'].page_setup.fitToHeight=1
    w['START HERE'].page_setup.fitToHeight=1
    w.save(target)
    print('PATCHED',target,hashlib.sha256(Path(target).read_bytes()).hexdigest())

if __name__=='__main__': patch(sys.argv[1],sys.argv[2])
