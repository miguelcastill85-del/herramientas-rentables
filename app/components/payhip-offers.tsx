import { payhipProductList, trackedPayhipUrl } from '../lib/payhip-products';

export function PayhipOffers({ variant = 'compact' }: { variant?: 'compact' | 'page' }) {
  const campaign = variant === 'compact' ? 'cotizador-generico' : 'recursos-freelance';

  return (
    <section className={`payhip-offers payhip-offers-${variant}`} aria-labelledby={`payhip-heading-${variant}`}>
      <div className="payhip-offers-heading">
        <p className="section-kicker">Recursos para freelancers</p>
        <h2 id={`payhip-heading-${variant}`}>
          {variant === 'compact' ? '¿Quieres llevar este cálculo más lejos?' : 'Elige la opción que mejor encaje contigo'}
        </h2>
        <p>
          {variant === 'compact'
            ? 'El cotizador gratuito resuelve una propuesta puntual. Descarga el recurso de tarifa para empezar o revisa el archivo premium para trabajar con precios y márgenes de forma recurrente.'
            : 'Empieza por tu tarifa con el recurso gratuito. Si necesitas repetir el proceso y revisar la rentabilidad de tus proyectos, conoce el archivo premium.'}
        </p>
      </div>

      <div className="payhip-product-grid">
        {payhipProductList.map((product) => (
          <article className={`payhip-product-card ${product.kind}`} key={product.kind}>
            <span className="payhip-product-label">{product.label}</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>{product.details}</strong></p>
            <a
              className={`button payhip-product-button ${product.kind === 'free' ? 'button-outline' : ''}`}
              href={trackedPayhipUrl(product, campaign)}
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
        Pago y entrega se gestionan en Payhip. Antes de comprar, confirma allí el contenido, el precio final y las condiciones vigentes.
      </p>
    </section>
  );
}
