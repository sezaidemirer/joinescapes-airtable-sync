const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '' 
}) => {
  
  // Farklı skeleton tipleri
  const skeletonTypes = {
    // Blog kartı skeleton
    card: (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    
    // Yazı skeleton
    text: (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    ),
    
    // Başlık skeleton
    title: (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      </div>
    ),
    
    // Resim skeleton
    image: (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ),
    
    // Liste skeleton
    list: (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    
    // Carousel skeleton
    carousel: (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    )
  }
  
  // Seçilen tipi render et
  const renderSkeleton = () => {
    return skeletonTypes[type] || skeletonTypes.card
  }
  
  return (
    <div className={className}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader 