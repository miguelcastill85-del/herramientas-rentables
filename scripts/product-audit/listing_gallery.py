"""Render precise product listing diagrams from audited workbook outputs.

No synthetic screenshots or changes to old bitmaps. Creates new vector pages
and JPEG renders, with actual example values and the approved CLP price.
Usage: python listing_gallery.py AUDIT_DIRECTORY OUTPUT_DIRECTORY
"""
from pathlib import Path
import json, sys
import openpyxl, fitz
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import simpleSplit

NAVY='#102a3a';BLUE='#265b79';GREEN='#dfeeda';PALE='#edf4f8';INK='#1c3544'
def money(v):return f'{v:,.2f}' if isinstance(v,(int,float)) else str(v or 'No data')
def main(audit,out):
    audit=Path(audit);out=Path(out);out.mkdir(parents=True,exist_ok=True)
    assert json.loads((audit/'receipt.json').read_text())['status']=='PASS'
    w=openpyxl.load_workbook(audit/'recalculated/baseline.xlsx',data_only=True)
    q=w['QUOTE BUILDER'];d=w['DECISION CENTER'];o=w['OFFER ARCHITECT'];m=w['MARKET BENCHMARK']
    budget=[]
    for name in ['budget_below','budget_between','budget_fit']:
        s=openpyxl.load_workbook(audit/f'recalculated/{name}.xlsx',data_only=True)['QUOTE BUILDER']
        budget.append((f'Client budget {money(s["B24"].value)}',s['E24'].value))
    scope=openpyxl.load_workbook(audit/'recalculated/scope_cost.xlsx',data_only=True)['SCOPE GUARD']
    panels=[
      ('01_hero','Know what to charge before you send the quote.',
       'One connected Excel workflow for pricing, scope, negotiation and project learning.',
       ['Protected floor and target price','FIT / NEGOTIATE / WALK AWAY','Essential / Recommended / Premium','Scope Guard and historical calibration'],
       'DECISION CENTER / EXAMPLE',[(w['DECISION CENTER'][f'A{r}'].value,w['DECISION CENTER'][f'B{r}'].value) for r in [5,6,7,10,11,12]]+[('Client-ready decision',d['B16'].value)]),
      ('02_workflow','Price the work people do not see.',
       'Include meetings, management, revisions and other hidden work before agreeing on a fee.',
       ['Start with your sustainable hourly floor','Add project costs and payment fees','Choose contingency and a net margin','Keep deposit and balance consistent'],
       'QUOTE BUILDER / USD EXAMPLE',[('Total planned hours',money(q['E5'].value)),('Hidden work hours',money(q['E6'].value)),('Protected floor',money(q['E13'].value)),('Target price',money(q['E14'].value)),('Deposit',money(q['E19'].value)),('Balance',money(q['E20'].value))]),
      ('03_budget_decision','A budget is a decision, not just a number.',
       'Compare the client budget with the protected floor and target before accepting.',
       ['Below the floor: WALK AWAY','Between floor and target: NEGOTIATE','At or above target: FIT','Review the assumptions before sending'],
       'THREE REAL RECALCULATED EXAMPLES',budget+[('Protected floor (USD)',money(q['E13'].value)),('Target (USD)',money(q['E14'].value))]),
      ('04_discount_protection','Know how far a discount can go.',
       'Check the protected floor, fee-adjusted net margin and maximum safe discount together.',
       ['Payment fees are included in net proceeds','Discounts below the floor trigger STOP','A chosen margin is a planning assumption','No guaranteed profit or client acceptance'],
       'DISCOUNT PROTECTION / USD EXAMPLE',[('Target price',money(q['E14'].value)),('Protected floor',money(q['E13'].value)),('Maximum safe discount',f'{q["E17"].value:.2%}'),('Current net margin',f'{q["E18"].value:.2%}'),('Pricing signal',q['E26'].value)]),
      ('05_scope_guard','A change request has a cost.',
       'Additional hours and cash costs both affect your project economics.',
       ['Price a separate change fee','See effective-rate erosion','Costs-only changes are included','Review the actual payment fee plan'],
       'COSTS-ONLY SCOPE EXAMPLE / USD',[('Additional hours',money(scope['E5'].value)),('Additional external costs','5,000.00'),('Suggested change fee',money(scope['E10'].value)),('Rate before change',money(scope['E12'].value)),('Rate if absorbed',money(scope['E13'].value)),('Absorption verdict',scope['E16'].value)]),
      ('06_offer_architect','Give the client clear options.',
       'Plan three scopes with their own hours, costs, margin and price.',
       ['Essential / Recommended / Premium','Calibrated core and hidden hours','A client summary for PDF export','Keep internal assumptions private'],
       'OFFER ARCHITECT / USD EXAMPLE',[(o[f'{c}12'].value,money(o[f'{c}19'].value)) for c in 'BCD']+[('Client export','CLIENT SUMMARY only'),('Workbook sharing','Internal use')]),
      ('07_benchmark_learn','Use context. Learn from your own projects.',
       'Compare contextual references and improve estimates with usable completed-project records.',
       ['Nine global market reference categories','Add dated and sourced custom evidence','Track actual hours, collections and fees','Zero revenue counts; missing data does not'],
       'BENCHMARK AND CALIBRATION',[('Reference discipline',m['B5'].value),('Reference low (USD/hr)',money(m['E5'].value)),('Reference high (USD/hr)',money(m['E6'].value)),('Evidence context','Global historical contracts'),('Initial calibration','NO DATA'),('Records available','100 project rows')]),
      ('08_package','Everything in one download.',
       'A reusable business planning workbook with concise instructions and a purchaser license.',
       ['19 connected Excel workbook modules','9-page Quick Start PDF','Benchmark references and START HERE','Purchaser license and file manifest'],
       'PACKAGE / COMPATIBILITY',[('Workbook version','v2.2'),('File format','Microsoft Excel .xlsx'),('Content language','English'),('Macros / VBA','None'),('Product subscription','None'),('Google Sheets','Not validated'),('Native Excel UI test','Not completed')])
    ]
    pdf=out/'DP001_v2_2_Gallery.pdf';c=canvas.Canvas(str(pdf),pagesize=(1200,1000))
    c.setTitle('DP-FREELANCE-001 v2.2 - product listing gallery')
    def label(x,y,text,size=20,font='Helvetica',color=INK):
        c.setFillColor(colors.HexColor(color));c.setFont(font,size);c.drawString(x,y,str(text))
    for i,(_,title,lead,bullets,table_title,rows) in enumerate(panels):
        c.setFillColor(colors.HexColor('#f6f8fc'));c.rect(0,0,1200,1000,fill=1,stroke=0)
        c.setFillColor(colors.HexColor(NAVY));c.roundRect(48,915,515,48,12,fill=1,stroke=0)
        label(68,931,'HERRAMIENTAS RENTABLES',22,'Helvetica-Bold','#ffffff');label(1070,933,'v2.2',24,'Helvetica-Bold',NAVY)
        label(52,864,'FREELANCER PRICING INTELLIGENCE',18,'Helvetica-Bold',BLUE)
        y=808
        for line in simpleSplit(title,'Helvetica-Bold',39,520):label(52,y,line,39,'Helvetica-Bold',NAVY);y-=47
        y-=22
        for line in simpleSplit(lead,'Helvetica',23,514):label(52,y,line,23);y-=32
        y-=42
        c.setFillColor(colors.HexColor(GREEN));c.roundRect(48,y-13,520,48,12,fill=1,stroke=0)
        label(68,y+2,'INTRODUCTORY PRICE  CLP 19.990',23,'Helvetica-Bold','#235c40')
        y-=91
        for text in bullets:
            label(56,y,'+',25,'Helvetica-Bold','#235c40')
            for j,line in enumerate(simpleSplit(text,'Helvetica',21,470)):label(89,y-j*27,line,21)
            y-=54
        c.setFillColor(colors.white);c.setStrokeColor(colors.HexColor('#d8e2eb'));c.roundRect(620,230,526,633,18,fill=1,stroke=1)
        for j,line in enumerate(simpleSplit(table_title,'Helvetica-Bold',18,480)):label(643,825-j*25,line,18,'Helvetica-Bold',BLUE)
        ty=770
        for k,v in rows:
            c.setFillColor(colors.HexColor(PALE));c.roundRect(640,ty-47,487,68,8,fill=1,stroke=0)
            label(657,ty,k,17,'Helvetica',BLUE)
            for j,line in enumerate(simpleSplit(str(v),'Helvetica-Bold',25,451)):label(657,ty-34-j*26,line,25,'Helvetica-Bold',NAVY)
            ty-=78
        label(638,182,'Illustrative workbook outputs. Replace defaults.',16,'Helvetica',BLUE)
        c.setStrokeColor(colors.HexColor('#d8e2eb'));c.line(48,125,1150,125)
        label(52,88,'v2.2  /  ENGLISH  /  MICROSOFT EXCEL .xlsx',18,'Helvetica-Bold',NAVY)
        label(52,56,'No macros. No paid add-ins. Business planning; no guaranteed income.',16,'Helvetica',BLUE)
        label(1090,58,f'{i+1}/8',18,'Helvetica-Bold',BLUE);c.showPage()
    c.save()
    doc=fitz.open(pdf)
    for page,panel in zip(doc,panels):page.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(out/f'DP001_v2_2_{panel[0]}.jpg')
    print(json.dumps({'gallery_pdf':str(pdf),'images':[str(out/f'DP001_v2_2_{p[0]}.jpg') for p in panels]}))

if __name__=='__main__':main(*sys.argv[1:])
