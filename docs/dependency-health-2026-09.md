# Dependency health – September 2026

Branch: `chore/dependency-health-2026-09`. Scope: remediate vulnerabilities using
compatible updates first, then the remaining major upgrades. Package manager: `pnpm@10.17.0`.

## Result

| | Before | After |
|---|---|---|
| `pnpm audit` total | 171 | 0 |
| critical | 6 | 0 |
| high | 101 | 0 |
| moderate | 53 | 0 |
| low | 11 | 0 |

## What changed

Direct dependencies (same major):

| Package | From | To |
|---|---|---|
| `nuxt` | 4.1.2 | 4.5.2 |
| `vue` | 3.5.21 | 3.5.43 |
| `vue-router` | 4.5.1 | 5.3.1 (required by Nuxt 4.5 `^5.2`) |
| `@nuxt/eslint` | 1.9.0 | 1.17.0 |
| `@nuxt/icon` | 2.0.0 | 2.5.1 |
| `@vite-pwa/nuxt` | 1.0.4 | 1.1.1 |
| `eslint` | 9.36.0 | 10.11.0 (required by `@nuxt/eslint-config` 1.17 deps) |
| `mammoth` | ^1.11.0 | ^1.13.0 |
| `marked` | ^16.4.1 | ^16.4.2 |
| `@playwright/test` | ^1.48.0 (1.56.1) | ^1.63.0 (stays on 1.x) |
| `@vue/test-utils` | ^2.4.6 | ^2.5.1 |
| `vue-tsc` | 3.0.8 | 3.3.11 |
| `typescript` | ^5.9.2 | ^5.9.3 (stays on 5.x) |
| `@types/node` | ^22.10.2 | ^22.20.4 |

Transitive dependencies were refreshed inside their existing semver ranges with
`pnpm update --depth Infinity` (no `overrides` were added).

### Major upgrades

| Package | From | To |
|---|---|---|
| `vitest`, `@vitest/ui`, `@vitest/coverage-v8` | 2.1.9 | 5.0.2 |
| `jsdom` | 25.0.1 | 30.1.1 |
| `marked` | 16.4.2 | 18.0.14 |
| `pdfjs-dist` | ~5.5.207 | ~6.3.289 |
| `typescript` | 5.9.3 | ~6.0.3 |
| `@types/node` | 22.20.4 | 26.6.3 |
| `@vitejs/plugin-vue` | 5.2.4 | 6.0.9 |
| `happy-dom` | 15.11.7 | removed (unused; `jsdom` is the test environment) |

- `pdfjs-dist` had been pinned to 5.x because 5.6.83–6.2.107 is affected by
  GHSA-hq66-cqwq-w95j; 6.3.x is outside that range, so the pin moved to `~6.3.289`.
- `typescript` stays on 6.0.x: TypeScript 7 fails the `typescript-eslint` peer range
  (`<6.1.0`), so `~6.0.3` is used until typescript-eslint supports it.
- `@types/node` 26 is ahead of the Node runtime used here (v24); lower it if the
  deployment target requires matching types.
- `pnpm.overrides` pins `happy-dom` to `^20.14.5`: pnpm still resolves it as an
  optional peer of `vitest`, and the override keeps that unused copy on a patched version.

### Remaining notes

- `workbox-build` and `workbox-window` are direct dev dependencies at 7.4.1 to satisfy
  the `vite-plugin-pwa` peer range.
- Remaining unmet peer: `cac@^6.7.14` (found 7.0.0) under `nuxt > @nuxt/cli > @bomb.sh/tab`;
  upstream, resolved by a future Nuxt release.

## Explicitly not upgraded

TypeScript 7 (see above). Playwright stays on 1.x.

## Verification

Run on Node v24.5.0, pnpm 10.17.0:

- `pnpm install --frozen-lockfile` – exit 0
- `pnpm audit` – no known vulnerabilities
- `pnpm exec vitest run` – 4 files, 29 tests passed (baseline before changes: 29/29)
- `CI=1 pnpm exec playwright test` – 4 passed
- `pnpm exec eslint .` and `vue-tsc --noEmit` – clean
- `pnpm build` – succeeded (6 routes prerendered, PWA precache 37 entries)
