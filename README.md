# BiblioTech

Gestión de biblioteca personal: catálogo de libros, autores y ubicaciones físicas
jerárquicas (casa → habitación → estantería). PWA instalable con soporte offline,
Web Push y 6 idiomas.

> Contexto para agentes de código en [AGENT.md](AGENT.md).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 + CSS Variables |
| UI | shadcn/ui + Radix UI + Lucide React + Motion |
| Backend | Server Actions + Route Handlers (RSC) |
| Base de datos | Supabase (PostgreSQL, RLS) |
| Auth | Supabase Auth (email/pass + Google OAuth PKCE) |
| PWA | Serwist (service worker, offline, Web Push) |
| i18n | next-intl — es, en, ca, gl, eu, fr con routing `/[locale]` |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions → Vercel |

## Desarrollo

```bash
npm install
cp .env.example .env   # define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Scripts disponibles:

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build de producción y arranque |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |

## Arquitectura

- **RSC**: las páginas protegidas en `src/app/[locale]/(protected)` obtienen los
  datos directamente de Supabase con el cliente de servidor
  (`src/lib/supabase/server.ts`) y respetan RLS.
- **Server Actions**: mutaciones en `src/lib/actions/*.ts` con validación zod y
  `revalidatePath` tras cada cambio.
- **Middleware**: `src/middleware.ts` combina i18n (next-intl) con el refresco de
  sesión de Supabase y la protección de rutas → redirige a `/{locale}/login`.
- **OAuth**: `src/app/api/auth/callback/route.ts` intercambia el código de sesión (PKCE).
- **PWA**: `src/app/sw.ts` + `src/app/manifest.json`; fallback offline
  (`public/offline.html`) y suscripciones push en la tabla `push_subscriptions`.
- **i18n**: `src/i18n/routing.ts` + mensajes en `messages/{es,en,ca,gl,eu,fr}.json`.

## Base de datos

`supabase-schema.sql` contiene el esquema completo (profiles, authors,
location_nodes, books, book_comments, push_subscriptions + triggers, índices y
policies RLS) para ejecutar desde el SQL Editor de Supabase.

## Despliegue

En Vercel, configurar:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Web Push)
- En Google OAuth, registrar el redirect URI `<origin>/api/auth/callback`
- Secrets `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` en GitHub para el CI

## Web Push

1. Genera las claves VAPID: `npm run vapid` y ponlas en `.env.local` / Vercel:
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
2. Al iniciar sesión, la app registra el service worker y sucribe automáticamente
   el navegador; la suscripción se guarda en `push_subscriptions`.
3. Para enviar una notificación al usuario autenticado:
   `POST /api/push/send` con `{"title": "...", "body": "...", "url": "/books"}`.
   Las suscripciones caducadas (404/410) se limpian automáticamente.
