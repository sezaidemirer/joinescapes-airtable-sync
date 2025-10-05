// YouTube Video Management with Supabase
import supabase from './supabase'

// YouTube video ID'sini URL'den çıkar (mevcut fonksiyon)
export const extractVideoId = (url) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Sadece video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// YouTube oEmbed API ile video bilgilerini çek
export const fetchVideoInfo = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    
    if (!response.ok) throw new Error('Video bulunamadı')
    
    const data = await response.json()
    
    return {
      video_id: videoId,
      title: data.title,
      description: data.author_name, // Channel name as description
      thumbnail_url: data.thumbnail_url,
      channel_name: data.author_name,
      views_count: 'N/A', // oEmbed doesn't provide view count
      upload_date: 'Yeni', // oEmbed doesn't provide upload date
      duration: 'N/A' // oEmbed doesn't provide duration
    }
  } catch (error) {
    console.error('Video bilgisi alınamadı:', error)
    throw error
  }
}

// Supabase YouTube video operations
export const youtubeVideoService = {
  // Tüm aktif videoları getir
  async getAll() {
    try {
      const { data, error } = await supabase
        .rpc('get_active_youtube_videos')
      
      if (error) {
        console.error('YouTube videoları getirilemedi:', error)
        return { data: [], error }
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      console.error('YouTube videoları getirilemedi:', error)
      return { data: [], error }
    }
  },

  // Yeni video ekle
  async add(videoData) {
    try {
      // Önce aynı video_id'ye sahip video var mı kontrol et
      const { data: existing, error: checkError } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('video_id', videoData.video_id)
        .single()

      if (existing) {
        throw new Error('Bu video zaten listede mevcut')
      }

      // Video ekle
      const { data, error } = await supabase
        .from('youtube_videos')
        .insert([{
          video_id: videoData.video_id,
          title: videoData.title,
          description: videoData.description || videoData.title,
          thumbnail_url: videoData.thumbnail_url,
          channel_name: videoData.channel_name,
          views_count: videoData.views_count || 'N/A',
          upload_date: videoData.upload_date || 'Yeni',
          duration: videoData.duration || 'N/A',
          display_order: 0 // Yeni videolar en üstte
        }])
        .select()
        .single()

      if (error) {
        console.error('Video eklenemedi:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Video eklenemedi:', error)
      return { data: null, error }
    }
  },

  // Video güncelle
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Video güncellenemedi:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Video güncellenemedi:', error)
      return { data: null, error }
    }
  },

  // Video sil
  async delete(id) {
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Video silinemedi:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Video silinemedi:', error)
      return { error }
    }
  },

  // Video sırasını değiştir
  async reorder(videoIds) {
    try {
      const { error } = await supabase
        .rpc('reorder_youtube_videos', { video_ids: videoIds })

      if (error) {
        console.error('Video sırası değiştirilemedi:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Video sırası değiştirilemedi:', error)
      return { error }
    }
  },

  // Video durumunu değiştir (aktif/pasif)
  async toggleActive(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Video durumu değiştirilemedi:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Video durumu değiştirilemedi:', error)
      return { data: null, error }
    }
  }
}

// Backward compatibility için localStorage'dan Supabase'e migration
export const migrateLocalStorageToSupabase = async () => {
  try {
    const STORAGE_KEY = 'joinescapes_youtube_videos'
    const stored = localStorage.getItem(STORAGE_KEY)
    
    if (!stored) {
      return { success: true, migrated: 0 }
    }

    const localVideos = JSON.parse(stored)
    if (!Array.isArray(localVideos) || localVideos.length === 0) {
      return { success: true, migrated: 0 }
    }

    
    let migrated = 0
    for (const video of localVideos) {
      try {
        const result = await youtubeVideoService.add({
          video_id: video.id,
          title: video.title,
          description: video.description,
          channel_name: video.channel,
          views_count: video.views || 'N/A',
          upload_date: video.date || 'Yeni',
          duration: video.duration || 'N/A'
        })

        if (!result.error) {
          migrated++
        } else {
          console.warn(`⚠️ Video aktarılamadı: ${video.title}`, result.error)
        }
      } catch (error) {
        console.warn(`⚠️ Video aktarılamadı: ${video.title}`, error)
      }
    }

    // Migration başarılıysa localStorage'ı temizle
    if (migrated > 0) {
      localStorage.removeItem(STORAGE_KEY)
    }

    return { success: true, migrated }
  } catch (error) {
    console.error('Migration hatası:', error)
    return { success: false, error }
  }
} 