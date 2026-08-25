# Herramientas Rentables

**Herramientas Rentables** es una colección de seis calculadoras gratuitas para tomar mejores decisiones de negocio. Todos los cálculos se ejecutan en el navegador, sin cuentas, APIs externas ni almacenamiento de los valores ingresados.

## Características

- Diseño responsive para móvil, tablet y escritorio.
- Calculadora de margen con utilidad, costos variables e indicador visual.
- Punto de equilibrio en unidades y facturación.
- Comparador de comisiones entre dos canales de venta.
- Constructor de enlaces UTM con validación y copia al portapapeles.
- Estimador de horas y cotización con multiplicadores de complejidad documentados.
- Diagnóstico de precios y cálculo de precio mínimo según margen objetivo.
- Catálogo de herramientas con búsqueda y filtros.
- Página independiente y compartible para cada herramienta, con explicación, metodología y ejemplos.
- Navegación semántica, foco visible, enlace de salto y regiones dinámicas accesibles.
- Metadatos SEO, Open Graph, Twitter Cards, JSON-LD, `robots.txt` y manifiesto web.
- Validaciones automáticas de contenido, lint, TypeScript y build de producción.
- GitHub Actions en cada push a `main` o `feat/**` y en Pull Requests hacia `main`.

## Requisitos

- Node.js 22.13 o superior.
- pnpm 11.19.0.

## Desarrollo local

```bash
pnpm install --frozen-lockfile
pnpm dev
```

El servidor de desarrollo muestra la URL local disponible, normalmente `http://localhost:3000`.

## Validaciones

```bash
pnpm check:content
pnpm lint
pnpm typecheck
pnpm build
```

Para ejecutar todo en el mismo orden que CI:

```bash
pnpm validate
```

## Estructura principal

```text
app/
  components/        Calculadoras reutilizables ejecutadas en el navegador
  herramientas/      Rutas públicas individuales de las seis herramientas
  lib/tools.ts       Catálogo, contenido SEO y relaciones entre herramientas
  globals.css        Estilos globales y responsive
  layout.tsx         Metadatos, idioma y datos estructurados
  page.tsx           Portada, catálogo, búsqueda y filtros
  sitemap.ts         Sitemap dinámico de las páginas públicas
public/
  robots.txt         Reglas para rastreadores
  site.webmanifest   Metadatos de instalación
scripts/
  validate-site.mjs  Comprobaciones estructurales y de contenido
.github/workflows/
  validate.yml       Pipeline de validación
```

## Rutas públicas

- `/herramientas/margen`
- `/herramientas/punto-de-equilibrio`
- `/herramientas/comparador-comisiones`
- `/herramientas/utm`
- `/herramientas/cotizacion`
- `/herramientas/diagnostico-precios`

## Privacidad y alcance

Los cálculos se ejecutan íntegramente en el navegador. El sitio no usa APIs externas, base de datos, autenticación ni suscripciones, y no envía ni almacena los valores ingresados. Los resultados son estimaciones orientativas y no sustituyen asesoría contable, tributaria o legal.

### Multiplicadores de complejidad

El estimador de cotización aplica estos multiplicadores al costo base (`horas × tarifa`):

- Baja: `1,00`.
- Media: `1,20`.
- Alta: `1,40`.

La contingencia se calcula después del ajuste por complejidad; los costos externos se agregan al final.
