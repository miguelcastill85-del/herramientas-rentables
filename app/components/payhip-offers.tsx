import { payhipProductList, trackedPayhipUrl } from '../lib/payhip-products';

type PayhipOffersProps = {
  variant?: 'compact' | 'page';
  campaign?: string;
};

export function PayhipOffers({ variant = 'compact', campaign }: PayhipOffersProps) {
  const trackedCampaign = campaign ?? (variant === 'compact' ? 'estimador-horas-cotizacion' : 'recursos-freelance');

  return (
    <section className={`payhip-offers payhip-offers-${variant}`} aria-labelledby={`payhip-heading-${variant}`}>
      <div className="payhip-offers-heading">
        <p className="section-kicker">Recursos para freelancers</p>
        <h2 id={`payhip-heading-${variant}`}>
          {variant === 'compact' ? '¿Quieres llevar este cálculo más lejos?' : 'Elige la opción que mejor encaje contigo'}
        </h2>
        <p>
          {variant === 'compact'
            ? 'El cotizador gratuito resuelve una propuesta puntual. Empieza por tu tarifa, trabaja con precios y márgenes en el sistema premium o conecta cotización, alcance e historial con el sistema avanzado v2.2 en inglés.'
            : 'Elige entre el recurso gratuito de tarifa, el Sistema Freelance Rentable y el sistema avanzado v2.2 en inglés. Revisa el contenido y el precio de cada opción antes de comprar.'}
        </p>
      </div>

      <div className="payhip-product-grid">
        {payhipProductList.map((product) => (
          <article className={`payhip-product-card ${product.kind}`} key={product.kind}>
            <span className="payhip-product-label">{product.label}</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>{product.details}</strong></p>
            {product.compatibility && <p className="payhip-compatibility">{product.compatibility}</p>}
            <a
              className={`button payhip-product-button ${product.kind === 'free' ? 'button-outline' : ''}`}
              href={trackedPayhipUrl(product, trackedCampaign)}
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
