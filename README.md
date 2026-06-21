# ContIA Argentina — MVP (Fase 1)

Comparador inteligente de balances. Dos proyectos separados: `contia-backend` (Node/Express + PostgreSQL)
y `contia-frontend` (Next.js 15).

Reutiliza patrones ya probados en `control-rt54`: render de PDF a PNG escala 3.0 + Claude Vision para
extracción, hashing con scrypt, alertas IA calibradas ERROR/OBSERVACION.

## 1. Requisitos

- Node.js 20+
- PostgreSQL 15+ (local o gestionado: Render, Railway, Supabase)
- Bucket S3-compatible (Cloudflare R2, AWS S3, o Supabase Storage)
- API key de Anthropic

## 2. Backend

```bash
cd contia-backend
cp .env.example .env
# completar DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, credenciales S3
```

**Windows sin WSL:** instalá ignorando los scripts de compilación nativa (evita el error de `canvas`/GTK):
```bash
npm install --ignore-scripts
```
Y en tu `.env`, agregá:
```
PDF_EXTRACTION_MODE=mock
```
Así el servidor arranca normal y la extracción de PDF devuelve cuentas de prueba en vez de leer el archivo real —
suficiente para probar login, empresas, comparación e informes. La extracción real la probás cuando subas a Render.

**Mac/Linux/WSL:** instalación normal, sin mock:
```bash
npm install
```

```bash
npm run migrate   # crea las tablas (migrations/001_init.sql)
npm run dev        # http://localhost:4000
```

Nota sobre `canvas` en producción: requiere librerías nativas del sistema (cairo, pango, etc.). El `Dockerfile`
incluido ya las instala para el deploy en Render — ahí no hace falta `PDF_EXTRACTION_MODE=mock`.

## 3. Frontend

```bash
cd contia-frontend
cp .env.local.example .env.local
npm install
npm run dev   # http://localhost:3000
```

## 4. Flujo funcional del MVP

1. Registro/login (`/registro`, `/login`)
2. Alta de empresa (`/empresas/nueva`)
3. Comparar balances (`/balances/comparar`): subir PDF ejercicio A y B
4. El backend procesa cada PDF en background (extracción IA) — el frontend hace polling de `estado_proceso`
5. Al estar ambos `listo`, se dispara la comparación (`POST /api/analisis`)
6. Resultado (`/resultado/[analisisId]`): variaciones, ratios, alertas IA, descarga DOCX/PDF

## 5. Deploy sugerido

- Backend: Render (Web Service, Dockerfile) o Railway
- Frontend: Vercel o Render (Static/Node)
- DB: Render PostgreSQL, Railway PostgreSQL o Supabase
- Storage: Cloudflare R2 (gratis hasta 10GB) o Supabase Storage

## 6. Pendiente para cerrar el criterio de salida de Fase 1

- [ ] Probar extracción IA contra balances reales (ajustar PROMPT_EXTRACCION en `pdfExtractor.js` según resultados)
- [ ] Definir clasificación corriente/no corriente en el prompt para ratio de liquidez real
- [ ] Reforzar validación de pertenencia en `balances.controller.js` (`obtenerUno`/`obtenerCuentas`) con join a empresas
- [ ] Configurar bucket S3-compatible y completar variables de entorno
- [ ] Deploy de ambos servicios + variables de entorno en producción
