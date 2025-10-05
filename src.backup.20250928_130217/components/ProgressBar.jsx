const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  color = 'primary',
  size = 'md',
  animated = true,
  className = '' 
}) => {
  
  // Renk sınıfları
  const colorClasses = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  // Progress değerini 0-100 arasında sınırla
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  return (
    <div className={className}>
      {/* Progress Bar */}
      <div className={`
        w-full bg-gray-200 rounded-full overflow-hidden
        ${sizeClasses[size]}
      `}>
        <div 
          className={`
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            rounded-full transition-all duration-300 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>
      
      {/* Percentage */}
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">İlerleme</span>
          <span className="text-xs font-medium text-gray-700">
            %{Math.round(clampedProgress)}
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar 