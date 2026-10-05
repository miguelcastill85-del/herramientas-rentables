'use client';

import { useMemo, useState } from 'react';
import { payhipProducts, trackedPayhipUrl } from '../lib/payhip-products';
import { evaluateQuote, type Complexity, type QuoteField } from '../lib/freelance-quote';
import styles from './freelance-quote-builder.module.css';

const money = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const premiumAfterQuoteUrl = trackedPayhipUrl(payhipProducts.premium, 'cotizacion-resultado');

function QuoteNumberField({ field, label, value, onChange, error, prefix, suffix, min = 0, max, step = 1 }: {
  field: QuoteField; label: string; value: string; onChange: (value: string) => void;
  error?: string; prefix?: string; suffix?: string; min?: number; max?: number; step?: number;
}) {
  const id = `quote-${field}`;
  return <label className="field-group" htmlFor={id}>
    <span className="field-label">{label}</span>
    <span className={`input-shell ${error ? 'has-error' : ''}`}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step}
        value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined} />
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
    {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
  </label>;
}

export function FreelanceQuoteBuilder() {
  const [projectName, setProjectName] = useState('Proyecto freelance');
  const [clientName, setClientName] = useState('');
  const [scope, setScope] = useState('Diseño y ejecución del proyecto según alcance acordado.');
  const [hours, setHours] = useState('30');
  const [hourlyRate, setHourlyRate] = useState('25000');
  const [complexity, setComplexity] = useState<Complexity>('medium');
  const [safety, setSafety] = useState('15');
  const [externalCosts, setExternalCosts] = useState('100000');
  const [targetMargin, setTargetMargin] = useState('20');
  const [depositRate, setDepositRate] = useState('50');
  const [revisions, setRevisions] = useState('2');
  const [validityDays, setValidityDays] = useState('7');
  const [deliveryTime, setDeliveryTime] = useState('10 días hábiles');
  const [copyStatus, setCopyStatus] = useState({ message: '', summary: '' });

  const { errors, result } = useMemo(() => evaluateQuote({
    hours, hourlyRate, complexity, safety, externalCosts, targetMargin, depositRate, revisions, validityDays,
  }), [hours, hourlyRate, complexity, safety, externalCosts, targetMargin, depositRate, revisions, validityDays]);

  const summary = useMemo(() => {
    if (!result) return '';
    const clientLine = clientName.trim() ? `Cliente: ${clientName.trim()}\n` : '';
    const startCondition = result.depositRate > 0
      ? 'La ejecución comienza una vez confirmado el anticipo.'
      : 'La ejecución comienza una vez aceptada la cotización.';
    return `${projectName.trim() || 'Proyecto freelance'}\n${clientLine}Alcance: ${scope.trim() || 'Por definir'}\n\nInversión total: ${money.format(result.quotedPrice)}\nAnticipo (${result.depositRate}%): ${money.format(result.deposit)}\nSaldo restante: ${money.format(result.balance)}\nRevisiones incluidas: ${result.revisions}\nPlazo estimado: ${deliveryTime.trim() || 'Por definir'}\nVigencia de la cotización: ${result.validityDays} días\n\nCambios fuera del alcance acordado se cotizan por separado. ${startCondition}`;
  }, [projectName, clientName, scope, result, deliveryTime]);

  async function copySummary() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus({ message: 'Resumen copiado.', summary });
    } catch {
      setCopyStatus({ message: 'No pudimos copiar automáticamente. Selecciona el texto y cópialo manualmente.', summary });
    }
  }

  return (
    <div className={styles.quoteBuilder}>
      <div className={styles.quoteGrid}>
        <section className={`tool-info-card ${styles.stageCard}`}>
          <div className={styles.stageHeader}>
            <span className={styles.stageNumber}>01</span>
            <div><h3>Protege tu rentabilidad</h3><p>Define el piso económico antes de negociar con el cliente.</p></div>
          </div>
          <div className="tool-field-grid two-columns">
            <QuoteNumberField field="hours" label="Horas estimadas" value={hours} onChange={setHours} min={0.01} step={0.5} error={errors.hours} />
            <QuoteNumberField field="hourlyRate" label="Tarifa por hora" value={hourlyRate} onChange={setHourlyRate} prefix="$" min={0.01} step={1000} error={errors.hourlyRate} />
            <label className="field-group"><span className="field-label">Complejidad</span><span className="input-shell"><select value={complexity} onChange={(e) => setComplexity(e.target.value as Complexity)}><option value="low">Baja · ×1,00</option><option value="medium">Media · ×1,20</option><option value="high">Alta · ×1,40</option></select></span></label>
            <QuoteNumberField field="safety" label="Contingencia" value={safety} onChange={setSafety} suffix="%" max={100} error={errors.safety} />
            <QuoteNumberField field="externalCosts" label="Costos externos" value={externalCosts} onChange={setExternalCosts} prefix="$" step={1000} error={errors.externalCosts} />
            <QuoteNumberField field="targetMargin" label="Margen objetivo" value={targetMargin} onChange={setTargetMargin} suffix="%" max={80} error={errors.targetMargin} />
          </div>
        </section>

        <section className={`tool-info-card ${styles.stageCard}`}>
          <div className={styles.stageHeader}>
            <span className={styles.stageNumber}>02</span>
            <div><h3>Define condiciones claras</h3><p>Reduce ambigüedad, retrabajo y negociaciones después de empezar.</p></div>
          </div>
          <div className="tool-field-grid two-columns">
            <label className="field-group full-width-field"><span className="field-label">Nombre del proyecto</span><span className="input-shell text-input-shell"><input value={projectName} onChange={(e) => setProjectName(e.target.value)} /></span></label>
            <label className="field-group full-width-field"><span className="field-label">Cliente (opcional)</span><span className="input-shell text-input-shell"><input value={clientName} onChange={(e) => setClientName(e.target.value)} /></span></label>
            <QuoteNumberField field="depositRate" label="Anticipo" value={depositRate} onChange={setDepositRate} suffix="%" max={100} step={5} error={errors.depositRate} />
            <QuoteNumberField field="revisions" label="Revisiones incluidas" value={revisions} onChange={setRevisions} error={errors.revisions} />
            <QuoteNumberField field="validityDays" label="Vigencia" value={validityDays} onChange={setValidityDays} min={1} suffix="días" error={errors.validityDays} />
            <label className="field-group"><span className="field-label">Plazo estimado</span><span className="input-shell text-input-shell"><input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} /></span></label>
            <label className="field-group full-width-field"><span className="field-label">Alcance / entregables</span><textarea className={styles.scopeArea} rows={4} value={scope} onChange={(e) => setScope(e.target.value)} /></label>
          </div>
        </section>
      </div>

      {result ? <section className={styles.resultShell} aria-live="polite">
        <p className={styles.resultKicker}>Diagnóstico comercial</p>
        <div className={styles.heroResult}><span>Precio recomendado para presentar</span><strong>{money.format(result.quotedPrice)}</strong></div>
        <div className={styles.resultGrid}>
          <div className={styles.metric}><span>Precio mínimo protegido</span><strong>{money.format(result.protectedMinimum)}</strong></div>
          <div className={styles.metric}><span>Anticipo</span><strong>{money.format(result.deposit)}</strong></div>
          <div className={styles.metric}><span>Saldo</span><strong>{money.format(result.balance)}</strong></div>
          <div className={styles.metric}><span>Colchón de contingencia</span><strong>{money.format(result.contingency)}</strong></div>
        </div>
        <p className={styles.protectionNote}>El mínimo protegido cubre horas, complejidad, contingencia y costos externos. El recomendado añade el margen objetivo para que la propuesta no dependa solo de “cubrir costos”.</p>
      </section> : <div className="validation-message" role="status">Corrige los campos marcados para obtener una cotización válida.</div>}

      <section className={`tool-info-card ${styles.summaryCard}`}>
        <div className={styles.summaryTop}>
          <div><h3>03 · Cotización lista para cliente</h3><p>Un resumen limpio para copiar, adaptar y enviar.</p></div>
          <span className="live-badge">{result ? 'Lista' : 'Revisar datos'}</span>
        </div>
        <pre className={styles.summaryText}>{summary || 'Completa los datos válidos para preparar el resumen del cliente.'}</pre>
        <div className={styles.copyBar}>
          <button className="secondary-button" type="button" onClick={copySummary} disabled={!result}>Copiar resumen</button>
          <span className={styles.copyStatus} aria-live="polite">{summary && copyStatus.summary === summary ? copyStatus.message : ''}</span>
        </div>
      </section>

      <section className={`tool-info-card ${styles.summaryCard}`} aria-labelledby="premium-after-quote-heading">
        <p className={styles.resultKicker}>Siguiente paso</p>
        <h3 id="premium-after-quote-heading">¿Cotizas proyectos con frecuencia?</h3>
        <p>Si necesitas repetir el proceso y controlar precios, proyectos y margen en un archivo reutilizable, conoce <strong>{payhipProducts.premium.name}</strong>.</p>
        <p><strong>{payhipProducts.premium.details}</strong></p>
        <a
          className="button button-primary"
          href={premiumAfterQuoteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${payhipProducts.premium.buttonLabel} en Payhip (se abre en una pestaña nueva)`}
        >
          {payhipProducts.premium.buttonLabel} <span aria-hidden="true">↗</span>
        </a>
      </section>

      <p className="tool-orientation-note"><strong>Importante:</strong> esta herramienta es orientativa. Ajusta las condiciones a tu servicio y revisa aspectos legales, tributarios o contractuales con un profesional cuando corresponda.</p>
    </div>
  );
}
