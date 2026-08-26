import type { Metadata } from 'next';
import { payhipProducts } from '../../../lib/payhip-products';
import { siteUrl } from '../../../lib/tools';

const path = '/guias/cuanto-cobrar-como-freelance-chile';
const canonical = `${siteUrl}${path}`;

export const metadata: Metadata = {
  title: 'Cuánto cobrar como freelance en Chile en 2026 | Herramientas Rentables',
  description: 'Calcula cuánto cobrar por hora o proyecto en Chile considerando gastos, horas facturables, retención 2026 y margen de seguridad.',
  alternates: { canonical },
};

export default function FreelanceChileGuide() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cuánto cobrar como freelance en Chile en 2026',
    description: 'Guía práctica para estimar una tarifa freelance sostenible en Chile.',
    inLanguage: 'es-CL',
    mainEntityOfPage: canonical,
    publisher: { '@type': 'Organization', name: 'Herramientas Rentables', url: siteUrl },
  };

  return (
    <div className="tool-page">
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
          <nav className="desktop-nav" aria-label="Navegación principal"><a href="/#herramientas">Herramientas</a><a href="/pro">Recursos</a></nav>
          <a className="button button-small button-outline" href="/herramientas/cotizacion">Crear cotización</a>
        </div>
      </header>

      <main>
        <section className="tool-page-hero">
          <div className="container">
            <p className="eyebrow">Guía para freelancers en Chile · 2026</p>
            <div className="tool-page-hero-grid">
              <div><h1>¿Cuánto cobrar como freelance en Chile?</h1><p className="tool-page-lead">Tu tarifa no debería salir de una adivinanza ni de copiar lo que cobra otra persona. Parte de lo que necesitas ganar, suma tus costos, considera las horas que realmente puedes cobrar y contempla impuestos y meses más lentos.</p></div>
              <aside className="tool-page-benefits" aria-label="Resumen"><p><span aria-hidden="true">✓</span> Cálculo basado en tus números</p><p><span aria-hidden="true">✓</span> Tarifa por hora y proyecto</p><p><span aria-hidden="true">✓</span> Contexto para Chile en 2026</p></aside>
            </div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Primero: encuentra tu piso</p><h2>No todas tus horas de trabajo son horas facturables</h2><p>Además de ejecutar proyectos, un freelance dedica tiempo a ventas, propuestas, administración, reuniones, aprendizaje y seguimiento. Si divides tu meta mensual entre todas las horas del mes, puedes terminar cobrando demasiado poco.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><h3>1. Define tu ingreso objetivo</h3><p>Parte del monto que necesitas obtener para que trabajar por cuenta propia sea sostenible.</p><h3>2. Suma costos del negocio</h3><p>Software, internet, equipos, servicios profesionales y otros gastos necesarios para trabajar también deben financiarse.</p></article>
              <article className="tool-info-card"><h3>3. Estima horas facturables</h3><p>Usa las horas que razonablemente podrás cobrar a clientes, no todas las horas que estarás frente al computador.</p><h3>4. Añade margen de seguridad</h3><p>Vacaciones, enfermedad, retrasos de clientes y meses con menor demanda justifican mantener un colchón.</p></article>
            </div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Chile 2026</p><h2>Considera la retención de las boletas de honorarios</h2><p>Durante 2026 la retención aplicable a boletas de honorarios es 15,25%. Esa retención no debe confundirse con tu utilidad: al fijar precios necesitas distinguir lo facturado, los costos del negocio y el dinero que finalmente queda disponible.</p></div>
            <p className="tool-orientation-note"><strong>Importante:</strong> esta guía es educativa y no reemplaza asesoría tributaria o contable. Verifica tu situación particular antes de tomar decisiones.</p>
          </div>
        </section>

        <section className="tool-related-section">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Pasa de la teoría a tus números</p><h2>Convierte tu tarifa en una cotización</h2><p>Una tarifa útil debe terminar en una propuesta que puedas presentar a un cliente. Usa la herramienta gratuita para calcular un proyecto con tus propios datos.</p></div>
            <div className="tool-page-all-link"><a className="button button-primary" href="/herramientas/cotizacion">Calcular y crear mi cotización →</a></div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Siguiente paso</p><h2>¿Quieres llevarte el cálculo?</h2><p>Empieza gratis. Si después necesitas un sistema más completo para ordenar precios y rentabilidad, tienes una opción premium.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><p className="eyebrow">Gratis</p><h3>{payhipProducts.free.name}</h3><p>{payhipProducts.free.description}</p><a className="button button-primary" href={payhipProducts.free.url} rel="noreferrer" target="_blank">{payhipProducts.free.buttonLabel}</a></article>
              <article className="tool-info-card"><p className="eyebrow">Premium</p><h3>{payhipProducts.premium.name}</h3><p>{payhipProducts.premium.description}</p><a className="button button-primary" href={payhipProducts.premium.url} rel="noreferrer" target="_blank">{payhipProducts.premium.buttonLabel}</a></article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><a className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a><p>Herramientas gratuitas para tomar mejores decisiones de negocio.</p></div></footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
}
