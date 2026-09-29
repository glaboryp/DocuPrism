# Dependency health – September 2026

Branch: `chore/dependency-health-2026-09`. Scope: remediate vulnerabilities using
**compatible, non-major** updates only. Package manager: `pnpm@10.17.0`.

## Result

| | Before | After |
|---|---|---|
| `pnpm audit` total | 171 | 12 |
| critical | 6 | 2 |
| high | 101 | 4 |
| moderate | 53 | 6 |
| low | 11 | 0 |

All remaining advisories require a major upgrade that was explicitly out of scope.

## What changed

Direct dependencies (same major):

| Package | From | To |
|---|---|---|
| `nuxt` | 4.1.2 | 4.5.2 |
| `vue` | 3.5.21 | 3.5.43 |
| `vue-router` | 4.5.1 | 4.6.4 (stays on 4.x) |
| `@nuxt/eslint` | 1.9.0 | 1.17.0 |
| `@nuxt/icon` | 2.0.0 | 2.5.1 |
| `@vite-pwa/nuxt` | 1.0.4 | 1.1.1 |
| `eslint` | 9.36.0 | 9.39.5 |
| `mammoth` | ^1.11.0 | ^1.13.0 |
| `marked` | ^16.4.1 | ^16.4.2 |
| `@playwright/test` | ^1.48.0 (1.56.1) | ^1.63.0 (stays on 1.x) |
| `@vue/test-utils` | ^2.4.6 | ^2.5.1 |
| `vue-tsc` | 3.0.8 | 3.3.11 |
| `typescript` | ^5.9.2 | ^5.9.3 (stays on 5.x) |
| `@types/node` | ^22.10.2 | ^22.20.4 |

Transitive dependencies were refreshed inside their existing semver ranges with
`pnpm update --depth Infinity` (no `overrides` were added).

### `pdfjs-dist` is deliberately pinned to `~5.5.207`

Refreshing to 5.7.x would have *introduced* GHSA-hq66-cqwq-w95j (high, affects
`>=5.6.83 <6.2.108`; fix only in 6.x, a major). The original 5.4.296 was not
affected. `~5.5.207` is the newest 5.x release below the vulnerable range.
Revisit when a 6.x migration is planned, then relax the pin.

## Remaining vulnerabilities (require a major; not applied)

All are in dev/test tooling except the `serialize-javascript` build-time path.

| Package (installed) | Severity | Advisory | Fixed in | Path | Blocked by |
|---|---|---|---|---|---|
| `vitest` 2.1.9 | critical | GHSA-5xrq-8626-4rwp | >=3.2.6 | `vitest` (direct dev) | Vitest 2 → 3+/5 (out of scope) |
| `vitest` 2.1.9 | moderate | GHSA-82fw-gwwq-j7x9 | >=4.1.11 | `vitest` (direct dev) | Vitest 2 → 4+/5 |
| `@vitest/mocker` 2.1.9 | moderate | GHSA-82fw-gwwq-j7x9 | >=4.1.11 | `vitest > @vitest/mocker` | Vitest major |
| `vite` 5.4.21 | high | GHSA-fx2h-pf6j-xcff | >=6.4.3 | `vitest > vite` | Vitest 2 pins `vite@^5` |
| `vite` 5.4.21 | moderate | GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3 | >=6.4.2 / >=6.4.3 | `vitest > vite` | Vitest major |
| `esbuild` 0.21.5 | moderate | GHSA-67mh-4wv8-2f99 | >=0.25.0 | `vitest > vite > esbuild` | Vitest major (via Vite 5) |
| `happy-dom` 15.11.7 | critical, high ×2 | GHSA-37j7-fg3j-429f, GHSA-w4gp-fjgq-3q4g, GHSA-6q6h-j7hj-3r64 | >=20.8.9 | `happy-dom` (direct dev) | happy-dom 15 → 20 |
| `serialize-javascript` 6.0.2 | high, moderate | GHSA-5c6j-r48x-rmvq, GHSA-qj8w-gfj5-8c6v | >=7.0.5 | `@vite-pwa/nuxt > vite-plugin-pwa > workbox-build > @rollup/plugin-terser` | `workbox-build@7` pins `@rollup/plugin-terser@^0.4`; needs an upstream release |

Notes:

- `vitest.config.ts` uses `environment: 'jsdom'`; `happy-dom` is installed but not
  referenced by any test. Removing it (not done here) would eliminate its three
  advisories without any major bump.
- The `vitest`/`vite`/`esbuild`/`@vitest/mocker` group is dev-only and never ships
  in the production bundle. `esbuild`/`vite` dev-server issues only matter when a
  dev server is exposed to untrusted networks.
- `serialize-javascript` is reached only during the PWA service-worker build
  (`workbox-build`), not at runtime. The Nitro copy (`nitropack > @rollup/plugin-terser`)
  is already at 7.1.2.

## Explicitly not upgraded

Vitest 2 → 5, Playwright 1 → 2, TypeScript 5 → 7, Vue Router 4 → 5, and other majors
reported by `pnpm outdated` (`eslint` 10, `marked` 18, `pdfjs-dist` 6, `jsdom` 30,
`happy-dom` 20, `@vitejs/plugin-vue` 6, `@types/node` 26).

## Verification

Run on Node v24.5.0, pnpm 10.17.0:

- `pnpm install --frozen-lockfile` – exit 0
- `pnpm audit` – 12 vulnerabilities (see above); exit 1 is expected until majors are taken
- `pnpm exec vitest run` – 4 files, 29 tests passed (baseline before changes: 29/29)
- `CI=1 pnpm exec playwright test --reporter=list` – 4 passed. The first run after
  the `pdfjs-dist` pin reported 1 flaky test (`should load home page`, `ERR_ABORTED`
  on first navigation, passed on retry; consistent with Vite re-optimizing deps on a
  cold dev server). A second run passed 4/4 with no retries.
- `pnpm build` – succeeded (6 routes prerendered, PWA precache 37 entries)
