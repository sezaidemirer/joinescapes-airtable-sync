import { useState, useRef, useEffect } from 'react'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/join_escape_logo_siyah.webp',
  webpSrc = null,
  loading = 'lazy',
  sizes = '100vw',
  quality = 80,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [supportsWebP, setSupportsWebP] = useState(false)
  const imgRef = useRef(null)

  // WebP support detection - daha güvenilir
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const webpDataURL = canvas.toDataURL('image/webp')
      return webpDataURL.indexOf('data:image/webp') === 0
    }
    
    setSupportsWebP(checkWebPSupport())
  }, [])

  // Intersection Observer for lazy loading - daha performanslı
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // 50px önceden yükle
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // WebP URL oluşturma fonksiyonu
  const createWebPUrl = (originalUrl) => {
    if (!originalUrl || !supportsWebP) return originalUrl
    
    // Eğer zaten WebP URL'i verilmişse onu kullan
    if (webpSrc) return webpSrc
    
    // Supabase URL'lerini WebP'ye çevir
    if (originalUrl.includes('supabase.co')) {
      return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
    
    return originalUrl
  }

  const getOptimizedSrc = () => {
    if (hasError) return fallbackSrc
    if (!isInView) return ''
    
    // WebP desteği varsa WebP kullan
    const optimizedSrc = createWebPUrl(src)
    return optimizedSrc
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder - daha güzel */}
      {!isLoaded && isInView && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
          aria-label="Resim yükleniyor"
          role="status"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual image - WebP desteği ile */}
      {isInView && (
        <picture>
          {/* WebP format - eğer destekleniyorsa */}
          {supportsWebP && createWebPUrl(src) !== src && (
            <source 
              srcSet={createWebPUrl(src)} 
              type="image/webp"
              sizes={sizes}
            />
          )}
          
          {/* Fallback image */}
          <img
            src={getOptimizedSrc()}
            alt={alt || 'Resim'}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            sizes={sizes}
            role="img"
            {...props}
          />
        </picture>
      )}
      
      {/* Fallback for no image */}
      {!isInView && (
        <div 
          className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full flex items-center justify-center"
          aria-label="Resim yükleniyor"
          role="status"
        >
          <div className="text-gray-400 text-sm">Yükleniyor...</div>
        </div>
      )}
    </div>
  )
}

export default LazyImage 