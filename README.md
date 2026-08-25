# Herramientas Rentables

Primera versión profesional de **Herramientas Rentables**, una colección de calculadoras y recursos claros para tomar mejores decisiones de negocio. Incluye una calculadora de margen funcional, buscador y filtros por categoría.

## Características

- Diseño responsive para móvil, tablet y escritorio.
- Calculadora de utilidad y margen mensual en tiempo real.
- Catálogo de herramientas con búsqueda y filtros.
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
  globals.css        Estilos globales y responsive
  layout.tsx         Metadatos, idioma y datos estructurados
  page.tsx           Interfaz e interacciones del sitio
public/
  robots.txt         Reglas para rastreadores
  site.webmanifest   Metadatos de instalación
scripts/
  validate-site.mjs  Comprobaciones estructurales y de contenido
.github/workflows/
  validate.yml       Pipeline de validación
```

## Privacidad y alcance

Los cálculos se ejecutan en el navegador y esta versión no envía ni almacena los valores ingresados. Los resultados son estimaciones orientativas y no sustituyen asesoría contable, tributaria o legal.
