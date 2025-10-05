import { useState } from 'react'
import { Upload, X, Image, Plus, Copy, Eye, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { convertToWebP, checkFileSize, isSupportedImageFormat } from '../../utils/imageConverter'

const ContentImageManager = ({ onImageInsert }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [showGallery, setShowGallery] = useState(false)

  const uploadImage = async (file) => {
    try {
      setUploading(true)
      setError(null)

      console.log(`🔄 İçerik görseli upload başlıyor: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)

      // Gelişmiş dosya kontrolü
      if (!checkFileSize(file, 8)) {
        throw new Error('Dosya boyutu 8MB\'dan küçük olmalıdır')
      }

      if (!isSupportedImageFormat(file)) {
        throw new Error('Desteklenmeyen resim formatı. JPG, PNG, WebP, GIF formatlarını kullanın.')
      }

      // 🎯 WEBP DÖNÜŞTÜRME - İçerik görselleri için orta kalite
      let optimizedFile
      try {
        optimizedFile = await convertToWebP(file, 0.8, 1440, 900) // %80 kalite, max 1440x900
        console.log(`✅ İçerik görseli WebP'ye dönüştürüldü: ${optimizedFile.name}`)
      } catch (webpError) {
        console.warn('⚠️ WebP dönüştürme başarısız, orijinal format kullanılıyor:', webpError.message)
        optimizedFile = file
      }

      // Benzersiz dosya adı
      const fileExt = optimizedFile.name.split('.').pop()
      const fileName = `content-images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)

      // Yüklenen görsel listesine ekle
      const newImage = {
        url: publicUrl,
        name: optimizedFile.name, // WebP adını kullan
        originalName: file.name, // Orijinal adı da sakla
        uploadedAt: new Date().toISOString()
      }

      setUploadedImages(prev => [newImage, ...prev])
      
      // Otomatik olarak content'e ekle
      insertImageToContent(newImage.url, file.name)

    } catch (error) {
      console.error('Upload hatası:', error)
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const insertImageToContent = (url, altText = 'Görsel') => {
    // Markdown formatında ekle
    const markdownImage = `\n\n![${altText}](${url})\n\n`
    onImageInsert(markdownImage)
  }

  const copyImageUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Görsel URL\'si kopyalandı!')
    } catch (error) {
      console.error('Kopyalama hatası:', error)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      uploadImage(file)
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">İçerik Görselleri</h4>
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
        >
          <Eye className="h-4 w-4" />
          <span>{showGallery ? 'Galeriyi Gizle' : 'Galeriyi Göster'}</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border border-dashed rounded-lg p-4 text-center transition-colors ${
          uploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-blue-600 text-sm">Yükleniyor...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 text-sm">
                İçerik görseli yükleyin
              </p>
              <label className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded cursor-pointer hover:bg-blue-700 transition-colors">
                Dosya Seç
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Zap className="h-3 w-3 text-green-500" />
              <span>Otomatik WebP dönüştürme</span>
            </div>
            <p className="text-xs text-gray-500">
              Görsel otomatik olarak içeriğe eklenecek
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Gallery */}
      {showGallery && uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">
            Yüklenen Görseller ({uploadedImages.length})
          </h5>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-20 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center space-x-2">
                  <button
                    onClick={() => insertImageToContent(image.url, image.name)}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    title="İçeriğe ekle"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => copyImageUrl(image.url)}
                    className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    title="URL kopyala"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p className="font-medium mb-1">💡 Kullanım:</p>
        <ul className="space-y-1">
          <li>• Görsel yüklenince otomatik olarak içeriğe eklenir</li>
          <li>• Manuel eklemek için galerideki (+) butonunu kullanın</li>
          <li>• URL kopyalamak için (📋) butonunu kullanın</li>
        </ul>
      </div>

    </div>
  )
}

export default ContentImageManager 