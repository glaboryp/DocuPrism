// Application Constants
export const APP_CONFIG = {
  name: 'DocuPrism',
  version: '1.0.0',
  description: 'Privacy-first, offline-capable PWA for on-device document analysis',
  repository: 'https://github.com/glaboryp/DocuPrism'
} as const

// AI Configuration
export const AI_CONFIG = {
  timeouts: {
    checkSupport: 10000, // 10 seconds
    createSummarizer: 10000, // 10 seconds
    summarize: 30000, // 30 seconds
    languageDetection: 3000 // 3 seconds
  },
  retries: {
    maxAttempts: 3,
    delayMs: 1000
  }
} as const

// Storage Configuration
export const STORAGE_CONFIG = {
  maxAnalyses: 10,
  previewLength: 1000, // characters
  storageKey: 'docuprism-analyses',
  estimatedQuota: 5 * 1024 * 1024 // 5MB
} as const

// File Upload Configuration
export const FILE_CONFIG = {
  maxSizeMB: 10,
  acceptedFormats: ['.txt', '.pdf', '.docx', '.doc', '.md'],
  supportedFormats: {
    text: ['.txt', '.md'],
    pdf: ['.pdf'],
    word: ['.docx', '.doc']
  }
} as const

// Toast Configuration
export const TOAST_CONFIG = {
  defaultDuration: 3000,
  durations: {
    short: 2000,
    medium: 3000,
    long: 5000,
    persistent: 0
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  ai: {
    notSupported: 'Chrome Built-in AI is not supported in this browser',
    notAvailable: 'Summarizer API is not available on this device',
    downloading: 'Summarizer model is currently downloading. Please wait...',
    downloadable: 'Summarizer model needs to be downloaded',
    timeout: 'Operation timed out. Please try again.',
    userActivation: 'User interaction required to use Summarizer API',
    noResult: 'No summary was generated',
    failed: 'Failed to summarize text'
  },
  storage: {
    notAvailable: 'Local storage is not available',
    saveFailed: 'Failed to save analysis offline',
    loadFailed: 'Failed to load stored analyses',
    deleteFailed: 'Failed to delete analysis',
    clearFailed: 'Failed to clear analyses'
  },
  file: {
    tooLarge: 'File is too large',
    unsupportedFormat: 'Unsupported file format',
    readFailed: 'Failed to read file',
    empty: 'File appears to be empty or could not be read',
    pdfNotSupported: 'PDF files are not yet supported',
    docxNotSupported: 'DOCX files are not yet supported'
  },
  clipboard: {
    copyFailed: 'Failed to copy to clipboard'
  },
  network: {
    offline: 'You are currently offline',
    connectionLost: 'Connection lost. Working in offline mode.'
  }
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  summary: {
    generated: 'Summary generated successfully!',
    copied: 'Summary copied to clipboard!'
  },
  storage: {
    saved: 'Analysis saved to history',
    deleted: 'Analysis deleted',
    cleared: 'All analyses cleared'
  },
  file: {
    loaded: 'File loaded successfully!'
  }
} as const
