import type { Metadata, Viewport } from 'next';
import { siteUrl } from './lib/tools';
import './globals.css';

const siteTitle = 'Herramientas Rentables';
const siteDescription =
  'Seis herramientas gratuitas para calcular margen, punto de equilibrio, comisiones, enlaces UTM, cotizaciones y precios desde tu navegador.';
const socialImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} | Decisiones simples para negocios sanos`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    'herramientas para negocios',
    'calculadora de margen',
    'rentabilidad',
    'costos',
    'emprendimiento',
  ],
  authors: [{ name: siteTitle }],
  creator: siteTitle,
  alternates: { canonical: siteUrl },
  verification: {
    google: '6X927-cp0Vh8-3Y0WaVK84eblVDkR7Z27XXkomdzSbw',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: siteTitle,
    title: `${siteTitle} | Haz que cada peso cuente`,
    description: siteDescription,
    url: siteUrl,
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
    title: `${siteTitle} | Haz que cada peso cuente`,
    description: siteDescription,
    images: [socialImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#132a24',
  colorScheme: 'light',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteTitle,
  url: siteUrl,
  description: siteDescription,
  inLanguage: 'es-CL',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
