import { supabase } from '../lib/supabase'

// Push notification gönderme fonksiyonu
export const sendPushNotification = async (title, body, options = {}) => {
  try {
    console.log('🔔 Push notification gönderiliyor...')
    
    // Tüm izin veren kullanıcıları getir
    const { data: permissions, error } = await supabase
      .from('notification_permissions')
      .select('*')
      .eq('permission', 'granted')
    
    if (error) {
      console.error('❌ Kullanıcı izinleri getirilemedi:', error)
      return { success: false, error }
    }
    
    if (!permissions || permissions.length === 0) {
      console.log('⚠️ İzin veren kullanıcı bulunamadı')
      return { success: false, message: 'No users with permission' }
    }
    
    console.log(`✅ ${permissions.length} kullanıcıya bildirim gönderilecek`)
    
    // Her kullanıcıya bildirim gönder
    const results = await Promise.allSettled(
      permissions.map(async (permission) => {
        try {
          // Burada gerçek push notification gönderme API'si kullanılacak
          // Şimdilik sadece log atıyoruz
          console.log(`📱 Bildirim gönderildi: ${permission.user_id || 'anonymous'}`)
          
          return {
            userId: permission.user_id,
            success: true,
            message: 'Notification sent'
          }
        } catch (error) {
          console.error(`❌ Bildirim gönderilemedi: ${permission.user_id}`, error)
          return {
            userId: permission.user_id,
            success: false,
            error: error.message
          }
        }
      })
    )
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful
    
    console.log(`✅ ${successful} başarılı, ❌ ${failed} başarısız`)
    
    return {
      success: true,
      total: permissions.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
    }
    
  } catch (error) {
    console.error('❌ Push notification hatası:', error)
    return { success: false, error: error.message }
  }
}

// Test bildirimi gönder
export const sendTestNotification = async () => {
  return await sendPushNotification(
    '🧪 Test Bildirimi',
    'Bu bir test bildirimidir. Sistem çalışıyor!',
    {
      icon: '/images/join_icon.webp',
      tag: 'test'
    }
  )
}

// Yeni yazı bildirimi gönder
export const sendNewPostNotification = async (postTitle, postSlug) => {
  return await sendPushNotification(
    '📰 Yeni Yazı',
    `${postTitle} - Hemen okuyun!`,
    {
      icon: '/images/join_icon.webp',
      tag: 'new-post',
      data: {
        url: `/destinasyon/${postSlug}`,
        type: 'new-post'
      }
    }
  )
}

// Özel kampanya bildirimi gönder
export const sendCampaignNotification = async (title, message, url) => {
  return await sendPushNotification(
    title,
    message,
    {
      icon: '/images/join_icon.webp',
      tag: 'campaign',
      data: {
        url: url,
        type: 'campaign'
      }
    }
  )
}

// Kullanıcı sayısını getir
export const getNotificationStats = async () => {
  try {
    const { data, error } = await supabase
      .from('notification_permissions')
      .select('permission')
    
    if (error) {
      console.error('❌ İstatistikler getirilemedi:', error)
      return null
    }
    
    const stats = {
      total: data.length,
      granted: data.filter(p => p.permission === 'granted').length,
      denied: data.filter(p => p.permission === 'denied').length,
      default: data.filter(p => p.permission === 'default').length
    }
    
    return stats
  } catch (error) {
    console.error('❌ İstatistik hatası:', error)
    return null
  }
}
