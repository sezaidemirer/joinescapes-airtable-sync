import { forwardRef } from 'react'
import useAccessibility from '../hooks/useAccessibility'

// Accessible Input Component
export const AccessibleInput = forwardRef(({ 
  label, 
  error, 
  helperText, 
  required = false,
  type = 'text',
  id,
  className = '',
  ...props 
}, ref) => {
  const { generateId } = useAccessibility()
  const inputId = id || generateId('input')
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="zorunlu">*</span>}
      </label>
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        required={required}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

AccessibleInput.displayName = 'AccessibleInput'

// Accessible Textarea Component
export const AccessibleTextarea = forwardRef(({ 
  label, 
  error, 
  helperText, 
  required = false,
  id,
  className = '',
  ...props 
}, ref) => {
  const { generateId } = useAccessibility()
  const textareaId = id || generateId('textarea')
  const errorId = error ? `${textareaId}-error` : undefined
  const helperId = helperText ? `${textareaId}-helper` : undefined
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="zorunlu">*</span>}
      </label>
      
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

AccessibleTextarea.displayName = 'AccessibleTextarea'

// Accessible Select Component
export const AccessibleSelect = forwardRef(({ 
  label, 
  error, 
  helperText, 
  required = false,
  options = [],
  id,
  className = '',
  ...props 
}, ref) => {
  const { generateId } = useAccessibility()
  const selectId = id || generateId('select')
  const errorId = error ? `${selectId}-error` : undefined
  const helperId = helperText ? `${selectId}-helper` : undefined
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="zorunlu">*</span>}
      </label>
      
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

AccessibleSelect.displayName = 'AccessibleSelect'

// Accessible Button Component
export const AccessibleButton = forwardRef(({ 
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ariaLabel,
  className = '',
  ...props 
}, ref) => {
  const { handleKeyboardNavigation } = useAccessibility()
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onKeyDown={(e) => handleKeyboardNavigation(e, props.onClick)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

// Accessible Checkbox Component
export const AccessibleCheckbox = forwardRef(({ 
  label, 
  error, 
  helperText, 
  required = false,
  id,
  className = '',
  ...props 
}, ref) => {
  const { generateId } = useAccessibility()
  const checkboxId = id || generateId('checkbox')
  const errorId = error ? `${checkboxId}-error` : undefined
  const helperId = helperText ? `${checkboxId}-helper` : undefined
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          required={required}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : 'false'}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...props}
        />
        <label 
          htmlFor={checkboxId}
          className="ml-2 block text-sm text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="zorunlu">*</span>}
        </label>
      </div>
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

AccessibleCheckbox.displayName = 'AccessibleCheckbox' 