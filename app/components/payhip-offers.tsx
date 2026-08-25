import { payhipProductList } from '../lib/payhip-products';

export function PayhipOffers({ variant = 'compact' }: { variant?: 'compact' | 'page' }) {
  return (
    <section className={`payhip-offers payhip-offers-${variant}`} aria-labelledby={`payhip-heading-${variant}`}>
      <div className="payhip-offers-heading">
        <p className="section-kicker">Recursos para freelancers</p>
        <h2 id={`payhip-heading-${variant}`}>
          {variant === 'compact' ? '¿Quieres llevar este cálculo más lejos?' : 'Elige la opción que mejor encaje contigo'}
        </h2>
        <p>
          {variant === 'compact'
            ? 'Continúa en Payhip con una opción gratuita o conoce el sistema premium.'
            : 'Puedes empezar con el recurso gratuito o revisar la alternativa premium más completa.'}
        </p>
      </div>

      <div className="payhip-product-grid">
        {payhipProductList.map((product) => (
          <article className={`payhip-product-card ${product.kind}`} key={product.kind}>
            <span className="payhip-product-label">{product.label}</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <a
              className={`button payhip-product-button ${product.kind === 'free' ? 'button-outline' : ''}`}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${product.buttonLabel} en Payhip (se abre en una pestaña nueva)`}
            >
              {product.buttonLabel} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>

      <p className="payhip-disclosure">
        Checkout, pago y entrega se gestionan en Payhip. Revisa allí la información vigente de cada producto.
      </p>
    </section>
  );
}
