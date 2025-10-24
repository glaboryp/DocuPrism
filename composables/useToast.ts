import { ref, readonly } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0
const MAX_TOASTS = 5

export const useToast = () => {
  const show = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`
    
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }
    
    toasts.value.push(toast)
    
    // Limit number of toasts
    if (toasts.value.length > MAX_TOASTS) {
      toasts.value = toasts.value.slice(-MAX_TOASTS)
    }
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
    
    return id
  }
  
  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }
  
  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration)
  }
  
  const warning = (message: string, duration?: number) => {
    return show(message, 'warning', duration)
  }
  
  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }
  
  const clear = () => {
    toasts.value = []
  }
  
  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}
