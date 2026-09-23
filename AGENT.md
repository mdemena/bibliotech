# AGENT.md — Contexto para agentes de código

Punto de partida para asistentes y agentes que trabajen en este repositorio.

## Qué es BiblioTech

Aplicación web para gestionar una biblioteca personal: catálogo de libros, autores
compartidos y ubicaciones físicas jerárquicas (casa → habitación → estantería).
Incluye auth (email/password + Google OAuth), PWA instalable con soporte offline y
Web Push, y está internacionalizada en 6 idiomas (es, en, ca, gl, eu, fr).

## Stack (no cambiar sin consultar al owner)

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript strict (`noUncheckedIndexedAccess` incluido) |
| Estilos | Tailwind CSS v4 + CSS variables |
| UI | shadcn/ui (componentes en `src/components/ui/`) + Radix UI |
| Iconos | Lucide React (no usar react-icons) |
| Animaciones | Motion (paquete `motion`, `motion/react`) |
| Backend | Server Actions + Route Handlers (no API REST propia) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + Google OAuth con PKCE) |
| PWA | Serwist (`src/app/sw.ts`, manifest en `src/app/manifest.json`) |
| i18n | next-intl, routing con prefijo `/[locale]/...` |
| Tests | Vitest (unit) + Playwright (e2e) |
| CI/CD | GitHub Actions → Vercel |

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción (verificar antes de terminar tareas)
npm run lint       # ESLint (flat config, eslint-config-next)
npm run typecheck  # tsc --noEmit (strict)
npm test           # Vitest run
npm run test:e2e   # Playwright (necesita dev server o lo lanza solo)
```

Verificación mínima antes de dar por válido un cambio:
`npm run typecheck && npm run lint && npm test` y, si toca UI o rutas, `npm run build`.

## Arquitectura — dónde vive cada cosa

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/            # landing, login, register (públicas)
│   │   └── (protected)/         # dashboard, books, authors, locations ( requieren sesión)
│   ├── api/auth/callback/       # route handler OAuth ( intercambio de código PKCE)
│   ├── layout.tsx               # html/body, script de tema anti-flash
│   ├── manifest.json            # manifest PWA
│   ├── globals.css              # Tailwind v4 + clases utilitarias (.card, .input, ...)
│   └── sw.ts                    # service worker (Serwist) + handlers de push
├── components/
│   ├── ui/                      # primitivas shadcn/ui (Button, Dialog, Select, ...)
│   └── app/                     # AppShell, forms, StarRating, ThemeToggle, i18n switcher
├── i18n/
│   ├── routing.ts               # locales, createNavigation (Link/redirect/usePathname/useRouter)
│   └── request.ts               # carga de mensajes (referenciada por next.config.ts)
├── lib/
│   ├── supabase/{server,client,middleware}.ts   # clientes SSR — nunca crear otros
│   ├── actions/{auth,books,authors,locations,push}.ts  # "use server"
│   ├── data.ts                  # consultas RSC (solo lectura, respetan RLS)
│   ├── locations.ts             # buildTree / getLocationPath (puro, testable)
│   └── forms.ts                 # FormState compartido de server actions
├── types/
│   ├── database.types.ts        # tipo `Database` schema para supabase-js (incluye Relationships)
│   └── index.ts                 # DTOs/form types de aplicación (Book, Author, LocationNode...)
└── middleware.ts                # next-intl + Supabase session + guard de rutas
```

## Convenciones y "gotchas" importantes

1. **Datos**: las páginas protected son RSC y consultan Supabase directamente con
   `supabaseServerClient()` (RLS decide qué filas ve el usuario). Las mutaciones
   son Server Actions que siempre llaman `revalidatePath` y devuelven
   `{ error: string | null }`. No reintroducir React Query ni clients "browser"
   en páginas server.
2. **Tipado de BD**: si tocas `supabase-schema.sql`, actualizar a mano
   `src/types/database.types.ts` (por tabla: Row/Insert/Update/`Relationships`;
   las `Relationships` son necesarias para que los joins `select("*, author:authors(*)")`
   infieran el tipo). No usar `any`; si hay type errors, arreglar el tipo,
   no hacer `as any`.
3. **Navegación**: dentro de la app usar `Link`/`useRouter`/`usePathname` de
   `@/i18n/routing` (no `next/link` ni `next/navigation`) salvo `redirect` plano
   de `next/navigation` en server actions, y `useLocale` de `next-intl`.
4. **Mensajes**: todos los textos van por i18n — evitar strings hardcodeadas en
   páginas; añadir las keys a los 6 ficheros de `messages/*.json` (indentación de
   4 espacios, consistente con lo existente). Las keys nuevas se
   agregan a todos los locales, nunca solo a uno.
5. **Auth**: las cookies de sesión las gestiona el middleware combinado; el
   matcher es `["/((?!api|_next|_vercel|.*\\..*).*)", "/"]` — si añades rutas
   nuevas en `app/`, no romper el regex (excluye `api` y ficheros con punto).
   Sin sesión en rutas de `(protected)`, el propio middleware redirige a
   `/{locale}/login`.
6. **PWA/Serwist**: `public/sw.js` es un artefacto generado — NO commitearlo ni
   editarlo (está en .gitignore; se compila con `next build`).
7. **ESLint**: no desactivar reglas con `eslint-disable` salvo bloqueo real;
   react-hooks/react-compiler está activo y da error por setState síncrono en
   effects, componentes creados durante el render, etc.
8. **Env vars**: solo `NEXT_PUBLIC_*` y las de Supabase publishable; nunca
   claves `service_role`. Ver `.env.example`. Para Web Push hacen falta
   `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (pendiente de configurar).
9. **Base de datos**: cambios de esquema se documentan/aplican con SQL en
   `supabase-schema.sql` (SQL Editor de Supabase); habilitar RLS + policies con
   `TO authenticated` + predicado de ownership, nunca solo `authenticated`.
10. **Commits**: atómicos, mensaje corto estilo imperativo en inglés o español
    según contexto previo del repo. No commitear artefactos ni secretos.
    El push es a `origin main` directamente (sin PR en repo personal).

## Estado actual / tareas conocidas pendientes

- Iconos PWA generados en `public/icons/` (192/512 + apple-touch-icon).
- Web Push completo: el cliente se suscribe al iniciar sesión y guarda la
  suscripción en `push_subscriptions`; el envío es `POST /api/push/send`
  (`src/lib/push.ts`, firma VAPID con `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`,
  limpieza de suscripciones caducadas 404/410). Solo falta un job o UX que
  dispare notificaciones reales (p. ej. objetivo de lectura mensual).
- Claves VAPID: generar con `npm run vapid`; NO commitearlas (van en
  `.env.local`/Vercel secrets).
- Google OAuth redirect URI en producción: `<origin>/api/auth/callback`.

## Verificación de Supabase

La skill `supabase` está disponible y debe usarse para cualquier cambio que
toque la base de datos, Auth, RLS o Storage. Al diagnosticar errores de
Supabase (RLS bloquea, PostgREST 4xx), consultar
https://supabase.com/docs/guides/monitoring-and-debugging.md antes que la memoria.
