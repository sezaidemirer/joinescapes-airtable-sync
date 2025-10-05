import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Eye, User, Save, LogOut, RefreshCw, X, Lock } from 'lucide-react'
import PostForm from '../components/admin/PostForm'

const Editor = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, signOut, getCurrentUser } = useAuthContext()
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('posts')
  
  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState('')
  const [securityError, setSecurityError] = useState('')
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
      if (userRole !== 'yazar' || !user.user_metadata?.editor_approved) {
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

  // Şifre değiştirme fonksiyonu
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    // Validasyon
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSecurityError('Yeni şifreler eşleşmiyor!')
      return
    }
    
    if (securityData.newPassword.length < 6) {
      setSecurityError('Yeni şifre en az 6 karakter olmalıdır!')
      return
    }
    
    setSecurityLoading(true)
    setSecurityError('')
    setSecuritySuccess('')
    
    try {
      // Mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: securityData.currentPassword
      })
      
      if (signInError) {
        setSecurityError('Mevcut şifre yanlış!')
        setSecurityLoading(false)
        return
      }
      
      // Yeni şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: securityData.newPassword
      })
      
      if (updateError) {
        setSecurityError(`Şifre güncellenemedi: ${updateError.message}`)
      } else {
        setSecuritySuccess('Şifreniz başarıyla güncellendi!')
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error)
      setSecurityError('Beklenmeyen bir hata oluştu!')
    } finally {
      setSecurityLoading(false)
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
      // 1. Önce Supabase Storage'a yükle
      const fileName = `profile-${user?.id}-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `profile-images/${fileName}`
      
      console.log('📤 Supabase Storage\'a yükleniyor...', { fileName, filePath })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('writer-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type // Dosya tipini belirt
        })

      if (uploadError) {
        console.error('❌ Supabase Storage yükleme hatası:', uploadError)
        throw uploadError
      }

      // 2. Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('writer-profiles')
        .getPublicUrl(filePath)

      console.log('✅ Supabase Storage\'a yüklendi:', publicUrl)

      // 3. Database'e kaydet (öncelik)
      await saveProfileImageToDatabase(publicUrl)
      
      // 4. Profil verilerini yeniden yükle (normal görünüm için)
      await fetchWriterProfile()
      
      // 5. Preview'ı ve writerProfile'ı güncelle (son adım)
      setProfileImagePreview(publicUrl)
      setWriterProfile(prev => ({ ...prev, profileImage: publicUrl }))
      
      // 6. Yükleme tamamlandıktan sonra bildirim göster
      alert('Profil fotoğrafı başarıyla yüklendi!')
      
    } catch (error) {
      console.error('❌ Resim yükleme hatası:', error)
      alert('Resim yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploadingProfileImage(false)
    }
  }

  const fetchMyPosts = async () => {
    setLoadingPosts(true)
    try {
      // Doğrudan posts tablosundan cover_image ile birlikte çek
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories!inner(name, slug)
        `)
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setPosts(data)
        setMyPosts(data) // myPosts state'ini de güncelle
        console.log('✅ Editör yazıları yüklendi:', data.length, 'yazı')
        console.log('📊 İlk yazının alanları:', data[0] ? Object.keys(data[0]) : 'Veri yok')
        console.log('🖼️ İlk yazının cover_image:', data[0]?.cover_image || 'cover_image yok')
        console.log('🖼️ İlk yazının featured_image_url:', data[0]?.featured_image_url || 'featured_image_url yok')
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
      
      // Kayıt sırasında yazılan dinamik isim ve soyisim
      const firstName = user?.user_metadata?.first_name || ''
      const lastName = user?.user_metadata?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim()
      
      // Boş profil şablonu (kullanıcı sonradan dolduracak)
      const defaultProfileData = {
        firstName: firstName,
        lastName: lastName,
        title: '', // BOŞ - kullanıcı sonradan dolduracak
        bio: '', // BOŞ - kullanıcı sonradan dolduracak
        location: '', // BOŞ - kullanıcı sonradan dolduracak
        specialties: [], // BOŞ array - kullanıcı sonradan dolduracak
        socialMedia: { // BOŞ object - kullanıcı sonradan dolduracak
          instagram: '',
          twitter: '',
          blog: ''
        },
        profileImage: '' // BOŞ - kullanıcı sonradan dolduracak
      }
      
      // User metadata'ya kaydet (tamamen boş)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          author_title: '', // BOŞ
          bio: '', // BOŞ
          location: '', // BOŞ
          specialties: [], // BOŞ array
          social_media: {}, // BOŞ object
          profile_image: '' // BOŞ
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
      console.log('🔍 Editör profil verisi yükleniyor...')
      console.log('👤 Kullanıcı bilgileri:', {
        email: user?.email,
        user_id: user?.id,
        user_metadata: user?.user_metadata
      })
      
      // Önce writer_profiles tablosundan veri al
      const { data: writerProfileData, error: profileError } = await supabase
        .from('writer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      // HER DURUMDA user_metadata'dan isim ve soyisim çek
      const firstName = user?.user_metadata?.first_name || ''
      const lastName = user?.user_metadata?.last_name || ''
      
      console.log('🔍 DEBUG - User metadata\'dan çekilen:', {
        firstName: firstName,
        lastName: lastName,
        full_name: user?.user_metadata?.full_name
      })

      if (writerProfileData && !profileError) {
        // writer_profiles tablosundan veri alındı
        console.log('✅ Writer_profiles tablosundan veri alındı')
        
        const profileData = {
          firstName: firstName, // user_metadata'dan çek
          lastName: lastName, // user_metadata'dan çek
          title: writerProfileData.title || '', // writer_profiles'dan çek
          bio: writerProfileData.bio || '', // writer_profiles'dan çek
          location: writerProfileData.location || '', // writer_profiles'dan çek
          specialties: writerProfileData.specialties || [], // writer_profiles'dan çek
          socialMedia: writerProfileData.social_media || { // writer_profiles'dan çek
            instagram: '',
            twitter: '',
            blog: ''
          },
          profileImage: writerProfileData.profile_image || '' // writer_profiles'dan çek
        }
        
        console.log('✅ Profil writer_profiles tablosundan yüklendi!', profileData)
        setWriterProfile(profileData)
        setProfileImagePreview(writerProfileData.profile_image || '')
        
      } else {
        // writer_profiles tablosunda veri yoksa user_metadata'dan al
        console.log('⚠️ Writer_profiles tablosunda veri yok, user_metadata kullanılıyor')
        
        const profileData = {
          firstName: firstName, // user_metadata'dan çek
          lastName: lastName, // user_metadata'dan çek
          title: user?.user_metadata?.author_title || '', // user_metadata'dan çek
          bio: user?.user_metadata?.bio || '', // user_metadata'dan çek
          location: user?.user_metadata?.location || '', // user_metadata'dan çek
          specialties: user?.user_metadata?.specialties || [], // user_metadata'dan çek
          socialMedia: user?.user_metadata?.social_media || { // user_metadata'dan çek
            instagram: '',
            twitter: '',
            blog: ''
          },
          profileImage: user?.user_metadata?.profile_image || '' // user_metadata'dan çek
        }
        
        console.log('✅ Profil user_metadata\'dan yüklendi!', profileData)
        setWriterProfile(profileData)
        setProfileImagePreview(user?.user_metadata?.profile_image || '')
      }
      
    } catch (error) {
      console.error('❌ Yazar profili yüklenemedi:', error)
      
      // Hata durumunda da en azından isim/soyisim'i göster
      const firstName = user?.user_metadata?.first_name || ''
      const lastName = user?.user_metadata?.last_name || ''
      
      const fallbackProfile = {
        firstName: firstName,
        lastName: lastName,
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
      }
      
      console.log('⚠️ Hata durumunda fallback profil yüklendi:', fallbackProfile)
      setWriterProfile(fallbackProfile)
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
      
      // Paralel olarak hem user metadata hem de writer_profiles'a kaydet
      const [metadataResult, profilesResult] = await Promise.allSettled([
        // 1. User metadata'ya kaydet
        supabase.auth.updateUser({
          data: {
            profile_image: imageUrl
          }
        }),
        
        // 2. Writer_profiles tablosuna kaydet
        supabase
          .from('writer_profiles')
          .upsert({
            user_id: user?.id,
            profile_image: imageUrl,
            updated_at: new Date().toISOString()
          })
          .select()
      ])
      
      // Metadata sonucunu kontrol et
      if (metadataResult.status === 'rejected' || metadataResult.value?.error) {
        console.error('❌ User metadata profil resmi kaydedilemedi:', metadataResult.value?.error || metadataResult.reason)
      } else {
        console.log('✅ User metadata profil resmi kaydedildi!')
      }
      
      // Profiles sonucunu kontrol et
      if (profilesResult.status === 'rejected' || profilesResult.value?.error) {
        console.error('❌ Writer_profiles profil resmi kaydedilemedi:', profilesResult.value?.error || profilesResult.reason)
      } else {
        console.log('✅ Writer_profiles profil resmi kaydedildi!')
      }
      
    } catch (error) {
      console.error('❌ Profil resmi kaydetme hatası:', error)
      throw error // Hatayı yukarı fırlat
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

  if (!isAuthenticated || user?.user_metadata?.user_role !== 'yazar') {
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
            { id: 'profile', name: 'Profil', icon: User },
            { id: 'security', name: 'Güvenlik', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
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
                            <div className="flex items-start space-x-3">
                              {/* Kapak fotoğrafı */}
                              {(post.cover_image || post.featured_image_url) && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={post.cover_image || post.featured_image_url}
                                    alt={post.title}
                                    className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Yazı bilgileri */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/blog/${post.slug}`}
                                  className="block hover:text-primary-600 transition-colors"
                                >
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                                    {post.title}
                                  </h4>
                                </Link>
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                  {post.excerpt}
                                </p>
                              </div>
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
                  <div className="lg:col-span-1 text-center lg:text-left">
                    <div className="text-center">
                      {writerProfile.profileImage ? (
                        <img
                          src={writerProfile.profileImage}
                          alt={writerProfile.name}
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-4xl">
                            {writerProfile.firstName ? writerProfile.firstName.charAt(0).toUpperCase() : 
                             writerProfile.lastName ? writerProfile.lastName.charAt(0).toUpperCase() : 
                             user?.email?.charAt(0).toUpperCase() || '?'}
                          </span>
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
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-2xl font-bold">
                          {(writerProfile.firstName || writerProfile.lastName) ? 
                            (writerProfile.firstName?.[0] || writerProfile.lastName?.[0] || '?').toUpperCase() :
                            '?'
                          }
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Email adresiniz"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Email adresiniz değiştirilemez</p>
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

                {/* Uzmanlık Alanları */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uzmanlık Alanları
                  </label>
                  <div className="space-y-3">
                    {/* Mevcut uzmanlık alanları */}
                    {writerProfile.specialties && writerProfile.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {writerProfile.specialties.map((specialty, index) => (
                          <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            <span>{specialty}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSpecialties = writerProfile.specialties.filter((_, i) => i !== index)
                                setWriterProfile(prev => ({ ...prev, specialties: newSpecialties }))
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Yeni uzmanlık alanı ekleme */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newSpecialty"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Örn: Seyahat, Editörlük, Fotoğrafçılık"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target
                            const value = input.value.trim()
                            if (value && !writerProfile.specialties.includes(value)) {
                              setWriterProfile(prev => ({
                                ...prev,
                                specialties: [...(prev.specialties || []), value]
                              }))
                              input.value = ''
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newSpecialty')
                          const value = input.value.trim()
                          if (value && !writerProfile.specialties.includes(value)) {
                            setWriterProfile(prev => ({
                              ...prev,
                              specialties: [...(prev.specialties || []), value]
                            }))
                            input.value = ''
                          }
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Uzmanlık alanını yazın ve Enter tuşuna basın veya "Ekle" butonuna tıklayın</p>
                  </div>
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

        {/* Güvenlik Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Güvenlik Ayarları</h3>
              
              {/* Success/Error Messages */}
              {securitySuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{securitySuccess}</p>
                </div>
              )}
              {securityError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{securityError}</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Şifre *
                    </label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData(prev => ({...prev, currentPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Mevcut şifrenizi girin"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre *
                    </label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData(prev => ({...prev, newPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Yeni şifrenizi girin (en az 6 karakter)"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre Tekrar *
                    </label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData(prev => ({...prev, confirmPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Yeni şifrenizi tekrar girin"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{securityLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Editor
