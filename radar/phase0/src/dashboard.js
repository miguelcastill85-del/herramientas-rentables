export function radarDashboard() {
  const html = `<!doctype html>
<html lang="es-CL">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Radar de Compras Ágiles | Herramientas Rentables</title>
  <style>
    :root{--ink:#132a24;--muted:#5f6f69;--line:#dfe7e3;--paper:#f7faf8;--card:#fff;--accent:#1d6b52;--soft:#e9f3ef;--warn:#8a5a12}
    *{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--paper);color:var(--ink)}
    a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:28px 0 48px}.top{display:flex;gap:18px;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.eyebrow{margin:0 0 6px;color:var(--accent);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.top h1{margin:0;font-size:clamp(30px,5vw,50px);line-height:1.05}.lead{max-width:760px;color:var(--muted);margin:12px 0 0}.status{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);padding:8px 12px;border-radius:999px;font-size:13px;font-weight:750;white-space:nowrap}.dot{width:9px;height:9px;border-radius:50%;background:#2a9d68}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}.metric,.panel,.opportunity{background:var(--card);border:1px solid var(--line);border-radius:18px}.metric{padding:18px}.metric span{display:block;color:var(--muted);font-size:13px}.metric strong{display:block;margin-top:5px;font-size:22px}.grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,.75fr);gap:18px}.panel{padding:20px}.panel h2{margin:0 0 6px;font-size:21px}.panel-note{margin:0 0 16px;color:var(--muted);font-size:14px}.list{display:grid;gap:12px}.opportunity{padding:17px}.opportunity-head{display:flex;gap:12px;justify-content:space-between}.code{font-size:12px;font-weight:800;color:var(--accent);letter-spacing:.04em}.opportunity h3{margin:5px 0 8px;font-size:18px}.meta{display:flex;flex-wrap:wrap;gap:7px;color:var(--muted);font-size:13px}.pill{display:inline-flex;padding:4px 8px;border-radius:999px;background:var(--soft);color:var(--accent);font-weight:750;font-size:12px}.pill.secondary{background:#f6efe4;color:var(--warn)}.searches{display:grid;gap:9px}.searches a{display:block;padding:12px;border-radius:12px;background:var(--soft);text-decoration:none;font-weight:750}.categories{display:grid;gap:9px}.category{display:grid;grid-template-columns:1fr auto;gap:10px;padding-bottom:9px;border-bottom:1px solid var(--line)}.category:last-child{border-bottom:0}.empty{padding:18px;border:1px dashed var(--line);border-radius:14px;color:var(--muted)}.error{padding:14px;border-radius:12px;background:#fff0ef;color:#7a2520}.footer{margin-top:18px;color:var(--muted);font-size:12px}.refresh{border:0;border-radius:12px;background:var(--ink);color:white;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer}@media(max-width:760px){.top{display:block}.status{margin-top:14px}.metrics{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.shell{width:min(100% - 22px,1120px);padding-top:20px}}
  </style>
</head>
<body>
  <main class="shell">
    <div class="top">
      <div><p class="eyebrow">Herramientas Rentables</p><h1>Radar de Compras Ágiles</h1><p class="lead">Canastas de ferretería y mantenimiento priorizadas por presupuesto, relevancia y competencia. Rango objetivo: $300.000–$3.000.000 CLP.</p></div>
      <div><span class="status"><span class="dot"></span><span id="mode">Cargando Radar…</span></span><br/><button class="refresh" id="refresh" type="button">Actualizar</button></div>
    </div>
    <section class="metrics" aria-label="Resumen"><div class="metric"><span>Oportunidades visibles</span><strong id="total">—</strong></div><div class="metric"><span>Rango objetivo</span><strong>$300 mil–$3 M</strong></div><div class="metric"><span>Fuente</span><strong id="source">Radar</strong></div></section>
    <div class="grid">
      <section class="panel"><h2>Oportunidades</h2><p class="panel-note" id="op-note">Buscando oportunidades recientes…</p><div class="list" id="opportunities"></div></section>
      <aside class="panel"><h2>Ranking histórico</h2><p class="panel-note">Categorías del histórico cargado en D1.</p><div class="categories" id="categories"></div></aside>
    </div>
    <p class="footer">Radar informativo. Verifica siempre especificaciones, anexos, plazos y condiciones en Mercado Público antes de tomar una decisión comercial.</p>
  </main>
<script>
const money = new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0});
const el = id => document.getElementById(id);
const safe = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
function bandLabel(band){return band==='objetivo'?'Objetivo':band==='secundario'?'Secundario':'Fuera de rango'}
function renderOpportunity(item){
  const budget=item.monto_disponible_clp?money.format(item.monto_disponible_clp):'Presupuesto no informado';
  const close=item.fecha_cierre?new Date(item.fecha_cierre).toLocaleString('es-CL'):'Cierre no informado';
  return '<article class="opportunity"><div class="opportunity-head"><div><span class="code">'+safe(item.codigo||'SIN CÓDIGO')+'</span><h3>'+safe(item.nombre||'Compra Ágil')+'</h3></div><span class="pill '+(item.ticket_band==='secundario'?'secondary':'')+'">'+safe(bandLabel(item.ticket_band))+'</span></div><div class="meta"><span>'+safe(budget)+'</span><span>•</span><span>'+safe(item.organismo||'Organismo no informado')+'</span><span>•</span><span>'+safe(item.region||'Región no informada')+'</span><span>•</span><span>Cierre '+safe(close)+'</span><span>•</span><span>Score '+safe(item.score??'—')+'</span></div></article>';
}
async function load(){
  el('mode').textContent='Actualizando…';el('opportunities').innerHTML='';el('categories').innerHTML='';
  try{
    const nonce=Date.now();
    const [liveRes,catRes]=await Promise.all([fetch('/api/opportunities/live?dashboard='+nonce,{cache:'no-store'}),fetch('/api/categories?dashboard='+nonce,{cache:'no-store'})]);
    if(!liveRes.ok||!catRes.ok) throw new Error('El Radar no respondió correctamente.');
    const live=await liveRes.json();const cats=await catRes.json();
    el('mode').textContent=live.mode==='api_v2'?'API Compra Ágil activa':'Búsqueda pública de respaldo';
    el('source').textContent=live.mode==='api_v2'?'API v2':'Fallback público';
    if(live.mode==='api_v2'){
      const items=Array.isArray(live.items)?live.items:[];el('total').textContent=String(items.length);el('op-note').textContent='Procesos publicados que coinciden con el foco del Radar.';
      el('opportunities').innerHTML=items.length?items.map(renderOpportunity).join(''):'<div class="empty">No hay oportunidades filtradas en este momento.</div>';
    }else{
      const searches=Array.isArray(live.searches)?live.searches:[];el('total').textContent=searches.length+' búsquedas';el('op-note').textContent='La API autenticada no está disponible; usa estos accesos oficiales del buscador público.';
      el('opportunities').innerHTML='<div class="searches">'+searches.map(s=>'<a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">Buscar '+safe(s.keyword)+' en Mercado Público ↗</a>').join('')+'</div>';
    }
    const rows=Array.isArray(cats.items)?cats.items.slice(0,10):[];
    el('categories').innerHTML=rows.length?rows.map(c=>'<div class="category"><span>'+safe(c.category||c.categoria||'Categoría')+'</span><strong>'+safe(c.opportunity_market_score??c.score??'—')+'</strong></div>').join(''):'<div class="empty">Sin ranking histórico disponible.</div>';
  }catch(error){el('mode').textContent='Radar temporalmente no disponible';el('total').textContent='—';el('opportunities').innerHTML='<div class="error">'+safe(error.message||error)+'</div>';el('categories').innerHTML='<div class="empty">Intenta actualizar en unos minutos.</div>'}
}
el('refresh').addEventListener('click',load);load();
</script>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}
