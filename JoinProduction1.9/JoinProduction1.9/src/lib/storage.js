import { supabase } from './supabase'

/**
 * Supabase Storage için yardımcı fonksiyonlar
 */

// Bucket oluştur (sadece ilk kurulumda)
export const createBlogImagesBucket = async () => {
  try {
    const { data, error } = await supabase.storage
      .createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
    
    if (error && error.message !== 'Bucket already exists') {
      console.error('Bucket oluşturma hatası:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Bucket setup hatası:', error)
    return { success: false, error }
  }
}

// Bucket'ların varlığını kontrol et
export const checkBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('Bucket listesi alınamadı:', error)
      return false
    }
    
    const blogImagesBucket = buckets.find(bucket => bucket.name === 'blog-images')
    
    if (!blogImagesBucket) {
      const result = await createBlogImagesBucket()
      return result.success
    }
    
    return true
  } catch (error) {
    console.error('Bucket kontrol hatası:', error)
    return false
  }
}

// Resim upload fonksiyonu
export const uploadImage = async (file, folder = 'blog-images') => {
  try {
    // Bucket kontrolü
    const bucketsReady = await checkBuckets()
    if (!bucketsReady) {
      throw new Error('Storage buckets hazır değil')
    }

    // Dosya boyut kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır')
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece görsel dosyaları yükleyebilirsiniz')
    }

    // Benzersiz dosya adı
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      path: fileName
    }

  } catch (error) {
    console.error('Upload hatası:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Resim silme fonksiyonu
export const deleteImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from('blog-images')
      .remove([imagePath])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Silme hatası:', error)
    return { success: false, error: error.message }
  }
}

export default {
  createBlogImagesBucket,
  checkBuckets,
  uploadImage,
  deleteImage
} 