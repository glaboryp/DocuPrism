/**
 * Markdown Formatting Utility
 * Provides safe markdown to HTML conversion
 */

import { marked } from 'marked'
import { sanitizeHTML } from './sanitizer'

/**
 * Configures marked with secure defaults
 */
function configureMarked() {
  marked.setOptions({
    breaks: true,        // Convert \n to <br>
    gfm: true           // GitHub Flavored Markdown
  })
}

/**
 * Formats markdown text to HTML with sanitization
 * 
 * @param text - Markdown text to format
 * @returns Sanitized HTML string
 * 
 * @example
 * ```typescript
 * const html = formatMarkdown('**Bold** text')
 * // Returns: '<strong>Bold</strong> text'
 * ```
 */
export function formatMarkdown(text: string): string {
  try {
    // Configure marked if not already configured
    configureMarked()
    
    // Parse markdown to HTML
    const html = marked.parse(text) as string
    
    // Sanitize the HTML
    return sanitizeHTML(html)
  } catch (error) {
    console.error('Error formatting markdown:', error)
    // Fallback to escaped plain text
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

/**
 * Formats markdown inline (without wrapping in <p> tags)
 * Useful for single-line markdown
 * 
 * @param text - Markdown text to format
 * @returns Sanitized HTML string
 */
export function formatMarkdownInline(text: string): string {
  try {
    configureMarked()
    
    // Use parseInline for single-line content
    const html = marked.parseInline(text) as string
    return sanitizeHTML(html)
  } catch (error) {
    console.error('Error formatting inline markdown:', error)
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

/**
 * Extracts plain text from markdown
 * 
 * @param markdown - Markdown text
 * @returns Plain text without markdown formatting
 */
export function markdownToPlainText(markdown: string): string {
  // Remove markdown syntax
  return markdown
    .replace(/#{1,6}\s+/g, '')           // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
    .replace(/\*(.+?)\*/g, '$1')         // Italic
    .replace(/`(.+?)`/g, '$1')           // Inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')  // Links
    .replace(/^\s*[-*+]\s+/gm, '')       // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, '')       // Ordered lists
    .replace(/^\s*>\s+/gm, '')           // Blockquotes
    .trim()
}
