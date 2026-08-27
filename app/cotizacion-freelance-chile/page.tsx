/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid vinext prefetch issues used elsewhere in the site. */
import type { Metadata } from 'next';
import { FreelanceQuoteBuilder } from '../components/freelance-quote-builder';
import { payhipProducts, trackedPayhipUrl } from '../lib/payhip-products';
import { siteUrl } from '../lib/tools';

const path = '/cotizacion-freelance-chile';
const canonical = `${siteUrl}${path}`;

export const metadata: Metadata = {
  title: 'Cotización Freelance Profesional en Chile | Herramientas Rentables',
  description: 'Calcula precio, margen, anticipo y condiciones para cotizar proyectos freelance en Chile. Genera un resumen profesional listo para enviar al cliente.',
  alternates: { canonical },
};

export default function FreelanceQuotePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cotización Freelance Profesional — Chile',
    description: 'Herramienta para calcular y estructurar una cotización freelance profesional en Chile.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    url: canonical,
    inLanguage: 'es-CL',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CLP' },
    provider: { '@type': 'Organization', name: 'Herramientas Rentables', url: siteUrl },
  };

  return (
    <div className="tool-page">
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="/" aria-label="Herramientas Rentables, inicio"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
          <nav className="desktop-nav" aria-label="Navegación principal"><a href="/#herramientas">Herramientas</a><a href="/guias/cuanto-cobrar-como-freelance-chile">Guía de tarifas</a><a href="/pro">Recursos</a></nav>
          <a className="button button-small button-outline" href="#cotizador">Crear cotización</a>
        </div>
      </header>

      <main>
        <section className="tool-page-hero">
          <div className="container">
            <p className="eyebrow">Cotización freelance profesional · Chile</p>
            <div className="tool-page-hero-grid">
              <div>
                <h1>Cotiza tu proyecto sin cobrar de menos.</h1>
                <p className="tool-page-lead">No rellenes una plantilla vacía. Calcula tu precio mínimo, protege margen, define anticipo y condiciones, y genera un resumen profesional listo para presentar al cliente.</p>
                <div className="hero-actions" style={{ marginTop: '1.5rem' }}><a className="button" href="#cotizador">Construir mi cotización <span aria-hidden="true">→</span></a></div>
              </div>
              <aside className="tool-page-benefits" aria-label="Diferenciadores"><p><span aria-hidden="true">✓</span> Precio mínimo y recomendado</p><p><span aria-hidden="true">✓</span> Anticipo, revisiones y vigencia</p><p><span aria-hidden="true">✓</span> Resumen listo para cliente</p><p><span aria-hidden="true">✓</span> Sin registro y datos locales</p></aside>
            </div>
          </div>
        </section>

        <section className="tool-page-calculator-section" id="cotizador" aria-labelledby="builder-title">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Herramienta</p><h2 id="builder-title">Construye una cotización que proteja tu rentabilidad</h2><p>Primero calcula el piso económico. Después define las condiciones comerciales que reducen ambigüedad y retrabajo.</p></div>
            <div className="tool-workspace tool-page-workspace"><div className="tool-surface"><FreelanceQuoteBuilder /></div><p className="workspace-privacy"><span aria-hidden="true">🔒</span> Todo se calcula en tu navegador. Tus datos no se envían a servidores.</p></div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Por qué es diferente</p><h2>Una cotización no es solo un precio</h2><p>Una buena propuesta comercial protege el alcance, los tiempos y la rentabilidad antes de comenzar el trabajo.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><h3>Protege el piso económico</h3><p>El cálculo separa costo base, complejidad, contingencia, costos externos y margen objetivo para que puedas ver cuánto necesitas cobrar antes de negociar.</p></article>
              <article className="tool-info-card"><h3>Protege las condiciones</h3><p>Anticipo, revisiones, vigencia, plazo y alcance quedan visibles en el mismo flujo para evitar que una cifra correcta termine en un proyecto mal definido.</p></article>
            </div>
          </div>
        </section>

        <section className="tool-related-section">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Cuando cotizar deja de ser algo ocasional</p><h2>Convierte el proceso en un sistema</h2><p>Esta herramienta resuelve una cotización puntual. Si cotizas proyectos con frecuencia, el siguiente paso es ordenar precios, cotizaciones y márgenes de forma reutilizable.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><p className="eyebrow">Premium</p><h3>{payhipProducts.premium.name}</h3><p>{payhipProducts.premium.description}</p><a className="button button-primary" href={trackedPayhipUrl(payhipProducts.premium, 'cotizacion-profesional')} target="_blank" rel="noreferrer">{payhipProducts.premium.buttonLabel}</a></article>
              <article className="tool-info-card"><p className="eyebrow">Aprende antes de cotizar</p><h3>¿Cuánto cobrar como freelance en Chile?</h3><p>Si todavía estás definiendo tu tarifa, usa la guía para estimar un piso sostenible antes de construir la propuesta.</p><a className="button button-primary" href="/guias/cuanto-cobrar-como-freelance-chile">Ver guía de tarifas</a></article>
            </div>
          </div>
        </section>

        <section className="tool-page-explanation" aria-labelledby="faq-title">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Preguntas frecuentes</p><h2 id="faq-title">Qué debe incluir una cotización freelance</h2></div>
            <div className="faq-list">
              <details><summary>¿Qué diferencia hay entre precio mínimo y precio recomendado?</summary><p>El mínimo protegido cubre horas, complejidad, contingencia y costos externos. El recomendado añade el margen objetivo que definiste.</p></details>
              <details><summary>¿Cuánto anticipo debería pedir?</summary><p>La herramienta permite simular cualquier porcentaje. El porcentaje adecuado depende del tipo de servicio, riesgo y acuerdo comercial.</p></details>
              <details><summary>¿Esto reemplaza una cotización legal o contrato?</summary><p>No. Es una herramienta comercial orientativa. Para condiciones legales, tributarias o contractuales revisa tu situación con un profesional.</p></details>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><a className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a><p>Herramientas gratuitas para tomar mejores decisiones de negocio.</p></div></footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
}
