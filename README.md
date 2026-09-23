# BiblioTech

Gestión de biblioteca personal: catálogo de libros, autores y ubicaciones físicas jerárquicas.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 + CSS Variables |
| UI | shadcn/ui + Radix UI + Lucide React + Motion |
| Backend | Next.js Route Handlers + Server Actions (RSC) |
| Base de datos | Supabase (PostgreSQL, Auth, RLS) |
| Auth | Supabase Auth (email/pass + Google OAuth) |
| PWA | Serwist (service worker, offline, Web Push) |
| i18n | next-intl (es, en, ca, gl, eu, fr con routing `/[locale]`) |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions → Vercel |

## Desarrollo

```bash
npm install
cp .env.example .env   # define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Scripts disponibles:

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm run start` — build y producción
- `npm run lint` / `npm run typecheck`
- `npm test` — Vitest
- `npm run test:e2e` — Playwright

## Arquitectura

- **RSC**: las páginas en `src/app/[locale]/(protected)` obtienen datos directamente de Supabase con cliente de servidor (`src/lib/supabase/server.ts`), respetando RLS.
- **Server Actions**: mutaciones en `src/lib/actions/*.ts` con validación zod y `revalidatePath`.
- **Middleware**: `src/middleware.ts` combina i18n (next-intl) con refresco de sesión de Supabase y protección de rutas.
- **Callback OAuth**: `src/app/api/auth/callback/route.ts` intercambia el código de sesión (PKCE).
- **PWA**: `src/app/sw.ts` + `manifest.json`; las suscripciones push se guardan en `push_subscriptions`.

## Base de datos

`supabase-schema.sql` contiene el esquema aplicable desde el SQL Editor de Supabase.

## Despliegue

En Vercel: configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y las claves VAPID para Web Push. El redirect URI de Google OAuth debe ser `<origin>/api/auth/callback`.
