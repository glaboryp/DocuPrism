import { ERROR_MESSAGES } from '../config/constants'

export enum ErrorCode {
  // AI Errors
  AI_NOT_SUPPORTED = 'AI_NOT_SUPPORTED',
  AI_NOT_AVAILABLE = 'AI_NOT_AVAILABLE',
  AI_DOWNLOADING = 'AI_DOWNLOADING',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_USER_ACTIVATION = 'AI_USER_ACTIVATION',
  AI_NO_RESULT = 'AI_NO_RESULT',
  AI_FAILED = 'AI_FAILED',
  
  // Storage Errors
  STORAGE_NOT_AVAILABLE = 'STORAGE_NOT_AVAILABLE',
  STORAGE_SAVE_FAILED = 'STORAGE_SAVE_FAILED',
  STORAGE_LOAD_FAILED = 'STORAGE_LOAD_FAILED',
  STORAGE_DELETE_FAILED = 'STORAGE_DELETE_FAILED',
  STORAGE_CLEAR_FAILED = 'STORAGE_CLEAR_FAILED',
  
  // File Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_UNSUPPORTED_FORMAT = 'FILE_UNSUPPORTED_FORMAT',
  FILE_READ_FAILED = 'FILE_READ_FAILED',
  FILE_EMPTY = 'FILE_EMPTY',
  FILE_PDF_NOT_SUPPORTED = 'FILE_PDF_NOT_SUPPORTED',
  FILE_DOCX_NOT_SUPPORTED = 'FILE_DOCX_NOT_SUPPORTED',
  
  // Clipboard Errors
  CLIPBOARD_COPY_FAILED = 'CLIPBOARD_COPY_FAILED',
  
  // Network Errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_CONNECTION_LOST = 'NETWORK_CONNECTION_LOST',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  code: ErrorCode
  originalError?: Error
  context?: Record<string, any>

  constructor(
    code: ErrorCode,
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message || 'An error occurred')
    this.name = 'AppError'
    this.code = code
    this.originalError = originalError
    this.context = context
  }
}

export const createAIError = (
  type: 'notSupported' | 'notAvailable' | 'downloading' | 'timeout' | 'userActivation' | 'noResult' | 'failed',
  originalError?: Error,
  context?: Record<string, any>
): AppError => {
  const errorMap = {
    notSupported: { code: ErrorCode.AI_NOT_SUPPORTED, message: ERROR_MESSAGES.ai.notSupported },
    notAvailable: { code: ErrorCode.AI_NOT_AVAILABLE, message: ERROR_MESSAGES.ai.notAvailable },
    downloading: { code: ErrorCode.AI_DOWNLOADING, message: ERROR_MESSAGES.ai.downloading },
    timeout: { code: ErrorCode.AI_TIMEOUT, message: ERROR_MESSAGES.ai.timeout },
    userActivation: { code: ErrorCode.AI_USER_ACTIVATION, message: ERROR_MESSAGES.ai.userActivation },
    noResult: { code: ErrorCode.AI_NO_RESULT, message: ERROR_MESSAGES.ai.noResult },
    failed: { code: ErrorCode.AI_FAILED, message: ERROR_MESSAGES.ai.failed }
  }
  
  const { code, message } = errorMap[type]
  return new AppError(code, message, originalError, context)
}

export const createStorageError = (
  type: 'notAvailable' | 'saveFailed' | 'loadFailed' | 'deleteFailed' | 'clearFailed',
  originalError?: Error,
  context?: Record<string, any>
): AppError => {
  const errorMap = {
    notAvailable: { code: ErrorCode.STORAGE_NOT_AVAILABLE, message: ERROR_MESSAGES.storage.notAvailable },
    saveFailed: { code: ErrorCode.STORAGE_SAVE_FAILED, message: ERROR_MESSAGES.storage.saveFailed },
    loadFailed: { code: ErrorCode.STORAGE_LOAD_FAILED, message: ERROR_MESSAGES.storage.loadFailed },
    deleteFailed: { code: ErrorCode.STORAGE_DELETE_FAILED, message: ERROR_MESSAGES.storage.deleteFailed },
    clearFailed: { code: ErrorCode.STORAGE_CLEAR_FAILED, message: ERROR_MESSAGES.storage.clearFailed }
  }
  
  const { code, message } = errorMap[type]
  return new AppError(code, message, originalError, context)
}

export const createFileError = (
  type: 'tooLarge' | 'unsupportedFormat' | 'readFailed' | 'empty' | 'pdfNotSupported' | 'docxNotSupported',
  originalError?: Error,
  context?: Record<string, any>
): AppError => {
  const errorMap = {
    tooLarge: { code: ErrorCode.FILE_TOO_LARGE, message: ERROR_MESSAGES.file.tooLarge },
    unsupportedFormat: { code: ErrorCode.FILE_UNSUPPORTED_FORMAT, message: ERROR_MESSAGES.file.unsupportedFormat },
    readFailed: { code: ErrorCode.FILE_READ_FAILED, message: ERROR_MESSAGES.file.readFailed },
    empty: { code: ErrorCode.FILE_EMPTY, message: ERROR_MESSAGES.file.empty },
    pdfNotSupported: { code: ErrorCode.FILE_PDF_NOT_SUPPORTED, message: ERROR_MESSAGES.file.pdfNotSupported },
    docxNotSupported: { code: ErrorCode.FILE_DOCX_NOT_SUPPORTED, message: ERROR_MESSAGES.file.docxNotSupported }
  }
  
  const { code, message } = errorMap[type]
  return new AppError(code, message, originalError, context)
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, error)
  }
  
  return new AppError(ErrorCode.UNKNOWN_ERROR, 'An unknown error occurred')
}

export const getErrorMessage = (error: unknown): string => {
  const appError = handleError(error)
  return appError.message
}

export const logError = (error: unknown, context?: Record<string, any>) => {
  const appError = handleError(error)
  
  console.error('[DocuPrism Error]', {
    code: appError.code,
    message: appError.message,
    originalError: appError.originalError,
    context: { ...appError.context, ...context },
    timestamp: new Date().toISOString()
  })
}
