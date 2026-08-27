'use client';

import { useMemo, useState } from 'react';
import styles from './freelance-quote-builder.module.css';

const money = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const complexityMultipliers = {
  low: 1,
  medium: 1.2,
  high: 1.4,
} as const;

type Complexity = keyof typeof complexityMultipliers;

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  const [copyStatus, setCopyStatus] = useState('');

  const result = useMemo(() => {
    const hourValue = Math.max(0, parseNumber(hours));
    const rateValue = Math.max(0, parseNumber(hourlyRate));
    const safetyValue = Math.min(100, Math.max(0, parseNumber(safety))) / 100;
    const externalValue = Math.max(0, parseNumber(externalCosts));
    const marginValue = Math.min(80, Math.max(0, parseNumber(targetMargin))) / 100;
    const depositValue = Math.min(100, Math.max(0, parseNumber(depositRate))) / 100;
    const complexityMultiplier = complexityMultipliers[complexity];

    const baseCost = hourValue * rateValue;
    const adjustedSubtotal = baseCost * complexityMultiplier;
    const contingency = adjustedSubtotal * safetyValue;
    const protectedMinimum = adjustedSubtotal + contingency + externalValue;
    const recommendedPrice = marginValue > 0 ? protectedMinimum / (1 - marginValue) : protectedMinimum;
    const deposit = recommendedPrice * depositValue;
    const balance = recommendedPrice - deposit;

    return { baseCost, contingency, protectedMinimum, recommendedPrice, deposit, balance };
  }, [hours, hourlyRate, complexity, safety, externalCosts, targetMargin, depositRate]);

  const summary = useMemo(() => {
    const clientLine = clientName.trim() ? `Cliente: ${clientName.trim()}\n` : '';
    return `${projectName.trim() || 'Proyecto freelance'}\n${clientLine}Alcance: ${scope.trim() || 'Por definir'}\n\nInversión total: ${money.format(result.recommendedPrice)}\nAnticipo (${depositRate}%): ${money.format(result.deposit)}\nSaldo restante: ${money.format(result.balance)}\nRevisiones incluidas: ${revisions || '0'}\nPlazo estimado: ${deliveryTime.trim() || 'Por definir'}\nVigencia de la cotización: ${validityDays || '0'} días\n\nCambios fuera del alcance acordado se cotizan por separado. La ejecución comienza una vez confirmado el anticipo.`;
  }, [projectName, clientName, scope, result, depositRate, revisions, deliveryTime, validityDays]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus('Resumen copiado.');
    } catch {
      setCopyStatus('No pudimos copiar automáticamente. Selecciona el texto y cópialo manualmente.');
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
            <label className="field-group"><span className="field-label">Horas estimadas</span><span className="input-shell"><input type="number" min="1" step="1" value={hours} onChange={(e) => setHours(e.target.value)} /></span></label>
            <label className="field-group"><span className="field-label">Tarifa por hora</span><span className="input-shell"><span aria-hidden="true">$</span><input type="number" min="1" step="1000" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} /></span></label>
            <label className="field-group"><span className="field-label">Complejidad</span><span className="input-shell"><select value={complexity} onChange={(e) => setComplexity(e.target.value as Complexity)}><option value="low">Baja · ×1,00</option><option value="medium">Media · ×1,20</option><option value="high">Alta · ×1,40</option></select></span></label>
            <label className="field-group"><span className="field-label">Contingencia</span><span className="input-shell"><input type="number" min="0" max="100" step="1" value={safety} onChange={(e) => setSafety(e.target.value)} /><span aria-hidden="true">%</span></span></label>
            <label className="field-group"><span className="field-label">Costos externos</span><span className="input-shell"><span aria-hidden="true">$</span><input type="number" min="0" step="1000" value={externalCosts} onChange={(e) => setExternalCosts(e.target.value)} /></span></label>
            <label className="field-group"><span className="field-label">Margen objetivo</span><span className="input-shell"><input type="number" min="0" max="80" step="1" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} /><span aria-hidden="true">%</span></span></label>
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
            <label className="field-group"><span className="field-label">Anticipo</span><span className="input-shell"><input type="number" min="0" max="100" step="5" value={depositRate} onChange={(e) => setDepositRate(e.target.value)} /><span aria-hidden="true">%</span></span></label>
            <label className="field-group"><span className="field-label">Revisiones incluidas</span><span className="input-shell"><input type="number" min="0" step="1" value={revisions} onChange={(e) => setRevisions(e.target.value)} /></span></label>
            <label className="field-group"><span className="field-label">Vigencia</span><span className="input-shell"><input type="number" min="1" step="1" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} /><span aria-hidden="true">días</span></span></label>
            <label className="field-group"><span className="field-label">Plazo estimado</span><span className="input-shell text-input-shell"><input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} /></span></label>
            <label className="field-group full-width-field"><span className="field-label">Alcance / entregables</span><textarea className={styles.scopeArea} rows={4} value={scope} onChange={(e) => setScope(e.target.value)} /></label>
          </div>
        </section>
      </div>

      <section className={styles.resultShell} aria-live="polite">
        <p className={styles.resultKicker}>Diagnóstico comercial</p>
        <div className={styles.heroResult}><span>Precio recomendado para presentar</span><strong>{money.format(result.recommendedPrice)}</strong></div>
        <div className={styles.resultGrid}>
          <div className={styles.metric}><span>Precio mínimo protegido</span><strong>{money.format(result.protectedMinimum)}</strong></div>
          <div className={styles.metric}><span>Anticipo</span><strong>{money.format(result.deposit)}</strong></div>
          <div className={styles.metric}><span>Saldo</span><strong>{money.format(result.balance)}</strong></div>
          <div className={styles.metric}><span>Colchón de contingencia</span><strong>{money.format(result.contingency)}</strong></div>
        </div>
        <p className={styles.protectionNote}>El mínimo protegido cubre horas, complejidad, contingencia y costos externos. El recomendado añade el margen objetivo para que la propuesta no dependa solo de “cubrir costos”.</p>
      </section>

      <section className={`tool-info-card ${styles.summaryCard}`}>
        <div className={styles.summaryTop}>
          <div><h3>03 · Cotización lista para cliente</h3><p>Un resumen limpio para copiar, adaptar y enviar.</p></div>
          <span className="live-badge">Lista</span>
        </div>
        <pre className={styles.summaryText}>{summary}</pre>
        <div className={styles.copyBar}>
          <button className="secondary-button" type="button" onClick={copySummary}>Copiar resumen</button>
          <span className={styles.copyStatus} aria-live="polite">{copyStatus}</span>
        </div>
      </section>

      <p className="tool-orientation-note"><strong>Importante:</strong> esta herramienta es orientativa. Ajusta las condiciones a tu servicio y revisa aspectos legales, tributarios o contractuales con un profesional cuando corresponda.</p>
    </div>
  );
}
