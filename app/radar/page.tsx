import type { Metadata } from 'next';
import Link from 'next/link';

const dashboardUrl = 'https://radar-rentable-estado.miguelcastill85.workers.dev/dashboard';

export const metadata: Metadata = {
  title: 'Radar de Compras Ágiles',
  description:
    'Radar gratuito de Compras Ágiles para detectar canastas de ferretería y mantenimiento con presupuestos y señales de oportunidad.',
  alternates: { canonical: '/radar' },
};

export default function RadarPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header">
        <div className="container nav-shell">
          <Link className="brand" href="/" aria-label="Herramientas Rentables, inicio">
            <span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span>
          </Link>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <Link href="/">Herramientas</Link>
            <a href="/radar" aria-current="page">Radar Compra Ágil</a>
            <a href="/guias/cuanto-cobrar-como-freelance-chile">Guía freelance 2026</a>
            <a href="/pro">Recursos</a>
          </nav>
          <a className="button button-small" href={dashboardUrl} target="_blank" rel="noopener noreferrer">Abrir Radar</a>
        </div>
      </header>

      <main id="contenido">
        <section className="tools-section" aria-labelledby="radar-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Datos públicos + Radar propio</p>
                <h1 id="radar-title">Compras Ágiles con foco en oportunidades rentables.</h1>
              </div>
              <p>
                El Radar prioriza canastas de ferretería y mantenimiento, con rango objetivo de $300.000 a $3.000.000 CLP. Si la API autenticada no está disponible, mantiene accesos al buscador público oficial.
              </p>
            </div>
            <iframe
              title="Radar de Compras Ágiles de Herramientas Rentables"
              src={dashboardUrl}
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-popups"
              style={{
                display: 'block',
                width: '100%',
                minHeight: '1050px',
                border: '1px solid #dfe7e3',
                borderRadius: '24px',
                background: '#f7faf8',
              }}
            />
            <p className="calculator-note" style={{ marginTop: '16px' }}>
              Información orientativa. Revisa siempre la publicación, anexos, plazos y condiciones oficiales antes de cotizar o tomar decisiones comerciales.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></Link>
          <p>Radar gratuito para explorar oportunidades de Compra Ágil junto a nuestras herramientas de negocio.</p>
          <p>© {new Date().getFullYear()} Herramientas Rentables</p>
        </div>
      </footer>
    </>
  );
}
