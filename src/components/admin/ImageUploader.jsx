import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { convertToWebP, checkFileSize, isSupportedImageFormat } from '../../utils/imageConverter'

const ImageUploader = ({ 
  currentImage, 
  onImageChange, 
  onImageRemove, 
  accept = 'image/*',
  maxSize = 10,
  className = '',
  showPreview = true,
  label = 'Öne Çıkan Görsel'
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [converting, setConverting] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    console.log('🖼️ handleFileSelect ÇAĞRILDI!')
    console.log('📁 Event:', event)
    console.log('📁 Files:', event.target.files)
    const file = event.target.files[0]
    console.log('📁 Seçilen dosya:', file)
    if (!file) {
      console.log('❌ Dosya yok!')
      return
    }

    console.log('✅ Dosya seçildi, işleniyor...')
    setError(null)
    
    try {
      // Dosya formatı kontrolü
      console.log('🔍 Format kontrolü yapılıyor...')
      const isFormatValid = isSupportedImageFormat(file)
      console.log('🔍 Format check sonucu:', isFormatValid)
      if (!isFormatValid) {
        console.log('❌ Format geçersiz')
        setError('Geçersiz dosya formatı. JPEG, PNG, GIF veya WebP kullanın.')
        return
      }

      // Dosya boyut kontrolü (WebP dönüştürme öncesi)
      console.log('🔍 Boyut kontrolü yapılıyor...')
      const isSizeValid = checkFileSize(file, maxSize)
      console.log('🔍 Boyut check sonucu:', isSizeValid)
      if (!isSizeValid) {
        console.log('❌ Boyut geçersiz')
        setError(`Dosya çok büyük. Maksimum ${maxSize}MB olabilir.`)
        return
      }

      console.log('🔄 WebP dönüştürme başlıyor...')
      setConverting(true)
      
      // WebP formatına dönüştür (85% kalite, max 1920x1080)
      const webpFile = await convertToWebP(file, 0.85, 1920, 1080)
      console.log('✅ WebP dönüştürme tamamlandı:', webpFile)
      
      setConverting(false)
      setUploading(true)

      // Dosya adını oluştur
      const fileExt = 'webp'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      // Supabase Storage'a yükle
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, webpFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Public URL'yi al
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      console.log('✅ Görsel başarıyla yüklendi:', {
        originalSize: `${(file.size / 1024).toFixed(2)}KB`,
        webpSize: `${(webpFile.size / 1024).toFixed(2)}KB`,
        url: publicUrl
      })

      // Parent component'e bildir
      console.log('📤 onImageChange çağrılıyor:', publicUrl)
      console.log('📤 onImageChange fonksiyonu:', onImageChange)
      if (onImageChange) {
        onImageChange(publicUrl)
        console.log('✅ onImageChange çağrıldı!')
      } else {
        console.log('❌ onImageChange fonksiyonu YOK!')
      }

    } catch (error) {
      console.error('❌ Görsel yükleme hatası:', error)
      setError('Görsel yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
      setConverting(false)
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {converting && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Zap className="h-4 w-4 animate-pulse" />
            <span>WebP'ye dönüştürülüyor...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Image Preview or Upload Area */}
      {currentImage && showPreview ? (
        <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <img
            src={currentImage}
            alt="Öne çıkan görsel"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading || converting}
              className="bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Değiştir</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Kaldır</span>
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors ${
            uploading || converting ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : converting ? (
            <div className="space-y-3">
              <Zap className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
              <p className="text-blue-600 font-medium">WebP'ye dönüştürülüyor...</p>
              <p className="text-xs text-gray-500">Lütfen bekleyin...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 font-medium">Görsel seçmek için tıklayın</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, WebP veya GIF (Max {maxSize}MB)
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  <Zap className="h-3 w-3 inline mr-1" />
                  Otomatik WebP dönüştürme ve boyutlandırma
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || converting}
      />

      {/* Upload Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Görseller otomatik olarak WebP formatına dönüştürülür</p>
        <p>• Maksimum boyut: 1920x1080px, kalite: %85</p>
        <p>• Desteklenen formatlar: JPEG, PNG, WebP, GIF</p>
      </div>

    </div>
  )
}

export default ImageUploader
