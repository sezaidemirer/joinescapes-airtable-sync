import { useEffect, useState } from 'react'

const AdSense = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = '',
  fallbackImage = null,
  fallbackText = 'Reklam Alanı'
}) => {
  const [adLoaded, setAdLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // AdSense reklamını yükle
        if (window.adsbygoogle) {
          window.adsbygoogle.push({})
          setAdLoaded(true)
        } else {
          setShowFallback(true)
        }
      } catch (error) {
        console.error('AdSense yükleme hatası:', error)
        setShowFallback(true)
      }
    }, 1000)

    // 5 saniye sonra fallback göster
    const fallbackTimer = setTimeout(() => {
      if (!adLoaded) {
        setShowFallback(true)
      }
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [adLoaded])

  return (
    <div className={`adsense-container relative ${className}`} style={style}>
      {/* AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-9097929594228195"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
      
      {/* Fallback Content */}
      {showFallback && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {fallbackImage ? (
            <img 
              src={fallbackImage} 
              alt="Reklam" 
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📢</div>
              <div className="text-sm font-medium">{fallbackText}</div>
              <div className="text-xs mt-1">AdSense Yükleniyor...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Farklı reklam türleri için hazır componentler - Mevcut reklam boyutlarına göre ayarlandı

// Banner reklamlar için (728x90 boyutunda)
export const AdSenseBanner = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="banner"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '728px', height: '90px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_1.webp'}
    fallbackText="RAW Agent"
  />
)

// Küçük sidebar reklamlar için (300x250 boyutunda)
export const AdSenseDisplay = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="rectangle"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '300px', height: '250px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_2.webp'}
    fallbackText="RAW Agent"
  />
)

// Orta boy reklamlar için (336x280 boyutunda)
export const AdSenseMediumRectangle = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="rectangle"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '336px', height: '280px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_1.webp'}
    fallbackText="RAW Agent"
  />
)

// Büyük banner reklamlar için (970x250 boyutunda)
export const AdSenseLargeBanner = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="banner"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '970px', height: '250px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_2.webp'}
    fallbackText="RAW Agent"
  />
)

// Makale içi küçük reklamlar için (300x100 boyutunda)
export const AdSenseInArticle = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="rectangle"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '300px', height: '100px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_1.webp'}
    fallbackText="RAW Agent"
  />
)

// Mobil banner için (320x50 boyutunda)
export const AdSenseMobileBanner = ({ adSlot, className = '', fallbackImage = null }) => (
  <AdSense
    adSlot={adSlot}
    adFormat="banner"
    className={`${className}`}
    style={{ width: '100%', maxWidth: '320px', height: '50px' }}
    fallbackImage={fallbackImage || '/images/raw_reklam_2.webp'}
    fallbackText="RAW Agent"
  />
)

export default AdSense 