# E2E Tests

## ✅ Tests actuales

### `basic-navigation.spec.ts` (4 tests)

Tests básicos de navegación que verifican:

- Carga de la página principal y su encabezado
- Presencia del textarea de entrada
- Navegación a la página de historial
- Vuelta al inicio desde el historial

**Todos pasan** ✓

## ℹ️ Cobertura y limitaciones

- Estos tests no ejercitan las funciones de IA: las Built-in AI APIs no están disponibles en el runner de Playwright, así que el comportamiento de la IA se cubre con los mocks de los tests unitarios (`tests/composables/`)
- Para validar la IA de verdad hay que hacerlo manualmente en Chrome 148+ con el modelo ya descargado
- Si añades tests que dependan de la UI, usa selectores estables (`getByRole`, `data-testid`) en lugar de clases de Tailwind

## 🚀 Ejecutar Tests E2E

```bash
# Todos los tests E2E
pnpm test:e2e

# Solo los tests de navegación
pnpm test:e2e basic-navigation

# Con UI de Playwright
pnpm test:e2e:ui

# En modo debug
pnpm test:e2e:debug
```

## 📚 Recursos

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

---

**Nota**: los tests unitarios (Vitest) están todos pasando (34/34 ✓).
