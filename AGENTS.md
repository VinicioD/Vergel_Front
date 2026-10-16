# AGENTS.md

React 19 + TypeScript + Vite SPA for "Vergel", a gardening-services product. The backend is a separate **Laravel** app (not in this repo). **All UI text and code comments are in Spanish** — write new code the same way.

## Commands

- **pnpm only** (`pnpm-lock.yaml` is committed; no `npm`/`yarn` lockfiles). `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm preview`.
- `pnpm build` = `tsc -b && vite build`, so it fails while tsc is red. Use `pnpm exec vite build` to check bundling alone, and `pnpm exec tsc -b` for typecheck.
- **No test runner, no tests, no CI, no pre-commit hooks.** Verification is `pnpm exec tsc -b` + `pnpm lint`, then `pnpm dev`.

### Baseline is RED — do not regress it

Measured on branch `connectAPI` (== `origin/develop`):

- `pnpm exec tsc -b` → **43 errors**: **35 × `TS6133`** (unused bindings, from `noUnusedLocals` — mostly stale `import React from "react"` that `jsx: "react-jsx"` makes unnecessary; 30 files affected: `App.example.tsx` (3), `components/DailyInspections.tsx` (2), `admin/modules/wallet/WalletPage.tsx` (3), one each in the other 27) **plus 8 real type errors in `components/clients/ClientsView.tsx`** (`TS2322`/`TS2339`/`TS2367`) that come from the half-finished API migration described below.
- `pnpm lint` → **14 errors across 10 files**: unused vars in `App.example.tsx` (2), `DailyInspections.tsx`, `FileUpload.tsx`, `WalletPage.tsx` (2); `no-useless-escape` in `PasswordInputWithRequirements.tsx` (2); `no-explicit-any` in `WalletPage.tsx`, `clients/ClientsView.tsx`, `auth/login.tsx`; `react-hooks/set-state-in-effect` in `components/clients/Form.tsx`, `components/finances/Form.tsx`, `admin/modules/collaborators/Form.tsx`.

Your job is to **not increase these counts**. If you touch a file, clear its own errors, but don't stop to fix the whole baseline unless asked. Write **new** files without `import React from "react"` and without unused bindings.

## Working tree: API integration is in flight (branch `connectAPI`)

This branch is mid-migration from mock data to the real Laravel API. What is **already real**:

- `src/services/api.ts` — an `axios` instance (`baseURL` from `import.meta.env.VITE_API_URL`, falling back to `https://vergel-api-evy7.onrender.com/api/v1`) with a request interceptor that attaches `Bearer` from `localStorage.token`.
- `src/services/authService.ts` (login/logout, Sanctum token → `localStorage`) and `src/services/customerService.ts` (full `/customers` CRUD + status/plan/history endpoints).
- `src/types/auth.ts` and `src/types/customer.ts` — real backend types. `src/types/user.ts` is still a one-line comment.
- `.env` with `VITE_API_URL` — **not in `.gitignore`**, so it shows up as untracked. Don't commit it, and remember Vite inlines any `VITE_*` var into the client bundle.
- `src/views/auth/login.tsx` really POSTs now, then `navigate("/admin/catalog")` on success; `src/components/clients/ClientsView.tsx` and `components/clients/Form.tsx` are being converted to `CustomerListItem`/`Client` types — that conversion is where the 8 type errors live.

What is **still mock**: every other page keeps hardcoded arrays in `useState`. **There are no route guards** — no `ProtectedRoute` anywhere, so any URL renders regardless of token. Don't infer an auth architecture that isn't there.

If this branch has been merged/cleaned up by the time you read this, re-run the two commands above and trust them over this section.

## Architecture

- `src/main.tsx` → `src/App.tsx` mounts the router by hand (no file-based routing). `*` and `/` → `/login`.
- **Six roles are wired**, each as `src/views/<role>/`: `<Role>Routes.tsx` (nested `<Routes>` + a `<Route path="*">` that `<Navigate to="dashboard">`) and `<Role>Layout.tsx` (`<Sidebar>` + `<Outlet/>`). Dashboard lives at `<Role>/Dashboard.tsx`, not in `modules/`.
- **The receptionist's URL prefix is `/recepcionist/*`, matching its folder** — it used to be `/users/*` and was renamed, so `/users` now dead-ends at the login catch-all. The role's *files* are still `recepcionist/UserRoutes.tsx` + `UserLayout.tsx` (components named `User*`, not `Recepcionist*`) and its menu array is `recepcionistMenu`. Don't "fix" that mismatch by assuming `/users` still works.
- **Don't confuse `/admin/users` with the receptionist role**: `/admin/users` is the admin "Usuarios" module (`admin/modules/users/UsersPage.tsx`), unrelated to any role prefix.
- `src/components/Sidebar.tsx` resolves the active role from a `ROLES: RoleConfig[]` array keyed on `prefix`, which also supplies the panel title/subtitle, hardcoded `displayName`/`email`, and the optional `profilePath` that turns the footer identity block into a link. **A new role needs an entry in `ROLES`**, not just a menu array.
- `src/config/menuConfig.ts` holds one array per role (`adminMenu`, `recepcionistMenu`, `technicalMenu`, `auditorMenu`, `quoteMenu`, `counterMenu`); each `<Role>Layout` prepends its own "Inicio" entry and passes the array to `<Sidebar>`. `profile` is never in a menu — `Sidebar` renders it from `profilePath`.

### Adding a module or route — all three places

`src/views/<role>/modules/<module>/` holds `<Module>Page.tsx` (list) + `Form.tsx` (modal form). Wiring a new one requires:

1. the page/import + `<Route>` in `<Role>Routes.tsx`,
2. an entry in the matching array in `src/config/menuConfig.ts`,
3. reusing the shared components in `src/components/` (`Table`, `Button`, `Input`, `SearchableSelect`, `CalendarView`, `DailyInspections`, `DateRangePicker`, `Sidebar`, `components/profile/ProfileView`) instead of hand-rolling markup.

**A menu entry with no matching `<Route>` fails silently** — it bounces to the dashboard and looks like a broken page. This shipped twice (`/users/transactions`, which had no route at all) and is the reason every menu array carries a `// Solo incluye rutas que existen en <Role>Routes.tsx` comment. Menu arrays are static module-level constants, so a bad entry survives every refresh — if a link points at a folder that doesn't exist, the fix is in `menuConfig.ts`.

### Profile and system settings

- `src/components/profile/ProfileView.tsx` is the shared personal-profile view (avatar upload, contact fields, disabled role, save feedback). Props: `initialData?: Partial<ProfileData>`, `onSave?`. Every role has a thin wrapper at `src/views/<role>/modules/profile/ProfilePage.tsx` that supplies mock data, plus a `profile` route and a `profilePath` in `Sidebar`'s `ROLES`. To onboard a new role, copy a wrapper — don't fork the view.
- Admin's **system configuration** is a separate thing: `src/views/admin/modules/settings/SettingsPage.tsx` at `/admin/settings` (tabbed: company profile, theme, placeholders). It was formerly `modules/profile/ProfilePage.tsx`; don't confuse the two. `src/components/UserProfileCard.tsx` and `src/components/SettingsSidebar.tsx` are older duplicates, now unused.

## Stubs and dead code — don't mistake these for real infrastructure

- **19 `Form.tsx` files exist, only 8 are non-empty**; the other 11 are 0 bytes and import as `undefined`, not a build error: `admin/modules/{quotes,rates,schedule,users,wallet}/Form.tsx` and all six `recepcionist/modules/*/Form.tsx`. Also 0 bytes: `quote/modules/{catalog,clients,quotes}/page.tsx` (lowercase duplicates of the real `*Page.tsx` next to them) and `src/App.css` (imported by nothing).
- Of the 8 real `Form.tsx`, 7 export both `export const Form` and `export default Form`; `admin/modules/history/Form.tsx` is only a re-export of `components/history/Form`. The data shape is an `export interface <X>Data` (`ClientData`, `FinanceTransactionData`, `CollaboratorData`, `PlanChangeData`, `CompanyProfileData`; `history` uses `HistoryTransaction`; `plans` alone uses the `ChangeData` suffix). Props are `{ onClose?, onSave?(data), initialData? }`. Note the real clients/finances/history forms live under `src/components/<x>/Form.tsx`, not in `views/`.
- `src/pdf/PdfLayout.tsx` is comments only — **no PDF generation**. `sweetalert2` and `@react-pdf/renderer` are in `package.json` but imported nowhere. Don't reach for them by reflex.
- `src/App.example.tsx` is a design sandbox for the shared components, not the app entry.
- Shared components defined but imported nowhere: `CategoryFilter`, `FileUpload`, `MainLayout`, `PasswordInputWithRequirements`, `PlantCard`, `SegmentedControl`, `SettingsSidebar`, `UserProfileCard`. Wired ones: `KpiCard` (dashboards), `TransactionsView` (admin/auditor `TransactionsPage`), `Timeline` (via `TransactionsView`), `history/HistoryView` (admin/auditor/counter `HistoryPage`).
- `src/views/recepcionist/**` and several `quote`/`counter` modules are stubs returning `<p>vista ...</p>`. Don't report them as broken, and don't assume the role work is finished.

## Conventions & gotchas

- `tsconfig.app.json` sets `verbatimModuleSyntax` (use `import type` for type-only imports) and `erasableSyntaxOnly` (no enums, no namespaces — use union types and `as const` objects). **`strict` is NOT enabled**, so don't assume strict-null checking; keep new code strict-safe anyway.
- `noUnusedLocals`/`noUnusedParameters` are on, and `jsx: "react-jsx"` means a default `import React from "react"` is only needed when you actually reference the `React` namespace (e.g. `React.FC`, `React.ChangeEvent`).
- **eslint-plugin-react-hooks v7 flat preset** includes the React Compiler rules. The repo's canonical `Form.tsx` pattern (`useEffect(() => setFormData(initialData), [initialData])`) trips `react-hooks/set-state-in-effect`. In new code derive initial state with a lazy `useState(() => …)` initializer (including when reading `document.documentElement.classList.contains("dark")`) or a `key` prop — don't copy that effect.
- `Table<T extends { id: string | number }>` (the `id` is the React key) takes **required** `currentPage` + `onPageChange`, optional `itemsPerPage` (default 10), and either `accessorKey` or `render` per column. Pass `totalItems` *only* for server-side pagination (`totalItems !== undefined` switches it to non-slicing mode) — otherwise it slices the `data` array in memory.
- Tailwind **v4** via `@tailwindcss/vite` — there is no `tailwind.config.js`, and **no color tokens in `@theme`** (it only sets `--font-sans`). Colors are hardcoded arbitrary values at each call site: olive accents `#5b642a` / `#5d682e` / `#636B2F` / `#6C7D38`, light surface `#F4EFE6`, `dark:bg-gray-900`. Dark mode is a class on `<html>` (`@custom-variant dark` in `index.css`); ~600 `dark:` usages already exist, so every new component must ship `dark:` variants.
- `src/index.css` puts a Google Fonts `@import url(...)` *after* `@import "tailwindcss"`, which emits a "must precede all rules" warning on every build. Pre-existing; ignore it.
- **Asset imports are case-mismatched**: `login.tsx` imports `../../assets/logo.png` but the file on disk is `Logo.png`. It resolves on Windows/macOS and breaks on a case-sensitive filesystem. Prefer the exact on-disk casing (`Logo.png`, `LOGO-sin-fondo.png`, `Fondo_light.jpeg`).
- Icons come from `lucide-react` (imported as `import { Users } from "lucide-react"`).

## Verifying a route actually exists

`App.tsx`'s catch-all silently swallows typos, so a bad path is indistinguishable from a redirect. Resolve routes without a browser:

```
node -e "import('react-router-dom').then(m=>{const t=[{path:'/recepcionist/*',children:[{element:1,children:['dashboard','catalog','clients','quotes','rates','schedule','wallet','profile'].map(p=>({path:p}))},{path:'*'}]}];for(const p of ['/recepcionist','/recepcionist/profile','/recepcionist/transactions']){const r=m.matchRoutes(t,p);console.log(p,'->',r[r.length-1].route.path)}})"
```

A leaf of `*` means the path is unrouted and will bounce.

## Git

- Feature branches (`feat-*`, `fix-design`, `design-*`) merge into `develop` via PR; `main` is the default branch but is stale (only the initial scaffold commits). Local `develop` can lag `origin/develop` — check before branching from it.
- Commit messages are Spanish conventional commits (`feat: …`, `fix-design: …`), so match that style.
