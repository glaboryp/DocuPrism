# 🧪 Testing Documentation

## Overview

DocuPrism uses a comprehensive testing strategy with both unit tests and end-to-end tests.

## Test Structure

```
tests/
├── setup.ts                          # Test setup and mocks
├── composables/                      # Unit tests for composables
│   ├── useChromeAI.test.ts
│   ├── useChromePrompt.test.ts
│   ├── useKeyboardShortcuts.test.ts
│   ├── useOfflineStorage.test.ts
│   ├── useSemanticGates.test.ts
│   ├── useSummaryCache.test.ts
│   └── useToast.test.ts
├── utils/                            # Unit tests for utilities
│   └── semanticChecks.test.ts
└── e2e/                              # End-to-end tests
    └── basic-navigation.spec.ts
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
pnpm test:e2e basic-navigation.spec.ts
```

## Test Coverage

### Unit Tests (57 tests)

- ✅ **useToast**: Toast notifications (7 tests)
- ✅ **useOfflineStorage**: Local storage operations (8 tests)
- ✅ **useSummaryCache**: Summary caching (10 tests)
- ✅ **useChromeAI**: Summarizer integration (2 tests)
- ✅ **useChromePrompt**: Prompt API session, sampling mode and context routing (4 tests)
- ✅ **useKeyboardShortcuts**: Keyboard navigation and shortcuts (4 tests)
- ✅ **semanticChecks**: Quality, sensitive-data and routing heuristics (15 tests)
- ✅ **useSemanticGates**: Heuristics plus Decisions API fallback (7 tests)

### E2E Tests

- ✅ **Basic Navigation**: Home page, history navigation (4 tests)

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
- `window.LanguageModel` - Prompt API used by the chat (mocked per test file)
- `window.LanguageDetector` - Language detection API
- `window.DecisionModel` - Experimental Decisions API (mocked per test file)
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
pnpm test:e2e basic-navigation.spec.ts

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
- E2E tests only cover navigation: the built-in AI APIs aren't available in the Playwright run, so the AI features are exercised through the mocks in unit tests
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
