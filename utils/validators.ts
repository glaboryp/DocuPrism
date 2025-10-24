/**
 * Validation Utilities
 * Centralized validation functions for the application
 */

import { FILE_CONFIG } from '../config/constants'

/**
 * Validates file size against maximum allowed size
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes (optional, uses config default)
 * @returns Object with validation result and error message
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = FILE_CONFIG.maxSizeMB
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${maxSizeMB}MB)`
    }
  }
  
  return { valid: true }
}

/**
 * Validates file type against allowed formats
 * 
 * @param file - File to validate
 * @param allowedExtensions - Array of allowed extensions (optional, uses config default)
 * @returns Object with validation result and error message
 */
export function validateFileType(
  file: File,
  allowedExtensions: readonly string[] = FILE_CONFIG.acceptedFormats
): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  // Check by extension
  const hasValidExtension = allowedExtensions.some(ext => 
    fileName.endsWith(ext.toLowerCase())
  )
  
  // Check by MIME type
  const validMimeTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  
  const hasValidMimeType = validMimeTypes.includes(fileType)
  
  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed formats: ${allowedExtensions.join(', ')}`
    }
  }
  
  return { valid: true }
}

/**
 * Validates text length
 * 
 * @param text - Text to validate
 * @param min - Minimum length (default: 1)
 * @param max - Maximum length (default: 1000000)
 * @returns Object with validation result and error message
 */
export function validateTextLength(
  text: string,
  min: number = 1,
  max: number = 1000000
): { valid: boolean; error?: string } {
  const length = text.trim().length
  
  if (length < min) {
    return {
      valid: false,
      error: `Text is too short. Minimum ${min} characters required.`
    }
  }
  
  if (length > max) {
    return {
      valid: false,
      error: `Text is too long. Maximum ${max} characters allowed.`
    }
  }
  
  return { valid: true }
}

/**
 * Validates email format
 * 
 * @param email - Email address to validate
 * @returns Object with validation result and error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    }
  }
  
  return { valid: true }
}

/**
 * Validates URL format
 * 
 * @param url - URL to validate
 * @returns Object with validation result and error message
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url)
    return { valid: true }
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format'
    }
  }
}

/**
 * Formats file size in human-readable format
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Validates multiple files at once
 * 
 * @param files - Array of files to validate
 * @returns Object with validation results
 */
export function validateFiles(
  files: File[]
): { valid: boolean; errors: string[]; validFiles: File[] } {
  const errors: string[] = []
  const validFiles: File[] = []
  
  files.forEach((file, index) => {
    const sizeValidation = validateFileSize(file)
    const typeValidation = validateFileType(file)
    
    if (!sizeValidation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${sizeValidation.error}`)
    } else if (!typeValidation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${typeValidation.error}`)
    } else {
      validFiles.push(file)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles
  }
}
