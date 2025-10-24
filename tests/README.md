# 🧪 Testing Documentation

## Overview

DocuPrism uses a comprehensive testing strategy with both unit tests and end-to-end tests.

## Test Structure

```
tests/
├── setup.ts                          # Test setup and mocks
├── composables/                      # Unit tests for composables
│   ├── useToast.test.ts
│   ├── useOfflineStorage.test.ts
│   └── useKeyboardShortcuts.test.ts
└── e2e/                             # End-to-end tests
    ├── toast-notifications.spec.ts
    └── history-page.spec.ts
```

## Installation

First, install the testing dependencies:

```bash
pnpm install
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test useToast.test.ts
```

### E2E Tests (Playwright)

**Note:** E2E tests are separate from unit tests. Use the dedicated Playwright commands:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug

# Run specific E2E test
pnpm test:e2e toast-notifications.spec.ts
```

## Test Coverage

### Unit Tests

- ✅ **useToast**: Toast notifications (success, error, info, warning)
- ✅ **useOfflineStorage**: Local storage operations (save, load, delete)
- ✅ **useKeyboardShortcuts**: Keyboard navigation and shortcuts

### E2E Tests

- ✅ **Basic Navigation**: Home page, history navigation (5 tests)
- ⚠️ **Toast Notifications**: Requiere ajustes a la UI real (deshabilitado)
- ⚠️ **History Page**: Requiere ajustes a la UI real (deshabilitado)

**Nota**: Los tests E2E de toast y history fueron creados basándose en suposiciones sobre la UI. Necesitan ser actualizados para coincidir con la implementación real de la aplicación.

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { useToast } from '../../composables/useToast'

describe('MyComposable', () => {
  it('should do something', () => {
    const { success } = useToast()
    success('Test message')
    // assertions...
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should perform action', async ({ page }) => {
  await page.goto('/')
  await page.click('button')
  await expect(page.locator('.result')).toBeVisible()
})
```

## Mocking Chrome AI APIs

The test setup (`tests/setup.ts`) includes mocks for:

- `window.Summarizer` - AI summarization API
- `window.LanguageDetector` - Language detection API
- `navigator.clipboard` - Clipboard operations
- `localStorage` - Local storage
- `navigator.userActivation` - User activation state

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run unit tests
  run: pnpm test

- name: Run E2E tests
  run: pnpm test:e2e
```

## Debugging Tests

### Vitest

```bash
# Run specific test file
pnpm test useToast.test.ts

# Run tests matching pattern
pnpm test --grep "should show success"
```

### Playwright

```bash
# Run specific test file
pnpm test:e2e toast-notifications.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug mode with inspector
pnpm test:e2e:debug
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock external dependencies**: Use mocks for APIs and browser features
5. **Clean up**: Reset state between tests

## Known Limitations

- Chrome AI APIs are mocked in unit tests
- E2E tests require Chrome Canary/Dev for full AI functionality
- Some TypeScript warnings are expected (dependencies not installed until `pnpm install`)
- Composables that use Vue lifecycle hooks (like `onMounted`) must be wrapped in a Vue component for testing

## Common Issues

### "onMounted is called when there is no active component"

This happens when testing composables that use Vue lifecycle hooks outside of a component context. Solution: Wrap the composable in a test component using `mount()` from `@vue/test-utils`.

### "Playwright Test did not expect test.describe()"

This means Playwright tests are being run by Vitest. E2E tests should only run with `pnpm test:e2e`, not `pnpm test`. The `vitest.config.ts` excludes the `e2e/` folder.

### Tests sharing state

Each test should get a fresh instance of composables. Use `beforeEach()` to create new instances and `afterEach()` to clean up.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [TESTING.md](../TESTING.md) - Manual testing guide
