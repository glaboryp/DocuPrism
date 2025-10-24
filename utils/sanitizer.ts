/**
 * HTML Sanitization Utility
 * Provides secure HTML sanitization for markdown-rendered content
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses a whitelist approach for allowed tags and attributes
 * 
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(html: string): string {
  // Create a temporary DOM element
  const temp = document.createElement('div')
  temp.textContent = html
  
  // Allowed tags for markdown rendering
  const allowedTags = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'code',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'pre'
  ])
  
  // Allowed attributes per tag
  const allowedAttributes: Record<string, Set<string>> = {
    'a': new Set(['href', 'title']),
    '*': new Set(['class']) // Allow class on all tags
  }
  
  /**
   * Recursively sanitize DOM nodes
   */
  function sanitizeNode(node: Node): Node | null {
    // Text nodes are safe
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true)
    }
    
    // Only process element nodes
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null
    }
    
    const element = node as Element
    const tagName = element.tagName.toLowerCase()
    
    // Check if tag is allowed
    if (!allowedTags.has(tagName)) {
      // Return text content of disallowed tags
      return document.createTextNode(element.textContent || '')
    }
    
    // Create sanitized element
    const sanitized = document.createElement(tagName)
    
    // Copy allowed attributes
    const tagAllowedAttrs = allowedAttributes[tagName] || new Set()
    const globalAllowedAttrs = allowedAttributes['*'] || new Set()
    
    Array.from(element.attributes).forEach(attr => {
      if (tagAllowedAttrs.has(attr.name) || globalAllowedAttrs.has(attr.name)) {
        // Additional validation for href
        if (attr.name === 'href') {
          const href = attr.value.toLowerCase()
          // Only allow http, https, and mailto links
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
            sanitized.setAttribute(attr.name, attr.value)
          }
        } else {
          sanitized.setAttribute(attr.name, attr.value)
        }
      }
    })
    
    // Recursively sanitize children
    Array.from(element.childNodes).forEach(child => {
      const sanitizedChild = sanitizeNode(child)
      if (sanitizedChild) {
        sanitized.appendChild(sanitizedChild)
      }
    })
    
    return sanitized
  }
  
  // Parse HTML and sanitize
  temp.innerHTML = html
  const sanitized = document.createElement('div')
  
  Array.from(temp.childNodes).forEach(child => {
    const sanitizedChild = sanitizeNode(child)
    if (sanitizedChild) {
      sanitized.appendChild(sanitizedChild)
    }
  })
  
  return sanitized.innerHTML
}

/**
 * Escapes HTML special characters
 * Use this for plain text that needs to be displayed as HTML
 * 
 * @param text - Plain text to escape
 * @returns HTML-escaped string
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Strips all HTML tags from a string
 * 
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHTML(html: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || ''
}
