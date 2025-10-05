/**
 * Resim dosyasını WebP formatına dönüştürür (güvenli versiyon)
 * @param {File} file - Dönüştürülecek resim dosyası
 * @param {number} quality - WebP kalitesi (0.1 - 1.0, varsayılan: 0.8)
 * @param {number} maxWidth - Maksimum genişlik (varsayılan: 1920)
 * @param {number} maxHeight - Maksimum yükseklik (varsayılan: 1080)
 * @returns {Promise<File>} WebP formatında yeni dosya veya orijinal dosya
 */
export const convertToWebP = async (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    // Dosya tipi kontrolü
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Geçerli bir resim dosyası seçiniz'))
      return
    }

    // WebP zaten ise direkt döndür
    if (file.type === 'image/webp') {
      console.log('📸 Dosya zaten WebP formatında:', file.name)
      resolve(file)
      return
    }

    // WebP desteği kontrolü
    const canvas = document.createElement('canvas')
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    
    if (!supportsWebP) {
      console.warn('⚠️ Tarayıcı WebP desteklemiyor, orijinal format kullanılacak:', file.name)
      resolve(file)
      return
    }

    const img = new Image()
    
    // CORS ayarları
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        // Yeni boyutları hesapla
        const { width, height } = calculateNewDimensions(img.width, img.height, maxWidth, maxHeight)
        
        canvas.width = width
        canvas.height = height

        // Canvas context al ve kalite ayarları yap
        const ctx = canvas.getContext('2d', {
          alpha: true,
          desynchronized: false,
          willReadFrequently: false
        })

        // Arka planı beyaz yap (JPEG'ler için önemli)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)

        // Anti-aliasing ve kalite ayarları
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Resmi canvas'a çiz
        ctx.drawImage(img, 0, 0, width, height)

        // WebP formatında blob oluştur
        canvas.toBlob((blob) => {
          if (!blob) {
            console.warn('⚠️ WebP blob oluşturulamadı, orijinal dosya kullanılacak')
            resolve(file)
            return
          }

          // Yeni dosya oluştur
          const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          const webpFile = new File([blob], fileName, {
            type: 'image/webp',
            lastModified: Date.now()
          })

          // Boyut kontrolü - eğer WebP daha büyükse orijinali kullan
          if (webpFile.size > file.size) {
            console.log(`📊 WebP (${(webpFile.size/1024).toFixed(2)}KB) orijinalden (${(file.size/1024).toFixed(2)}KB) büyük, orijinal kullanılacak`)
            resolve(file)
            return
          }

          console.log(`✅ WebP dönüştürme başarılı: ${file.name} (${(file.size/1024).toFixed(2)}KB) → ${fileName} (${(webpFile.size/1024).toFixed(2)}KB)`)
          resolve(webpFile)
        }, 'image/webp', quality)

      } catch (error) {
        console.error('❌ Canvas işlemi hatası:', error)
        resolve(file) // Hata durumunda orijinal dosyayı döndür
      }
    }

    img.onerror = (error) => {
      console.error('❌ Resim yüklenemedi:', file.name, error)
      resolve(file) // Hata durumunda orijinal dosyayı döndür
    }

    // Basit URL oluştur
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Yeni boyutları hesapla (aspect ratio'yu koru)
 */
const calculateNewDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  // Aspect ratio'yu koru
  const aspectRatio = originalWidth / originalHeight
  
  let width = originalWidth
  let height = originalHeight
  
  // Maksimum boyutları aşıyorsa küçült
  if (width > maxWidth) {
    width = maxWidth
    height = Math.round(width / aspectRatio)
  }
  
  if (height > maxHeight) {
    height = maxHeight
    width = Math.round(height * aspectRatio)
  }
  
  return { width, height }
}

/**
 * Dosya boyutunu kontrol et ve gerekirse sıkıştır
 */
export const optimizeImage = async (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  // Dosya zaten küçükse direkt döndür
  if (file.size <= maxSizeBytes) {
    console.log(`📏 Dosya boyutu uygun: ${(file.size/1024/1024).toFixed(2)}MB`)
    return file
  }
  
  console.log(`🔄 Dosya çok büyük (${(file.size/1024/1024).toFixed(2)}MB), optimize ediliyor...`)
  
  // Kaliteyi düşürerek tekrar dene
  let quality = 0.9
  let optimizedFile = file
  
  while (optimizedFile.size > maxSizeBytes && quality > 0.1) {
    optimizedFile = await convertToWebP(file, quality)
    quality -= 0.1
    
    if (optimizedFile.size <= maxSizeBytes) {
      console.log(`✅ Optimize edildi: ${(optimizedFile.size/1024/1024).toFixed(2)}MB (kalite: ${(quality + 0.1).toFixed(1)})`)
      break
    }
  }
  
  return optimizedFile
}

/**
 * Birden fazla resmi toplu olarak dönüştür
 */
export const convertMultipleToWebP = async (files, onProgress) => {
  const results = []
  const total = files.length
  
  for (let i = 0; i < total; i++) {
    try {
      const converted = await convertToWebP(files[i])
      results.push(converted)
      
      if (onProgress) {
        onProgress(i + 1, total)
      }
    } catch (error) {
      console.error(`❌ Dosya dönüştürülemedi: ${files[i].name}`, error)
      results.push(files[i]) // Hata durumunda orijinali ekle
    }
  }
  
  return results
}

/**
 * Resim validasyonu
 */
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi' }
  }
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Geçersiz dosya formatı. JPEG, PNG, GIF, WebP veya SVG kullanın.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `Dosya çok büyük. Maksimum ${maxSize / 1024 / 1024}MB olabilir.` }
  }
  
  return { valid: true }
}

/**
 * Dosya boyutunu kontrol et
 */
export const checkFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Desteklenen resim formatı kontrolü
 */
export const isSupportedImageFormat = (file) => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return supportedTypes.includes(file.type)
}