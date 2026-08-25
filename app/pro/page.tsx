/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a vinext RSC prefetch runtime error. */
import type { Metadata } from 'next';
import { PayhipOffers } from '../components/payhip-offers';
import { payhipProducts } from '../lib/payhip-products';
import { siteUrl } from '../lib/tools';

const canonical = `${siteUrl}/pro`;
const socialImage =
  'https://raw.githubusercontent.com/miguelcastill85-del/herramientas-rentables/main/public/og.png';
const pageTitle = 'Recursos gratuitos y premium para freelancers';
const pageDescription =
  'Conoce la Calculadora Gratis de Tarifa Freelance y el Sistema Freelance Rentable disponibles en Payhip.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Herramientas Rentables',
    title: pageTitle,
    description: pageDescription,
    url: canonical,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Herramientas Rentables — Haz que cada peso cuente.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [socialImage],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageTitle,
  description: pageDescription,
  url: canonical,
  inLanguage: 'es-CL',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Herramientas Rentables',
    url: siteUrl,
  },
};

export default function ProPage() {
  return (
    <div className="pro-page">
      <a className="skip-link" href="#contenido-pro">Saltar al contenido</a>
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="/" aria-label="Ir al inicio de Herramientas Rentables">
            <span className="brand-mark" aria-hidden="true">HR</span>
            <span>Herramientas Rentables</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="/#herramientas">Herramientas</a>
            <a href="/pro" aria-current="page">Recursos</a>
            <a href="/#preguntas">Preguntas frecuentes</a>
          </nav>
          <a className="button button-small" href="/herramientas/cotizacion">Calcular cotización</a>
        </div>
      </header>

      <main id="contenido-pro">
        <section className="pro-hero" aria-labelledby="pro-title">
          <div className="container pro-hero-grid">
            <div>
              <p className="eyebrow"><span aria-hidden="true" /> Recursos disponibles en Payhip</p>
              <h1 id="pro-title">Recursos gratuitos y premium para freelancers.</h1>
              <p className="pro-hero-lead">
                Herramientas Rentables conecta contigo dos productos existentes: una opción gratuita y una alternativa premium más completa. Puedes revisar ambas directamente en sus páginas públicas de Payhip.
              </p>
              <div className="pro-hero-actions">
                <a className="button" href="#opciones">Ver las opciones <span aria-hidden="true">↓</span></a>
                <a className="text-link" href="/herramientas/cotizacion">Volver a la calculadora</a>
              </div>
            </div>
            <aside className="pro-summary-card" aria-label="Resumen de opciones">
              <p><strong>Opción gratuita</strong><span>{payhipProducts.free.name}</span></p>
              <p><strong>Opción premium</strong><span>{payhipProducts.premium.name}</span></p>
              <small>Payhip gestiona checkout, pago y entrega.</small>
            </aside>
          </div>
        </section>

        <div className="pro-options" id="opciones">
          <div className="container">
            <PayhipOffers variant="page" />
          </div>
        </div>

        <section className="pro-transparency" aria-labelledby="transparency-title">
          <div className="container pro-transparency-grid">
            <div>
              <p className="section-kicker">Antes de continuar</p>
              <h2 id="transparency-title">Información clara, sin checkout propio.</h2>
            </div>
            <div>
              <p>Los botones te llevan a Payhip, donde puedes consultar la descripción y condiciones vigentes de cada producto antes de elegir.</p>
              <p>Las seis calculadoras de Herramientas Rentables siguen siendo gratuitas y funcionan directamente en tu navegador.</p>
            </div>
          </div>
        </section>

        <section className="pro-back-section" aria-label="Continuar con las herramientas">
          <div className="container pro-back-shell">
            <div>
              <p className="section-kicker">¿Prefieres seguir calculando?</p>
              <h2>Vuelve a las herramientas gratuitas.</h2>
            </div>
            <a className="button button-light" href="/#herramientas">Ver todas las herramientas</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <a className="brand footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">HR</span>
            <span>Herramientas Rentables</span>
          </a>
          <p>Herramientas y recursos para tomar mejores decisiones de negocio.</p>
          <p><a className="footer-text-link" href="/#herramientas">Herramientas gratuitas</a></p>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
