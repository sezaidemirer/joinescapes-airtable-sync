// YouTube Video Management Utilities
// localStorage tabanlı video yönetimi - Database'e gerek yok

// YouTube video ID'sini URL'den çıkar
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
      id: videoId,
      title: data.title,
      description: data.author_name, // Channel name as description
      thumbnail: data.thumbnail_url,
      views: 'N/A', // oEmbed doesn't provide view count
      date: 'Yeni', // oEmbed doesn't provide upload date
      channel: data.author_name,
      duration: 'N/A' // oEmbed doesn't provide duration
    }
  } catch (error) {
    console.error('Video bilgisi alınamadı:', error)
    throw error
  }
}

// localStorage'da video listesi yönetimi
const STORAGE_KEY = 'joinescapes_youtube_videos'

export const videoStorage = {
  // Tüm videoları getir
  getAll: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Video listesi okunamadı:', error)
      return []
    }
  },

  // Video ekle
  add: (video) => {
    try {
      const videos = videoStorage.getAll()
      const newVideo = {
        ...video,
        id: video.id || Date.now().toString(),
        addedAt: new Date().toISOString()
      }
      videos.unshift(newVideo) // En başa ekle
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
      return newVideo
    } catch (error) {
      console.error('Video eklenemedi:', error)
      throw error
    }
  },

  // Video sil
  remove: (videoId) => {
    try {
      const videos = videoStorage.getAll()
      const filtered = videos.filter(v => v.id !== videoId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Video silinemedi:', error)
      return false
    }
  },

  // Video güncelle
  update: (videoId, updates) => {
    try {
      const videos = videoStorage.getAll()
      const index = videos.findIndex(v => v.id === videoId)
      if (index === -1) throw new Error('Video bulunamadı')
      
      videos[index] = { ...videos[index], ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
      return videos[index]
    } catch (error) {
      console.error('Video güncellenemedi:', error)
      throw error
    }
  },

  // Video sırasını değiştir
  reorder: (videoIds) => {
    try {
      const videos = videoStorage.getAll()
      const reordered = videoIds.map(id => videos.find(v => v.id === id)).filter(Boolean)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered))
      return reordered
    } catch (error) {
      console.error('Video sırası değiştirilemedi:', error)
      throw error
    }
  },

  // Listemi temizle
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Video listesi temizlenemedi:', error)
      return false
    }
  }
}

// Default video listesi - ilk kurulum için
export const defaultVideos = [
  {
    id: 'FLNg5aQb9rk',
    title: 'Turkish Celebrity in JORDAN! 🇯🇴 جولة شخصية مشهورة في الأردن',
    description: 'Join us for an exclusive journey through Jordan with a Turkish celebrity!',
    views: '15.2K görüntülenme',
    date: '2 gün önce',
    channel: 'JoinPRMarketing'
  },
  {
    id: 'pJy_mcZRxDY',
    title: 'SHARM EL SHEIKH Egypt 🇪🇬 Ultimate Travel Guide & Hidden Gems',
    description: 'Discover the stunning Red Sea paradise of Sharm El Sheikh!',
    views: '12.1K görüntülenme',
    date: '1 hafta önce',
    channel: 'JoinPRMarketing'
  },
  {
    id: 'jA57OToKvAg',
    title: 'SHARM EL SHEIKH - Red Sea Paradise 🌊 Egypt Travel Vlog',
    description: 'Experience the magical underwater world and pristine beaches.',
    views: '8.7K görüntülenme',
    date: '2 hafta önce',
    channel: 'JoinPRMarketing'
  }
]

// İlk kurulum - eğer hiç video yoksa default'ları ekle
export const initializeDefaultVideos = () => {
  const existing = videoStorage.getAll()
  if (existing.length === 0) {
    defaultVideos.forEach(video => videoStorage.add(video))
  }
}

export default {
  extractVideoId,
  fetchVideoInfo,
  videoStorage,
  initializeDefaultVideos
} 