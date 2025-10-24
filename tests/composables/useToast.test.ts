import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '../../composables/useToast'

describe('useToast', () => {
  let toastInstance: ReturnType<typeof useToast>

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    toastInstance = useToast()
    // Clear any toasts from previous tests
    toastInstance.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should show success toast', () => {
    const { success, toasts } = toastInstance
    
    success('Test success message')
    
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.type).toBe('success')
    expect(toasts.value[0]!.message).toBe('Test success message')
  })

  it('should show error toast', () => {
    const { error, toasts } = toastInstance
    
    error('Test error message')
    
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.type).toBe('error')
    expect(toasts.value[0]!.message).toBe('Test error message')
  })

  it('should show info toast', () => {
    const { info, toasts } = toastInstance
    
    info('Test info message')
    
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.type).toBe('info')
    expect(toasts.value[0]!.message).toBe('Test info message')
  })

  it('should show warning toast', () => {
    const { warning, toasts } = toastInstance
    
    warning('Test warning message')
    
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.type).toBe('warning')
    expect(toasts.value[0]!.message).toBe('Test warning message')
  })

  it('should auto-remove toast after duration', () => {
    const { success, toasts } = toastInstance
    
    success('Test message')
    expect(toasts.value).toHaveLength(1)
    
    // Fast-forward time by 3 seconds (default duration)
    vi.advanceTimersByTime(3000)
    
    expect(toasts.value).toHaveLength(0)
  })

  // Note: removeToast is not exposed by the composable
  // Toasts are auto-removed after duration

  it('should handle multiple toasts', () => {
    const { success, error, info, toasts } = toastInstance
    
    success('Success message')
    error('Error message')
    info('Info message')
    
    expect(toasts.value).toHaveLength(3)
    expect(toasts.value[0]!.type).toBe('success')
    expect(toasts.value[1]!.type).toBe('error')
    expect(toasts.value[2]!.type).toBe('info')
  })

  it('should limit number of toasts', () => {
    const { success, toasts } = toastInstance
    
    // Add more than max toasts (5)
    for (let i = 0; i < 10; i++) {
      success(`Message ${i}`)
    }
    
    expect(toasts.value.length).toBeLessThanOrEqual(5)
  })
})
