/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a vinext RSC prefetch runtime error. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PayhipOffers } from '../../components/payhip-offers';
import { ToolCalculator } from '../../components/calculators';
import { getToolById, getToolBySlug, siteUrl, tools } from '../../lib/tools';

const socialImage = `${siteUrl}/og.png`;

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {};
  }

  const canonical = `${siteUrl}${tool.path}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      siteName: 'Herramientas Rentables',
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: canonical,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${tool.name} | Herramientas Rentables`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
      images: [socialImage],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = tool.related
    .map((toolId) => getToolById(toolId))
    .filter((relatedTool) => relatedTool !== undefined);
  const canonical = `${siteUrl}${tool.path}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.seoDescription,
    url: canonical,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requiere un navegador web moderno con JavaScript habilitado.',
    inLanguage: 'es',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CLP',
    },
    provider: {
      '@type': 'Organization',
      name: 'Herramientas Rentables',
      url: siteUrl,
    },
  };

  return (
    <div className="tool-page">
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="/" aria-label="Ir al inicio de Herramientas Rentables">
            <span className="brand-mark" aria-hidden="true">HR</span>
            <span>Herramientas Rentables</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="/#herramientas">Herramientas</a>
            <a href="/pro">Recursos</a>
            <a href="/#metodo">Cómo funciona</a>
            <a href="/#preguntas">Preguntas frecuentes</a>
          </nav>
          <a className="button button-small button-outline" href="/#herramientas">
            Ver todas
          </a>
        </div>
      </header>

      <main>
        <section className="tool-page-hero">
          <div className="container">
            <a className="tool-page-back" href="/#herramientas">
              <span aria-hidden="true">←</span> Volver a todas las herramientas
            </a>
            <div className="tool-page-hero-grid">
              <div>
                <p className="eyebrow">{tool.category}</p>
                <h1>{tool.name}</h1>
                <p className="tool-page-lead">{tool.intro}</p>
              </div>
              <aside className="tool-page-benefits" aria-label="Características de la herramienta">
                <p><span aria-hidden="true">✓</span> Gratis y sin registro</p>
                <p><span aria-hidden="true">✓</span> Cálculo instantáneo</p>
                <p><span aria-hidden="true">✓</span> Datos privados en tu navegador</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="tool-page-calculator-section" aria-labelledby="calculator-heading">
          <div className="container">
            <div className="section-heading tool-page-section-heading">
              <p className="eyebrow">Calculadora</p>
              <h2 id="calculator-heading">Haz el cálculo con tus datos</h2>
              <p>Completa los campos para ver una estimación al instante.</p>
            </div>
            <div className="tool-workspace tool-page-workspace">
              <div className="tool-surface">
                <ToolCalculator toolId={tool.id} idPrefix={`page-${tool.slug}`} />
                {tool.id === 'estimate' && (
                  <div className="calculator-payhip-funnel">
                    <PayhipOffers />
                  </div>
                )}
              </div>
              <p className="workspace-privacy">
                <span aria-hidden="true">🔒</span> Tus valores se procesan únicamente en este navegador y no se envían a servidores.
              </p>
            </div>
          </div>
        </section>

        <section className="tool-page-explanation" aria-labelledby="understand-heading">
          <div className="container">
            <div className="section-heading tool-page-section-heading">
              <p className="eyebrow">Entiende tus resultados</p>
              <h2 id="understand-heading">Cómo interpretar esta estimación</h2>
            </div>
            <div className="tool-content-grid">
              <article className="tool-info-card">
                <h3>Qué significa el resultado</h3>
                <ul>
                  {tool.resultMeaning.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article className="tool-info-card">
                <h3>Fórmula y metodología</h3>
                <ol>
                  {tool.methodology.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </article>
            </div>
            <article className="tool-example-card">
              <div>
                <p className="eyebrow">Ejemplo simple</p>
                <h3>Un caso para orientarte</h3>
              </div>
              <p>{tool.example}</p>
            </article>
            <p className="tool-orientation-note">
              <strong>Importante:</strong> esta herramienta entrega una estimación orientativa. Contrasta el resultado con tus costos reales, impuestos y condiciones comerciales antes de tomar una decisión.
            </p>
          </div>
        </section>

        <section className="tool-related-section" aria-labelledby="related-heading">
          <div className="container">
            <div className="section-heading tool-page-section-heading">
              <p className="eyebrow">Sigue analizando</p>
              <h2 id="related-heading">Herramientas relacionadas</h2>
            </div>
            <div className="tool-related-grid">
              {relatedTools.map((relatedTool) => (
                <a className="tool-related-card" href={relatedTool.path} key={relatedTool.id}>
                  <span className="tool-code" aria-hidden="true">{relatedTool.code}</span>
                  <span>
                    <strong>{relatedTool.name}</strong>
                    <small>{relatedTool.description}</small>
                  </span>
                  <span className="related-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
            <div className="tool-page-all-link">
              <a className="button button-primary" href="/#herramientas">Volver a todas las herramientas</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <a className="brand footer-brand" href="/">
              <span className="brand-mark" aria-hidden="true">HR</span>
              <span>Herramientas Rentables</span>
            </a>
            <p>Herramientas simples y gratuitas para tomar mejores decisiones de negocio.</p>
          </div>
          <div className="footer-links">
            <a href="/#herramientas">Herramientas</a>
            <a href="/pro">Recursos</a>
            <a href="/#preguntas">Preguntas frecuentes</a>
            <a href="https://www.instagram.com/herramientasrentables" rel="noreferrer" target="_blank">Instagram</a>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
