import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Calendar, User, Eye, Heart, ArrowLeft, Share2, Tag, ChevronLeft, ChevronRight, ArrowRight, Bookmark } from 'lucide-react'
import DOMPurify from 'dompurify'
import { AdSenseDisplay, AdSenseInArticle } from '../components/AdSense'
import SEO from '../components/SEO'
import { generateBlogSEOTags } from '../utils/seo'
import SocialShare from '../components/SocialShare'

const BlogPost = () => {
  const params = useParams()
  const { pageSlug, categorySlug, tagSlug, postSlug } = params
  const { user, isAuthenticated } = useAuthContext()
  
  // URL formatını belirle: 3 seviyeli mi 2 seviyeli mi?
  const isThreeLevelURL = pageSlug && categorySlug && tagSlug && postSlug
  const actualCategorySlug = isThreeLevelURL ? categorySlug : categorySlug
  const actualPostSlug = isThreeLevelURL ? postSlug : (tagSlug || postSlug)
  
  console.log('🎯 Gelen URL parametreleri:', params)
  console.log('📝 URL Format:', isThreeLevelURL ? '3 seviyeli' : '2 seviyeli')
  console.log('🔍 ActualCategorySlug:', actualCategorySlug)
  console.log('🔍 ActualPostSlug:', actualPostSlug)
  
  if (isThreeLevelURL) {
    console.log('🏷️ PageSlug:', pageSlug, 'TagSlug:', tagSlug)
  }
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [category, setCategory] = useState(null)
  const [recommendedPosts, setRecommendedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Favoriler state
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  
  // Dinamik SEO tags - post yüklendikten sonra oluşturulacak
  const [seoTags, setSeoTags] = useState(null)

  // Hero carousel state - dinamik yapıldı
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState([])
  const [carouselLoading, setCarouselLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  // En çok okunan haberler için state
  const [mostReadNews, setMostReadNews] = useState([])
  const [recommendedNews, setRecommendedNews] = useState([])

  // URL formatını belirle: 3 seviyeli mi 2 seviyeli mi?
  // Artık basit 2 seviyeli format kullanıyoruz


  useEffect(() => {
    // TEK SEFERDE TÜM VERİLERİ PARALEL OLARAK ÇEK
    fetchAllData()
  }, [actualCategorySlug, actualPostSlug])

  // Post yüklendikten sonra favori durumunu kontrol et
  useEffect(() => {
    if (post && isAuthenticated) {
      checkFavoriteStatus()
    }
  }, [post, isAuthenticated, user])

  // Sayfa yüklendiğinde yazının görseline scroll yap (reklamlar da görünsün)
  useEffect(() => {
    if (post) {
      // Kısa bir gecikme ile scroll yap (sayfa tam yüklensin)
      setTimeout(() => {
        const postTitle = document.querySelector('h1')
        if (postTitle) {
          // Başlığın carousel'in üstünde görünmesi için offset -170
          const offset = -170 // -170px yukarıdan başlat (başlık carousel'in üstünde olsun)
          const elementPosition = postTitle.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 500)
    }
  }, [post])



  // Responsive design için window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    
    handleResize() // İlk yüklemede kontrol et
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive haber sayısı: mobilde 8, web'de 10
  const getVisiblePostsCount = () => {
    return isMobile ? 8 : 10
  }

  const visibleSlides = heroSlides.slice(0, getVisiblePostsCount())

  // Hero carousel auto-slide
  useEffect(() => {
    if (visibleSlides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleSlides.length)
    }, 5000) // 5 seconds

    return () => clearInterval(timer)
  }, [visibleSlides.length])

  // Hero carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % visibleSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // ❌ ESKİ YAVAŞ FONKSİYON - ARTIK KULLANILMIYOR (fetchAllData kullan)
  const fetchCarouselData_OLD = async () => {
    setCarouselLoading(true)
    
    try {
      // Ana sayfa etiketli yazıları getir (carousel için) - 20 haber getir
      const { data: mainPosts, error: mainError } = await blogPostsWithTags.getMainPagePosts(20)
      
      if (!mainError && mainPosts && mainPosts.length > 0) {
        // Mevcut yazıyı hariç tut
        const filteredMainPosts = mainPosts.filter(p => p.slug !== postSlug)
        
        // Blog verilerini carousel formatına çevir
        const formattedSlides = filteredMainPosts.map(post => ({
          id: post.id,
          title: post.title,
          subtitle: post.excerpt,
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_color: post.category_color,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name
        }))
        
        // Eğer 10'dan az haber varsa, son haberlerle tamamla
        if (formattedSlides.length < 10) {
          
          // Son haberleri getir
          const { data: latestPosts } = await blogPosts.getLatest(20)
          
          if (latestPosts && latestPosts.length > 0) {
            // Ana Sayfa etiketli haberlerin ID'lerini al ve mevcut yazıyı da hariç tut
            const existingIds = formattedSlides.map(slide => slide.id)
            
            // Son haberlerden Ana Sayfa etiketli olmayanları ve mevcut yazıyı filtrele
            const additionalPosts = latestPosts
              .filter(post => !existingIds.includes(post.id) && post.slug !== postSlug)
              .slice(0, 10 - formattedSlides.length)
              .map(post => ({
                id: post.id,
                title: post.title,
                subtitle: post.excerpt,
                image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                category: post.category_name,
                category_color: post.category_color,
                category_slug: post.category_slug,
                slug: post.slug,
                views: post.views || 0,
                likes: post.likes || 0,
                published_at: post.published_at || post.created_at,
                author_name: post.author_name
              }))
            
            // Ana Sayfa etiketli haberleri önce koy, sonra diğerlerini ekle
            setHeroSlides([...formattedSlides, ...additionalPosts])
          } else {
        setHeroSlides(formattedSlides)
          }
      } else {
          setHeroSlides(formattedSlides)
        }
      } else {
        // Eğer ana sayfa etiketli haber yoksa son haberleri göster
        const { data: latestPosts } = await blogPosts.getLatest(10)
        
        if (latestPosts && latestPosts.length > 0) {
          // Mevcut yazıyı hariç tut
          const filteredPosts = latestPosts.filter(p => p.slug !== postSlug)
          const formattedSlides = filteredPosts.map(post => ({
            id: post.id,
            title: post.title,
            subtitle: post.excerpt,
            image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            category: post.category_name,
            category_color: post.category_color,
            category_slug: post.category_slug,
            slug: post.slug,
            views: post.views || 0,
            likes: post.likes || 0,
            published_at: post.published_at || post.created_at,
            author_name: post.author_name
          }))
          setHeroSlides(formattedSlides)
        } else {
          setHeroSlides([])
        }
      }
    } catch (error) {
      console.error('❌ BlogPost carousel verileri yüklenemedi:', error)
      console.error('🔗 Supabase bağlantı durumu:', error.message)
      // Hata durumunda boş bırak
      setHeroSlides([])
    } finally {
      setCarouselLoading(false)
    }
  }

  // En çok okunan haberleri getir - Ana sayfa ile aynı mantık
  const fetchSidebarData = async () => {
    try {
      
      // En çok okunan yazıları getir
      const { data: mostReadPosts, error: mostReadError } = await blogPostsWithTags.getMostReadPosts(10)
      
      // Önerilen yazıları getir
      const { data: recommendedPosts, error: recommendedError } = await blogPostsWithTags.getRecommendedPosts(3)
      
      if (!mostReadError && mostReadPosts && mostReadPosts.length > 0) {
        // En çok okunan haberler verilerini formatla
        const formattedMostRead = mostReadPosts.map(post => ({
          id: post.id,
          title: post.title,
          category: 'EN ÇOK OKUNANLAR',
          isHighlight: true,
          category_slug: post.category_slug,
          slug: post.slug
        }))
        setMostReadNews(formattedMostRead)
      } else {
        // Fallback static data
        setMostReadNews(getStaticMostReadNews())
      }

      if (!recommendedError && recommendedPosts && recommendedPosts.length > 0) {
        // Önerilen haberler verilerini formatla
        const formattedRecommended = recommendedPosts.map(post => ({
          id: post.id,
          title: post.title,
          category: 'BUNLARI OKUDUNUZ MU?',
          isHighlight: false,
          category_slug: post.category_slug,
          slug: post.slug
        }))
        setRecommendedNews(formattedRecommended)
      } else {
        // Fallback static data
        setRecommendedNews(getStaticRecommendedNews())
      }
    } catch (error) {
      console.error('❌ BlogPost sidebar verileri yüklenemedi:', error)
      // Hata durumunda static data kullan
      setMostReadNews(getStaticMostReadNews())
      setRecommendedNews(getStaticRecommendedNews())
    }
  }

  // Fallback static data for most read news
  const getStaticMostReadNews = () => [
      {
        id: 1,
      title: 'DRFS açıkladı: FTI iflasında geri ödeme süreci büyük ölçüde tamamlandı',
      category: 'EN ÇOK OKUNANLAR',
      isHighlight: true,
        category_slug: 'sektor-haberleri',
      slug: 'drfs-acikladi-fti-iflasinda-geri-odeme-sureci-buyuk-olcude-tamamlandi'
      },
      {
        id: 2,
      title: 'Akdeniz\'de otel dolulukları düşen tek ülke Türkiye',
      category: 'EN ÇOK OKUNANLAR',
      isHighlight: true,
      category_slug: 'sektor-analizi',
      slug: 'akdenizde-otel-doluluklari-dusen-tek-ulke-turkiye'
      },
      {
        id: 3,
      title: 'FlyArystan, Astana\'dan Antalya\'ya charter uçuş başlatacak',
      category: 'EN ÇOK OKUNANLAR',
      isHighlight: true,
      category_slug: 'havayolu-haberleri',
      slug: 'flyarystan-astanadan-antalyaya-charter-ucus-baslatacak'
    }
  ]

  // Fallback static data for recommended news
  const getStaticRecommendedNews = () => [
      {
        id: 4,
      title: '2025\'in ilk çeyreğinde otel yatırımlarında büyük düşüş',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false,
        category_slug: 'sektor-analizi',
      slug: '2025in-ilk-ceyreyinde-otel-yatirimlarinda-buyuk-dusus'
      },
      {
        id: 5,
      title: 'Türkiye\'nin turizm geliri rekor kırdı',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false,
      category_slug: 'sektor-haberleri',
      slug: 'turkiyenin-turizm-geliri-rekor-kirdi'
    },
    {
      id: 6,
      title: 'Yeni nesil otellerde teknoloji devrimi',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false,
      category_slug: 'teknoloji',
      slug: 'yeni-nesil-otellerde-teknoloji-devrimi'
      }
    ]



  // 🚀 ULTRA HIZLI VERİ ÇEKİMİ - TÜM SORGUYLARI PARALEL YAP
  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    setCarouselLoading(true)

    console.log('🚀 PARALEL veri çekme başlatılıyor...')
    console.log('🔍 URL parametreleri:', { 
      isThreeLevelURL, 
      actualCategorySlug, 
      actualPostSlug,
      originalParams: { pageSlug, categorySlug, tagSlug, postSlug }
    })

    try {
      // TIMEOUT Promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase timeout - 10 saniye')), 10000)
      })

      // PARALEL SORGULAR - HEPSİ AYNI ANDA!
      const [
        postResult,
        categoryResult,
        carouselResult,
        sidebarResult
      ] = await Promise.allSettled([
        // 1. Ana yazıyı çek - ÖZEL DEBUG
        (() => {
          console.log('🔍 ÖZEL DEBUG - Aranan slug:', actualPostSlug);
          if (actualPostSlug === 'rixosun-25-yili-jennifer-lopez-surpriziyle-basladi') {
            console.log('🎬 Jennifer Lopez yazısı tespit edildi! Direkt Supabase çağrısı yapılıyor...');
          }
          return Promise.race([blogPosts.getBySlug(actualPostSlug), timeoutPromise]);
        })(),
        
        // 2. Kategoriyi çek (eğer varsa)
        actualCategorySlug ? Promise.race([blogCategories.getBySlug(actualCategorySlug), timeoutPromise]) : Promise.resolve({ data: null }),
        
        // 3. Carousel verilerini çek (Ana sayfa etiketli - 10 tane)
        Promise.race([
          supabase
            .from('posts_with_tags')
            .select('id,title,slug,excerpt,featured_image_url,category_name,category_slug,category_color,published_at,author_name,views,likes,tag_objects')
            .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
            .order('published_at', { ascending: false })
            .limit(15), // Sadece 15 tane - hızlı olsun
          timeoutPromise
        ]),
        
        // 4. Sidebar verilerini çek (En çok okunanlar - "encokokunan" etiketli 7 yazı)
        Promise.race([
          supabase
            .from('posts_with_tags')
            .select('id,title,slug,category_slug,published_at,tag_objects')
            .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
            .order('published_at', { ascending: false })
            .limit(100), // Ana sayfadaki gibi daha fazla çek
          timeoutPromise
        ])
      ])

      console.log('⚡ Paralel sorgular tamamlandı!')

      // SONUÇLARI İŞLE
      
      // 1. ANA YAZI
      if (postResult.status === 'fulfilled' && postResult.value?.data) {
        const postData = postResult.value.data
        setPost(postData)
        
        // SEO tags oluştur
        const dynamicSeoTags = generateBlogSEOTags(postData)
        setSeoTags(dynamicSeoTags)

        // Görüntülenme sayısını arka planda artır (await etme)
        blogPosts.incrementViews(postData.id).catch(console.error)
        
        console.log('✅ Ana yazı yüklendi:', postData.title)
      console.log('🔗 Gerçek slug:', postData.slug)
      console.log('🔗 Aranan slug:', actualPostSlug)
      } else {
        console.error('❌ Ana yazı yüklenemedi:', postResult.reason?.message)
        console.log('🔍 Aranan slug:', actualPostSlug)
        
        // DEBUG: Benzer slug'ları ara
        try {
          const { data: allPosts } = await supabase
            .from('posts_with_tags')
            .select('slug, title')
            .ilike('slug', `%${actualPostSlug.split('-').slice(0, 3).join('-')}%`)
            .limit(5)
          
          if (allPosts && allPosts.length > 0) {
            console.log('🔍 Benzer slug\'lar bulundu:')
            allPosts.forEach((post, i) => {
              console.log(`${i+1}. ${post.slug} - ${post.title}`)
            })
          } else {
            console.log('❌ Hiç benzer slug bulunamadı')
          }
        } catch (debugError) {
          console.error('Debug slug arama hatası:', debugError)
        }
        
        setError('Yazı bulunamadı. Console\'da benzer slug\'ları kontrol edin.')
        setLoading(false)
        return
      }

      // 2. KATEGORİ
      if (categoryResult.status === 'fulfilled' && categoryResult.value?.data) {
        setCategory(categoryResult.value.data)
        console.log('✅ Kategori yüklendi')
      } else {
        console.warn('⚠️ Kategori bulunamadı (eski URL formatı)')
        setCategory(null)
      }

      // 3. CAROUSEL - GARANTİLİ 10 HABER!
      if (carouselResult.status === 'fulfilled' && carouselResult.value?.data) {
        const carouselData = carouselResult.value.data
        console.log('📊 Toplam carousel data:', carouselData.length)
        
        // Ana Sayfa etiketli olanları filtrele
        const mainPagePosts = carouselData.filter(post =>
          post.tag_objects?.some(tag => tag.slug === 'main')
        )
        console.log('🏠 Ana Sayfa etiketli yazılar:', mainPagePosts.length)
        
        // Mevcut yazıyı hariç tut
        let availablePosts = mainPagePosts.filter(p => p.slug !== actualPostSlug)
        
        // EĞER ANA SAYFA ETİKETLİ YAZZ AZ İSE, DİĞER YAZILARI EKLE
        if (availablePosts.length < 10) {
          console.log(`⚠️ Ana Sayfa etiketli sadece ${availablePosts.length} yazı var, diğer yazılarla tamamlanıyor...`)
          
          // Ana Sayfa etiketli olmayan diğer yazıları bul
          const nonMainPosts = carouselData.filter(post => 
            post.slug !== actualPostSlug && 
            !mainPagePosts.find(mp => mp.id === post.id)
          )
          
          // Eksik olan kadar ekle
          const needed = 10 - availablePosts.length
          const additionalPosts = nonMainPosts.slice(0, needed)
          availablePosts = [...availablePosts, ...additionalPosts]
          
          console.log(`✅ Toplam ${availablePosts.length} yazı carousel'e eklendi (${mainPagePosts.length} Ana Sayfa + ${additionalPosts.length} son haber)`)
        }
        
        // 10 tane garantile
        const selectedPosts = availablePosts.slice(0, 10)
        
        // Carousel formatına çevir
        const formattedSlides = selectedPosts.map(post => ({
          id: post.id,
          title: post.title,
          subtitle: post.excerpt || '',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0
        }))
        
        setHeroSlides(formattedSlides)
        console.log('🎠 Carousel FINAL:', formattedSlides.length, 'slide - GARANTİLİ 10 HABER!')
      }

      // 4. SİDEBAR (En çok okunanlar - "encokokunan" etiketli 7 yazı)
      if (sidebarResult.status === 'fulfilled' && sidebarResult.value?.data) {
        const sidebarData = sidebarResult.value.data
        
        console.log('📊 Toplam sidebar data:', sidebarData.length)
        
        // "encokokunan" etiketli yazıları filtrele (Ana sayfadaki gibi)
        const mostReadTagged = sidebarData.filter(post =>
          post.tag_objects?.some(tag => 
            tag.slug === 'encokokunan' ||
            tag.name === 'En Çok Okunan'
          )
        )
        
        console.log('🔍 "En Çok Okunan" etiketli yazılar:', mostReadTagged.length)
        
        // DEBUG: encokokunan etiketli yazıları göster
        if (mostReadTagged.length > 0) {
          console.log('✅ encokokunan etiketli yazılar:', mostReadTagged.length, 'adet')
          mostReadTagged.forEach((post, index) => {
            console.log(`${index + 1}. ${post.title} (ID: ${post.id})`)
          })
        } else {
          console.log('❌ encokokunan etiketli yazı bulunamadı!')
          console.log('🔍 Tüm yazıların etiketlerini kontrol edelim:')
          sidebarData.slice(0, 5).forEach((post, index) => {
            console.log(`${index + 1}. ${post.title}`)
            console.log('   Etiketler:', post.tag_objects?.map(tag => `${tag.slug} (${tag.name})`) || 'YOK')
          })
        }
        
        // 7 adede tamamla (eksikse sidebarData'dan doldur)
        const targetMostRead = [...mostReadTagged]
        if (targetMostRead.length < 7 && sidebarData?.length > 0) {
          const needed = 7 - targetMostRead.length
          const filler = sidebarData
            .filter(p => !targetMostRead.some(m => m.id === p.id))
            .slice(0, needed)
          targetMostRead.push(...filler)
        }

        const formattedSidebar = targetMostRead.slice(0, 7).map(post => ({
          id: post.id,
          title: post.title,
          category: 'EN ÇOK OKUNANLAR',
          category_slug: post.category_slug,
          slug: post.slug
        }))
        
        setMostReadNews(formattedSidebar)
        console.log('✅ Sidebar yüklendi:', formattedSidebar.length, 'haber (En Çok Okunan etiketli)')
      }

      // RANDOM ÖNERİLER (Arka planda)
      const randomPosts = carouselResult.status === 'fulfilled' ? carouselResult.value.data : []
      if (randomPosts.length > 0) {
        const filteredPosts = randomPosts.filter(p => p.slug !== actualPostSlug)
        const shuffled = filteredPosts.sort(() => 0.5 - Math.random())
        setRecommendedPosts(shuffled.slice(0, 3))
      }

    } catch (error) {
      console.error('🚨 BlogPost veri yükleme hatası:', error)
      if (error.message.includes('timeout')) {
        setError('Sayfa yükleme çok uzun sürdü. Lütfen tekrar deneyin.')
      } else {
        setError('Bir hata oluştu: ' + error.message)
      }
    } finally {
      setLoading(false)
      setCarouselLoading(false)
      console.log('⚡ TÜM VERİLER YÜKLENDİ!')
    }
  }

  const fetchPost = async () => {
    setLoading(true)
    setError(null)

    console.log('🔍 BlogPost URL Parametreleri:', {
      categorySlug, 
      postSlug,
      url: window.location.pathname
    })

    try {
      // TIMEOUT ile Supabase çağrısı - 8 saniye timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase timeout - 8 saniye')), 8000)
      })
      // Basit 2 seviyeli URL formatı: /kategori/yazı-başlığı
      console.log('📝 Kullanılacak parametreler:', {
        categorySlug,
        postSlug
      })

      // Eğer categorySlug varsa kategoriyi kontrol et
      if (categorySlug) {
        const { data: categoryData, error: categoryError } = await blogCategories.getBySlug(categorySlug)
        if (categoryError || !categoryData) {
          console.warn('⚠️ Kategori bulunamadı, eski URL formatı olabilir:', categorySlug)
          // Eski URL formatı için kategori kontrolünü atla
          setCategory(null)
        } else {
          setCategory(categoryData)
        }
      } else {
        // /blog/ route'u için kategori kontrolü yok
        setCategory(null)
      }

      // Yazıyı getir - TIMEOUT ile
      console.log('📡 Supabase\'den yazı çekiliyor:', postSlug)
      const postPromise = blogPosts.getBySlug(postSlug)
      const { data: postData, error: postError } = await Promise.race([
        postPromise,
        timeoutPromise
      ])
      if (postError || !postData) {
        console.error('❌ Yazı bulunamadı:', postSlug, postError)
        setError('Yazı bulunamadı')
        setLoading(false)
        return
      }

      // Kategori eşleşmesini kontrol et (sadece categorySlug varsa ve kategori bulunduysa)
      if (categorySlug && category && postData.category_slug !== categorySlug) {
        console.warn('⚠️ Kategori eşleşmiyor ama devam ediyoruz (eski URL):', postData.category_slug, '!=', categorySlug)
        // Eski URL formatı için kategori eşleşmeme kontrolünü atla
      }

      setPost(postData)
      
      // Dinamik SEO tags oluştur
      const dynamicSeoTags = generateBlogSEOTags(postData)
      setSeoTags(dynamicSeoTags)

      // Görüntülenme sayısını artır
      await blogPosts.incrementViews(postData.id)

      // Rastgele önerilen yazıları getir
      const { data: randomPosts } = await blogPosts.getLatest(20) // Son 20 haberi getir
      if (randomPosts && randomPosts.length > 0) {
        // Mevcut yazıyı hariç tut
        const filteredPosts = randomPosts.filter(p => p.id !== postData.id)
        
        // Rastgele karıştır ve 3 tane seç
        const shuffled = filteredPosts.sort(() => 0.5 - Math.random())
        setRecommendedPosts(shuffled.slice(0, 3))
      }

    } catch (error) {
      console.error('🚨 BlogPost fetchPost hatası:', error)
      console.error('🚨 Error stack:', error.stack)
      
      if (error.message.includes('timeout')) {
        console.error('⏰ TIMEOUT: Supabase yavaş yanıt veriyor')
        setError('Sayfa yükleme çok uzun sürdü. Lütfen tekrar deneyin.')
      } else if (error.message.includes('Failed to fetch')) {
        console.error('🌐 NETWORK: İnternet bağlantısı sorunu')
        setError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.')
      } else {
        setError('Bir hata oluştu: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!post) return
    
    try {
      await blogPosts.incrementLikes(post.id)
      setPost(prev => ({
        ...prev,
        likes: (prev.likes || 0) + 1
      }))
    } catch (error) {
      console.error('Beğeni eklenemedi:', error)
    }
  }

  // Favorilere ekleme/çıkarma fonksiyonu
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/kullanici-girisi')
      return
    }

    if (!post || favoriteLoading) return

    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        // Favorilerden çıkar
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)

        if (error) throw error
        setIsFavorite(false)
      } else {
        // Favorilere ekle
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            post_id: post.id
          })

        if (error) throw error
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('❌ Favori işlemi başarısız:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Favori durumunu kontrol et
  const checkFavoriteStatus = async () => {
    if (!isAuthenticated || !post) return

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      setIsFavorite(!!data)
    } catch (error) {
      console.error('❌ Favori durumu kontrol edilemedi:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = post?.title || 'Blog Yazısı'
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (error) {
        // Paylaşım iptal edildi
      }
    } else {
      // Fallback - URL'yi kopyala
      try {
        await navigator.clipboard.writeText(url)
        alert('Link kopyalandı!')
      } catch (error) {
        alert('Link: ' + url)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Markdown içeriklerini HTML'e çevir (PostForm'dakiyle aynı)
  const renderContent = (content, isFirstHalf = null) => {
    if (!content) return 'İçerik bulunamadı'
    
    // Markdown görsellerini HTML'e çevir: ![alt](url) -> <img src="url" alt="alt" />
    const withImages = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-sm" />'
    )
    
    // Satır başlarını <br> etiketlerine çevir
    const withLineBreaks = withImages.replace(/\n/g, '<br />')
    
    // 🔒 GÜVENLİK: XSS saldırılarını önlemek için HTML içeriğini sanitize et
    const sanitizedContent = DOMPurify.sanitize(withLineBreaks, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option'],
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
    })
    
    // Eğer isFirstHalf null ise (eski kullanım) tüm içeriği döndür
    if (isFirstHalf === null) {
    return sanitizedContent
    }
    
    // İçeriği paragraflar halinde böl
    const paragraphs = sanitizedContent.split('<br />')
    const totalParagraphs = paragraphs.length
    const halfPoint = Math.floor(totalParagraphs / 2)
    
    if (isFirstHalf) {
      // İlk yarı
      return paragraphs.slice(0, halfPoint).join('<br />')
    } else {
      // İkinci yarı
      return paragraphs.slice(halfPoint).join('<br />')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Yazı yükleniyor...</p>
            <p className="text-gray-500 text-sm mt-2">Supabase'den veri çekiliyor</p>
          </div>
          <div className="animate-pulse mt-8">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                fetchPost()
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mr-3"
            >
              🔄 Tekrar Dene
            </button>
            <button
              onClick={() => navigate('/news')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Haberlere Dön
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dinamik SEO Meta Tags */}
      {seoTags && <SEO {...seoTags} />}
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
            <Link 
              to="/" 
              className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
            >
              Ana Sayfa
            </Link>
            <span className="text-gray-400 mx-1">›</span>
            {categorySlug ? (
              <>
                <Link 
                  to="/haberler" 
                  className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
                >
                  Haberler
                </Link>
                <span className="text-gray-400 mx-1">›</span>
            <Link 
              to={`/kategori/${categorySlug}`} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
            >
              {category?.name}
            </Link>
                <span className="text-gray-400 mx-1">›</span>
              </>
            ) : (
              <>
                <Link to="/seyahat-onerileri" className="text-primary-600 hover:text-primary-700 font-medium">
                  Seyahat Önerileri
                </Link>
                <span className="text-gray-400 mx-1">›</span>
              </>
            )}
            <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium truncate max-w-sm md:max-w-md lg:max-w-lg">
              {post?.title}
            </span>
          </nav>
        </div>
      </div>



      {/* Hero Carousel Section - Ana sayfa ve News gibi düzgün tasarım */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Ana Carousel - Sol taraf (2/3) */}
            <div className="lg:col-span-2">
          <div className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-xl">
            
            {/* Loading State for Carousel */}
            {carouselLoading ? (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                <div className="text-gray-500 text-lg">Carousel yükleniyor...</div>
              </div>
            ) : visibleSlides.length > 0 ? (
              <>
                {/* Slides */}
                <div className="relative h-full">
                  {visibleSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
                        style={{ 
                          backgroundImage: `url(${slide.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})` 
                        }}
                          ></div>
                      
                      <div className="relative z-10 h-full flex items-end p-2 sm:p-8">
                            {/* Alt alan için siyah bant - başlık ve kontrolleri kaplıyor */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-xl" style={{height: isMobile ? '55px' : '105px'}}></div>
                            
                            <div className="text-white max-w-4xl relative z-10 text-left">
                              <h1 className="font-bold mb-4 sm:mb-8 leading-tight text-white text-base sm:text-xl lg:text-3xl line-clamp-1 overflow-hidden" style={{transform: isMobile ? 'translateY(-12px)' : 'translateY(8px)'}}>
                                {slide.title}
                              </h1>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="carousel-indicator absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-2 rounded-full transition-all duration-200 z-20"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="carousel-indicator absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-2 rounded-full transition-all duration-200 z-20"
                >
                  <ChevronRight className="h-3 w-3 sm:h-5 sm:w-5" />
                </button>

                    {/* Bottom Controls - All Aligned */}
                    <div className="absolute bottom-1 sm:bottom-4 left-0 right-0 flex items-center justify-between px-2 sm:px-8 z-20 max-w-full">
                      
                      {/* Left Side - Slide Indicators */}
                      <div className="flex items-center space-x-1 sm:space-x-1.5 relative z-10 flex-shrink-0">
                  {visibleSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`slide-indicator w-4 h-4 sm:w-5 sm:h-5 rounded-full text-xs font-bold transition-all duration-200 ${
                        index === currentSlide 
                          ? 'bg-secondary-500 text-white' 
                          : 'bg-white bg-opacity-50 text-gray-700 hover:bg-opacity-75'
                      }`}
                    >
                      <span className="text-xs">{index + 1}</span>
                    </button>
                  ))}
                        
                        {/* Mobilde tarih burada gösterilsin */}
                        {isMobile && visibleSlides[currentSlide]?.published_at && (
                          <>
                            <div className="text-white text-sm font-light mx-0.5">|</div>
                            <span className="text-xs text-white whitespace-nowrap leading-none" style={{fontSize: '0.6rem'}}>{formatDate(visibleSlides[currentSlide].published_at || visibleSlides[currentSlide].created_at)}</span>
                          </>
                        )}
                        
                        {/* Ayırıcı çizgi - sadece web'de */}
                        {!isMobile && <div className="text-white text-sm sm:text-lg font-light mx-1 sm:mx-2">|</div>}
                      </div>

                      {/* Right Side - Stats and Button */}
                      <div className="flex items-center space-x-1 sm:space-x-3 relative z-10 ml-1 sm:ml-4">
                        {/* İstatistikler */}
                        <div className="flex items-center space-x-1 sm:space-x-2 text-white px-1 sm:px-2 py-1">
                          {!isMobile && (
                            <>
                              {visibleSlides[currentSlide]?.published_at && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-2 w-2 sm:h-3 sm:w-3" />
                                  <span className="text-xs whitespace-nowrap">{formatDate(visibleSlides[currentSlide].published_at || visibleSlides[currentSlide].created_at)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Devamını Oku Button - Mobilde Kompakt */}
                        {visibleSlides[currentSlide]?.category_slug && visibleSlides[currentSlide]?.slug ? (
                          <Link
                            to={`/${visibleSlides[currentSlide].category_slug}/${visibleSlides[currentSlide].slug}`}
                            className="carousel-indicator bg-primary-600 hover:bg-primary-700 text-white px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors inline-flex items-center space-x-1 shadow-md whitespace-nowrap"
                          >
                            <span>Devamını Oku</span>
                            <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Link>
                        ) : (
                          <button className="carousel-indicator bg-primary-600 hover:bg-primary-700 text-white px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors inline-flex items-center space-x-1 shadow-md whitespace-nowrap">
                            <span>Devamını Oku</span>
                            <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                          </button>
                        )}
                      </div>

                </div>
              </>
            ) : (
              /* Fallback when no carousel data */
              <div className="absolute inset-0 bg-gray-300 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-4">📰</div>
                  <div className="text-xl font-semibold">Carousel haberi bulunamadı</div>
                  <div className="text-sm mt-2">Admin panelden "Ana Sayfa" etiketli haber ekleyin</div>
                </div>
              </div>
            )}
            
              </div>
            </div>

            {/* Sidebar - Sağ taraf */}
            <div className="lg:col-span-1">
              <div className="h-auto flex flex-col gap-4">
                
                {/* En Çok Okunanlar Section - 4 yazı görünür, 3 yazı scroll */}
                <div className="flex flex-col">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm">EN ÇOK OKUNANLAR</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg min-h-0 overflow-y-auto" style={{ maxHeight: '260px' }}>
                    {mostReadNews.length > 0 ? (
                      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {mostReadNews.map((news, index) => (
                          <div 
                            key={news.id} 
                            className="p-2 sm:p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                          {news.category_slug && news.slug ? (
                            <Link 
                              to={`/${news.category_slug}/${news.slug}`}
                              className="block"
                            >
                              <h4 className="text-sm font-medium text-gray-900 leading-tight hover:text-primary-600 transition-colors">
                                {news.title}
                              </h4>
                            </Link>
                          ) : (
                              <div>
                            <h4 className="text-sm font-medium text-gray-900 leading-tight">
                              {news.title}
                            </h4>
                              </div>
                          )}
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <div className="text-2xl mb-2">📰</div>
                        <div className="text-sm">En çok okunan haber bulunamadı</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AdSense Reklam Alanı - Biraz daha büyük */}
                <div className="flex-[1.2] flex-shrink-0">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm">ÖZEL FIRSATLAR</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg p-4">
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src="/images/ozel-firsatlar2.png" 
                        alt="Özel Fırsatlar" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span 
              className="inline-block px-3 py-1 text-sm font-medium text-black rounded-full border border-gray-300"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              {category?.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{post?.read_time} dakika okuma</span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight flex-1">
              {post?.title}
            </h1>
            
            {/* Favorilere Ekle Butonu */}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFavorite
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">
                {favoriteLoading ? 'İşleniyor...' : isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post?.published_at || post?.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Paylaş</span>
              </button>
            </div>
          </div>
        </header>

        {/* Yazı Başlangıcı Reklam Alanları - 2 adet yan yana */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            
            {/* Sol Banner Reklam - Ajet */}
            <a 
              href="https://ajet.com/tr"
              target="_blank"
              rel="noopener noreferrer"
              className="adsense-article-top relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567950"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '728px',
                height: '90px'
              }}
            >
              <img 
                src="/images/Ajet_yeni_reklam.webp" 
                alt="Ajet Reklam"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </a>

            {/* Sağ Banner Reklam - Rixos */}
            <a 
              href="https://allinclusive-collection.com/tr/hotel/rixos-radamis-sharm-el-sheikh/?utm_source=facebook&utm_medium=cpc&utm_campaign=[Reach]+-+Rixos+Radamis++-+2+Kids+Free+-+TR+-+IG&utm_content=T%C3%BCrkiye&utm_id=120226465279010313_v2_s04&utm_term=120226465278990313&fbclid=PAZXh0bgNhZW0BMABhZGlkAasjTjMJ7rkBpxlMqox_yAVkFCknQHGZV_tJhdlFKolQugScqwi_X0khx8DtvhghLDK8aQaw_aem_rYH2yZcjYotr2k5ywKv7sw"
              target="_blank"
              rel="noopener noreferrer"
              className="adsense-article-top relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567951"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '728px',
                height: '90px'
              }}
            >
              <img 
                src="/images/rixos_reklam.webp" 
                alt="Rixos Reklam"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </a>
            
          </div>
        </div>

        {/* Featured Image */}
        {post?.featured_image_url && (
          <div className="mb-8" data-featured-image>
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Excerpt */}
        {post?.excerpt && (
          <div className="bg-gray-50 border-l-4 border-primary-500 p-6 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed italic">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Sosyal Medya Paylaşım - Başlık Altı */}
        <div className="mb-8">
          <SocialShare
            title={post?.title || 'JoinEscapes Blog'}
            url={window.location.href}
            description={post?.excerpt || post?.description || 'JoinEscapes\'ten harika bir seyahat rehberi'}
            image={post?.featured_image_url}
            hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Destinasyon']}
            variant="compact"
            className="justify-center"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-gray-900 leading-relaxed">
            {/* İçeriğin ilk yarısı */}
            <div dangerouslySetInnerHTML={{ __html: renderContent(post?.content, true) }} />
            
            {/* Makale içi AdSense Reklam */}
            <div className="my-8 text-center">
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Reklam</div>
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9097929594228195" crossOrigin="anonymous"></script>
              <ins 
                className="adsbygoogle"
                style={{display: 'block', textAlign: 'center'}}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-9097929594228195"
                data-ad-slot="9927120542"
              ></ins>
              <script>
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </script>
            </div>
            
            {/* İçeriğin ikinci yarısı */}
            <div dangerouslySetInnerHTML={{ __html: renderContent(post?.content, false) }} />
          </div>
        </div>

        {/* Tags */}
        {((post?.tags && post.tags.length > 0) || (post?.tag_objects && post.tag_objects.length > 0)) && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Etiketler:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Önce tag_objects'ten etiketleri göster (yeni sistem) */}
              {post?.tag_objects && post.tag_objects.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag.name}
                </span>
              ))}
              {/* Sonra tags array'inden etiketleri göster (eski sistem) */}
              {post?.tags && post.tags.map((tag, index) => (
                <span
                  key={`tag-${index}`}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-6 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Geri Dön</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Paylaş</span>
            </button>
          </div>
        </div>

        {/* Yazı Sonu Reklam Alanları - 2 adet yan yana */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            
            {/* Sol Banner Reklam - RAW Agent 1 */}
            <div 
              className="adsense-article-bottom relative overflow-hidden rounded-lg shadow-md mx-auto"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567952"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '728px',
                height: '90px'
              }}
            >
              <img 
                src="/images/raw_reklam_1.webp" 
                alt="RAW Agent Reklam 1"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Sağ Banner Reklam - RAW Agent 2 */}
            <div 
              className="adsense-article-bottom relative overflow-hidden rounded-lg shadow-md mx-auto"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567953"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '728px',
                height: '90px'
              }}
            >
              <img 
                src="/images/raw_reklam_2.webp" 
                alt="RAW Agent Reklam 2"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            
          </div>
        </div>

        {/* Sosyal Medya Paylaşım - Yazı Sonu */}
        <div className="mb-12">
          <SocialShare
            title={post?.title || 'JoinEscapes Blog'}
            url={window.location.href}
            description={post?.excerpt || post?.description || 'JoinEscapes\'ten harika bir seyahat rehberi'}
            image={post?.featured_image_url}
            hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Destinasyon']}
            variant="default"
          />
        </div>

        {/* Recommended Posts - Görseldeki tasarıma uygun */}
        {recommendedPosts.length > 0 && (
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Önerilen Haberler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPosts.map((recommendedPost) => (
                <Link
                  key={recommendedPost.id}
                  to={`/${recommendedPost.category_slug}/${recommendedPost.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-300"
                >
                  {recommendedPost.featured_image_url && (
                    <div className="relative overflow-hidden">
                    <img
                      src={recommendedPost.featured_image_url}
                      alt={recommendedPost.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                      <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Destinasyon
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                      {recommendedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(recommendedPost.published_at || recommendedPost.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Floating Sosyal Medya Paylaşım Butonu */}
      <SocialShare
        title={post?.title || 'JoinEscapes Blog'}
        url={window.location.href}
        description={post?.excerpt || post?.description || 'JoinEscapes\'ten harika bir seyahat rehberi'}
        image={post?.featured_image_url}
        hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Destinasyon']}
        variant="floating"
      />
    </div>
  )
}

export default BlogPost 