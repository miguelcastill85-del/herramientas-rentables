'use client';

import { useMemo, useRef, useState } from 'react';

type Category = 'Finanzas' | 'Marketing' | 'Ventas' | 'Operaciones';
type Filter = 'Todas' | Category;
type ToolId = 'margin' | 'break-even' | 'commissions' | 'utm' | 'estimate' | 'pricing';
type Complexity = 'low' | 'medium' | 'high';

type ToolDefinition = {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  category: Category;
  code: string;
};

const tools: ToolDefinition[] = [
  { id: 'margin', name: 'Calculadora de margen', shortName: 'Margen mensual', description: 'Conoce tu utilidad mensual, tus costos variables y el porcentaje real que conserva tu negocio.', category: 'Finanzas', code: '01' },
  { id: 'break-even', name: 'Punto de equilibrio', shortName: 'Punto de equilibrio', description: 'Calcula cuántas ventas y cuánta facturación necesitas para cubrir todos tus costos.', category: 'Finanzas', code: '02' },
  { id: 'commissions', name: 'Comparador de comisiones', shortName: 'Comparador de comisiones', description: 'Compara dos canales de cobro y descubre cuál deja más ingreso neto en tu negocio.', category: 'Ventas', code: '03' },
  { id: 'utm', name: 'Constructor de enlaces UTM', shortName: 'Constructor UTM', description: 'Crea enlaces de campaña válidos, ordenados y listos para copiar sin enviar datos a servidores.', category: 'Marketing', code: '04' },
  { id: 'estimate', name: 'Estimador de horas y cotización', shortName: 'Estimador de cotización', description: 'Convierte horas, tarifa, complejidad y contingencia en una cotización sostenible.', category: 'Operaciones', code: '05' },
  { id: 'pricing', name: 'Diagnóstico de precios', shortName: 'Diagnóstico de precios', description: 'Mide tu margen actual y calcula el precio necesario para alcanzar tu objetivo.', category: 'Ventas', code: '06' },
];

const categories: Filter[] = ['Todas', 'Finanzas', 'Marketing', 'Ventas', 'Operaciones'];
const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

function parseNumber(value: string) {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function NumberField({ id, label, value, onChange, prefix, suffix, min = 0, max, step = 'any', error, hint }: {
  id: string; label: string; value: string; onChange: (value: string) => void; prefix?: string; suffix?: string;
  min?: number; max?: number; step?: number | 'any'; error?: string; hint?: string;
}) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <label className="field-group" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className={`input-shell ${error ? 'has-error' : ''}`}>
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value}
          aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => onChange(event.target.value)} />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </span>
      {hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </label>
  );
}

function TextField({ id, label, value, onChange, type = 'text', placeholder, required, error }: {
  id: string; label: string; value: string; onChange: (value: string) => void; type?: 'text' | 'url';
  placeholder?: string; required?: boolean; error?: string;
}) {
  return (
    <label className="field-group" htmlFor={id}>
      <span className="field-label">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <span className={`input-shell text-input-shell ${error ? 'has-error' : ''}`}>
        <input id={id} type={type} inputMode={type === 'url' ? 'url' : 'text'} autoCapitalize="none" autoCorrect="off"
          spellCheck={false} placeholder={placeholder} value={value} required={required} aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.value)} />
      </span>
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </label>
  );
}

function ResultItem({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' }) {
  return <div className="result-item"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

function InvalidResult({ message = 'Corrige los campos marcados para obtener un resultado.' }: { message?: string }) {
  return <div className="validation-message" aria-live="polite" role="status">{message}</div>;
}

function MarginCalculator({ idPrefix, hero = false }: { idPrefix: string; hero?: boolean }) {
  const defaults = { sales: '2500000', fixed: '900000', variable: '12' };
  const [sales, setSales] = useState(defaults.sales);
  const [fixedCosts, setFixedCosts] = useState(defaults.fixed);
  const [variableRate, setVariableRate] = useState(defaults.variable);
  const salesValue = parseNumber(sales);
  const fixedValue = parseNumber(fixedCosts);
  const variableValue = parseNumber(variableRate);
  const salesError = salesValue === null || salesValue <= 0 ? 'Ingresa ventas mayores que cero.' : undefined;
  const fixedError = fixedValue === null || fixedValue < 0 ? 'Los costos fijos no pueden ser negativos.' : undefined;
  const variableError = variableValue === null || variableValue < 0 || variableValue > 100 ? 'Usa un porcentaje entre 0 y 100.' : undefined;
  const isValid = !salesError && !fixedError && !variableError;
  const variableCosts = isValid ? salesValue! * (variableValue! / 100) : 0;
  const profit = isValid ? salesValue! - fixedValue! - variableCosts : 0;
  const margin = isValid ? (profit / salesValue!) * 100 : 0;
  const indicator = profit > 0 ? 'Resultado positivo' : profit < 0 ? 'Resultado negativo' : 'Punto neutro';
  const indicatorTone = profit > 0 ? 'positive' : profit < 0 ? 'negative' : 'neutral';
  function reset() { setSales(defaults.sales); setFixedCosts(defaults.fixed); setVariableRate(defaults.variable); }
  return (
    <div className={`tool-form ${hero ? 'hero-tool-form' : ''}`}>
      <div className="tool-field-grid three-columns">
        <NumberField id={`${idPrefix}-sales`} label="Ventas mensuales" prefix="$" value={sales} onChange={setSales} step={50000} error={salesError} />
        <NumberField id={`${idPrefix}-fixed`} label="Costos fijos" prefix="$" value={fixedCosts} onChange={setFixedCosts} step={50000} error={fixedError} />
        <NumberField id={`${idPrefix}-variable`} label="Costos variables" suffix="%" value={variableRate} onChange={setVariableRate} max={100} step={0.1} error={variableError} />
      </div>
      {isValid ? (
        <div className="result-panel tool-results" aria-live="polite" aria-atomic="true">
          <ResultItem label="Utilidad estimada" value={money.format(profit)} tone={profit < 0 ? 'negative' : 'positive'} />
          <ResultItem label="Margen" value={`${margin.toFixed(1)}%`} tone={margin < 0 ? 'negative' : 'positive'} />
          <ResultItem label="Costos variables" value={money.format(variableCosts)} />
          <div className={`health-indicator ${indicatorTone}`}><span aria-hidden="true" />{indicator}</div>
        </div>
      ) : <InvalidResult />}
      <div className="tool-actions"><button className="secondary-button" type="button" onClick={reset}>Restablecer</button></div>
    </div>
  );
}

function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState('900000');
  const [price, setPrice] = useState('25000');
  const [variableCost, setVariableCost] = useState('10000');
  const fixed = parseNumber(fixedCosts); const salePrice = parseNumber(price); const variable = parseNumber(variableCost);
  const fixedError = fixed === null || fixed < 0 ? 'Ingresa un costo fijo igual o mayor que cero.' : undefined;
  const priceError = salePrice === null || salePrice <= 0 ? 'El precio debe ser mayor que cero.' : undefined;
  const variableError = variable === null || variable < 0 ? 'El costo variable no puede ser negativo.'
    : salePrice !== null && salePrice > 0 && variable >= salePrice ? 'El precio debe ser mayor que el costo variable.' : undefined;
  const isValid = !fixedError && !priceError && !variableError;
  const contribution = isValid ? salePrice! - variable! : 0;
  const units = isValid ? Math.ceil(fixed! / contribution) : 0;
  const revenue = isValid ? units * salePrice! : 0;
  return (
    <div className="tool-form">
      <div className="tool-field-grid three-columns">
        <NumberField id="be-fixed" label="Costos fijos mensuales" prefix="$" value={fixedCosts} onChange={setFixedCosts} step={50000} error={fixedError} />
        <NumberField id="be-price" label="Precio medio por venta" prefix="$" value={price} onChange={setPrice} step={1000} error={priceError} />
        <NumberField id="be-variable" label="Costo variable por venta" prefix="$" value={variableCost} onChange={setVariableCost} step={1000} error={variableError} />
      </div>
      {isValid ? <div className="result-panel tool-results three-results" aria-live="polite" aria-atomic="true">
        <ResultItem label="Contribución por unidad" value={money.format(contribution)} />
        <ResultItem label="Unidades para equilibrar" value={integer.format(units)} />
        <ResultItem label="Facturación necesaria" value={money.format(revenue)} />
      </div> : <InvalidResult message="El precio debe superar al costo variable para calcular el equilibrio." />}
      <p className="formula-note">Las unidades se redondean hacia arriba porque una venta parcial no cubre el costo restante.</p>
    </div>
  );
}

function CommissionCalculator() {
  const [averageSale, setAverageSale] = useState('35000'); const [monthlySales, setMonthlySales] = useState('120');
  const [rateA, setRateA] = useState('3.19'); const [fixedA, setFixedA] = useState('0');
  const [rateB, setRateB] = useState('2.95'); const [fixedB, setFixedB] = useState('250');
  const average = parseNumber(averageSale); const count = parseNumber(monthlySales); const aRate = parseNumber(rateA);
  const aFixed = parseNumber(fixedA); const bRate = parseNumber(rateB); const bFixed = parseNumber(fixedB);
  const averageError = average === null || average <= 0 ? 'El valor por venta debe ser mayor que cero.' : undefined;
  const countError = count === null || count <= 0 ? 'Ingresa al menos una venta.' : undefined;
  const rateErrorA = aRate === null || aRate < 0 || aRate > 100 ? 'Usa un porcentaje entre 0 y 100.' : undefined;
  const fixedErrorA = aFixed === null || aFixed < 0 ? 'La tarifa fija no puede ser negativa.' : undefined;
  const rateErrorB = bRate === null || bRate < 0 || bRate > 100 ? 'Usa un porcentaje entre 0 y 100.' : undefined;
  const fixedErrorB = bFixed === null || bFixed < 0 ? 'La tarifa fija no puede ser negativa.' : undefined;
  const isValid = !averageError && !countError && !rateErrorA && !fixedErrorA && !rateErrorB && !fixedErrorB;
  const gross = isValid ? average! * count! : 0;
  const costA = isValid ? gross * (aRate! / 100) + count! * aFixed! : 0;
  const costB = isValid ? gross * (bRate! / 100) + count! * bFixed! : 0;
  const netA = gross - costA; const netB = gross - costB; const difference = Math.abs(netA - netB);
  const winner = Math.abs(netA - netB) < 0.01 ? 'Ambos canales dejan el mismo ingreso neto.'
    : netA > netB ? `Canal A deja ${money.format(difference)} más al negocio.` : `Canal B deja ${money.format(difference)} más al negocio.`;
  return (
    <div className="tool-form">
      <div className="tool-field-grid two-columns general-fields">
        <NumberField id="commission-average" label="Valor promedio de cada venta" prefix="$" value={averageSale} onChange={setAverageSale} step={1000} error={averageError} />
        <NumberField id="commission-count" label="Número mensual de ventas" value={monthlySales} onChange={setMonthlySales} step={1} error={countError} />
      </div>
      <div className="channel-grid">
        <fieldset className="channel-card"><legend>Canal A</legend>
          <NumberField id="commission-rate-a" label="Comisión porcentual" suffix="%" value={rateA} onChange={setRateA} max={100} step={0.01} error={rateErrorA} />
          <NumberField id="commission-fixed-a" label="Tarifa fija por transacción" prefix="$" value={fixedA} onChange={setFixedA} step={10} error={fixedErrorA} />
        </fieldset>
        <fieldset className="channel-card"><legend>Canal B</legend>
          <NumberField id="commission-rate-b" label="Comisión porcentual" suffix="%" value={rateB} onChange={setRateB} max={100} step={0.01} error={rateErrorB} />
          <NumberField id="commission-fixed-b" label="Tarifa fija por transacción" prefix="$" value={fixedB} onChange={setFixedB} step={10} error={fixedErrorB} />
        </fieldset>
      </div>
      {isValid ? <div className="result-panel comparison-results" aria-live="polite" aria-atomic="true">
        <ResultItem label="Ventas brutas" value={money.format(gross)} /><ResultItem label="Costo Canal A" value={money.format(costA)} />
        <ResultItem label="Ingreso neto A" value={money.format(netA)} /><ResultItem label="Costo Canal B" value={money.format(costB)} />
        <ResultItem label="Ingreso neto B" value={money.format(netB)} /><ResultItem label="Diferencia" value={money.format(difference)} />
        <div className="recommendation"><span aria-hidden="true">✓</span><strong>{winner}</strong></div>
      </div> : <InvalidResult />}
    </div>
  );
}

function UtmBuilder() {
  const [destination, setDestination] = useState('https://tusitio.cl/oferta'); const [source, setSource] = useState('instagram');
  const [medium, setMedium] = useState('social'); const [campaign, setCampaign] = useState('lanzamiento');
  const [term, setTerm] = useState(''); const [content, setContent] = useState(''); const [copyStatus, setCopyStatus] = useState('');
  let urlError: string | undefined; let generatedUrl = '';
  try {
    const url = new URL(destination); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid-protocol');
    if (source.trim() && medium.trim() && campaign.trim()) {
      const params = new URLSearchParams(url.search);
      params.set('utm_source', source.trim()); params.set('utm_medium', medium.trim()); params.set('utm_campaign', campaign.trim());
      if (term.trim()) params.set('utm_term', term.trim()); else params.delete('utm_term');
      if (content.trim()) params.set('utm_content', content.trim()); else params.delete('utm_content');
      url.search = params.toString();
      generatedUrl = url.toString();
    }
  } catch { urlError = 'Ingresa una URL completa que comience con http:// o https://.'; }
  const sourceError = source.trim() ? undefined : 'utm_source es obligatorio.';
  const mediumError = medium.trim() ? undefined : 'utm_medium es obligatorio.';
  const campaignError = campaign.trim() ? undefined : 'utm_campaign es obligatorio.';
  const isValid = !urlError && !sourceError && !mediumError && !campaignError && Boolean(generatedUrl);
  function update(setter: (value: string) => void, value: string) { setter(value); setCopyStatus(''); }
  async function copyLink() {
    if (!isValid) return;
    try { await navigator.clipboard.writeText(generatedUrl); setCopyStatus('Enlace copiado al portapapeles.'); }
    catch { setCopyStatus('No pudimos copiar automáticamente. Selecciona el enlace y cópialo manualmente.'); }
  }
  return (
    <div className="tool-form">
      <div className="tool-field-grid two-columns">
        <div className="full-width-field"><TextField id="utm-destination" label="URL de destino" type="url" required value={destination} onChange={(value) => update(setDestination, value)} placeholder="https://tusitio.cl/oferta" error={urlError} /></div>
        <TextField id="utm-source" label="utm_source" required value={source} onChange={(value) => update(setSource, value)} placeholder="instagram" error={sourceError} />
        <TextField id="utm-medium" label="utm_medium" required value={medium} onChange={(value) => update(setMedium, value)} placeholder="social" error={mediumError} />
        <TextField id="utm-campaign" label="utm_campaign" required value={campaign} onChange={(value) => update(setCampaign, value)} placeholder="lanzamiento" error={campaignError} />
        <TextField id="utm-term" label="utm_term (opcional)" value={term} onChange={(value) => update(setTerm, value)} placeholder="zapatos-rojos" />
        <TextField id="utm-content" label="utm_content (opcional)" value={content} onChange={(value) => update(setContent, value)} placeholder="boton-principal" />
      </div>
      {isValid ? <div className="utm-result" aria-live="polite"><span>Enlace generado</span><output>{generatedUrl}</output>
        <button className="button copy-button" type="button" onClick={copyLink}>Copiar enlace</button><p className="copy-status" role="status">{copyStatus}</p>
      </div> : <InvalidResult message="Completa la URL y los tres parámetros obligatorios para generar el enlace." />}
      <p className="formula-note">La URL se crea con las funciones URL y URLSearchParams del navegador. Ningún valor se envía fuera de este dispositivo.</p>
    </div>
  );
}

function EstimateCalculator() {
  const [hours, setHours] = useState('30'); const [hourlyRate, setHourlyRate] = useState('25000');
  const [complexity, setComplexity] = useState<Complexity>('medium'); const [safety, setSafety] = useState('15');
  const [externalCosts, setExternalCosts] = useState('100000');
  const hourValue = parseNumber(hours); const rateValue = parseNumber(hourlyRate); const safetyValue = parseNumber(safety); const externalValue = parseNumber(externalCosts);
  const hourError = hourValue === null || hourValue <= 0 ? 'Las horas deben ser mayores que cero.' : undefined;
  const rateError = rateValue === null || rateValue <= 0 ? 'La tarifa debe ser mayor que cero.' : undefined;
  const safetyError = safetyValue === null || safetyValue < 0 || safetyValue > 100 ? 'Usa un margen entre 0 y 100.' : undefined;
  const externalError = externalValue === null || externalValue < 0 ? 'Los costos externos no pueden ser negativos.' : undefined;
  const isValid = !hourError && !rateError && !safetyError && !externalError;
  const multipliers: Record<Complexity, number> = { low: 1, medium: 1.2, high: 1.4 }; const multiplier = multipliers[complexity];
  const baseCost = isValid ? hourValue! * rateValue! : 0; const complexityAdjustment = baseCost * (multiplier - 1);
  const adjustedSubtotal = baseCost + complexityAdjustment; const contingency = isValid ? adjustedSubtotal * (safetyValue! / 100) : 0;
  const quote = isValid ? adjustedSubtotal + contingency + externalValue! : 0;
  return (
    <div className="tool-form">
      <div className="tool-field-grid three-columns">
        <NumberField id="estimate-hours" label="Horas estimadas" value={hours} onChange={setHours} step={0.5} error={hourError} />
        <NumberField id="estimate-rate" label="Tarifa por hora" prefix="$" value={hourlyRate} onChange={setHourlyRate} step={1000} error={rateError} />
        <label className="field-group" htmlFor="estimate-complexity"><span className="field-label">Complejidad</span>
          <span className="input-shell select-shell"><select id="estimate-complexity" value={complexity} onChange={(event) => setComplexity(event.target.value as Complexity)}>
            <option value="low">Baja · ×1,00</option><option value="medium">Media · ×1,20</option><option value="high">Alta · ×1,40</option>
          </select></span>
        </label>
        <NumberField id="estimate-safety" label="Margen de seguridad" suffix="%" value={safety} onChange={setSafety} max={100} step={1} error={safetyError} />
        <NumberField id="estimate-external" label="Costos externos" prefix="$" value={externalCosts} onChange={setExternalCosts} step={1000} error={externalError} />
      </div>
      <p className="formula-note formula-highlight"><strong>Multiplicadores de complejidad:</strong> baja ×1,00; media ×1,20; alta ×1,40. El ajuste se aplica al costo base antes de calcular la contingencia.</p>
      {isValid ? <div className="result-panel tool-results quote-results" aria-live="polite" aria-atomic="true">
        <ResultItem label="Costo base" value={money.format(baseCost)} /><ResultItem label="Ajuste por complejidad" value={money.format(complexityAdjustment)} />
        <ResultItem label="Contingencia" value={money.format(contingency)} /><ResultItem label="Costos externos" value={money.format(externalValue!)} />
        <ResultItem label="Cotización recomendada" value={money.format(quote)} tone="positive" />
      </div> : <InvalidResult />}
    </div>
  );
}

function PricingCalculator() {
  const [currentPrice, setCurrentPrice] = useState('35000'); const [unitCost, setUnitCost] = useState('12000');
  const [fixedPerSale, setFixedPerSale] = useState('5000'); const [commission, setCommission] = useState('3.2');
  const [targetMargin, setTargetMargin] = useState('30');
  const price = parseNumber(currentPrice); const unit = parseNumber(unitCost); const fixed = parseNumber(fixedPerSale);
  const commissionRate = parseNumber(commission); const target = parseNumber(targetMargin);
  const priceError = price === null || price <= 0 ? 'El precio actual debe ser mayor que cero.' : undefined;
  const unitError = unit === null || unit < 0 ? 'El costo unitario no puede ser negativo.' : undefined;
  const fixedError = fixed === null || fixed < 0 ? 'El costo fijo asignado no puede ser negativo.' : undefined;
  const commissionError = commissionRate === null || commissionRate < 0 || commissionRate >= 100 ? 'Usa una comisión entre 0 y menos de 100.' : undefined;
  const targetError = target === null || target < 0 || target >= 100 ? 'Usa un margen objetivo entre 0 y menos de 100.'
    : commissionRate !== null && commissionRate + target >= 100 ? 'Comisión y margen objetivo deben sumar menos de 100%.' : undefined;
  const isValid = !priceError && !unitError && !fixedError && !commissionError && !targetError;
  const currentProfit = isValid ? price! - unit! - fixed! - price! * (commissionRate! / 100) : 0;
  const currentMargin = isValid ? (currentProfit / price!) * 100 : 0;
  const denominator = isValid ? 1 - commissionRate! / 100 - target! / 100 : 0;
  const recommendedPrice = isValid ? (unit! + fixed!) / denominator : 0; const difference = recommendedPrice - (price ?? 0);
  const diagnostic = currentMargin >= (target ?? 0) ? { label: 'Precio saludable', detail: 'El margen actual alcanza o supera tu objetivo.', tone: 'positive' }
    : currentProfit >= 0 && currentMargin >= (target ?? 0) - 5 ? { label: 'Precio ajustado', detail: 'Estás cerca del objetivo, pero tienes poco espacio ante imprevistos.', tone: 'neutral' }
      : { label: 'Precio insuficiente', detail: 'El precio actual queda por debajo del margen objetivo definido.', tone: 'negative' };
  return (
    <div className="tool-form">
      <div className="tool-field-grid three-columns">
        <NumberField id="pricing-current" label="Precio de venta actual" prefix="$" value={currentPrice} onChange={setCurrentPrice} step={1000} error={priceError} />
        <NumberField id="pricing-unit" label="Costo unitario" prefix="$" value={unitCost} onChange={setUnitCost} step={1000} error={unitError} />
        <NumberField id="pricing-fixed" label="Costos fijos por venta" prefix="$" value={fixedPerSale} onChange={setFixedPerSale} step={1000} error={fixedError} />
        <NumberField id="pricing-commission" label="Comisión" suffix="%" value={commission} onChange={setCommission} max={99.99} step={0.1} error={commissionError} />
        <NumberField id="pricing-target" label="Margen objetivo" suffix="%" value={targetMargin} onChange={setTargetMargin} max={99.99} step={0.1} error={targetError} />
      </div>
      {isValid ? <div className="result-panel pricing-results" aria-live="polite" aria-atomic="true">
        <ResultItem label="Utilidad actual por venta" value={money.format(currentProfit)} tone={currentProfit < 0 ? 'negative' : 'positive'} />
        <ResultItem label="Margen actual" value={`${currentMargin.toFixed(1)}%`} tone={currentMargin < 0 ? 'negative' : 'positive'} />
        <ResultItem label="Precio mínimo recomendado" value={money.format(recommendedPrice)} />
        <ResultItem label="Diferencia contra precio actual" value={`${difference > 0 ? '+' : ''}${money.format(difference)}`} tone={difference > 0 ? 'negative' : 'positive'} />
        <div className={`diagnostic-card ${diagnostic.tone}`}><strong>{diagnostic.label}</strong><span>{diagnostic.detail}</span></div>
      </div> : <InvalidResult message="Ajusta los porcentajes para que comisión y margen objetivo sumen menos de 100%." />}
      <p className="formula-note">El precio recomendado cubre costo unitario, costos fijos asignados, comisión y margen objetivo. No incluye impuestos.</p>
    </div>
  );
}

function ActiveTool({ tool }: { tool: ToolDefinition }) {
  switch (tool.id) {
    case 'margin': return <MarginCalculator idPrefix="workspace-margin" />;
    case 'break-even': return <BreakEvenCalculator />;
    case 'commissions': return <CommissionCalculator />;
    case 'utm': return <UtmBuilder />;
    case 'estimate': return <EstimateCalculator />;
    case 'pricing': return <PricingCalculator />;
  }
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Filter>('Todas'); const [query, setQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null); const workspaceRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null); const activeTool = tools.find((tool) => tool.id === activeToolId) ?? null;
  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === 'Todas' || tool.category === activeCategory;
      const searchable = `${tool.name} ${tool.description} ${tool.category}`.toLocaleLowerCase('es');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, query]);
  function openTool(toolId: ToolId, trigger?: HTMLButtonElement) {
    if (trigger) lastTriggerRef.current = trigger; setActiveToolId(toolId);
    window.setTimeout(() => { workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); workspaceRef.current?.focus({ preventScroll: true }); }, 0);
  }
  function closeTool() { setActiveToolId(null); window.setTimeout(() => lastTriggerRef.current?.focus(), 0); }
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header"><div className="container nav-shell">
        <a className="brand" href="#inicio" aria-label="Herramientas Rentables, inicio"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
        <nav className="desktop-nav" aria-label="Navegación principal"><a href="#herramientas">Herramientas</a><a href="#metodo">Cómo funciona</a><a href="#preguntas">Preguntas</a></nav>
        <a className="button button-small" href="#herramientas">Abrir herramientas</a>
      </div></header>
      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="hero-title"><div className="container hero-grid">
          <div className="hero-copy"><p className="eyebrow"><span aria-hidden="true" /> Seis herramientas, decisiones más claras</p>
            <h1 id="hero-title">Haz que cada peso <em>cuente.</em></h1>
            <p className="hero-lead">Calculadoras gratuitas para entender tus números, comparar alternativas y fijar precios con más confianza. Todo se calcula en tu navegador.</p>
            <div className="hero-actions"><a className="button" href="#herramientas">Explorar herramientas <span aria-hidden="true">→</span></a><a className="text-link" href="#calculadora">Calcular mi margen</a></div>
            <ul className="trust-list" aria-label="Beneficios principales"><li>Sin registro</li><li>100% gratuitas</li><li>Datos en tu navegador</li></ul>
          </div>
          <div className="calculator-wrap" id="calculadora" tabIndex={-1}><div className="calculator-card">
            <div className="calculator-heading"><div><p className="section-kicker">Herramienta destacada</p><h2>Margen mensual</h2></div><span className="live-badge"><span aria-hidden="true" /> Disponible</span></div>
            <MarginCalculator idPrefix="hero-margin" hero /><p className="calculator-note">Estimación orientativa. Revisa impuestos y costos específicos antes de tomar decisiones.</p>
          </div><p className="privacy-note"><span aria-hidden="true">●</span> Tus datos no salen de este dispositivo</p></div>
        </div></section>

        <section className="tools-section" id="herramientas" aria-labelledby="tools-title"><div className="container">
          <div className="section-heading"><div><p className="section-kicker">Tu caja de herramientas</p><h2 id="tools-title">Menos intuición. Más claridad.</h2></div><p>Seis recursos gratuitos para responder preguntas reales sobre costos, ventas, marketing, tiempo y precios.</p></div>
          <div className="tool-controls"><div className="category-list" aria-label="Filtrar por categoría">
            {categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : undefined} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div><label className="search-field"><span className="sr-only">Buscar herramientas</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar herramienta" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
          <p className="results-summary" aria-live="polite">{filteredTools.length} {filteredTools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}</p>
          <div className="tool-grid">{filteredTools.map((tool) => <article className="tool-card" key={tool.id}>
            <div className="tool-card-top"><span className="tool-code" aria-hidden="true">{tool.code}</span><span className="status available">Disponible</span></div>
            <p className="tool-category">{tool.category}</p><h3>{tool.name}</h3><p>{tool.description}</p>
            <button type="button" aria-label={`Abrir ${tool.name}`} aria-controls="herramienta-activa" onClick={(event) => openTool(tool.id, event.currentTarget)}>Abrir herramienta <span aria-hidden="true">↗</span></button>
          </article>)}</div>
          {filteredTools.length === 0 && <div className="empty-state" role="status"><strong>No encontramos coincidencias.</strong><p>Prueba otra palabra o selecciona la categoría “Todas”.</p><button type="button" onClick={() => { setQuery(''); setActiveCategory('Todas'); }}>Limpiar filtros</button></div>}
          {activeTool && <div className="tool-workspace" id="herramienta-activa" ref={workspaceRef} tabIndex={-1} aria-labelledby="active-tool-title">
            <div className="workspace-header"><div><p className="section-kicker">Herramienta {activeTool.code} · {activeTool.category}</p><h2 id="active-tool-title">{activeTool.shortName}</h2><p>{activeTool.description}</p></div>
              <button className="close-tool-button" type="button" onClick={closeTool} aria-label={`Cerrar ${activeTool.name}`}><span aria-hidden="true">←</span> Volver a herramientas</button>
            </div><div className="tool-surface"><ActiveTool tool={activeTool} /></div><p className="workspace-privacy"><span aria-hidden="true">●</span> Cálculo privado: los valores permanecen en este navegador.</p>
          </div>}
        </div></section>

        <section className="method-section" id="metodo" aria-labelledby="method-title"><div className="container method-grid">
          <div className="method-intro"><p className="section-kicker">Diseñado para avanzar</p><h2 id="method-title">Una respuesta útil en menos de tres minutos.</h2><p>Sin fórmulas escondidas ni paneles abrumadores. Cada herramienta explica sus supuestos y se concentra en una decisión concreta.</p></div>
          <ol className="steps-list"><li><span>01</span><div><h3>Ingresa lo esencial</h3><p>Solo usamos los datos necesarios para calcular tu escenario en el navegador.</p></div></li><li><span>02</span><div><h3>Entiende el resultado</h3><p>Presentamos cifras legibles, contexto, validaciones y fórmulas transparentes.</p></div></li><li><span>03</span><div><h3>Decide con confianza</h3><p>Compara alternativas y vuelve a calcular cuando cambien tus números.</p></div></li></ol>
        </div></section>
        <section className="faq-section" id="preguntas" aria-labelledby="faq-title"><div className="container faq-grid"><div><p className="section-kicker">Preguntas frecuentes</p><h2 id="faq-title">Lo importante, claro desde el inicio.</h2></div>
          <div className="faq-list"><details><summary>¿Necesito crear una cuenta o pagar?</summary><p>No. Las seis herramientas son gratuitas y funcionan sin registro.</p></details><details><summary>¿Guardan la información que ingreso?</summary><p>No. Todos los cálculos se realizan en tu navegador y los valores no se envían a servidores.</p></details><details><summary>¿Los resultados reemplazan asesoría profesional?</summary><p>No. Son estimaciones para explorar escenarios. Las decisiones contables, tributarias o legales deben revisarse con un especialista.</p></details></div>
        </div></section>
        <section className="final-cta" aria-labelledby="cta-title"><div className="container cta-shell"><div><p className="section-kicker">Empieza por tus números</p><h2 id="cta-title">Tu próxima buena decisión puede comenzar aquí.</h2></div><a className="button button-light" href="#herramientas">Abrir herramientas <span aria-hidden="true">↑</span></a></div></section>
      </main>
      <footer className="site-footer"><div className="container footer-grid"><a className="brand footer-brand" href="#inicio"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a><p>Seis herramientas gratuitas para tomar mejores decisiones de negocio.</p><p>© {new Date().getFullYear()} Herramientas Rentables</p></div></footer>
    </>
  );
}
