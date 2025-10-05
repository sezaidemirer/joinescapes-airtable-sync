import { supabase } from './supabase'

/**
 * Supabase Storage için yardımcı fonksiyonlar
 */

// ❌ BUCKET OLUŞTURMA KODU KALDIRILDI!
// Bucket'lar Supabase Dashboard'dan manuel olarak oluşturulmalı.
// blog-images bucket'ı zaten mevcut ve public olarak ayarlanmış durumda.

// Resim upload fonksiyonu
export const uploadImage = async (file, folder = 'images') => {
  try {
    // Dosya boyut kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Dosya boyutu 10MB\'dan küçük olmalıdır')
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece görsel dosyaları yükleyebilirsiniz')
    }

    // Benzersiz dosya adı
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    console.log('📤 Storage upload başlıyor:', {
      fileName,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      fileType: file.type
    })

    // Upload - authenticated kullanıcı olarak
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload hatası:', error)
      throw error
    }

    console.log('✅ Storage upload başarılı:', data)

    // Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    console.log('✅ Public URL alındı:', publicUrl)

    return {
      success: true,
      url: publicUrl,
      path: fileName
    }

  } catch (error) {
    console.error('❌ Upload hatası:', error)
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
  uploadImage,
  deleteImage
} 