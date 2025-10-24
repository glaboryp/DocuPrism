import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  it('should trigger handler on correct key combination', () => {
    const handler = vi.fn()
    
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcuts([
          {
            key: 'k',
            ctrl: true,
            description: 'Test shortcut',
            handler
          }
        ])
        return () => h('div')
      }
    })
    
    mount(TestComponent)
    
    // Simulate Ctrl+K
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true
    })
    window.dispatchEvent(event)
    
    expect(handler).toHaveBeenCalled()
  })

  it('should not trigger handler on wrong key', () => {
    const handler = vi.fn()
    
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcuts([
          {
            key: 'k',
            ctrl: true,
            description: 'Test shortcut',
            handler
          }
        ])
        return () => h('div')
      }
    })
    
    mount(TestComponent)
    
    // Simulate Ctrl+J (wrong key)
    const event = new KeyboardEvent('keydown', {
      key: 'j',
      ctrlKey: true
    })
    window.dispatchEvent(event)
    
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle multiple modifiers', () => {
    const handler = vi.fn()
    
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcuts([
          {
            key: 'c',
            ctrl: true,
            shift: true,
            description: 'Test shortcut',
            handler
          }
        ])
        return () => h('div')
      }
    })
    
    mount(TestComponent)
    
    // Simulate Ctrl+Shift+C
    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      shiftKey: true
    })
    window.dispatchEvent(event)
    
    expect(handler).toHaveBeenCalled()
  })

  it('should cleanup event listeners on unmount', () => {
    const handler = vi.fn()
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcuts([
          {
            key: 'k',
            ctrl: true,
            description: 'Test shortcut',
            handler
          }
        ])
        return () => h('div')
      }
    })
    
    const wrapper = mount(TestComponent)
    wrapper.unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
