/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid the vinext RSC prefetch runtime error used elsewhere in this site. */
import type { Metadata } from 'next';
import { payhipProducts, trackedPayhipUrl } from '../../lib/payhip-products';
import { siteUrl } from '../../lib/tools';

const path = '/guias/cuanto-cobrar-como-freelance-chile';
const canonical = `${siteUrl}${path}`;
const socialImage =
  'https://raw.githubusercontent.com/miguelcastill85-del/herramientas-rentables/main/public/og.png';

export const metadata: Metadata = {
  title: 'Cuánto cobrar como freelance en Chile en 2026 | Herramientas Rentables',
  description: 'Calcula cuánto cobrar por hora o proyecto en Chile considerando gastos, horas facturables, retención 2026 y margen de seguridad.',
  alternates: { canonical },
  openGraph: {
    type: 'article',
    locale: 'es_CL',
    siteName: 'Herramientas Rentables',
    title: 'Cuánto cobrar como freelance en Chile en 2026',
    description: 'Guía práctica para estimar una tarifa freelance sostenible y convertirla en una cotización.',
    url: canonical,
    images: [{ url: socialImage, width: 1200, height: 630, alt: 'Cuánto cobrar como freelance en Chile' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuánto cobrar como freelance en Chile en 2026',
    description: 'Calcula una tarifa freelance sostenible con tus costos, horas facturables y margen de seguridad.',
    images: [socialImage],
  },
};

export default function FreelanceChileGuide() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Cuánto cobrar como freelance en Chile en 2026',
        description: 'Guía práctica para estimar una tarifa freelance sostenible en Chile.',
        inLanguage: 'es-CL',
        mainEntityOfPage: canonical,
        publisher: { '@type': 'Organization', name: 'Herramientas Rentables', url: siteUrl },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Cómo calcular una tarifa freelance por hora?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Parte de tu ingreso objetivo y tus costos, agrega un margen de seguridad y divide el total por las horas que realmente puedes facturar. No uses todas las horas laborales del mes como horas cobrables.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Conviene cobrar por hora o por proyecto?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La tarifa por hora sirve como piso interno. Para un proyecto, estima horas, complejidad, contingencia y costos externos para convertir ese piso en una cotización completa.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué pasa si mi tarifa queda muy alta para el cliente?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Antes de bajar el precio, revisa alcance, entregables, plazos y costos. Reducir alcance suele ser más sostenible que aceptar un precio que no cubre el trabajo real.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="tool-page">
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
          <nav className="desktop-nav" aria-label="Navegación principal"><a href="/#herramientas">Herramientas</a><a href="/cotizacion-freelance-chile">Cotización profesional</a><a href="/pro">Recursos</a></nav>
          <a className="button button-small button-outline" href="/cotizacion-freelance-chile">Crear cotización profesional</a>
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
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">De tarifa a precio real</p><h2>Usa la tarifa por hora como piso, no como respuesta final</h2><p>Una tarifa mínima te ayuda a saber cuánto debe valer tu tiempo, pero un proyecto también depende del alcance, la complejidad, los cambios esperables y los costos externos. Para servicios cerrados, convierte tu tarifa en una cotización completa y después revisa si el margen final sigue siendo saludable.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><h3>Calcula el proyecto</h3><p>Estima horas, complejidad y contingencia con el <a href="/herramientas/cotizacion">estimador de cotización</a>.</p></article>
              <article className="tool-info-card"><h3>Comprueba la rentabilidad</h3><p>Si vendes servicios con costos adicionales, revisa el resultado con la <a href="/herramientas/margen">calculadora de margen</a> y evita aceptar trabajos que solo aumentan facturación.</p></article>
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
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">De tarifa a propuesta profesional</p><h2>Convierte tu tarifa en una cotización que proteja tu rentabilidad</h2><p>Cuando ya tienes una tarifa de referencia, el siguiente paso no es rellenar una plantilla vacía. Define precio mínimo, margen, anticipo, revisiones, vigencia y alcance antes de presentar la propuesta al cliente.</p></div>
            <div className="tool-page-all-link"><a className="button button-primary" href="/cotizacion-freelance-chile">Construir mi cotización profesional →</a></div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Preguntas frecuentes</p><h2>Dudas comunes al fijar una tarifa freelance</h2></div>
            <div className="faq-list">
              <details><summary>¿Cómo calcular una tarifa freelance por hora?</summary><p>Parte de tu ingreso objetivo y tus costos, agrega un margen de seguridad y divide el total por las horas que realmente puedes facturar. No uses todas las horas laborales del mes como horas cobrables.</p></details>
              <details><summary>¿Conviene cobrar por hora o por proyecto?</summary><p>La tarifa por hora sirve como piso interno. Para un proyecto, estima horas, complejidad, contingencia y costos externos para convertir ese piso en una cotización completa.</p></details>
              <details><summary>¿Qué pasa si mi tarifa queda muy alta para el cliente?</summary><p>Antes de bajar el precio, revisa alcance, entregables, plazos y costos. Reducir alcance suele ser más sostenible que aceptar un precio que no cubre el trabajo real.</p></details>
            </div>
          </div>
        </section>

        <section className="tool-page-explanation">
          <div className="container">
            <div className="section-heading tool-page-section-heading"><p className="eyebrow">Siguiente paso</p><h2>¿Quieres llevarte el cálculo?</h2><p>Empieza gratis. Si después necesitas un sistema más completo para ordenar precios y rentabilidad, tienes una opción premium.</p></div>
            <div className="tool-content-grid">
              <article className="tool-info-card"><p className="eyebrow">Gratis</p><h3>{payhipProducts.free.name}</h3><p>{payhipProducts.free.description}</p><a className="button button-primary" href={trackedPayhipUrl(payhipProducts.free, 'guia-tarifa-freelance')} rel="noreferrer" target="_blank">{payhipProducts.free.buttonLabel}</a></article>
              <article className="tool-info-card"><p className="eyebrow">Premium</p><h3>{payhipProducts.premium.name}</h3><p>{payhipProducts.premium.description}</p><a className="button button-primary" href={trackedPayhipUrl(payhipProducts.premium, 'guia-tarifa-freelance')} rel="noreferrer" target="_blank">{payhipProducts.premium.buttonLabel}</a></article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><a className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a><p>Herramientas gratuitas para tomar mejores decisiones de negocio.</p></div></footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
}
