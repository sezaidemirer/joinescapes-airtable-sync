import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Eye, User, Save, LogOut, RefreshCw, X } from 'lucide-react'
import PostForm from '../components/admin/PostForm'

const Editor = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, signOut, getCurrentUser } = useAuthContext()
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostForm, setShowPostForm] = useState(false)

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    authorName: '',
    bio: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Slug oluşturma fonksiyonu
  const createUserSlug = useCallback((user) => {
    if (!user) return ''
    
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'kullanici'
    
    console.log('🔍 Slug oluşturuluyor:', {
      user_email: user.email,
      user_metadata: user.user_metadata,
      full_name: user.user_metadata?.full_name,
      email_name: user.email?.split('@')[0],
      final_fullName: fullName
    })
    
    const slug = fullName
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
    
    console.log('✅ Oluşturulan slug:', slug)
    return slug
  }, [])

  // Auth check and role verification
  useEffect(() => {
    if (loading) return

    console.log('🔍 Auth check başlıyor:', {
      loading,
      isAuthenticated,
      user_email: user?.email,
      user_id: user?.id,
      user_role: user?.user_metadata?.user_role,
      editor_approved: user?.user_metadata?.editor_approved,
      current_slug: slug
    })

    // Çıkış yapıldığında ana sayfaya yönlendir
    if (!isAuthenticated && !loading) {
      console.log('🚪 Kullanıcı giriş yapmamış, ana sayfaya yönlendiriliyor')
      navigate('/')
      return
    }

    // Sadece giriş yapmış kullanıcıları kontrol et
    if (isAuthenticated && user && user.id) {
      // Role kontrolü - sadece editör/yazar erişebilir (admin hariç)
    const userRole = user?.user_metadata?.user_role
      
      console.log('👤 Kullanıcı kontrolü:', {
        email: user.email,
        role: userRole,
        approved: user.user_metadata?.editor_approved
      })
      
      // Admin editör paneline erişemez
      if (user.email === 'test@test.com') {
        console.log('🔑 Admin kullanıcı, admin paneline yönlendiriliyor')
        navigate('/admin')
      return
    }
      
      // Sadece onaylanmış editör/yazar erişebilir
      if ((userRole !== 'editor' && userRole !== 'yazar') || !user.user_metadata?.editor_approved) {
        console.log('❌ Yetkisiz kullanıcı veya onaylanmamış editör:', {
          role: userRole,
          approved: user.user_metadata?.editor_approved
        })
        navigate('/')
        return
      }

      console.log('✅ Kullanıcı yetkili, slug kontrolü yapılıyor...')

      // URL slug kontrolü - eğer slug varsa ve kullanıcının slug'ı ile eşleşmiyorsa yönlendir
      if (slug) {
        const userSlug = createUserSlug(user)
        console.log('🔍 Slug karşılaştırması:', {
          current_slug: slug,
          user_slug: userSlug,
          match: slug === userSlug
        })
        
        if (slug !== userSlug) {
          // Yanlış kullanıcı, doğru URL'ye yönlendir
          console.log('🔄 Yanlış slug, doğru URL\'ye yönlendiriliyor:', `/yazar/profil/${userSlug}`)
          navigate(`/yazar/profil/${userSlug}`, { replace: true })
          return
        }
      } else {
        // Slug yoksa, kullanıcının slug'ı ile yönlendir
        const userSlug = createUserSlug(user)
        console.log('🔄 Slug yok, kullanıcı slug\'ı ile yönlendiriliyor:', `/yazar/profil/${userSlug}`)
        navigate(`/yazar/profil/${userSlug}`, { replace: true })
        return
      }
    }
  }, [loading, isAuthenticated, user, navigate, slug, createUserSlug])

  // Data fetching
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        console.log('🎨 Editör paneli yükleniyor...')
        
        const [postsResult, categoriesResult, tagsResult] = await Promise.allSettled([
          fetchMyPosts(),
          fetchCategories(),
          fetchTags()
        ])
        
        console.log('✅ Editör verileri yüklendi:', {
          posts: postsResult.status,
          categories: categoriesResult.status,
          tags: tagsResult.status
        })
        
      } catch (error) {
        console.error('❌ Editör init hatası:', error)
      }
    }
    
    if (isAuthenticated && user) {
      initializeEditor()
      fetchWriterProfile() // Yazar profili verilerini yükle
    }
  }, [isAuthenticated, user?.id]) // Sadece user.id dependency olarak kullan

  // Profil düzenleme için ek state'ler
  const [writerProfile, setWriterProfile] = useState({
    firstName: '',
    lastName: '',
    title: '',
    bio: '',
    location: '',
    specialties: [],
    socialMedia: {
      instagram: '',
      twitter: '',
      blog: ''
    },
    profileImage: ''
  })
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [myPosts, setMyPosts] = useState([])

  // Çıkış yapma fonksiyonu
  const handleSignOut = async () => {
    try {
      console.log('🚪 Editör çıkış yapıyor...')
      await signOut()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('❌ Çıkış hatası:', error)
    }
  }

  // Profil resmi yükleme fonksiyonu
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan büyük olamaz.')
      return
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir.')
      return
    }

    setUploadingProfileImage(true)

    try {
      // Geçici olarak preview göster
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result)
        setWriterProfile(prev => ({ ...prev, profileImage: e.target.result }))
      }
      reader.readAsDataURL(file)

      // Bu örnekte resmi doğrudan URL olarak kaydediyoruz
      // Gerçek uygulamada Supabase Storage kullanılabilir
      
    } catch (error) {
      console.error('❌ Resim yükleme hatası:', error)
      alert('Resim yüklenirken hata oluştu.')
    } finally {
      setUploadingProfileImage(false)
    }
  }

  const fetchMyPosts = async () => {
    setLoadingPosts(true)
    try {
      // Sadece kendi yazılarını getir (author_id ile filtrele)
      const { data, error } = await blogPosts.getAll({
        authorId: user?.id,
        orderBy: 'created_at',
        orderDirection: 'desc'
      })
      
      if (!error && data) {
        setPosts(data)
        setMyPosts(data) // myPosts state'ini de güncelle
        console.log('✅ Editör yazıları yüklendi:', data.length, 'yazı')
      } else {
        console.error('❌ Yazılar yüklenemedi:', error)
      }
    } catch (error) {
      console.error('❌ Yazı fetch hatası:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await blogCategories.getAll()
    if (!error && data) {
      setCategories(data)
    }
  }

  const fetchTags = async () => {
    const { data, error } = await blogTags.getAll()
    if (!error && data) {
      setTags(data)
    }
  }

  // Silme fonksiyonu kaldırıldı - sadece adminler silebilir

  // Yeni editör için varsayılan profil oluştur
  const createDefaultProfile = async () => {
    try {
      console.log('🆕 Yeni editör için varsayılan profil oluşturuluyor...')
      
      const email = user?.email || ''
      const emailName = email.split('@')[0] || 'Editör'
      const fullName = user?.user_metadata?.full_name || emailName
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || emailName
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Beste Duran profilini şablon olarak kullan (sadece isim değişecek)
      const defaultProfileData = {
        firstName: firstName,
        lastName: lastName,
        title: 'Editör & Seyahat Yazarı', // Beste'nin unvanı
        bio: 'Ben Sez geliyorums', // Beste'nin bio'su
        location: 'İstanbul', // Beste'nin lokasyonu
        specialties: ['Seyahat', 'Editörlük'], // Beste'nin uzmanlık alanları
        socialMedia: {
          instagram: '@sezaidemirer', // Beste'nin sosyal medyası
          twitter: '@sezaidemirer',
          blog: 'Kişisel Blog'
        },
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' // Beste'nin profil resmi
      }
      
      // User metadata'ya kaydet
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          author_title: defaultProfileData.title,
          bio: defaultProfileData.bio,
          location: defaultProfileData.location,
          specialties: defaultProfileData.specialties,
          social_media: defaultProfileData.socialMedia,
          profile_image: defaultProfileData.profileImage
        }
      })
      
      if (metadataError) {
        console.error('❌ Varsayılan profil oluşturulamadı:', metadataError)
        return null
      }
      
      // writer_profiles tablosuna kaydet
      const { error: profileError } = await supabase
        .from('writer_profiles')
        .insert({
          user_id: user?.id,
          name: fullName,
          title: defaultProfileData.title,
          bio: defaultProfileData.bio,
          location: defaultProfileData.location,
          profile_image: defaultProfileData.profileImage,
          join_date: new Date().toISOString(),
          followers: 0,
          specialties: defaultProfileData.specialties,
          social_media: defaultProfileData.socialMedia
        })
      
      if (profileError) {
        console.error('❌ Writer profile oluşturulamadı:', profileError)
      } else {
        console.log('✅ Varsayılan profil oluşturuldu!')
      }
      
      return defaultProfileData
      
    } catch (error) {
      console.error('❌ Varsayılan profil oluşturma hatası:', error)
      return null
    }
  }

  // Yazar profili fonksiyonları
  const fetchWriterProfile = async () => {
    try {
      // Önce writer_profiles tablosundan veri al
      const { data: writerProfileData, error: profileError } = await supabase
        .from('writer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (writerProfileData && !profileError) {
        // writer_profiles tablosundan veri alındı
        // İsim ve soyisimi ayır
        const fullName = writerProfileData.name || user?.email?.split('@')[0] || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        const profileData = {
          firstName: firstName,
          lastName: lastName,
          title: writerProfileData.title || 'Editör & Seyahat Yazarı',
          bio: writerProfileData.bio || '',
          location: writerProfileData.location || '',
          specialties: typeof writerProfileData.specialties === 'string' 
            ? JSON.parse(writerProfileData.specialties) 
            : (writerProfileData.specialties || []),
          socialMedia: typeof writerProfileData.social_media === 'string'
            ? JSON.parse(writerProfileData.social_media)
            : (writerProfileData.social_media || {
                instagram: '',
                twitter: '',
                blog: ''
              }),
          profileImage: writerProfileData.profile_image || ''
        }
        
        setWriterProfile(profileData)
        setProfileImagePreview(writerProfileData.profile_image || '')
        console.log('✅ Profil writer_profiles tablosundan yüklendi!', profileData)
      } else {
        // writer_profiles tablosunda veri yoksa user_metadata'dan al
        const userMetadata = user?.user_metadata || {}
        
        // Eğer user_metadata'da da temel veriler yoksa varsayılan profil oluştur
        console.log('🔍 User metadata kontrolü:', {
          full_name: userMetadata.full_name,
          author_title: userMetadata.author_title,
          has_full_name: !!userMetadata.full_name,
          has_author_title: !!userMetadata.author_title
        })
        
        if (!userMetadata.full_name && !userMetadata.author_title) {
          console.log('🆕 Editör için profil verisi bulunamadı, varsayılan profil oluşturuluyor...')
          console.log('👤 Kullanıcı bilgileri:', {
            email: user?.email,
            user_id: user?.id,
            user_metadata: user?.user_metadata
          })
          
          const defaultProfile = await createDefaultProfile()
          
          if (defaultProfile) {
            setWriterProfile(defaultProfile)
            setProfileImagePreview(defaultProfile.profileImage)
            console.log('✅ Varsayılan profil yüklendi!', defaultProfile)
            return
          } else {
            console.log('❌ Varsayılan profil oluşturulamadı!')
          }
        } else {
          console.log('ℹ️ User metadata\'da profil verisi var, varsayılan profil oluşturulmayacak')
        }
        
        // İsim ve soyisimi ayır
        const fullName = userMetadata.full_name || user?.email?.split('@')[0] || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        const profileData = {
          firstName: firstName,
          lastName: lastName,
          title: userMetadata.author_title || 'Editör & Seyahat Yazarı',
          bio: userMetadata.bio || '',
          location: userMetadata.location || '',
          specialties: userMetadata.specialties || [],
          socialMedia: userMetadata.social_media || {
            instagram: '',
            twitter: '',
            blog: ''
          },
          profileImage: userMetadata.profile_image || ''
        }
        
        setWriterProfile(profileData)
        setProfileImagePreview(userMetadata.profile_image || '')
        console.log('✅ Profil user metadata\'dan yüklendi!', profileData)
      }
      
    } catch (error) {
      console.error('❌ Yazar profili yüklenemedi:', error)
    }
  }

  const handleWriterProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      // İsim ve soyisimi birleştir
      const fullName = `${writerProfile.firstName} ${writerProfile.lastName}`.trim()
      
      console.log('🔄 Profil kaydediliyor (Hem user_metadata hem writer_profiles)...', {
        firstName: writerProfile.firstName,
        lastName: writerProfile.lastName,
        fullName: fullName,
        title: writerProfile.title,
        bio: writerProfile.bio,
        location: writerProfile.location,
        profile_image: writerProfile.profileImage,
        specialties: writerProfile.specialties,
        socialMedia: writerProfile.socialMedia
      })

      // 1. User metadata'sını güncelle
      // JSON alanları için güvenli veri hazırla
      const safeMetadataSpecialties = Array.isArray(writerProfile.specialties) 
        ? writerProfile.specialties 
        : []
      
      const safeMetadataSocialMedia = writerProfile.socialMedia && typeof writerProfile.socialMedia === 'object'
        ? writerProfile.socialMedia
        : {}
      
      console.log('🔍 Metadata için güvenli veri:', {
        safeMetadataSpecialties,
        safeMetadataSocialMedia
      })

      // User metadata için güvenli veri hazırla
      const metadataData = {
        full_name: fullName,
        first_name: writerProfile.firstName,
        last_name: writerProfile.lastName,
        author_title: writerProfile.title,
        bio: writerProfile.bio,
        location: writerProfile.location,
        profile_image: writerProfile.profileImage
      }

      // Sadece dolu olan JSON alanları ekle
      if (safeMetadataSpecialties.length > 0) {
        metadataData.specialties = safeMetadataSpecialties
      }
      if (Object.keys(safeMetadataSocialMedia).length > 0) {
        metadataData.social_media = safeMetadataSocialMedia
      }

      console.log('🔍 Kaydedilecek metadata verisi:', metadataData)

      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataData
      })

      if (metadataError) {
        console.error('❌ User metadata güncelleme hatası:', metadataError)
        setProfileError('Profil güncellenemedi: ' + metadataError.message)
        return
      }

      // 2. writer_profiles tablosunu güncelle (ana sayfada görünen profil için)
      // JSON alanları için güvenli veri hazırla
      const safeSpecialties = Array.isArray(writerProfile.specialties) && writerProfile.specialties.length > 0 
        ? writerProfile.specialties 
        : []
      
      const safeSocialMedia = writerProfile.socialMedia && typeof writerProfile.socialMedia === 'object'
        ? writerProfile.socialMedia
        : {}
      
      console.log('🔍 Güvenli veri hazırlandı:', {
        safeSpecialties,
        safeSocialMedia,
        specialtiesType: typeof safeSpecialties,
        socialMediaType: typeof safeSocialMedia
      })

      // JSON alanları olmadan sadece temel alanları kaydet
      const profileData = {
        user_id: user?.id,
        name: fullName,
        title: writerProfile.title,
        bio: writerProfile.bio,
        location: writerProfile.location,
        profile_image: writerProfile.profileImage,
        updated_at: new Date().toISOString()
      }

      // Sadece dolu olan JSON alanları ekle
      if (safeSpecialties.length > 0) {
        profileData.specialties = safeSpecialties
      }
      if (Object.keys(safeSocialMedia).length > 0) {
        profileData.social_media = safeSocialMedia
      }

      console.log('🔍 Kaydedilecek profil verisi:', profileData)

      // Önce mevcut kaydı kontrol et
      const { data: existingProfile, error: checkError } = await supabase
        .from('writer_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      let profileError = null

      if (existingProfile) {
        // Mevcut kaydı güncelle
        console.log('🔄 Mevcut profil güncelleniyor...', existingProfile.id)
        const { error: updateError } = await supabase
          .from('writer_profiles')
          .update(profileData)
          .eq('user_id', user?.id)
        profileError = updateError
      } else {
        // Yeni kayıt ekle
        console.log('➕ Yeni profil ekleniyor...')
        const { error: insertError } = await supabase
          .from('writer_profiles')
          .insert(profileData)
        profileError = insertError
      }

      if (profileError) {
        console.error('❌ Writer profiles güncelleme hatası:', profileError)
        setProfileError('Profil güncellenemedi: ' + profileError.message)
        return
      }

      // 3. Tüm yazılardaki author_name'i güncelle
      if (fullName) {
        const { error: postsError } = await supabase
          .from('posts')
          .update({ author_name: fullName })
          .eq('author_id', user?.id)

        if (postsError) {
          console.error('❌ Yazılar güncelleme hatası:', postsError)
          // Bu hata kritik değil, devam et
        } else {
          console.log('✅ Tüm yazılardaki yazar adı güncellendi')
        }
      }

      console.log('✅ Profil başarıyla güncellendi! (Hem user_metadata hem writer_profiles)')
      setProfileSuccess('Profil başarıyla güncellendi! Ana sayfada da görünecek.')
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('❌ Catch hatası:', error)
      setProfileError('Profil güncellenemedi: ' + error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const updateWriterProfileData = () => {
    // WriterProfile.jsx'teki 'beste' verisini güncelle
    // Bu fonksiyon WriterProfile component'ine yeni veriyi gönderecek
    console.log('✅ Yazar profili güncellendi:', writerProfile)
  }

  const saveProfileImageToDatabase = async (imageUrl) => {
    try {
      console.log('💾 Profil resmi kaydediliyor...', { user_id: user?.id, imageUrl })
      
      const { data, error } = await supabase
        .from('writer_profiles')
        .upsert({
          user_id: user?.id,
          profile_image: imageUrl,
          updated_at: new Date().toISOString()
        })
        .select()
      
      console.log('📊 Supabase yanıtı:', { data, error })
      
      if (error) {
        console.error('❌ Profil resmi kaydedilemedi:', error)
      } else {
        console.log('✅ Profil resmi kaydedildi!')
      }
    } catch (error) {
      console.error('❌ Profil resmi kaydetme hatası:', error)
    }
  }

  // Eski profil formu için handleProfileSubmit fonksiyonu
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      console.log('🔄 Editör profil güncelleniyor...')
      
      // Update user metadata (full name, author name, bio)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName || user?.email?.split('@')[0],
          author_name: profileData.authorName || user?.email?.split('@')[0],
          bio: profileData.bio || ''
        }
      })
      if (metadataError) throw metadataError

      // TÜM YAZILARDAKI YAZAR ADINI GÜNCELLE
      if (profileData.authorName && profileData.authorName !== user?.user_metadata?.author_name) {
        console.log('📝 Yazılardaki yazar adı güncelleniyor:', profileData.authorName)
        
        // Şimdi güncelle
        const { data: updateData, error: postsUpdateError } = await supabase
          .from('posts')
          .update({ author_name: profileData.authorName })
          .eq('author_id', user?.id)
          .select()
        
        if (postsUpdateError) {
          console.error('❌ Yazılar güncelleme hatası:', postsUpdateError)
          setProfileError('Yazılar güncellenemedi: ' + postsUpdateError.message)
        } else {
          console.log('✅ Güncellenen yazı sayısı:', updateData?.length || 0)
        }
      }

      // Update email if changed
      if (profileData.email && profileData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        })
        if (emailError) throw emailError
      }

      console.log('✅ Editör profili güncellendi')
      setProfileSuccess('Profil başarıyla güncellendi!')
      
      // User state'i manuel yenile
      if (getCurrentUser) {
        console.log('🔄 User state yenileniyor...')
        await getCurrentUser()
      }
      
      // Alternatif: 2 saniye bekle, sonra sayfayı yenile
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('❌ Profil güncelleme hatası:', error)
      setProfileError('Profil güncellenemedi: ' + error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      console.log('👤 Editör profil verisi yükleniyor:', user.user_metadata)
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        authorName: user.user_metadata?.author_name || user.email?.split('@')[0] || '',
        bio: user.user_metadata?.bio || ''
      })
    }
  }, [user])

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

  if (!isAuthenticated || !['editor', 'yazar', 'supervisor'].includes(user?.user_metadata?.user_role)) {
    return null // useEffect will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Edit className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Editör Paneli</h1>
                <p className="text-sm text-gray-500">Hoşgeldin, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                📝 {posts.length} yazınız
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-8">
          {[
            { id: 'posts', name: 'Yazılarım', icon: Edit },
            { id: 'new-post', name: 'Yeni Yazı', icon: Plus },
            { id: 'profile', name: 'Profil', icon: User }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Yazılarım Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Yazılarım</h3>
                  <button
                    onClick={() => {
                      setActiveTab('new-post')
                      setSelectedPost(null)
                      setShowPostForm(false)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Yeni Yazı</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingPosts ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Yazılar yükleniyor...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yazınız yok</h3>
                    <p className="text-gray-600 mb-4">İlk yazınızı oluşturmak için "Yeni Yazı" butonuna tıklayın.</p>
                    <button
                      onClick={() => setActiveTab('new-post')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Yeni Yazı Oluştur
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Yazı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                {post.excerpt}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {post.category_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800'
                                : post.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : post.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.status === 'published' 
                                ? 'Yayında' 
                                : post.status === 'pending'
                                ? 'Onay Bekliyor'
                                : post.status === 'rejected'
                                ? 'Reddedildi'
                                : 'Taslak'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedPost(post)
                                  setActiveTab('new-post')
                                  setShowPostForm(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Düzenle"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {/* Silme butonu kaldırıldı - sadece adminler silebilir */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Yeni Yazı Tab */}
        {activeTab === 'new-post' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPost ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('posts')
                    setSelectedPost(null)
                    setShowPostForm(false)
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <PostForm
                post={selectedPost}
                categories={categories}
                tags={tags}
                onSave={() => {
                  fetchMyPosts()
                  setActiveTab('posts')
                  setSelectedPost(null)
                  setShowPostForm(false)
                }}
                onCancel={() => {
                  setActiveTab('posts')
                  setSelectedPost(null)
                  setShowPostForm(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Profil Tab - Yazar profil görüntüleme ve düzenleme */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profil Görüntüleme */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Profil Bilgileri</h3>
                <button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showProfileForm ? 'Gizle' : 'Düzenle'}
                </button>
              </div>

              {/* Profil Görüntüleme Alanı */}
              {!showProfileForm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profil Resmi ve Temel Bilgiler */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      {writerProfile.profileImage ? (
                        <img
                          src={writerProfile.profileImage}
                          alt={writerProfile.name}
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <h2 className="text-xl font-semibold text-gray-900">{`${writerProfile.firstName} ${writerProfile.lastName}`.trim() || user?.email?.split('@')[0]}</h2>
                      <p className="text-gray-600 mt-1">{writerProfile.title || 'Editör & Seyahat Yazarı'}</p>
                      {writerProfile.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {writerProfile.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Detaylı Bilgiler */}
                  <div className="lg:col-span-2 space-y-4">
                    {writerProfile.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Hakkımda</h4>
                        <p className="text-gray-700">{writerProfile.bio}</p>
                      </div>
                    )}

                    {writerProfile.specialties && writerProfile.specialties.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Uzmanlık Alanları</h4>
                        <div className="flex flex-wrap gap-2">
                          {writerProfile.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(writerProfile.socialMedia?.instagram || writerProfile.socialMedia?.twitter || writerProfile.socialMedia?.blog) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Sosyal Medya</h4>
                        <div className="space-y-2">
                          {writerProfile.socialMedia?.instagram && (
                            <p className="text-sm text-gray-600">📷 Instagram: {writerProfile.socialMedia.instagram}</p>
                          )}
                          {writerProfile.socialMedia?.twitter && (
                            <p className="text-sm text-gray-600">🐦 Twitter: {writerProfile.socialMedia.twitter}</p>
                          )}
                          {writerProfile.socialMedia?.blog && (
                            <p className="text-sm text-gray-600">📝 Blog: {writerProfile.socialMedia.blog}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">İstatistikler</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-primary-600">{myPosts.length}</p>
                          <p className="text-sm text-gray-600">Toplam Yazı</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{myPosts.filter(post => post.status === 'published').length}</p>
                          <p className="text-sm text-gray-600">Yayında</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profil Düzenleme Formu */}
              {showProfileForm && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Profil Düzenle</h4>
              
              {/* Success/Error Messages */}
              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleWriterProfileUpdate} className="space-y-6">
                {/* Profil Resmi */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    {uploadingProfileImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Resim Seç
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                        disabled={uploadingProfileImage}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG veya WebP (Max 5MB)</p>
                  </div>
                </div>

                {/* İsim ve Soyisim */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İsim *
                    </label>
                    <input
                      type="text"
                      value={writerProfile.firstName}
                      onChange={(e) => setWriterProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Adınız"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyisim *
                    </label>
                    <input
                      type="text"
                      value={writerProfile.lastName}
                      onChange={(e) => setWriterProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Soyadınız"
                      required
                    />
                  </div>
                </div>

                {/* Unvan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unvan *
                  </label>
                  <input
                    type="text"
                    value={writerProfile.title}
                    onChange={(e) => setWriterProfile(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Örn: Editör & Seyahat Yazarı"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hakkımda
                  </label>
                  <textarea
                    value={writerProfile.bio}
                    onChange={(e) => setWriterProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  />
                </div>

                {/* Lokasyon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasyon
                  </label>
                  <input
                    type="text"
                    value={writerProfile.location}
                    onChange={(e) => setWriterProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Örn: İstanbul, Türkiye"
                  />
                </div>

                {/* Sosyal Medya */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={writerProfile.socialMedia?.instagram || ''}
                      onChange={(e) => setWriterProfile(prev => ({ 
                        ...prev, 
                        socialMedia: { ...(prev.socialMedia || {}), instagram: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="@kullanici_adi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={writerProfile.socialMedia?.twitter || ''}
                      onChange={(e) => setWriterProfile(prev => ({ 
                        ...prev, 
                        socialMedia: { ...(prev.socialMedia || {}), twitter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="@kullanici_adi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog/Website
                    </label>
                    <input
                      type="url"
                      value={writerProfile.socialMedia?.blog || ''}
                      onChange={(e) => setWriterProfile(prev => ({ 
                        ...prev, 
                        socialMedia: { ...(prev.socialMedia || {}), blog: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://website.com"
                    />
                  </div>
                </div>

                {/* Kaydet Butonu */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{profileLoading ? 'Kaydediliyor...' : 'Profili Kaydet'}</span>
                  </button>
                </div>
              </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profil Tab - Eski versiyon (yorum satırında) */}
        {false && activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Profil Bilgileri</h3>
              
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

              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yazar Adı (Yazılarda Görünecek)
                  </label>
                  <input
                    type="text"
                    value={profileData.authorName}
                    onChange={(e) => setProfileData(prev => ({...prev, authorName: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Yazılarda görünecek yazar adı"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bu ad blog yazılarında yazar olarak görüntülenecek</p>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biyografi (İsteğe Bağlı)
                  </label>
                  <textarea
                    rows="3"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Kısa biyografinizi yazın..."
                  />
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      profileLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
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

            {/* Hesap Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Hesap Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Hesap Türü:</span>
                  <p className="font-medium text-green-600 mt-1">Editör</p>
                </div>
                <div>
                  <span className="text-gray-600">Hesap ID:</span>
                  <p className="font-mono text-xs text-gray-800 mt-1">{user?.id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Üyelik Tarihi:</span>
                  <p className="text-gray-800 mt-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'N/A'}
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

export default Editor
