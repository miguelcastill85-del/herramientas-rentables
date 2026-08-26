'use client';

import { useMemo, useState } from 'react';
import { MarginCalculator } from './components/calculators';
import { tools, type Category } from './lib/tools';

type Filter = 'Todas' | Category;

const categories: Filter[] = ['Todas', 'Finanzas', 'Marketing', 'Ventas', 'Operaciones'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Filter>('Todas');
  const [query, setQuery] = useState('');
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
            <span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="#herramientas">Herramientas</a><a href="/guias/cuanto-cobrar-como-freelance-chile">Guía freelance 2026</a><a href="/pro">Recursos</a><a href="#metodo">Cómo funciona</a><a href="#preguntas">Preguntas</a>
          </nav>
          <a className="button button-small" href="#herramientas">Abrir herramientas</a>
        </div>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true" /> Seis herramientas, decisiones más claras</p>
              <h1 id="hero-title">Haz que cada peso <em>cuente.</em></h1>
              <p className="hero-lead">Calculadoras gratuitas para entender tus números, comparar alternativas y fijar precios con más confianza. Todo se calcula en tu navegador.</p>
              <div className="hero-actions">
                <a className="button" href="#herramientas">Explorar herramientas <span aria-hidden="true">→</span></a>
                <a className="text-link" href="#calculadora">Calcular mi margen</a>
              </div>
              <ul className="trust-list" aria-label="Beneficios principales"><li>Sin registro</li><li>100% gratuitas</li><li>Datos en tu navegador</li></ul>
              <a className="hero-resource-link" href="/guias/cuanto-cobrar-como-freelance-chile">Guía 2026: cuánto cobrar como freelance en Chile <span aria-hidden="true">→</span></a>
              <a className="hero-resource-link" href="/pro">Conocer recursos para freelancers <span aria-hidden="true">→</span></a>
              <a className="hero-resource-link" href="/guias/cuanto-cobrar-como-freelance-chile">Guía 2026: cuánto cobrar como freelance en Chile <span aria-hidden="true">→</span></a>
            </div>
            <div className="calculator-wrap" id="calculadora" tabIndex={-1}>
              <div className="calculator-card">
                <div className="calculator-heading">
                  <div><p className="section-kicker">Herramienta destacada</p><h2>Margen mensual</h2></div>
                  <span className="live-badge"><span aria-hidden="true" /> Disponible</span>
                </div>
                <MarginCalculator idPrefix="hero-margin" hero />
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
              <p>Seis recursos gratuitos para responder preguntas reales sobre costos, ventas, marketing, tiempo y precios.</p>
            </div>
            <div className="tool-controls">
              <div className="category-list" aria-label="Filtrar por categoría">
                {categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : undefined}
                  type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
              </div>
              <label className="search-field"><span className="sr-only">Buscar herramientas</span><span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Buscar herramienta" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
            </div>
            <p className="results-summary" aria-live="polite">{filteredTools.length} {filteredTools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}</p>
            <div className="tool-grid">
              {filteredTools.map((tool) => <article className="tool-card" key={tool.id}>
                <div className="tool-card-top"><span className="tool-code" aria-hidden="true">{tool.code}</span><span className="status available">Disponible</span></div>
                <p className="tool-category">{tool.category}</p><h3>{tool.name}</h3><p>{tool.description}</p>
                <a href={tool.path} aria-label={`Abrir ${tool.name}`}>Abrir herramienta <span aria-hidden="true">↗</span></a>
              </article>)}
            </div>
            {filteredTools.length === 0 && <div className="empty-state" role="status"><strong>No encontramos coincidencias.</strong>
              <p>Prueba otra palabra o selecciona la categoría “Todas”.</p><button type="button" onClick={() => { setQuery(''); setActiveCategory('Todas'); }}>Limpiar filtros</button>
            </div>}
          </div>
        </section>

        <section className="method-section" id="metodo" aria-labelledby="method-title">
          <div className="container method-grid">
            <div className="method-intro"><p className="section-kicker">Diseñado para avanzar</p><h2 id="method-title">Una respuesta útil en menos de tres minutos.</h2>
              <p>Sin fórmulas escondidas ni paneles abrumadores. Cada herramienta explica sus supuestos y se concentra en una decisión concreta.</p>
            </div>
            <ol className="steps-list"><li><span>01</span><div><h3>Ingresa lo esencial</h3><p>Solo usamos los datos necesarios para calcular tu escenario en el navegador.</p></div></li>
              <li><span>02</span><div><h3>Entiende el resultado</h3><p>Presentamos cifras legibles, contexto, validaciones y fórmulas transparentes.</p></div></li>
              <li><span>03</span><div><h3>Decide con confianza</h3><p>Compara alternativas y vuelve a calcular cuando cambien tus números.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="faq-section" id="preguntas" aria-labelledby="faq-title">
          <div className="container faq-grid"><div><p className="section-kicker">Preguntas frecuentes</p><h2 id="faq-title">Lo importante, claro desde el inicio.</h2></div>
            <div className="faq-list"><details><summary>¿Necesito crear una cuenta o pagar?</summary><p>No. Las seis herramientas son gratuitas y funcionan sin registro.</p></details>
              <details><summary>¿Guardan la información que ingreso?</summary><p>No. Todos los cálculos se realizan en tu navegador y los valores no se envían a servidores.</p></details>
              <details><summary>¿Los resultados reemplazan asesoría profesional?</summary><p>No. Son estimaciones para explorar escenarios. Las decisiones contables, tributarias o legales deben revisarse con un especialista.</p></details>
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title"><div className="container cta-shell"><div><p className="section-kicker">Empieza por tus números</p>
          <h2 id="cta-title">Tu próxima buena decisión puede comenzar aquí.</h2></div><a className="button button-light" href="#herramientas">Abrir herramientas <span aria-hidden="true">↑</span></a>
        </div></section>
      </main>

      <footer className="site-footer"><div className="container footer-grid">
        <a className="brand footer-brand" href="#inicio"><span className="brand-mark" aria-hidden="true">HR</span><span>Herramientas Rentables</span></a>
        <p>Seis herramientas gratuitas para tomar mejores decisiones de negocio. <a className="footer-text-link" href="/guias/cuanto-cobrar-como-freelance-chile">Guía freelance Chile 2026</a> · <a className="footer-text-link" href="/pro">Ver recursos</a></p><p>© {new Date().getFullYear()} Herramientas Rentables</p>
      </div></footer>
    </>
  );
}
