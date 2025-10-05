const LoadingSpinner = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'primary',
  text = '',
  className = '' 
}) => {
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  // Renk sınıfları
  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  }
  
  // Farklı spinner tipleri
  const spinnerTypes = {
    // Klasik dönen spinner
    spinner: (
      <div className={`
        ${sizeClasses[size]} 
        border-2 border-gray-200 
        ${colorClasses[color]} 
        border-t-transparent 
        rounded-full 
        animate-spin
      `}></div>
    ),
    
    // Dots spinner
    dots: (
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}
              bg-primary-600 rounded-full animate-bounce
            `}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          ></div>
        ))}
      </div>
    ),
    
    // Pulse spinner
    pulse: (
      <div className={`
        ${sizeClasses[size]} 
        bg-primary-600 
        rounded-full 
        animate-pulse
      `}></div>
    ),
    
    // Bars spinner
    bars: (
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`
              ${size === 'sm' ? 'w-1 h-4' : size === 'lg' ? 'w-2 h-8' : 'w-1.5 h-6'}
              bg-primary-600 rounded animate-pulse
            `}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {spinnerTypes[type] || spinnerTypes.spinner}
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner 