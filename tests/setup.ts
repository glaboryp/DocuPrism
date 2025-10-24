import { vi } from 'vitest'

// Mock DOM query selector
global.document.querySelector = vi.fn((_query) => null)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage with actual storage
const storage: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value
  },
  removeItem: (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete storage[key]
  },
  clear: () => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    Object.keys(storage).forEach(key => delete storage[key])
  },
  get length() {
    return Object.keys(storage).length
  },
  key: (index: number) => {
    const keys = Object.keys(storage)
    return keys[index] || null
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
})

// Mock Chrome AI APIs
Object.defineProperty(window, 'Summarizer', {
  value: {
    availability: vi.fn().mockResolvedValue('available'),
    create: vi.fn().mockResolvedValue({
      summarize: vi.fn().mockResolvedValue('Test summary'),
      destroy: vi.fn(),
    }),
  },
  writable: true,
})

Object.defineProperty(window, 'LanguageDetector', {
  value: {
    availability: vi.fn().mockResolvedValue('available'),
    create: vi.fn().mockResolvedValue({
      detect: vi.fn().mockResolvedValue([
        { detectedLanguage: 'en', confidence: 0.95 }
      ]),
      destroy: vi.fn(),
    }),
  },
  writable: true,
})

// Mock navigator.userActivation
Object.defineProperty(navigator, 'userActivation', {
  value: {
    isActive: true,
    hasBeenActive: true,
  },
  writable: true,
})
