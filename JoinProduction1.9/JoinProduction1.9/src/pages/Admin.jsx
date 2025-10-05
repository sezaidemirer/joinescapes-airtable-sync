import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogTags } from '../lib/tags'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { checkBuckets } from '../lib/storage'
import { videoStorage, extractVideoId, fetchVideoInfo, initializeDefaultVideos } from '../lib/youtube'
import { youtubeVideoService, extractVideoId as extractVideoIdSupabase, fetchVideoInfo as fetchVideoInfoSupabase, migrateLocalStorageToSupabase } from '../lib/youtubeSupabase'
import { generateXMLSitemap, generateHTMLSitemap, saveSitemap } from '../lib/sitemap'
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, BarChart3, X, Save, Cookie, Brain, Video, Youtube, Link, Map, Download, RefreshCw, Bell, Clock, Users, Star, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import { lazy, Suspense } from 'react'
const PostForm = lazy(() => import('../components/admin/PostForm'))
import CookieAnalytics from '../components/CookieAnalytics'
import CookieBusinessIntelligence from '../components/CookieBusinessIntelligence'
import rateLimiter from '../utils/rateLimiter'
import inputValidator from '../utils/inputValidator'
import { sendTestNotification, sendNewPostNotification, sendCampaignNotification, getNotificationStats } from '../utils/pushNotifications'

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuthContext()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [posts, setPosts] = useState([])
  const [pendingPosts, setPendingPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingPending, setLoadingPending] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  })

  // YouTube Video Management state
  const [videos, setVideos] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoForm, setShowVideoForm] = useState(false)

  // Sitemap state
  const [sitemapLoading, setSitemapLoading] = useState(false)
  const [sitemapGenerated, setSitemapGenerated] = useState(false)

  // Push Notification state
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    granted: 0,
    denied: 0,
    default: 0
  })
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    message: '',
    url: ''
  })

  // Featured Writers state
  const [featuredWriters, setFeaturedWriters] = useState([])

  // Editor Approval state
  const [pendingEditors, setPendingEditors] = useState([])
  const [loadingEditors, setLoadingEditors] = useState(false)
  const [allWriters, setAllWriters] = useState([])
  const [loadingWriters, setLoadingWriters] = useState(false)

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    authorName: 'JoinEscapes',
    bio: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [sitemapXml, setSitemapXml] = useState('')

  // Tag Form state
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    is_featured: false
  })

  // Category Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  // Push notification istatistiklerini getir
  const loadNotificationStats = async () => {
    try {
      const stats = await getNotificationStats()
      if (stats) {
        setNotificationStats(stats)
      }
    } catch (error) {
      console.error('Bildirim istatistikleri yüklenemedi:', error)
    }
  }

  // Test bildirimi gönder
  const handleTestNotification = async () => {
    setNotificationLoading(true)
    try {
      const result = await sendTestNotification()
      if (result.success) {
        alert(`✅ Test bildirimi gönderildi!\nBaşarılı: ${result.successful}\nBaşarısız: ${result.failed}`)
      } else {
        alert(`❌ Test bildirimi gönderilemedi: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Hata: ${error.message}`)
    } finally {
      setNotificationLoading(false)
    }
  }

  // Kampanya bildirimi gönder
  const handleCampaignNotification = async () => {
    if (!campaignForm.title || !campaignForm.message) {
      alert('❌ Başlık ve mesaj alanları zorunludur!')
      return
    }

    setNotificationLoading(true)
    try {
      const result = await sendCampaignNotification(
        campaignForm.title,
        campaignForm.message,
        campaignForm.url
      )
      if (result.success) {
        alert(`✅ Kampanya bildirimi gönderildi!\nBaşarılı: ${result.successful}\nBaşarısız: ${result.failed}`)
        setCampaignForm({ title: '', message: '', url: '' })
      } else {
        alert(`❌ Kampanya bildirimi gönderilemedi: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Hata: ${error.message}`)
    } finally {
      setNotificationLoading(false)
    }
  }

  // Storage kurulumu
  const setupStorage = async () => {
    try {
      const isReady = await checkBuckets()
      setStorageReady(isReady)
      if (isReady) {
      } else {
        console.error('❌ Storage kurulum hatası')
      }
    } catch (error) {
      console.error('Storage setup hatası:', error)
    }
  }

  // Auth kontrolü - yetkilendirme kontrolü ve yönlendirme
  useEffect(() => {
    console.log('🔍 Admin Auth Check:', { loading, isAuthenticated, user: user?.email })
    
    // Çıkış yapıldığında ana sayfaya yönlendir
    if (!loading && !isAuthenticated) {
      console.log('❌ Admin: Çıkış yapıldı, ana sayfaya yönlendiriliyor...')
      navigate('/', { replace: true })
      return
    }
    
    // Sadece giriş yapmış kullanıcıları kontrol et
    if (isAuthenticated && user && user.id) {
      // SADECE test@test.com ADMIN PANELİNE ERİŞEBİLİR!
      if (user.email !== 'test@test.com') {
        console.log('🚫 Admin: Yetkisiz erişim denemesi:', user.email)
        alert('Bu panele sadece admin erişebilir!')
        navigate('/', { replace: true })
        return
      }
      
      // Kullanıcı giriş yapmışsa bildirim istatistiklerini yükle
      loadNotificationStats()
    }
  }, [loading, isAuthenticated, navigate, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Giriş yapmamışsa hiçbir şey render etme (yönlendirme yapılacak)
  if (!isAuthenticated) {
    return null
  }

  // Data fetch functions
  const fetchPosts = async () => {
    setLoadingPosts(true)
    // TÜM YAZILAR - LİMİT YOK!
    const { data, error } = await blogPosts.getAll({
      // limit kaldırıldı - tüm yazıları göster
      orderBy: 'created_at',
      orderDirection: 'desc'
    })
    if (!error && data) {
      setPosts(data)
      console.log('✅ Admin paneline yüklenen yazı sayısı:', data.length)
    }
    setLoadingPosts(false)
  }

  const fetchPendingPosts = async () => {
    setLoadingPending(true)
    try {
      // Onay bekleyen yazıları çek (status = 'pending')
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPendingPosts(data)
        console.log('⏳ Onay bekleyen yazı sayısı:', data.length)
      } else {
        console.error('❌ Pending posts fetch hatası:', error)
      }
    } catch (error) {
      console.error('❌ Pending posts fetch hatası:', error)
    }
    setLoadingPending(false)
  }

  // Featured Writers functions
  const fetchAllWriters = async () => {
    setLoadingWriters(true)
    try {
      const { data, error } = await supabase
        .from('writer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAllWriters(data)
        setFeaturedWriters(data.filter(writer => writer.is_featured))
        console.log('✅ Yazarlar yüklendi:', data.length, 'öne çıkan:', data.filter(w => w.is_featured).length)
      } else {
        console.error('❌ Writers fetch hatası:', error)
      }
    } catch (error) {
      console.error('❌ Writers fetch hatası:', error)
    }
    setLoadingWriters(false)
  }

  const toggleFeaturedWriter = async (writerId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('writer_profiles')
        .update({ is_featured: !currentStatus })
        .eq('id', writerId)

      if (!error) {
        console.log('✅ Yazar öne çıkarma durumu güncellendi:', writerId)
        fetchAllWriters() // Listeyi yenile
      } else {
        alert('İşlem başarısız: ' + error.message)
      }
    } catch (error) {
      alert('İşlem başarısız: ' + error.message)
    }
  }

  // GERÇEK İSTATİSTİKLERİ AYRI SORGU İLE AL
  const fetchRealStats = async () => {
    console.log('📊 Gerçek istatistikler hesaplanıyor...')
    
    try {
      // PARALEL SORGU - HEPSİ AYNI ANDA
      const [totalResult, publishedResult, draftResult, viewsResult] = await Promise.all([
        // Toplam yazı sayısı
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        
        // Yayınlanmış yazı sayısı
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        
        // Taslak yazı sayısı  
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        
        // Toplam görüntülenme sayısı
        supabase.from('posts').select('views')
      ])
      
      const totalPosts = totalResult.count || 0
      const publishedPosts = publishedResult.count || 0  
      const draftPosts = draftResult.count || 0
      const totalViews = viewsResult.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
      
      console.log('✅ Gerçek istatistikler:', { totalPosts, publishedPosts, draftPosts, totalViews })
      
      setStats({ totalPosts, publishedPosts, draftPosts, totalViews })
      
    } catch (error) {
      console.error('❌ İstatistik hatası:', error)
      setStats({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalViews: 0 })
    }
  }

  const fetchCategories = async () => {
    setLoadingCategories(true)
    const { data, error } = await blogCategories.getAll()
    if (!error && data) {
      setCategories(data)
    }
    setLoadingCategories(false)
  }

  const fetchTags = async () => {
    setLoadingTags(true)
    const { data, error } = await blogTags.getAll()
    if (!error && data) {
      setTags(data)
    }
    setLoadingTags(false)
  }

  // YouTube Video Management functions - Supabase version
  const fetchVideos = async () => {
    try {
      const { data, error } = await youtubeVideoService.getAll()
      if (!error && data) {
        setVideos(data)
      } else {
        console.error('YouTube videoları getirilemedi:', error)
        setVideos([])
      }
    } catch (error) {
      console.error('YouTube videoları getirilemedi:', error)
      setVideos([])
    }
  }

  const handleAddVideo = async () => {
    // 🔒 GÜVENLİK: Rate limiting kontrolü
    const rateCheck = rateLimiter.checkCriticalEndpoint('add-video')
    if (!rateCheck.allowed) {
      alert(rateCheck.message)
      return
    }

    // 🔒 GÜVENLİK: Input validation
    const urlValidation = inputValidator.validateYouTubeUrl(videoUrl)
    if (!urlValidation.isValid) {
      alert('Hata: ' + urlValidation.errors.join(', '))
      return
    }

    const descValidation = inputValidator.validateText(videoDescription, {
      maxLength: 500,
      allowHtml: false,
      allowSpecialChars: true
    })
    if (!descValidation.isValid) {
      alert('Açıklama hatası: ' + descValidation.errors.join(', '))
      return
    }

    setVideoLoading(true)
    try {
      const videoId = extractVideoIdSupabase(urlValidation.sanitized)
      if (!videoId) {
        throw new Error('Geçerli bir YouTube URL\'si giriniz')
      }

      // Fetch video info from YouTube
      const videoInfo = await fetchVideoInfoSupabase(videoId)
      
      // Manuel açıklama varsa onu kullan, yoksa video başlığını kullan
      const finalDescription = descValidation.sanitized || videoInfo.title || 'Video açıklaması mevcut değil'
      
      const videoToAdd = {
        ...videoInfo,
        description: finalDescription
      }
      
      // Add to Supabase
      const { data, error } = await youtubeVideoService.add(videoToAdd)
      
      if (error) {
        throw new Error(error.message || 'Video eklenirken hata oluştu')
      }
      
      // Update local state
      setVideos([data, ...videos])
      setVideoUrl('')
      setVideoDescription('')
      
      // Ana sayfaya event gönder (aynı tab'da güncelleme için)
      window.dispatchEvent(new CustomEvent('youtube-videos-updated'))
      
      alert('✅ Video başarıyla eklendi!')
    } catch (error) {
      alert('❌ Video eklenirken hata: ' + error.message)
    } finally {
      setVideoLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await youtubeVideoService.delete(videoId)
        
        if (error) {
          throw new Error(error.message || 'Video silinirken hata oluştu')
        }
        
        // Update local state
        setVideos(videos.filter(v => v.id !== videoId))
        
        // Ana sayfaya event gönder
        window.dispatchEvent(new CustomEvent('youtube-videos-updated'))
        
        alert('Video başarıyla silindi!')
      } catch (error) {
        alert('Video silinirken hata: ' + error.message)
      }
    }
  }

  const handleEditVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoForm(true)
  }

  const handleUpdateVideo = async (videoId, updates) => {
    try {
      const { data, error } = await youtubeVideoService.update(videoId, updates)
      
      if (error) {
        throw new Error(error.message || 'Video güncellenirken hata oluştu')
      }
      
      // Update local state
      setVideos(videos.map(v => v.id === videoId ? data : v))
      setShowVideoForm(false)
      setSelectedVideo(null)
      
      // Ana sayfaya event gönder
      window.dispatchEvent(new CustomEvent('youtube-videos-updated'))
      
      alert('Video güncellendi!')
    } catch (error) {
      alert('Video güncellenirken hata: ' + error.message)
    }
  }

  // Tag management functions
  const handleNewTag = () => {
    setSelectedTag(null)
    setTagForm({
      name: '',
      description: '',
      color: '#3B82F6',
      is_featured: false
    })
    setActiveTab('tagForm')
  }

  const handleEditTag = (tag) => {
    setSelectedTag(tag)
    setTagForm({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#3B82F6',
      is_featured: tag.is_featured || false
    })
    setActiveTab('tagForm')
  }

  const handleSaveTag = async () => {
    if (!tagForm.name.trim()) {
      alert('Etiket adı gereklidir')
      return
    }

    try {
      let result
      if (selectedTag) {
        // Güncelle
        console.log('🔄 Etiket güncelleniyor:', selectedTag.id)
        result = await blogTags.update(selectedTag.id, tagForm)
      } else {
        // Yeni oluştur
        console.log('🆕 Yeni etiket oluşturuluyor...')
        result = await blogTags.create(tagForm)
      }

      if (result.error) {
        console.error('❌ Etiket işlemi hatası:', result.error)
        throw new Error(result.error.message)
      }

      console.log('✅ Etiket işlemi başarılı!')
      alert(selectedTag ? 'Etiket güncellendi!' : 'Etiket oluşturuldu!')
      setActiveTab('tags')
      fetchTags()
    } catch (error) {
      console.error('❌ Etiket işlemi hatası:', error)
      alert('İşlem başarısız: ' + error.message)
    }
  }

  const handleDeleteTag = async (id) => {
    if (window.confirm('Bu etiketi silmek istediğinizden emin misiniz?')) {
      const { error } = await blogTags.delete(id)
      if (!error) {
        fetchTags()
      } else {
        alert('Silme işlemi başarısız: ' + error.message)
      }
    }
  }

  const handleTagFormChange = (field, value) => {
    setTagForm(prev => ({ ...prev, [field]: value }))
  }

  // Category management functions
  const handleNewCategory = () => {
    setSelectedCategory(null)
    setCategoryForm({
      name: '',
      description: '',
      color: '#3B82F6'
    })
    setActiveTab('categoryForm')
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    })
    setActiveTab('categoryForm')
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Kategori adı gereklidir')
      return
    }

    try {
      let result
      if (selectedCategory) {
        // Güncelle
        console.log('🔄 Kategori güncelleniyor:', selectedCategory.id)
        result = await blogCategories.update(selectedCategory.id, categoryForm)
      } else {
        // Yeni oluştur
        console.log('🆕 Yeni kategori oluşturuluyor...')
        result = await blogCategories.create(categoryForm)
      }

      if (result.error) {
        console.error('❌ Kategori işlemi hatası:', result.error)
        throw new Error(result.error.message)
      }

      console.log('✅ Kategori işlemi başarılı!')
      alert(selectedCategory ? 'Kategori güncellendi!' : 'Kategori oluşturuldu!')
      setActiveTab('categories')
      fetchCategories()
    } catch (error) {
      console.error('❌ Kategori işlemi hatası:', error)
      alert('İşlem başarısız: ' + error.message)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait yazılar da etkilenebilir.')) {
      const { error } = await blogCategories.delete(id)
      if (!error) {
        fetchCategories()
        fetchPosts() // Posts'u da refresh et çünkü kategori silindi
      } else {
        alert('Silme işlemi başarısız: ' + error.message)
      }
    }
  }

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }))
  }

  // Sitemap fonksiyonları
  const handleGenerateSitemap = async () => {
    setSitemapLoading(true)
    setSitemapGenerated(false)
    try {
      const result = await generateXMLSitemap()
      setSitemapXml(result.xml)
      setSitemapGenerated(true)
      
      // Otomatik olarak sitemap'i kaydet
      try {
        // XML sitemap'i public klasörüne kaydet
        const xmlBlob = new Blob([result.xml], { type: 'application/xml' })
        const xmlUrl = URL.createObjectURL(xmlBlob)
        
        // Dosyayı indir (public klasörüne kopyalamak için)
        const a = document.createElement('a')
        a.href = xmlUrl
        a.download = 'sitemap.xml'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(xmlUrl)
        
        // HTML sitemap de oluştur ve kaydet
        const htmlResult = await generateHTMLSitemap()
        const htmlBlob = new Blob([htmlResult], { type: 'text/html' })
        const htmlUrl = URL.createObjectURL(htmlBlob)
        
        const b = document.createElement('a')
        b.href = htmlUrl
        b.download = 'sitemap.html'
        b.style.display = 'none'
        document.body.appendChild(b)
        b.click()
        document.body.removeChild(b)
        URL.revokeObjectURL(htmlUrl)
        
        alert('✅ Sitemap başarıyla oluşturuldu ve kaydedildi!\n\n📁 Dosyalar:\n- sitemap.xml\n- sitemap.html\n\n💡 Bu dosyaları public klasörüne kopyalayın.')
        
      } catch (saveError) {
        console.warn('Sitemap kaydetme uyarısı:', saveError)
        alert('⚠️ Sitemap oluşturuldu ama kaydedilemedi. Manuel olarak indirin.')
      }
      
    } catch (error) {
      console.error('Sitemap oluşturma hatası:', error)
      alert('Sitemap oluşturulurken hata oluştu: ' + error.message)
    } finally {
      setSitemapLoading(false)
    }
  }

  const handleDownloadSitemap = () => {
    if (!sitemapXml) return
    
    const blob = new Blob([sitemapXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveSitemap = async () => {
    if (!sitemapXml) {
      alert('Önce sitemap oluşturun')
      return
    }
    
    try {
      // Sitemap'i saveSitemap fonksiyonuyla kaydet
      await saveSitemap(sitemapXml)
      alert('Sitemap başarıyla kaydedildi!')
    } catch (error) {
      console.error('Sitemap kaydetme hatası:', error)
      alert('Sitemap kaydedilirken hata oluştu: ' + error.message)
    }
  }

  useEffect(() => {
    const initializeAdmin = async () => {
      console.log('🚀 Admin paneli yükleniyor - HIZLI MOD!')
      
      try {
        // 1. PARALEL VERİ ÇEKME - HEPSİ AYNI ANDA
        const [postsResult, pendingResult, categoriesResult, tagsResult, videosResult, statsResult, writersResult, editorsResult] = await Promise.allSettled([
          fetchPosts(),
          fetchPendingPosts(),
          fetchCategories(), 
          fetchTags(),
          fetchVideos(),
          fetchRealStats(), // GERÇEK İSTATİSTİKLER
          fetchAllWriters(), // YAZARLAR
          fetchPendingEditors() // EDITÖR ONAYLARI
        ])
        
        console.log('✅ Paralel veri yükleme tamamlandı:', {
          posts: postsResult.status,
          categories: categoriesResult.status, 
          tags: tagsResult.status,
          videos: videosResult.status,
          stats: statsResult.status,
          writers: writersResult.status,
          editors: editorsResult.status
        })
        
        // 2. STORAGE KURULUMU - NON-BLOCKING
        setupStorage().catch(err => console.warn('Storage kurulum uyarısı:', err))
        
        // 3. YOUTUBE MİGRATION - ARKA PLANDA
        setTimeout(async () => {
          try {
            const migrationResult = await migrateLocalStorageToSupabase()
            if (migrationResult.success && migrationResult.migrated > 0) {
              console.log('✅ YouTube migration tamamlandı')
            }
          } catch (error) {
            console.warn('Migration hatası:', error)
          }
        }, 1000) // 1 saniye sonra çalıştır
        
      } catch (error) {
        console.error('❌ Admin init hatası:', error)
      }
    }
    
    initializeAdmin()
  }, [])

  // Profile Functions
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      // Update email if changed
      if (profileData.email && profileData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        })
        if (emailError) throw emailError
      }

      // Update password if provided
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('Şifreler eşleşmiyor')
        }
        if (profileData.newPassword.length < 6) {
          throw new Error('Şifre en az 6 karakter olmalıdır')
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword
        })
        if (passwordError) throw passwordError
      }

      // Update user metadata (full name, author name, bio)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName || 'JoinEscapes',
          author_name: profileData.authorName || 'JoinEscapes',
          bio: profileData.bio || ''
        }
      })
      if (metadataError) throw metadataError

      setProfileSuccess('Profil başarıyla güncellendi!')
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }))

    } catch (error) {
      setProfileError(error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'JoinEscapes',
        email: user.email || '',
        newPassword: '',
        confirmPassword: '',
        authorName: user.user_metadata?.author_name || 'JoinEscapes',
        bio: user.user_metadata?.bio || ''
      })
    }
  }, [user])

  const handleDeletePost = async (id) => {
    if (window.confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) {
      const { error } = await blogPosts.delete(id)
      if (!error) {
        fetchPosts()
      } else {
        alert('Silme işlemi başarısız: ' + error.message)
      }
    }
  }

  const handleEditPost = (post) => {
    setSelectedPost(post)
    setShowPostForm(true)
  }

  const handleNewPost = () => {
    setSelectedPost(null)
    setShowPostForm(true)
  }

  const handlePostSaved = () => {
    setShowPostForm(false)
    setSelectedPost(null)
    fetchPosts()
  }

  // Pending posts functions
  const handleApprovePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('id', postId)

      if (!error) {
        console.log('✅ Yazı onaylandı:', postId)
        fetchPendingPosts() // Pending listesini güncelle
        fetchPosts() // Ana yazı listesini güncelle
        fetchRealStats() // İstatistikleri güncelle
      } else {
        alert('Onay işlemi başarısız: ' + error.message)
      }
    } catch (error) {
      alert('Onay işlemi başarısız: ' + error.message)
    }
  }

  const handleRejectPost = async (postId) => {
    if (window.confirm('Bu yazıyı reddetmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('posts')
          .update({ status: 'rejected' })
          .eq('id', postId)

        if (!error) {
          console.log('❌ Yazı reddedildi:', postId)
          fetchPendingPosts() // Pending listesini güncelle
          fetchRealStats() // İstatistikleri güncelle
        } else {
          alert('Red işlemi başarısız: ' + error.message)
        }
      } catch (error) {
        alert('Red işlemi başarısız: ' + error.message)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Yayında' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Taslak' },
      pending: { color: 'bg-orange-100 text-orange-800', text: 'Onay Bekliyor' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Reddedildi' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Arşiv' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  // Editor Approval Functions
  const fetchPendingEditors = async () => {
    setLoadingEditors(true)
    try {
      // Service role key kontrolü
      if (!supabaseAdmin) {
        console.error('❌ Service role key eksik!')
        alert('Admin işlemleri için service role key eksik!')
        return
      }

      // test@test.com dışındaki editör/süpervizör kullanıcıları getir
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        console.error('❌ Editörler getirilemedi:', error)
        return
      }

      // Onay bekleyen editörleri filtrele
      const pendingEditors = data.users.filter(user => {
        const userRole = user.user_metadata?.user_role
        const isEditorOrSupervisor = userRole === 'editor' || userRole === 'yazar' || userRole === 'supervisor'
        const isNotAdmin = user.email !== 'test@test.com'
        const isNotApproved = !user.user_metadata?.editor_approved
        
        return isEditorOrSupervisor && isNotAdmin && isNotApproved
      })

      console.log('📋 Onay bekleyen editörler:', pendingEditors.length)
      setPendingEditors(pendingEditors)
    } catch (error) {
      console.error('❌ Editör fetch hatası:', error)
    } finally {
      setLoadingEditors(false)
    }
  }

  const handleApproveEditor = async (userId, email) => {
    if (window.confirm(`${email} adresli kullanıcıyı editör olarak onaylamak istediğinizden emin misiniz?`)) {
      try {
        console.log('🔄 Editör onaylanıyor:', { userId, email })
        
        // KALICI ÇÖZÜM: RPC fonksiyonu kullan
        const { data, error } = await supabase.rpc('approve_editor_admin', {
          p_user_id: userId,
          p_approved_by: user?.email || 'admin@joinescapes.com'
        })

        if (error) {
          console.error('❌ RPC fonksiyon hatası:', error)
          alert('Editör onaylama hatası: ' + error.message)
          return
        }

        if (data && data.success) {
          console.log('✅ Editör onaylandı:', email)
          fetchPendingEditors() // Listeyi güncelle
          fetchAllWriters() // Yazarlar listesini güncelle
          alert(`${email} adresli kullanıcı başarıyla editör olarak onaylandı ve profil oluşturuldu!`)
        } else {
          alert('Onay işlemi başarısız: ' + (data?.message || 'Bilinmeyen hata'))
        }
        
      } catch (error) {
        console.error('❌ Editör onaylama hatası:', error)
        alert('Onay işlemi başarısız: ' + error.message)
      }
    }
  }

  // Test için kullanıcı metadata'sını güncelleme fonksiyonu
  const fixTestUserMetadata = async () => {
    try {
      if (!supabaseAdmin) {
        alert('Service role key eksik!')
        return
      }

      // birsurvivorgeyigi@gmail.com kullanıcısını bul ve metadata'sını güncelle
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const targetUser = users.users.find(u => u.email === 'birsurvivorgeyigi@gmail.com')
      
      if (targetUser) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
          user_metadata: {
            user_role: 'yazar',
            editor_approved: false, // Onay bekleyen olarak işaretle
            full_name: 'birsurvivorgeyigi',
            author_name: 'JoinEscapes'
          }
        })
        
        if (!error) {
          console.log('✅ Test kullanıcı metadata güncellendi')
          alert('birsurvivorgeyigi@gmail.com kullanıcısının metadata\'sı güncellendi!')
          fetchPendingEditors() // Listeyi yenile
        } else {
          alert('Hata: ' + error.message)
        }
      } else {
        alert('Kullanıcı bulunamadı!')
      }
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const handleRejectEditor = async (userId, email) => {
    if (window.confirm(`${email} adresli kullanıcıyı reddetmek istediğinizden emin misiniz?`)) {
      try {
        // Kullanıcıyı sil
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (!error) {
          console.log('❌ Editör reddedildi:', email)
          fetchPendingEditors() // Listeyi güncelle
          alert(`${email} adresli kullanıcı reddedildi ve hesabı silindi.`)
        } else {
          alert('Red işlemi başarısız: ' + error.message)
        }
      } catch (error) {
        alert('Red işlemi başarısız: ' + error.message)
      }
    }
  }

  // Post Form Modal
  if (showPostForm) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div></div>}>
        <PostForm
          post={selectedPost}
          categories={categories}
          onSave={handlePostSaved}
          onCancel={() => setShowPostForm(false)}
        />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Hoş geldin, {user?.email}</p>
            </div>
            <button
              onClick={handleNewPost}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Yazı</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-inner">
            <div className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-3 pb-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3, short: 'Panel' },
              { id: 'posts', name: 'Yazılar', icon: Edit, short: 'Yazı' },
              { id: 'pending', name: 'Onay Bekleyen', icon: Clock, short: 'Onay' },
              { id: 'editorApproval', name: 'Editör Onayı', icon: UserCheck, short: 'Edit' },
              { id: 'featuredWriters', name: 'Öne Çıkan Yazarlar', icon: Users, short: 'Yazar' },
              { id: 'categories', name: 'Kategoriler', icon: Tag, short: 'Kat' },
              { id: 'tags', name: 'Etiketler', icon: Tag, short: 'Tag' },
              { id: 'notifications', name: 'Bildirimler', icon: Bell, short: 'Bell' },
              { id: 'profile', name: 'Profil Ayarları', icon: User, short: 'Prof' },
              { id: 'videos', name: 'YouTube Videos', icon: Youtube, short: 'Vid' },
              { id: 'sitemap', name: 'Site Haritası', icon: Map, short: 'Map' },
              { id: 'cookieAnalytics', name: 'Cookie Analytics', icon: Cookie, short: 'Ana' },
              { id: 'cookieBusinessIntelligence', name: 'Cookie Business Intelligence', icon: Brain, short: 'BI' }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-xs shadow-sm border min-w-[50px] sm:min-w-[60px] ${
                    activeTab === tab.id || 
                    (activeTab === 'tagForm' && tab.id === 'tags') ||
                    (activeTab === 'categoryForm' && tab.id === 'categories')
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 transform scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="hidden lg:block text-[11px]">{tab.name}</span>
                  <span className="lg:hidden text-[11px]">{tab.short}</span>
                </button>
              )
            })}
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Yazı</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                  </div>
                  <Edit className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Yayında</p>
                    <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taslak</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
                  </div>
                  <Edit className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalViews}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Son Yazılar</h3>
                <span className="text-sm text-gray-500">Son 5 yazı</span>
              </div>
              
              {loadingPosts ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Son yazılar yükleniyor...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Edit className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Henüz yazı eklenmemiş</p>
                  <button
                    onClick={handleNewPost}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    İlk yazıyı ekle
                  </button>
                </div>
              ) : (
              <div className="divide-y divide-gray-200">
                  {posts
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // En yeni yazılar üstte
                    .slice(0, 5)
                    .map((post) => (
                    <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(post.created_at)}
                            </p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {post.category_name || 'Kategori yok'}
                            </p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {post.author_name || 'Yazar bilinmiyor'}
                            </p>
                    </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                      {getStatusBadge(post.status)}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{post.views || 0} görüntülenme</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              
              {posts.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 border-t">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Tüm yazıları görüntüle ({posts.length} yazı)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Blog Yazıları</h3>
              <button
                onClick={handleNewPost}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Yazı</span>
              </button>
            </div>
            
            {loadingPosts ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yazılar yükleniyor...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Görüntülenme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.author_name} • {post.read_time} dk okuma
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{post.category_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(post.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.views} • {post.likes} beğeni
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending Posts Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Onay Bekleyen Yazılar</h3>
                <p className="text-sm text-gray-500 mt-1">Editörler tarafından yayın için gönderilen yazılar</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingPosts.length} yazı bekliyor
                </span>
                <button
                  onClick={fetchPendingPosts}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {loadingPending ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Onay bekleyen yazılar yükleniyor...</p>
              </div>
            ) : pendingPosts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Onay bekleyen yazı yok</h4>
                <p className="text-gray-500">Editörler yazı gönderdiğinde burada görünecek</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yazı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yazar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gönderilme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {post.featured_image_url && (
                              <img 
                                src={post.featured_image_url} 
                                alt={post.title}
                                className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {post.title}
                              </h4>
                              {post.excerpt && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {post.author_name || 'Bilinmeyen'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {post.categories?.name || 'Kategori yok'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprovePost(post.id)}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1"
                              title="Yazıyı Onayla ve Yayınla"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Onayla</span>
                            </button>
                            <button
                              onClick={() => handleRejectPost(post.id)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-1"
                              title="Yazıyı Reddet"
                            >
                              <X className="h-3 w-3" />
                              <span>Reddet</span>
                            </button>
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-gray-600 hover:text-blue-600 transition-colors p-1"
                              title="Önizle/Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Editor Approval Tab */}
        {activeTab === 'editorApproval' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Editör Onayı</h3>
                <p className="text-sm text-gray-500 mt-1">Editör/Süpervizör olarak kayıt olan kullanıcıları onaylayın</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingEditors.length} onay bekleyen
                </span>
                <button
                  onClick={fetchPendingEditors}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={fixTestUserMetadata}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  title="Test kullanıcısını onay bekleyen yap"
                >
                  Test Hazırla
                </button>
              </div>
            </div>
            
            {loadingEditors ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Onay bekleyen editörler yükleniyor...</p>
              </div>
            ) : pendingEditors.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Onay bekleyen editör yok</h4>
                <p className="text-gray-500">Yeni editör/süpervizör kayıt olduğunda burada görünecek</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Durumu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingEditors.map((editor) => (
                      <tr key={editor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {editor.user_metadata?.full_name || editor.email?.split('@')[0]}
                              </div>
                              <div className="text-sm text-gray-500">{editor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            editor.user_metadata?.user_role === 'supervisor' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {editor.user_metadata?.user_role === 'supervisor' ? 'Süpervizör' : 
                             editor.user_metadata?.user_role === 'editor' || editor.user_metadata?.user_role === 'yazar' ? 'Editör' : 
                             editor.user_metadata?.user_role || 'Bilinmeyen'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(editor.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            editor.email_confirmed_at 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {editor.email_confirmed_at ? 'Doğrulanmış' : 'Bekliyor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApproveEditor(editor.id, editor.email)}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1"
                              title="Editörü Onayla"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Onayla</span>
                            </button>
                            <button
                              onClick={() => handleRejectEditor(editor.id, editor.email)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-1"
                              title="Editörü Reddet"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Featured Writers Tab */}
        {activeTab === 'featuredWriters' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Öne Çıkan Yazarlar</h3>
                <p className="text-sm text-gray-500 mt-1">Ana sayfada görünecek yazarları yönetin</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {featuredWriters.length} öne çıkan yazar
                </span>
                <button
                  onClick={fetchAllWriters}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {loadingWriters ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yazarlar yükleniyor...</p>
              </div>
            ) : allWriters.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz yazar yok</h4>
                <p className="text-gray-500">Yazarlar kayıt olduğunda burada görünecek</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yazar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allWriters.map((writer) => (
                      <tr key={writer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {writer.profile_image ? (
                              <img 
                                src={writer.profile_image} 
                                alt={writer.name}
                                className="w-12 h-12 object-cover rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-lg">
                                  {writer.name ? writer.name.charAt(0).toUpperCase() : '?'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900">
                                {writer.name}
                              </h4>
                              {writer.location && (
                                <p className="text-sm text-gray-500">
                                  {writer.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {writer.title || 'Başlık belirtilmemiş'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(writer.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {writer.is_featured ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Star className="w-3 h-3 mr-1" />
                              Öne Çıkan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleFeaturedWriter(writer.id, writer.is_featured)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              writer.is_featured
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {writer.is_featured ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Kaldır
                              </>
                            ) : (
                              <>
                                <Star className="w-3 h-3 mr-1" />
                                Öne Çıkar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Kategoriler</h3>
              <button
                onClick={handleNewCategory}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Kategori</span>
              </button>
            </div>
            
            {loadingCategories ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Kategoriler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {category.description || 'Açıklama bulunmuyor'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Slug: {category.slug}</span>
                      <span>ID: {category.id}</span>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz kategori eklenmemiş</p>
                    <button
                      onClick={handleNewCategory}
                      className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      İlk Kategoriyi Ekle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Etiketler</h3>
              <button
                onClick={handleNewTag}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Etiket</span>
              </button>
            </div>
            
            {loadingTags ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Etiketler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {tags.map((tag) => (
                  <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <h4 className="font-medium text-gray-900">{tag.name}</h4>
                        {tag.is_featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            ⭐ Öne Çıkan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {tag.description || 'Açıklama bulunmuyor'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Slug: {tag.slug}</span>
                      <span>Kullanım: {tag.usage_count || 0}</span>
                    </div>
                  </div>
                ))}
                
                {tags.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz etiket eklenmemiş</p>
                    <button
                      onClick={handleNewTag}
                      className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      İlk Etiketi Ekle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tag Form Tab */}
        {activeTab === 'tagForm' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedTag ? 'Etiket Düzenle' : 'Yeni Etiket Ekle'}
              </h3>
              <button
                onClick={() => setActiveTab('tags')}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Etiket Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiket Adı *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => handleTagFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Öneri"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => handleTagFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Etiket hakkında kısa açıklama"
                />
              </div>

              {/* Renk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => handleTagFormChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => handleTagFormChange('color', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="#3B82F6"
                  />
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-block w-8 h-8 rounded-full border"
                      style={{ backgroundColor: tagForm.color }}
                    ></span>
                    <span className="text-sm text-gray-500">Önizleme</span>
                  </div>
                </div>
              </div>

              {/* Öne Çıkan */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={tagForm.is_featured}
                    onChange={(e) => handleTagFormChange('is_featured', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Öne Çıkan Etiket
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Öne çıkan etiketler admin panelinde öncelikli gösterilir
                </p>
              </div>

              {/* Önizleme */}
              {tagForm.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Önizleme
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: tagForm.color }}
                    >
                      {tagForm.name}
                      {tagForm.is_featured && <span className="ml-1">⭐</span>}
                    </span>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('tags')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveTag}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{selectedTag ? 'Güncelle' : 'Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Form Tab */}
        {activeTab === 'categoryForm' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Kategori Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Turizm Gündemi"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kategori hakkında kısa açıklama"
                />
              </div>

              {/* Renk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => handleCategoryFormChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => handleCategoryFormChange('color', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="#3B82F6"
                  />
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-block w-8 h-8 rounded-full border"
                      style={{ backgroundColor: categoryForm.color }}
                    ></span>
                    <span className="text-sm text-gray-500">Önizleme</span>
                  </div>
                </div>
              </div>

              {/* Önizleme */}
              {categoryForm.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Önizleme
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: categoryForm.color }}
                    >
                      {categoryForm.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{selectedCategory ? 'Güncelle' : 'Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cookie Analytics Tab */}
        {activeTab === 'cookieAnalytics' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Cookie Analytics</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <CookieAnalytics />
            </div>
          </div>
        )}

        {/* Cookie Business Intelligence Tab */}
        {activeTab === 'cookieBusinessIntelligence' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Cookie Business Intelligence</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <CookieBusinessIntelligence />
            </div>
          </div>
        )}

        {/* Sitemap Tab */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Site Haritası Yönetimi</h3>
                <p className="text-sm text-gray-600">Dinamik XML sitemap oluşturun ve yönetin</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Sol Panel - Sitemap Oluşturma */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Sitemap Oluştur</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Tüm sayfalarınızı, blog yazılarınızı ve kategorilerinizi içeren dinamik XML sitemap oluşturun.
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={handleGenerateSitemap}
                          disabled={sitemapLoading}
                          className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {sitemapLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Oluşturuluyor...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              <span>Sitemap Oluştur</span>
                            </>
                          )}
                        </button>

                        {sitemapGenerated && (
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={handleDownloadSitemap}
                              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>İndir</span>
                            </button>
                            <button
                              onClick={handleSaveSitemap}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Save className="h-4 w-4" />
                              <span>Kaydet</span>
                            </button>
                            <a
                              href="/sitemap.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Link className="h-4 w-4" />
                              <span>HTML</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sitemap Bilgileri */}
                    {sitemapGenerated && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Sitemap Bilgileri</h5>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>XML Boyutu:</span>
                            <span>{(sitemapXml.length / 1024).toFixed(2)} KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Toplam URL:</span>
                            <span>{(sitemapXml.match(/<url>/g) || []).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Oluşturulma:</span>
                            <span>{new Date().toLocaleString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-medium text-blue-600">📍 Ana</div>
                              <div>3</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-green-600">🏷️ Kategori</div>
                              <div>12</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-purple-600">📝 Post</div>
                              <div>{sitemapXml ? (sitemapXml.match(/\/[^/]+\/[^/]+<\/loc>/g) || []).length : '20'}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-orange-600">🏷️ Etiket</div>
                              <div>3</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-600">📄 Statik</div>
                              <div>5</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-red-600">🌐 HTML</div>
                              <div>✓</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sağ Panel - Sitemap Önizleme */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Sitemap Önizleme</h4>
                      {sitemapGenerated ? (
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-96 overflow-y-auto">
                          <pre>{sitemapXml}</pre>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Sitemap oluşturun ve önizlemeyi görün</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sitemap Yönergeleri */}
                <div className="mt-8 bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">📋 Sitemap Yönergeleri</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>XML Sitemap:</strong> Arama motorları için optimizasyonu (Google, Bing)</li>
                    <li>• <strong>HTML Sitemap:</strong> Ziyaretçiler için düzenli site haritası</li>
                    <li>• Otomatik olarak tüm sayfalar, kategoriler, etiketler ve blog yazıları dahil edilir</li>
                    <li>• Sitemap'i oluşturduktan sonra sunucuya kaydetmeyi unutmayın</li>
                    <li>• Google Search Console'a <code>sitemap.xml</code> URL'sini ekleyin</li>
                    <li>• Yeni içerik ekledikçe sitemap'i düzenli olarak güncelleyin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">YouTube Video Yönetimi</h3>
                    <p className="text-gray-600">Ana sayfada gösterilecek YouTube videolarını yönetin</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Toplam {videos.length} video
                </div>
              </div>

              {/* Add Video Form */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video URL'si
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      disabled={videoLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      YouTube video URL'sini yapıştırın. Video başlığı otomatik çekilecek.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Açıklaması (İsteğe Bağlı)
                    </label>
                    <textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Video hakkında kısa açıklama yazın..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      disabled={videoLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Boş bırakılırsa video başlığı açıklama olarak kullanılacak.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                  <button
                    onClick={handleAddVideo}
                    disabled={videoLoading || !videoUrl.trim()}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {videoLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Video Ekle</span>
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">Video Listesi</h4>
                <p className="text-sm text-gray-600">Ana sayfada görüntülenecek videolar (sıraya göre)</p>
              </div>

              {videos.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz video eklenmemiş</p>
                  <p className="text-sm text-gray-400">YouTube video URL'si ekleyerek başlayın</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {videos.map((video, index) => (
                    <div key={video.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-4">
                        
                        {/* Video Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img
                              src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.webp`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-lg font-medium text-gray-900 truncate">
                            {video.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>#{video.display_order + 1}</span>
                            <span>{video.channel_name}</span>
                            <span>{video.views_count}</span>
                            <span>{video.upload_date}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                            title="YouTube'da aç"
                          >
                            <Link className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Edit Modal */}
            {showVideoForm && selectedVideo && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
                  
                  <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Video Düzenle</h3>
                      <button
                        onClick={() => setShowVideoForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Başlığı
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedVideo.title}
                          onChange={(e) => setSelectedVideo({...selectedVideo, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          rows={3}
                          defaultValue={selectedVideo.description}
                          onChange={(e) => setSelectedVideo({...selectedVideo, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Görüntülenme
                          </label>
                          <input
                            type="text"
                            defaultValue={selectedVideo.views_count}
                            onChange={(e) => setSelectedVideo({...selectedVideo, views_count: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tarih
                          </label>
                          <input
                            type="text"
                            defaultValue={selectedVideo.upload_date}
                            onChange={(e) => setSelectedVideo({...selectedVideo, upload_date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => handleUpdateVideo(selectedVideo.id, selectedVideo)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setShowVideoForm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Push Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Push Bildirimleri</h3>
                    <p className="text-sm text-gray-600">Kullanıcılara bildirim gönderin ve istatistikleri görün</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                    <p className="text-3xl font-bold text-gray-900">{notificationStats.total}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">İzin Veren</p>
                    <p className="text-3xl font-bold text-green-600">{notificationStats.granted}</p>
                  </div>
                  <Bell className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">İzin Vermeyen</p>
                    <p className="text-3xl font-bold text-red-600">{notificationStats.denied}</p>
                  </div>
                  <X className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Henüz Karar Vermemiş</p>
                    <p className="text-3xl font-bold text-yellow-600">{notificationStats.default}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Test Notification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Test Bildirimi</h4>
              <p className="text-sm text-gray-600 mb-4">
                Tüm izin veren kullanıcılara test bildirimi gönderin.
              </p>
              <button
                onClick={handleTestNotification}
                disabled={notificationLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {notificationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Test Bildirimi Gönder</span>
                  </>
                )}
              </button>
            </div>

            {/* Campaign Notification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Kampanya Bildirimi</h4>
              <p className="text-sm text-gray-600 mb-4">
                Özel kampanya veya duyuru bildirimi gönderin.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bildirim Başlığı
                  </label>
                  <input
                    type="text"
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Özel İndirim!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bildirim Mesajı
                  </label>
                  <textarea
                    value={campaignForm.message}
                    onChange={(e) => setCampaignForm(prev => ({...prev, message: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Örn: %50'ye varan indirimler sadece bugün!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yönlendirme URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={campaignForm.url}
                    onChange={(e) => setCampaignForm(prev => ({...prev, url: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://joinescapes.com/kampanya"
                  />
                </div>
                
                <button
                  onClick={handleCampaignNotification}
                  disabled={notificationLoading || !campaignForm.title || !campaignForm.message}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {notificationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Kampanya Bildirimi Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profil Ayarları</h3>
                    <p className="text-sm text-gray-600">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Success/Error Messages */}
              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{profileSuccess}</p>
                </div>
              )}
              {profileError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{profileError}</p>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                
                {/* Basic Info Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Temel Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Adınızı girin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="E-posta adresiniz"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Şifre Değiştir</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData(prev => ({...prev, newPassword: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Yeni şifrenizi girin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şifre Onayı
                      </label>
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({...prev, confirmPassword: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Şifrenizi tekrar girin"
                      />
                    </div>
                  </div>
                </div>

                {/* Author Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Yazar Ayarları</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yazar Adı (Yazılarda Görünecek)
                      </label>
                      <input
                        type="text"
                        value={profileData.authorName}
                        onChange={(e) => setProfileData(prev => ({...prev, authorName: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Yazılarda görünecek yazar adı"
                      />
                      <p className="text-xs text-gray-500 mt-1">Bu ad blog yazılarında yazar olarak görüntülenecek</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biyografi (İsteğe Bağlı)
                      </label>
                      <textarea
                        rows="3"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Kısa biyografinizi yazın..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      profileLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {profileLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{profileLoading ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Hesap Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Hesap ID:</span>
                  <p className="font-mono text-xs text-gray-800 mt-1">{user?.id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Oluşturulma Tarihi:</span>
                  <p className="text-gray-800 mt-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Son Giriş:</span>
                  <p className="text-gray-800 mt-1">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Admin 