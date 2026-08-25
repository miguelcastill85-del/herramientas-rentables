'use client';

import { useMemo, useState } from 'react';

type Category = 'Finanzas' | 'Marketing' | 'Ventas' | 'Operaciones';
type Filter = 'Todas' | Category;

const tools: Array<{
  name: string;
  description: string;
  category: Category;
  code: string;
  available: boolean;
}> = [
  {
    name: 'Calculadora de margen',
    description: 'Conoce tu utilidad mensual y el porcentaje real que conserva tu negocio.',
    category: 'Finanzas',
    code: '01',
    available: true,
  },
  {
    name: 'Punto de equilibrio',
    description: 'Calcula cuántas ventas necesitas para cubrir todos tus costos.',
    category: 'Finanzas',
    code: '02',
    available: false,
  },
  {
    name: 'Comparador de comisiones',
    description: 'Compara escenarios de cobro y elige el canal que protege mejor tu margen.',
    category: 'Ventas',
    code: '03',
    available: false,
  },
  {
    name: 'Constructor de enlaces UTM',
    description: 'Ordena tus campañas con enlaces medibles y listos para compartir.',
    category: 'Marketing',
    code: '04',
    available: false,
  },
  {
    name: 'Estimador de horas',
    description: 'Convierte tiempo, tarifa y complejidad en una cotización sostenible.',
    category: 'Operaciones',
    code: '05',
    available: false,
  },
  {
    name: 'Diagnóstico de precios',
    description: 'Revisa costos, valor percibido y objetivos antes de fijar tu próximo precio.',
    category: 'Ventas',
    code: '06',
    available: false,
  },
];

const categories: Filter[] = ['Todas', 'Finanzas', 'Marketing', 'Ventas', 'Operaciones'];

const money = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

function safeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export default function Home() {
  const [sales, setSales] = useState(2_500_000);
  const [fixedCosts, setFixedCosts] = useState(900_000);
  const [variableRate, setVariableRate] = useState(12);
  const [activeCategory, setActiveCategory] = useState<Filter>('Todas');
  const [query, setQuery] = useState('');

  const variableCosts = sales * (variableRate / 100);
  const profit = sales - fixedCosts - variableCosts;
  const margin = sales > 0 ? (profit / sales) * 100 : 0;

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === 'Todas' || tool.category === activeCategory;
      const searchable = `${tool.name} ${tool.description} ${tool.category}`.toLocaleLowerCase('es');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, query]);

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="#inicio" aria-label="Herramientas Rentables, inicio">
            <span className="brand-mark" aria-hidden="true">HR</span>
            <span>Herramientas Rentables</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="#herramientas">Herramientas</a>
            <a href="#metodo">Cómo funciona</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <a className="button button-small" href="#calculadora">Probar calculadora</a>
        </div>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true" /> Decisiones simples, negocios más sanos</p>
              <h1 id="hero-title">Haz que cada peso <em>cuente.</em></h1>
              <p className="hero-lead">
                Calculadoras y recursos claros para entender tus números, fijar mejores
                precios y dedicar energía a lo que sí hace crecer tu negocio.
              </p>
              <div className="hero-actions">
                <a className="button" href="#calculadora">Calcular mi margen <span aria-hidden="true">→</span></a>
                <a className="text-link" href="#herramientas">Ver todas las herramientas</a>
              </div>
              <ul className="trust-list" aria-label="Beneficios principales">
                <li>Sin registro</li>
                <li>Resultados inmediatos</li>
                <li>Datos en tu navegador</li>
              </ul>
            </div>

            <div className="calculator-wrap" id="calculadora">
              <div className="calculator-card">
                <div className="calculator-heading">
                  <div><p className="section-kicker">Herramienta 01</p><h2>Margen mensual</h2></div>
                  <span className="live-badge"><span aria-hidden="true" /> En vivo</span>
                </div>
                <div className="input-grid">
                  <label>
                    Ventas mensuales
                    <span className="input-shell"><span aria-hidden="true">$</span>
                      <input type="number" inputMode="numeric" min="0" step="50000" value={sales}
                        onChange={(event) => setSales(safeNumber(event.target.value))} />
                    </span>
                  </label>
                  <label>
                    Costos fijos
                    <span className="input-shell"><span aria-hidden="true">$</span>
                      <input type="number" inputMode="numeric" min="0" step="50000" value={fixedCosts}
                        onChange={(event) => setFixedCosts(safeNumber(event.target.value))} />
                    </span>
                  </label>
                  <label>
                    Costos variables
                    <span className="input-shell">
                      <input type="number" inputMode="decimal" min="0" max="100" step="1" value={variableRate}
                        onChange={(event) => setVariableRate(Math.min(safeNumber(event.target.value), 100))} />
                      <span aria-hidden="true">%</span>
                    </span>
                  </label>
                </div>
                <div className="result-panel" aria-live="polite" aria-atomic="true">
                  <div><span>Utilidad estimada</span><strong className={profit < 0 ? 'negative' : undefined}>{money.format(profit)}</strong></div>
                  <div className="margin-result"><span>Margen</span><strong className={margin < 0 ? 'negative' : undefined}>{margin.toFixed(1)}%</strong></div>
                </div>
                <p className="calculator-note">Estimación orientativa. Revisa impuestos y costos específicos antes de tomar decisiones.</p>
              </div>
              <p className="privacy-note"><span aria-hidden="true">●</span> Tus datos no salen de este dispositivo</p>
            </div>
          </div>
        </section>

        <section className="tools-section" id="herramientas" aria-labelledby="tools-title">
          <div className="container">
            <div className="section-heading">
              <div><p className="section-kicker">Tu caja de herramientas</p><h2 id="tools-title">Menos intuición. Más claridad.</h2></div>
              <p>Recursos breves para responder las preguntas que aparecen todos los días al dirigir un negocio.</p>
            </div>
            <div className="tool-controls">
              <div className="category-list" aria-label="Filtrar por categoría">
                {categories.map((category) => (
                  <button key={category} className={activeCategory === category ? 'active' : undefined}
                    type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>
                    {category}
                  </button>
                ))}
              </div>
              <label className="search-field">
                <span className="sr-only">Buscar herramientas</span><span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Buscar herramienta" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
            </div>
            <p className="results-summary" aria-live="polite">
              {filteredTools.length} {filteredTools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}
            </p>
            <div className="tool-grid">
              {filteredTools.map((tool) => (
                <article className="tool-card" key={tool.name}>
                  <div className="tool-card-top">
                    <span className="tool-code" aria-hidden="true">{tool.code}</span>
                    <span className={`status ${tool.available ? 'available' : ''}`}>{tool.available ? 'Disponible' : 'Próximamente'}</span>
                  </div>
                  <p className="tool-category">{tool.category}</p><h3>{tool.name}</h3><p>{tool.description}</p>
                  {tool.available ? (
                    <a href="#calculadora" aria-label={`Abrir ${tool.name}`}>Abrir herramienta <span aria-hidden="true">↗</span></a>
                  ) : (
                    <span className="coming-link" aria-label={`${tool.name}: próximamente`}>En preparación <span aria-hidden="true">·</span></span>
                  )}
                </article>
              ))}
            </div>
            {filteredTools.length === 0 && (
              <div className="empty-state" role="status">
                <strong>No encontramos coincidencias.</strong><p>Prueba otra palabra o selecciona la categoría “Todas”.</p>
                <button type="button" onClick={() => { setQuery(''); setActiveCategory('Todas'); }}>Limpiar filtros</button>
              </div>
            )}
          </div>
        </section>

        <section className="method-section" id="metodo" aria-labelledby="method-title">
          <div className="container method-grid">
            <div className="method-intro">
              <p className="section-kicker">Diseñado para avanzar</p><h2 id="method-title">Una respuesta útil en menos de tres minutos.</h2>
              <p>Sin fórmulas escondidas ni paneles abrumadores. Cada herramienta se concentra en una decisión concreta.</p>
            </div>
            <ol className="steps-list">
              <li><span>01</span><div><h3>Ingresa lo esencial</h3><p>Solo pedimos los datos necesarios para calcular tu escenario.</p></div></li>
              <li><span>02</span><div><h3>Entiende el resultado</h3><p>Presentamos cifras legibles, contexto y supuestos transparentes.</p></div></li>
              <li><span>03</span><div><h3>Decide con confianza</h3><p>Compara alternativas y vuelve cuando cambien tus números.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="faq-section" id="preguntas" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div><p className="section-kicker">Preguntas frecuentes</p><h2 id="faq-title">Lo importante, claro desde el inicio.</h2></div>
            <div className="faq-list">
              <details><summary>¿Necesito crear una cuenta?</summary><p>No. Puedes usar las herramientas disponibles sin registrarte ni entregar datos personales.</p></details>
              <details><summary>¿Guardan la información que ingreso?</summary><p>No. En esta versión, los cálculos se realizan en tu navegador y no se envían a un servidor.</p></details>
              <details><summary>¿Los resultados reemplazan asesoría profesional?</summary><p>No. Son estimaciones para explorar escenarios. Las decisiones contables, tributarias o legales deben revisarse con un especialista.</p></details>
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <div className="container cta-shell">
            <div><p className="section-kicker">Empieza por tus números</p><h2 id="cta-title">Tu próxima buena decisión puede comenzar aquí.</h2></div>
            <a className="button button-light" href="#calculadora">Calcular mi margen <span aria-hidden="true">↑</span></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <a className="brand footer-brand" href="#inicio"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
          <p>Recursos simples para tomar mejores decisiones de negocio.</p>
          <p>© {new Date().getFullYear()} Herramientas Rentables</p>
        </div>
      </footer>
    </>
  );
}
