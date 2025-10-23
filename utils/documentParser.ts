/**
 * Document Parser Utility
 * Extracts text from various document formats (PDF, DOCX, TXT)
 */

// Dynamic imports to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mammoth: any = null

// Initialize libraries only on client side
async function initLibraries() {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    // Use unpkg CDN with https protocol
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }
  if (typeof window !== 'undefined' && !mammoth) {
    mammoth = await import('mammoth')
  }
}

export interface ParseResult {
  text: string
  pageCount?: number
  wordCount: number
  charCount: number
  error?: string
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<ParseResult> {
  try {
    await initLibraries()
    if (!pdfjsLib) {
      throw new Error('PDF.js library not available')
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages
    
    let fullText = ''
    
    // Extract text from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: { str?: string }) => ('str' in item ? item.str : ''))
        .join(' ')
      fullText += pageText + '\n\n'
    }
    
    const text = fullText.trim()
    const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length
    const charCount = text.length
    
    return {
      text,
      pageCount,
      wordCount,
      charCount
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(file: File): Promise<ParseResult> {
  try {
    await initLibraries()
    if (!mammoth) {
      throw new Error('Mammoth library not available')
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.default.extractRawText({ arrayBuffer })
    
    const text = result.value.trim()
    const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length
    const charCount = text.length
    
    // Check for warnings
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages)
    }
    
    return {
      text,
      wordCount,
      charCount
    }
  } catch (error) {
    console.error('Error extracting text from DOCX:', error)
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Extract text from plain text file
 */
async function extractTextFromTXT(file: File): Promise<ParseResult> {
  try {
    const text = await file.text()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    const charCount = text.length
    
    return {
      text: text.trim(),
      wordCount,
      charCount
    }
  } catch (error) {
    console.error('Error reading text file:', error)
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Main function to parse any supported document type
 */
export async function parseDocument(file: File): Promise<ParseResult> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  // Determine file type and extract text accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file)
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDOCX(file)
  } else if (
    fileType === 'application/msword' ||
    fileName.endsWith('.doc')
  ) {
    // For older .doc files, we can't parse them directly in the browser
    // We'll return an error message
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: 'Legacy .doc format is not supported. Please convert to .docx or PDF format.'
    }
  } else if (
    fileType === 'text/plain' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md')
  ) {
    return await extractTextFromTXT(file)
  } else {
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Unsupported file type: ${fileType || 'unknown'}. Supported formats: PDF, DOCX, TXT, MD`
    }
  }
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ['.pdf', '.docx', '.txt', '.md']
}

/**
 * Get supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ]
}

/**
 * Check if a file is supported
 */
export function isFileSupported(file: File): boolean {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  const supportedExtensions = getSupportedExtensions()
  const supportedMimeTypes = getSupportedMimeTypes()
  
  return (
    supportedMimeTypes.includes(fileType) ||
    supportedExtensions.some(ext => fileName.endsWith(ext))
  )
}
