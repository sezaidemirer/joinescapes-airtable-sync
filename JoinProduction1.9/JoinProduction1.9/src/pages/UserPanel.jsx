import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Heart, 
  Bookmark, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Eye,
  Calendar,
  Tag,
  ExternalLink,
  Star,
  List,
  Grid,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  UserCircle
} from 'lucide-react'

const UserPanel = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, signOut } = useAuthContext()
  
  // State
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [playlistPosts, setPlaylistPosts] = useState({})
  const [loadingData, setLoadingData] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    profileImage: '',
    birthDate: ''
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [selectedPostForPlaylist, setSelectedPostForPlaylist] = useState(null)

  // Auth check
  useEffect(() => {
    if (loading) return

    // Çıkış yapıldığında ana sayfaya yönlendir
    if (!isAuthenticated && !loading) {
      navigate('/')
      return
    }

    // Sadece giriş yapmış kullanıcıları kontrol et
    if (isAuthenticated && user && user.id) {
      // Admin kullanıcı paneline erişemez
      if (user.email === 'test@test.com') {
        navigate('/admin')
        return
      }
      
      // Editör/yazar kullanıcı paneline erişemez
      const userRole = user?.user_metadata?.user_role
      if (userRole === 'editor' || userRole === 'yazar') {
        // Editör için slug oluştur ve dinamik URL'ye yönlendir
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'kullanici'
        const userSlug = fullName
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')
        navigate(`/yazar/profil/${userSlug}`)
        return
      } else if (userRole === 'supervisor') {
        navigate('/admin')
        return
      }
      
      // Sadece normal kullanıcılar erişebilir
      if (userRole && userRole !== 'user') {
        navigate('/')
        return
      }
    }
  }, [loading, isAuthenticated, user, navigate])

  // Data fetching
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData()
      fetchProfileData()
    }
  }, [isAuthenticated, user])

  const fetchUserData = async () => {
    setLoadingData(true)
    try {
      await Promise.all([
        fetchFavorites(),
        fetchPlaylists()
      ])
    } catch (error) {
      console.error('❌ Kullanıcı verileri yüklenemedi:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchProfileData = async () => {
    if (!user) return

    try {
      // Kullanıcı metadata'sından profil bilgilerini al
      const metadata = user.user_metadata || {}
      setProfileData({
        fullName: metadata.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: metadata.phone || '',
        city: metadata.city || '',
        bio: metadata.bio || '',
        profileImage: metadata.profile_image || '',
        birthDate: metadata.birth_date || ''
      })
    } catch (error) {
      console.error('❌ Profil verileri yüklenemedi:', error)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Dosya boyutu 5MB\'dan küçük olmalıdır.')
      return
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setProfileError('Lütfen geçerli bir resim dosyası seçin.')
      return
    }

    setUploadingImage(true)
    setProfileError('')

    try {
      // Eski dosyayı sil (eğer varsa)
      if (profileData.profileImage && profileData.profileImage.includes('supabase')) {
        const oldFileName = profileData.profileImage.split('/').pop()
        await supabase.storage
          .from('profile-images')
          .remove([`${user.id}/${oldFileName}`])
      }

      // Yeni dosya adı oluştur
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Dosyayı yükle
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Public URL'i al
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Profil verisini güncelle
      setProfileData(prev => ({ ...prev, profileImage: publicUrl }))
      setImagePreview(publicUrl)

      setProfileSuccess('Profil fotoğrafı başarıyla yüklendi!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (error) {
      console.error('❌ Fotoğraf yüklenemedi:', error)
      setProfileError('Fotoğraf yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
          city: profileData.city,
          bio: profileData.bio,
          profile_image: profileData.profileImage,
          birth_date: profileData.birthDate
        }
      })

      if (error) throw error

      setProfileSuccess('Profil başarıyla güncellendi!')
      setIsEditingProfile(false)
      setImagePreview('')
      
      // 3 saniye sonra success mesajını temizle
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (error) {
      console.error('❌ Profil güncellenemedi:', error)
      setProfileError('Profil güncellenirken hata oluştu: ' + error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          posts (
            id,
            title,
            slug,
            excerpt,
            featured_image_url,
            created_at,
            categories (name, slug)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('❌ Favoriler yüklenemedi:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlaylists(data || [])

      // Her playlist için postları da getir
      for (const playlist of data || []) {
        await fetchPlaylistPosts(playlist.id)
      }
    } catch (error) {
      console.error('❌ Playlistler yüklenemedi:', error)
    }
  }

  const fetchPlaylistPosts = async (playlistId) => {
    try {
      const { data, error } = await supabase
        .from('playlist_posts')
        .select(`
          *,
          posts (
            id,
            title,
            slug,
            excerpt,
            featured_image_url,
            created_at,
            categories (name, slug)
          )
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylistPosts(prev => ({
        ...prev,
        [playlistId]: data || []
      }));
    } catch (error) {
      console.error('❌ Playlist postları yüklenemedi:', error);
    }
  }

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return

    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          name: newPlaylistName.trim(),
          description: ''
        })
        .select()
        .single()

      if (error) throw error

      setPlaylists(prev => [data, ...prev])
      setNewPlaylistName('')
      setShowNewPlaylistForm(false)
    } catch (error) {
      console.error('❌ Playlist oluşturulamadı:', error)
    }
  }

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Bu playlisti silmek istediğinizden emin misiniz?')) return

    try {
      // Önce playlist postlarını sil
      await supabase
        .from('playlist_posts')
        .delete()
        .eq('playlist_id', playlistId)

      // Sonra playlisti sil
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error

      setPlaylists(prev => prev.filter(p => p.id !== playlistId))
      setPlaylistPosts(prev => {
        const newPosts = { ...prev }
        delete newPosts[playlistId]
        return newPosts
      })
    } catch (error) {
      console.error('❌ Playlist silinemedi:', error)
    }
  }

  const removeFromFavorites = async (postId) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      if (error) throw error

      setFavorites(prev => prev.filter(f => f.post_id !== postId))
    } catch (error) {
      console.error('❌ Favoriden çıkarılamadı:', error)
    }
  }

  const removeFromPlaylist = async (playlistId, postId) => {
    try {
      const { error } = await supabase
        .from('playlist_posts')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('post_id', postId)

      if (error) throw error

      setPlaylistPosts(prev => ({
        ...prev,
        [playlistId]: prev[playlistId]?.filter(p => p.post_id !== postId) || []
      }))
    } catch (error) {
      console.error('❌ Playlistten çıkarılamadı:', error)
    }
  }

  const addToPlaylist = async (playlistId, postId) => {
    try {
      const { error } = await supabase
        .from('playlist_posts')
        .insert({
          playlist_id: playlistId,
          post_id: postId
        })

      if (error) throw error

      // Playlist'i yeniden yükle
      await fetchPlaylistPosts(playlistId)
      
      setShowPlaylistModal(false)
      setSelectedPostForPlaylist(null)
    } catch (error) {
      console.error('❌ Playlist\'e eklenemedi:', error)
    }
  }

  const handleAddToPlaylist = (post) => {
    setSelectedPostForPlaylist(post)
    setShowPlaylistModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const PostCard = ({ post, onRemove, removeLabel = 'Favoriden Çıkar', showPlaylistButton = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {post.featured_image_url && (
        <div className="aspect-video bg-gray-200">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {post.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            {showPlaylistButton && (
              <button
                onClick={() => handleAddToPlaylist(post)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Listeye Ekle"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onRemove(post.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title={removeLabel}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(post.created_at)}
            </span>
            {post.categories && (
              <span className="flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {post.categories.name}
              </span>
            )}
          </div>
          
          <button
            onClick={() => navigate(`/destinasyon/${post.slug}`)}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Oku
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Ana Sayfa
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Kullanıcı Paneli</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email?.split('@')[0]}</span>
              </div>
              
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Content */}
        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Veriler yükleniyor...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Profile Image */}
                    <div className="relative">
                      {(imagePreview || profileData.profileImage) ? (
                        <img
                          src={imagePreview || profileData.profileImage}
                          alt="Profil Fotoğrafı"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg">
                          <UserCircle className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                        </div>
                      )}
                      {isEditingProfile && (
                        <>
                          <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </label>
                        </>
                      )}
                    </div>
                    
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        {profileData.fullName || 'Kullanıcı'}
                      </h1>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm opacity-90">{profileData.email}</span>
                        </div>
                        {profileData.city && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm opacity-90">{profileData.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm text-sm sm:text-base"
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>İptal</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Düzenle</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Bio */}
                {profileData.bio && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Hakkımda</h3>
                    <p className="text-white opacity-90 leading-relaxed">{profileData.bio}</p>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              {isEditingProfile && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Bilgileri</h3>
                  
                  {profileError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{profileError}</p>
                    </div>
                  )}
                  
                  {profileSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 text-sm">{profileSuccess}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Adınızı ve soyadınızı girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şehir
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Yaşadığınız şehir"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hakkımda
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      disabled={profileLoading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Kaydediliyor...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Kaydet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Favorites Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 sm:mr-3" />
                    Favorilerim ({favorites.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
                      title="Grid Görünümü"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
                      title="Liste Görünümü"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori yazınız yok</h3>
                    <p className="text-gray-600 mb-4">Beğendiğiniz yazıları favorilere ekleyerek burada görebilirsiniz.</p>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Yazıları Keşfet
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {favorites.map((favorite) => (
                      <PostCard
                        key={favorite.id}
                        post={favorite.posts}
                        onRemove={removeFromFavorites}
                        removeLabel="Favoriden Çıkar"
                        showPlaylistButton={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Playlists Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                    <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 sm:mr-3" />
                    Blog Listem ({playlists.length})
                  </h2>
                  <button
                    onClick={() => setShowNewPlaylistForm(!showNewPlaylistForm)}
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Liste
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* New Playlist Form */}
                {showNewPlaylistForm && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Liste adı..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                      />
                      <button
                        onClick={createPlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Oluştur
                      </button>
                      <button
                        onClick={() => {
                          setShowNewPlaylistForm(false)
                          setNewPlaylistName('')
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Playlists */}
                {playlists.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz listeniz yok</h3>
                    <p className="text-gray-600">Kendi listelerinizi oluşturarak yazıları organize edebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {playlists.map((playlist) => (
                      <div key={playlist.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{playlist.name}</h3>
                            {playlist.description && (
                              <p className="text-gray-600 text-sm mt-1">{playlist.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                              {playlistPosts[playlist.id]?.length || 0} yazı
                            </p>
                          </div>
                          
                          <button
                            onClick={() => deletePlaylist(playlist.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Listeyi Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div>
                          {playlistPosts[playlist.id]?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <List className="h-8 w-8 mx-auto mb-2" />
                              <p>Bu listede henüz yazı yok</p>
                            </div>
                          ) : (
                            <div className={`grid gap-4 ${
                              viewMode === 'grid' 
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                                : 'grid-cols-1'
                            }`}>
                              {playlistPosts[playlist.id]?.map((playlistPost) => (
                                <PostCard
                                  key={playlistPost.id}
                                  post={playlistPost.posts}
                                  onRemove={(postId) => removeFromPlaylist(playlist.id, postId)}
                                  removeLabel="Listeden Çıkar"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Playlist Selection Modal */}
        {showPlaylistModal && selectedPostForPlaylist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Liste Seç</h3>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Bu yazıyı hangi listeye eklemek istiyorsun?</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {selectedPostForPlaylist.title}
                  </h4>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Henüz listeniz yok</p>
                    <p className="text-xs">Önce bir liste oluşturun</p>
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => addToPlaylist(playlist.id, selectedPostForPlaylist.id)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{playlist.name}</h4>
                          <p className="text-xs text-gray-500">
                            {playlistPosts[playlist.id]?.length || 0} yazı
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle - Removed since it's now in each section */}
      </div>
    </div>
  )
}

export default UserPanel
