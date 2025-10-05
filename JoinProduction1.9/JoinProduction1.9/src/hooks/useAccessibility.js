import { useEffect, useRef } from 'react'

export const useAccessibility = () => {
  
  // Focus management
  const focusRef = useRef(null)
  
  // Auto-focus element when component mounts
  const autoFocus = (element) => {
    if (element && element.focus) {
      element.focus()
    }
  }
  
  // Keyboard navigation handler
  const handleKeyboardNavigation = (event, onEnter, onEscape) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault()
          onEnter(event)
        }
        break
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape(event)
        }
        break
      case 'Tab':
        // Tab navigation is handled by browser, but we can add custom logic
        break
      default:
        break
    }
  }
  
  // Skip to main content
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Announce to screen readers
  const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  // Focus trap for modals
  const trapFocus = (containerElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    containerElement.addEventListener('keydown', handleTabKey)
    
    // Return cleanup function
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey)
    }
  }
  
  // Generate unique ID for form elements
  const generateId = (prefix = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  return {
    focusRef,
    autoFocus,
    handleKeyboardNavigation,
    skipToMain,
    announceToScreenReader,
    trapFocus,
    generateId
  }
}

export default useAccessibility 