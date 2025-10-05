import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, MapPin, Calendar, Camera, Compass, Heart, ChevronLeft, ChevronRight, Eye, User } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { blogPosts } from '../lib/blog'
import { supabase } from '../lib/supabase'
import { AdSenseDisplay, AdSenseBanner, AdSenseMediumRectangle, AdSenseLargeBanner } from '../components/AdSense'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import SkeletonLoader from '../components/SkeletonLoader'
import SocialShare from '../components/SocialShare'
import LazyImage from '../components/LazyImage'
import { lazy, Suspense } from 'react'
const TravelFinder = lazy(() => import('../components/TravelFinder'))

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState([]) // Başlangıçta boş, dinamik yüklenecek
  const [mostReadNews, setMostReadNews] = useState([])
  // const [recommendedNews, setRecommendedNews] = useState([]) // Kaldırıldı - ana sayfada yok
  const [editorCommentPosts, setEditorCommentPosts] = useState([]) // Editör Yorumu için
  const [featuredWriters, setFeaturedWriters] = useState([]) // Öne çıkan yazarlar
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [dataCache, setDataCache] = useState(null) // Cache için
  
  // SEO tags
  const seoTags = generateSEOTags('home')
  
  // Quiz state management
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  

  // YouTube video state
  const [currentVideo, setCurrentVideo] = useState(0)

  // Ana sayfa carousel verilerini getir
  // Mobil tespiti
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Ana sayfa veilerini dinamik getir
    fetchMainPageData()
  }, [])

  // Responsive design için window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480) // sadece çok küçük mobil cihazlar
    }
    
    handleResize() // İlk yüklemede kontrol et
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mobilde 8, web'de 10 haber göster
  const getVisiblePostsCount = () => {
    const count = isMobile ? 8 : 10
    return count
  }

  const visibleSlides = heroSlides.slice(0, getVisiblePostsCount())

  // Carousel otomatik geçiş
  useEffect(() => {
    if (visibleSlides.length === 0) {
      // console.log('⏸️ Carousel timer bekleniyor, henüz slide yok')
      return
    }

    console.log('▶️ Carousel timer başlatılıyor:', visibleSlides.length, 'slide')
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleSlides.length)
    }, 5000) // 5 saniye

    return () => {
      console.log('⏹️ Carousel timer durduruluyor')
      clearInterval(timer)
    }
  }, [visibleSlides.length])

  const fetchMainPageData = async () => {
    setLoading(true)
    console.log('🚀 Ana sayfa verileri yükleniyor...')
    
    try {
      // PARALEL VERİ ÇEKME - POSTS VE WRITERS
      console.log('📡 Supabase\'den veri çekiliyor...')
      
      const [postsResult, writersResult] = await Promise.allSettled([
        supabase
          .from('posts_with_tags')
          .select('id,title,slug,excerpt,featured_image_url,category_name,category_slug,category_color,published_at,created_at,author_name,views,likes,tag_objects')
          .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
          .order('published_at', { ascending: false })
          .limit(100), // Daha fazla veri çek ki tüm encokokunan etiketli yazıları bulabilelim
        
        supabase
          .from('writer_profiles')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8) // Maksimum 8 öne çıkan yazar
      ])
      
      // Posts verilerini işle
      const { data: allPosts, error: postsError } = postsResult.status === 'fulfilled' ? postsResult.value : { data: null, error: postsResult.reason }
      
      // Writers verilerini işle
      const { data: writers, error: writersError } = writersResult.status === 'fulfilled' ? writersResult.value : { data: null, error: writersResult.reason }
      
      if (writers && writers.length > 0) {
        // Admin hesabını filtrele (test@test.com)
        const filteredWriters = writers.filter(writer => 
          writer.email !== 'test@test.com' && 
          writer.name !== 'test' &&
          writer.name !== 'admin'
        );
        setFeaturedWriters(filteredWriters)
        console.log('✅ Öne çıkan yazarlar yüklendi:', filteredWriters.length)
        console.log('📸 Yazarların profil fotoğrafları:', filteredWriters.map(w => ({ name: w.name, profile_image: w.profile_image })))
      } else {
        console.log('⚠️ Öne çıkan yazar bulunamadı')
        if (writersError) console.error('❌ Writers hatası:', writersError)
      }
      
      console.log('✅ Toplam yazı:', allPosts?.length || 0)
      
      if (postsError) {
        console.error('❌ Supabase hatası:', postsError)
        throw postsError
      }
      
      if (allPosts && allPosts.length > 0) {
        // Ana Sayfa etiketli olanları filtrele
        let mainPagePosts = allPosts.filter(post => 
          post.tag_objects?.some(tag => 
            tag.slug === 'main' ||
            tag.name === 'Ana Sayfa'
          )
        )
        console.log('🏠 Ana Sayfa etiketli yazılar:', mainPagePosts.length)
        
        // Eğer ana sayfa etiketli yazı yoksa, son 10 yazıyı al
        if (mainPagePosts.length === 0) {
          console.log('⚠️ Ana sayfa etiketli yazı bulunamadı, son yazılar kullanılıyor')
          mainPagePosts = allPosts.slice(0, 10)
        }
        
        // DEBUG: İlk 3 yazının etiketlerini göster
        console.log('🔍 İlk 3 yazının etiketleri:')
        allPosts.slice(0, 3).forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`)
          console.log('   Etiketler:', post.tag_objects?.map(tag => `${tag.slug} (${tag.name})`) || 'YOK')
        })
        
        // DETAYLI LOG - hangi yazılar Ana Sayfa etiketli?
        if (mainPagePosts.length > 0) {
          console.log('📋 Ana Sayfa etiketli yazılar:')
          mainPagePosts.forEach((post, index) => {
            console.log(`${index + 1}. ${post.title} - ${post.category_name}`)
          })
        } else {
          console.log('⚠️ Hiç Ana Sayfa etiketli yazı bulunamadı!')
          console.log('🔍 İlk 5 yazının etiketleri:')
          allPosts.slice(0, 5).forEach((post, index) => {
            console.log(`${index + 1}. ${post.title}`)
            console.log('   Etiketler:', post.tag_objects?.map(tag => `${tag.slug} (${tag.name})`) || 'YOK')
          })
          console.log('🔍 Tüm mevcut etiketler:')
          const allTags = new Set()
          allPosts.forEach(post => {
            post.tag_objects?.forEach(tag => allTags.add(`${tag.slug} (${tag.name})`))
          })
          console.log(Array.from(allTags))
        }
        
        // HEMEN CAROUSEL'E YÜKLE! (10 TANE GARANTİSİ)
        let carouselPosts = mainPagePosts.slice(0, 10)
        
        // Eğer Ana Sayfa etiketli yazı 10'dan azsa, son yazılarla tamamla
        if (carouselPosts.length < 10) {
          console.log(`⚠️ Ana Sayfa etiketli sadece ${carouselPosts.length} yazı var, son yazılarla tamamlanıyor...`)
          
          // Ana Sayfa etiketli olmayan son yazıları bul
          const mainPostIds = carouselPosts.map(p => p.id)
          const remainingPosts = allPosts.filter(post => !mainPostIds.includes(post.id))
          
          // Eksik olan kadar ekle
          const needed = 10 - carouselPosts.length
          const additionalPosts = remainingPosts.slice(0, needed)
          carouselPosts = [...carouselPosts, ...additionalPosts]
          
          console.log(`✅ Toplam ${carouselPosts.length} yazı carousel'e eklendi (${mainPagePosts.length} Ana Sayfa + ${additionalPosts.length} son haber)`)
        }
        
        if (carouselPosts.length > 0) {
          const carouselSlides = carouselPosts.map(post => ({
            id: post.id,
            title: post.title,
            subtitle: post.excerpt || '',
            image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
            category: post.category_name || 'Haber',
            category_color: post.category_color || '#3B82F6',
            category_slug: post.category_slug || 'haberler',
            slug: post.slug,
            views: post.views || 0,
            likes: post.likes || 0,
            published_at: post.published_at || post.created_at,
            author_name: post.author_name || 'Editör'
          }))
          
          console.log('🎠 Carousel\'e yükleniyor:', carouselSlides.length, 'slide (İLK 10 ANA SAYFA ETİKETLİ)')
          console.log('📝 Carousel yazıları:', carouselSlides.map((slide, i) => `${i+1}. ${slide.title.slice(0, 40)}...`))
          
          // JENNIFER LOPEZ YAZISINI DEBUG ET
          const jenniferPost = carouselSlides.find(slide => 
            slide.title.toLowerCase().includes('jennifer') || 
            slide.title.toLowerCase().includes('lopez')
          )
          if (jenniferPost) {
            console.log('🎬 Jennifer Lopez yazısı bulundu:')
            console.log('   Başlık:', jenniferPost.title)
            console.log('   Slug:', jenniferPost.slug)
            console.log('   Kategori:', jenniferPost.category_slug)
            console.log('   Link:', `/${jenniferPost.category_slug}/${jenniferPost.slug}`)
            console.log('   MANUEL TEST URL:', `http://localhost:5173/${jenniferPost.category_slug}/${jenniferPost.slug}`)
          }
          
          // TÜM CAROUSEL LİNKLERİNİ DEBUG ET
          console.log('🔗 Tüm carousel linkleri:')
          carouselSlides.forEach((slide, i) => {
            console.log(`${i+1}. ${slide.title.slice(0, 30)}... -> /${slide.category_slug}/${slide.slug}`)
          })
          setHeroSlides(carouselSlides)
          setCurrentSlide(0) // Carousel'i başa al
          // Loading'i carousel verisi yüklendikten sonra kapat
          setTimeout(() => setLoading(false), 100) // Kısa delay ile UI render'ına zaman ver
        } else {
          console.log('⚠️ Ana Sayfa etiketli yazı bulunamadı! Son yazılar gösteriliyor...')
          // Son yazıları göster
          const latestSlides = allPosts.slice(0, 10).map(post => ({
            id: post.id,
            title: post.title,
            subtitle: post.excerpt || '',
            image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
            category: post.category_name || 'Haber',
            category_color: post.category_color || '#3B82F6',
            category_slug: post.category_slug || 'haberler',
            slug: post.slug,
            views: post.views || 0,
            likes: post.likes || 0,
            published_at: post.published_at || post.created_at,
            author_name: post.author_name || 'Editör'
          }))
          console.log('📰 Son haberler gösteriliyor:', latestSlides.length, 'slide')
          setHeroSlides(latestSlides)
          setCurrentSlide(0) // Carousel'i başa al
          setTimeout(() => setLoading(false), 100)
        }
        
        // En Çok Okunan etiketli olanları filtrele (Ana sayfa için)
        const mostReadTagged = allPosts.filter(post =>
          post.tag_objects?.some(tag => 
            tag.slug === 'encokokunan' ||
            tag.name === 'En Çok Okunan'
          )
        )
        console.log('📈 En Çok Okunan etiketli yazılar:', mostReadTagged.length)
        
        // DEBUG: Tüm yazıların etiketlerini detaylı göster
        console.log('🔍 Tüm yazıların etiketleri (detaylı):')
        allPosts.slice(0, 10).forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`)
          console.log('   Etiketler:', post.tag_objects?.map(tag => `${tag.slug} (${tag.name})`) || 'YOK')
        })
        
        // DEBUG: encokokunan etiketli yazıları göster
        if (mostReadTagged.length > 0) {
          console.log('✅ encokokunan etiketli yazılar:', mostReadTagged.length, 'adet')
          mostReadTagged.forEach((post, index) => {
            console.log(`${index + 1}. ${post.title} (ID: ${post.id})`)
          })
        } else {
          console.log('❌ encokokunan etiketli yazı bulunamadı!')
          console.log('🔍 Tüm yazıların etiketlerini kontrol edelim:')
          allPosts.slice(0, 5).forEach((post, index) => {
            console.log(`${index + 1}. ${post.title}`)
            console.log('   Etiketler:', post.tag_objects?.map(tag => `${tag.slug} (${tag.name})`) || 'YOK')
          })
        }
        
        // EN ÇOK OKUNANLAR'I DA YÜKLE - Sadece son 7 yazı
        if (mostReadTagged.length > 0) {
          // console.log('✅ EN ÇOK OKUNANLAR yükleniyor:', mostReadTagged.length, 'yazı')
          const formattedMostRead = mostReadTagged.slice(0, 7).map(post => ({
            id: post.id,
            title: post.title,
            category: 'EN ÇOK OKUNANLAR',
            isHighlight: true,
            category_slug: post.category_slug,
            slug: post.slug
          }))
          // console.log('📝 Formatlanmış EN ÇOK OKUNANLAR:', formattedMostRead.length, 'yazı')
          setMostReadNews(formattedMostRead)
        } else {
          console.log('❌ EN ÇOK OKUNANLAR yüklenemedi - mostReadTagged boş')
          // Fallback static data kaldırıldı - artık dinamik olarak çekiliyor
          setMostReadNews([])
        }
        
        // "Bunları Okudunuz mu?" bölümü ana sayfada yok - kaldırıldı
        
        // Editör önerileri için "Öneri" etiketli olanları filtrele
        const editorTagged = allPosts.filter(post =>
          post.tag_objects?.some(tag => tag.slug === 'oneri')
        )
        if (editorTagged.length > 0) {
          const formattedEditor = editorTagged.slice(0, 3).map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || 'Editörümüzden özel yorum ve öneriler...',
            image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            date: formatDate(post.published_at || post.created_at),
            category_slug: post.category_slug,
            slug: post.slug,
            author_name: post.author_name || 'Editör'
          }))
          setEditorCommentPosts(formattedEditor)
        }
        
        // Eğer hiçbir veri yoksa fallback'leri yükle
        if (mainPagePosts.length === 0) {
          setHeroSlides(getStaticHeroSlides())
        }
        if (mostReadTagged.length === 0) {
          // setMostReadNews(getStaticMostReadNews()) - Kaldırıldı: artık dinamik olarak çekiliyor
          setMostReadNews([])
        }
        // "Bunları Okudunuz mu?" bölümü kaldırıldı
        if (editorTagged.length === 0) {
          setEditorCommentPosts(getStaticEditorCommentPosts())
        }
        
      } else {
        console.log('⚠️ Hiç yazı bulunamadı!')
        setHeroSlides(getStaticHeroSlides())
        // setMostReadNews(getStaticMostReadNews()) - Kaldırıldı: artık dinamik olarak çekiliyor
        setMostReadNews([])
        // setRecommendedNews kaldırıldı
        setEditorCommentPosts(getStaticEditorCommentPosts())
        setLoading(false)
      }
      
    } catch (error) {
      console.error('🚨 Veri yükleme hatası:', error)
      // Hata durumunda fallback verileri yükle
      setHeroSlides(getStaticHeroSlides())
      // setMostReadNews(getStaticMostReadNews()) - Kaldırıldı: artık dinamik olarak çekiliyor
      setMostReadNews([])
      setRecommendedNews(getStaticRecommendedNews())
      setEditorCommentPosts(getStaticEditorCommentPosts())
      setLoading(false)
    }
    
    // ESKİ KOD - ARTIK ÇALIŞMAYACAK
    return // Burayı da engelle
    
    try {
      console.log('📊 Paralel veri çekme başlatılıyor...')
      
      // İLK ÖNCE BASIT VERİ ÇEK - HIZLI YÜKLEME İÇİN
      console.log('⚡ Basit blog posts çekiliyor...')
      const simplePostsPromise = blogPosts.getPublished({ limit: 15 }).catch(err => {
        console.error('❌ Simple posts error:', err)
        return { data: [], error: err }
      })
      
      // TÜM VERİLERİ PARALEL OLARAK ÇEK - TIMEOUT İLE
      const complexDataPromise = Promise.all([
        blogPostsWithTags.getMainPagePosts(20).catch(err => {
          console.error('❌ Main posts error:', err)
          return { data: [], error: err }
        }),
        blogPostsWithTags.getMostReadPosts(10).catch(err => {
          console.error('❌ Most read posts error:', err)
          return { data: [], error: err }
        }),
        blogPostsWithTags.getRecommendedPosts(3).catch(err => {
          console.error('❌ Recommended posts error:', err)
          return { data: [], error: err }
        }),
        blogPostsWithTags.getEditorCommentPosts(3).catch(err => {
          console.error('❌ Editor posts error:', err)
          return { data: [], error: err }
        })
      ])
      
      // İLK ÖNCE BASIT VERİYİ AL, SONRA COMPLEX VERİYİ
      const { data: simplePosts } = await Promise.race([simplePostsPromise, timeoutPromise])
      
      // Eğer basit veriler gelirse hemen göster
      if (simplePosts && simplePosts.length > 0) {
        console.log('⚡ Hızlı veriler yüklendi:', simplePosts.length, 'post')
        const quickSlides = simplePosts.slice(0, 10).map(post => ({
          id: post.id,
          title: post.title,
          subtitle: post.excerpt,
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          category: post.category_name,
          category_color: '#3B82F6',
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name
        }))
        setHeroSlides(quickSlides)
        setLoading(false) // HEMEN GÖSTER
      }
      
      // ŞIMDI COMPLEX VERİLERİ ÇEK (ARKA PLANDA) - Fallback durumunda skip et
      try {
        const [
          complexMainPostsResult,
          complexMostReadPostsResult,
          complexRecommendedPostsResult,
          complexEditorPostsResult
        ] = await Promise.race([complexDataPromise, timeoutPromise])
        
        console.log('📝 Complex veri sonuçları:', {
          mainPosts: complexMainPostsResult.data?.length || 0,
          mostRead: complexMostReadPostsResult.data?.length || 0,
          recommended: complexRecommendedPostsResult.data?.length || 0,
          editor: complexEditorPostsResult.data?.length || 0
        })
        
        // HATA DETAYLARI
        if (complexMainPostsResult.error) console.error('Complex Main Posts Error:', complexMainPostsResult.error)
        if (complexMostReadPostsResult.error) console.error('Complex Most Read Error:', complexMostReadPostsResult.error)
        if (complexRecommendedPostsResult.error) console.error('Complex Recommended Error:', complexRecommendedPostsResult.error)
        if (complexEditorPostsResult.error) console.error('Complex Editor Posts Error:', complexEditorPostsResult.error)
        
        const { data: mainPosts, error: mainError } = complexMainPostsResult
        const { data: mostReadPosts, error: mostReadError } = complexMostReadPostsResult
        const { data: recommendedPosts, error: recommendedError } = complexRecommendedPostsResult
        const { data: editorPosts, error: editorError } = complexEditorPostsResult
      
      if (!mainError && mainPosts && mainPosts.length > 0) {
        // Blog verilerini carousel formatına çevir
        const formattedSlides = mainPosts.map(post => ({
          id: post.id,
          title: post.title,
          subtitle: post.excerpt,
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
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
            // Ana Sayfa etiketli haberlerin ID'lerini al
            const existingIds = formattedSlides.map(slide => slide.id)
            
            // Son haberlerden Ana Sayfa etiketli olmayanları filtrele
            const additionalPosts = latestPosts
              .filter(post => !existingIds.includes(post.id))
              .slice(0, 10 - formattedSlides.length)
              .map(post => ({
                id: post.id,
                title: post.title,
                subtitle: post.excerpt,
                image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
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
          const formattedSlides = latestPosts.map(post => ({
            id: post.id,
            title: post.title,
            subtitle: post.excerpt,
            image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
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

      // Bu kısım kaldırıldı - çakışma yaratıyordu
      // mostReadPosts zaten yukarıda encokokunan etiketi ile yükleniyor

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
        // setRecommendedNews kaldırıldı
      }

      if (!editorError && editorPosts && editorPosts.length > 0) {
        // Editörün Yorumu verilerini formatla
        const formattedEditorPosts = editorPosts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || 'Editörümüzden özel yorum ve öneriler...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          date: formatDate(post.published_at || post.created_at),
          category_slug: post.category_slug,
          slug: post.slug,
          author_name: post.author_name || 'Editör'
        }))
        setEditorCommentPosts(formattedEditorPosts)
      } else {
        // Fallback static data
        setEditorCommentPosts(getStaticEditorCommentPosts())
      }
      } catch (complexError) {
        console.log('⚠️ Complex data yüklenemedi, basit verilerle devam:', complexError.message)
        // Basit veriler zaten yüklendi, complex data olmasa da devam
      }
    } catch (error) {
      console.error('❌ Ana sayfa haberleri yüklenemedi:', error)
      console.error('🔗 Supabase bağlantı durumu:', error.message)
      
      // TIMEOUT veya HATA durumunda fallback static veriler yükle
      console.log('🔄 Fallback static veriler yükleniyor...')
      setHeroSlides([])
      // setMostReadNews(getStaticMostReadNews()) - Kaldırıldı: artık dinamik olarak çekiliyor
      setMostReadNews([])
      setRecommendedNews(getStaticRecommendedNews())
      setEditorCommentPosts(getStaticEditorCommentPosts())
      
      // Kullanıcıya bilgi ver
      if (error.message.includes('timeout')) {
        console.log('⏰ Supabase yavaş yanıt veriyor, static veriler gösteriliyor')
      }
    } finally {
      console.log('✅ Loading tamamlandı')
      setLoading(false)
    }
  }



  // Fallback static data for hero slides
  const getStaticHeroSlides = () => [
    {
      id: 'static-1',
      title: 'İspanya Gezi Rehberi | Tarih, Kültür ve Doğanın Muhteşem Uyumu',
      subtitle: 'İspanya\'nın büyüleyici şehirlerini keşfedin',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      category: 'Destinasyonlar',
      category_color: '#3B82F6',
      category_slug: 'destinasyonlar',
      slug: 'ispanya-gezi-rehberi',
      views: 1250,
      likes: 89,
      published_at: new Date().toISOString(),
      author_name: 'JoinEscapes Editör'
    },
    {
      id: 'static-2',
      title: 'Maldivler | Tropikal Cennet Keşfi',
      subtitle: 'Kristal berraklığındaki suların büyüsü',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      category: 'Lüks Seçkiler',
      category_color: '#F59E0B',
      category_slug: 'luks-seckiler',
      slug: 'maldivler-tropikal-cennet',
      views: 2100,
      likes: 156,
      published_at: new Date().toISOString(),
      author_name: 'JoinEscapes Editör'
    },
    {
      id: 'static-3',
      title: 'Paris | Aşk Şehrinin Sırları',
      subtitle: 'Romantizmin kalbi Paris\'te atıyor',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      category: 'Şehir Keşifleri',
      category_color: '#10B981',
      category_slug: 'sehir-molalari',
      slug: 'paris-ask-sehrinin-sirlari',
      views: 1850,
      likes: 134,
      published_at: new Date().toISOString(),
      author_name: 'JoinEscapes Editör'
    }
  ]

  // Fallback static data for most read news - REMOVED: Artık dinamik olarak çekiliyor

  // Fallback static data for recommended news
  const getStaticRecommendedNews = () => [
    {
      id: 4,
      title: '2025\'in ilk çeyreğinde otel yatırımlarında büyük düşüş',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false
    },
    {
      id: 5,
      title: '2025\'in ilk dört ayında hangi pazarlarda artış ve düşüş yaşandı?',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false
    },
    {
      id: 6,
      title: 'İşte 2025\'in ilk dört ayında sektörden toplanan TGA payı ve konaklama vergisi',
      category: 'BUNLARI OKUDUNUZ MU?',
      isHighlight: false
    }
  ]

  // Fallback static data for editor comment posts
  const getStaticEditorCommentPosts = () => [
    {
      id: 1,
      title: 'Türkiye Turizm Sezonu Rekorla Açıldı',
      excerpt: '2024 yılının ilk yarısında turist sayısında %25 artış kaydedildi...',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      date: '15 Mayıs 2024',
      category_slug: 'sektor-haberleri',
      slug: 'turkiye-turizm-sezonu-rekorla-acildi',
      author_name: 'Editör'
    },
    {
      id: 2,
      title: 'Yeni Seyahat Trendleri: Sürdürülebilir Turizm',
      excerpt: 'Çevre dostu seyahat seçenekleri giderek daha popüler hale geliyor...',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      date: '12 Mayıs 2024',
      category_slug: 'trendler',
      slug: 'yeni-seyahat-trendleri-surdurulebilir-turizm',
      author_name: 'Editör'
    },
    {
      id: 3,
      title: 'Dijital Nomadlar İçin En İyi Destinasyonlar',
      excerpt: 'Uzaktan çalışma imkanı sunan şehirler listesi güncellendi...',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      date: '10 Mayıs 2024',
      category_slug: 'destinasyon',
      slug: 'dijital-nomadlar-icin-en-iyi-destinasyonlar',
      author_name: 'Editör'
    }
  ]

  // YouTube videos state - Ana sayfada admin panelden eklenen videolar gösterilecek
  const [youtubeVideos, setYoutubeVideos] = useState([])

  // Admin panelden eklenen YouTube videolarını yükle - Supabase version
  useEffect(() => {
    const loadYouTubeVideos = async () => {
      try {
        // Supabase'den videoları çek
        const { youtubeVideoService } = await import('../lib/youtubeSupabase')
        const { data, error } = await youtubeVideoService.getAll()
        
        if (!error && data) {
          setYoutubeVideos(data)
        } else {
          console.error('YouTube videoları yüklenemedi:', error)
          setYoutubeVideos([])
        }
      } catch (error) {
        console.error('YouTube videoları yüklenemedi:', error)
        setYoutubeVideos([])
      }
    }

    loadYouTubeVideos()

    // Custom event listener for same-tab updates (admin panelden video eklendiğinde)
    const handleVideoUpdate = () => {
      loadYouTubeVideos()
    }
    
    window.addEventListener('youtube-videos-updated', handleVideoUpdate)

    return () => {
      window.removeEventListener('youtube-videos-updated', handleVideoUpdate)
    }
  }, [])

  // Fallback default videos eğer admin panelden video eklenmemişse
  const getDefaultVideos = () => [
    // Statik videolar kaldırıldı - sadece admin panelden eklenen videolar gösterilecek
  ]

  const sideNews = [
    // Static "EN ÇOK OKUNANLAR" ve "BUNLARI OKUDUNUZ MU?" verileri kaldırıldı - artık dinamik olarak çekiliyor
  ]

  // Tarih formatı
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // 5 seconds

    return () => clearInterval(timer)
  }, [heroSlides.length])


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % visibleSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const featuredDestinations = [
    {
      id: 1,
      name: 'Burj Al Arab',
      country: 'Dubai, Birleşik Arap Emirlikleri',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      description: 'Dünyanın en lüks otellerinden biri, yelken şeklindeki ikonik mimarisi ile.',
      groupSize: '2-4 Kişi',
      duration: '3-5 Gün'
    },
    {
      id: 2,
      name: 'The Ritz Paris',
      country: 'Fransa',
      image: '/images/The Ritz Paris – Fransa.webp',
      rating: 4.8,
      description: 'Place Vendôme\'deki efsanevi otel, Fransız lüksünün ve zarafetin simgesi.',
      groupSize: '2-4 Kişi',
      duration: '2-4 Gün'
    },
    {
      id: 3,
      name: 'Aman Tokyo',
      country: 'Japonya',
      image: '/images/Aman Tokyo Hotel – Japonya.webp',
      rating: 4.9,
      description: 'Otemachi\'deki minimalist lüks, geleneksel Japon estetiği ile modern konfor.',
      groupSize: '2-4 Kişi',
      duration: '3-5 Gün'
    }
  ]



  const cheapFlights = [
    {
      id: 1,
      from: 'İstanbul',
      to: 'Paris',
      airline: 'Turkish Airlines',
      duration: '3s 45d',
      image: '/images/istanbul_paris_join_escapes.webp',
      action: 'Keşfet'
    },
    {
      id: 2,
      from: 'Ankara',
      to: 'Londra',
      airline: 'Pegasus',
      duration: '4s 20d',
      image: '/images/londra_join_escapes_travel_.webp',
      action: 'Keşfet'
    },
    {
      id: 3,
      from: 'İzmir',
      to: 'Amsterdam',
      airline: 'KLM',
      duration: '3s 55d',
      image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      action: 'Keşfet'
    }
  ]

  const gourmetRoutes = [
    {
      id: 1,
      destination: 'Tokyo',
      country: 'Japonya',
      specialty: 'Sushi & Ramen',
      michelin: '3 Michelin Yıldızı',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      action: 'Keşfet'
    },
    {
      id: 2,
      destination: 'Paris',
      country: 'Fransa',
      specialty: 'French Cuisine',
      michelin: '2 Michelin Yıldızı',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      action: 'Keşfet'
    },
    {
      id: 3,
      destination: 'İstanbul',
      country: 'Türkiye',
      specialty: 'Ottoman Cuisine',
      michelin: '1 Michelin Yıldızı',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      action: 'Keşfet'
    }
  ]

  const visaFreeRoutes = [
    {
      id: 1,
      destination: 'Gürcistan',
      country: 'Tiflis',
      duration: '90 gün vizesiz',
      image: '/images/gurcistan_join_escapes.webp',
      highlight: 'Pasaportla Giriş',
      action: 'Keşfet'
    },
    {
      id: 2,
      destination: 'Sırbistan',
      country: 'Belgrad',
      duration: '90 gün vizesiz',
      image: '/images/sırbistan_join_escapes_.webp',
      highlight: 'Pasaportla Giriş',
      action: 'Keşfet'
    },
    {
      id: 3,
      destination: 'Karadağ',
      country: 'Podgorica',
      duration: '90 gün vizesiz',
      image: '/images/karadag_sveti_stefan_join_escapes_.webp',
      highlight: 'Pasaportla Giriş',
      action: 'Keşfet'
    }
  ]

  const cruiseRoutes = [
    {
      id: 1,
      destination: 'Akdeniz Cruise',
      route: 'İstanbul → Yunanistan → İtalya → Fransa',
      duration: '7 gece',
      image: '/images/cruise_gemi_akdeniz_.webp',
      ship: 'MSC Splendida',
      action: 'Keşfet'
    },
    {
      id: 2,
      destination: 'Ege Cruise',
      route: 'İzmir → Santorini → Mykonos',
      duration: '5 gece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      ship: 'Celebrity Edge',
      action: 'Keşfet'
    },
    {
      id: 3,
      destination: 'Karadeniz Cruise',
      route: 'İstanbul → Odessa → Soçi',
      duration: '6 gece',
      image: '/images/cruise_gemi_join_escapes_.webp',
      ship: 'Royal Caribbean',
      action: 'Keşfet'
    }
  ]

  const soloTravelers = [
    {
      id: 1,
      destination: 'Thailand',
      country: 'Bangkok & Phuket',
      duration: 'Solo Adventure',
      image: '/images/thailand_join_escapes_travel.webp',
      highlight: 'Backpacker Friendly',
      action: 'Keşfet'
    },
    {
      id: 2,
      destination: 'Japonya',
      country: 'Tokyo & Kyoto',
      duration: 'Cultural Journey',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      highlight: 'Solo Women Safe',
      action: 'Keşfet'
    },
    {
      id: 3,
      destination: 'İzlanda',
      country: 'Reykjavik',
      duration: 'Nature Explorer',
      image: '/images/izlanda_join_escapes_travel.webp',
      highlight: 'Aurora Borealis',
      action: 'Keşfet'
    }
  ]

  const couplesSpecial = [
    {
      id: 1,
      destination: 'Marrakech',
      country: 'Fas',
      duration: 'Romantic Getaway',
      image: '/images/marrakech_seyahat_rehberi_.webp',
      highlight: 'Sunset Views',
      action: 'Keşfet'
    },
    {
      id: 2,
      destination: 'Maldivler',
      country: 'Overwater Villa',
      duration: 'Honeymoon Special',
      image: '/images/maldivler_join_escapes_couple.webp',
      highlight: 'Private Beach',
      action: 'Keşfet'
    },
    {
      id: 3,
      destination: 'Paris',
      country: 'Fransa',
      duration: 'City of Love',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      highlight: 'Couple Massage',
      action: 'Keşfet'
    }
  ]

  // Quiz questions data
  const quizQuestions = [
    {
      id: 1,
      question: 'Bütçeniz ne kadar?',
      options: [
        { id: 'budget_low', text: 'Ekonomik', subtitle: '₺2.000 - ₺5.000', emoji: '💰' },
        { id: 'budget_mid', text: 'Orta Seviye', subtitle: '₺5.000 - ₺15.000', emoji: '💳' },
        { id: 'budget_high', text: 'Lüks', subtitle: '₺15.000+', emoji: '💎' }
      ]
    },
    {
      id: 2,
      question: 'Nasıl bir tatil istiyorsunuz?',
      options: [
        { id: 'type_beach', text: 'Deniz & Güneş', emoji: '🏖️' },
        { id: 'type_culture', text: 'Kültür & Tarih', emoji: '🏛️' },
        { id: 'type_nature', text: 'Doğa & Macera', emoji: '🏔️' },
        { id: 'type_city', text: 'Şehir & Gece', emoji: '🌃' }
      ]
    },
    {
      id: 3,
      question: 'Vize durumu tercihiniz?',
      options: [
        { id: 'visa_free', text: 'Vizesiz Ülkeler', subtitle: 'Pasaportla seyahat', emoji: '🛂' },
        { id: 'visa_ok', text: 'Vize Gerekli Olabilir', subtitle: 'Daha fazla seçenek', emoji: '📋' }
      ]
    },
    {
      id: 4,
      question: 'Tatil süreniz ne kadar?',
      options: [
        { id: 'duration_short', text: '2-3 Gün', subtitle: 'Kısa kaçamak', emoji: '⚡' },
        { id: 'duration_week', text: '4-7 Gün', subtitle: 'Hafta sonu+', emoji: '📅' },
        { id: 'duration_long', text: '1-2 Hafta', subtitle: 'Klasik tatil', emoji: '🗓️' },
        { id: 'duration_extended', text: '2+ Hafta', subtitle: 'Uzun seyahat', emoji: '🌍' }
      ]
    },
    {
      id: 5,
      question: 'Hangi mevsimde seyahat etmek istiyorsunuz?',
      options: [
        { id: 'season_spring', text: 'İlkbahar', emoji: '🌸' },
        { id: 'season_summer', text: 'Yaz', emoji: '☀️' },
        { id: 'season_autumn', text: 'Sonbahar', emoji: '🍂' },
        { id: 'season_winter', text: 'Kış', emoji: '❄️' }
      ]
    }
  ]

  // Quiz helper functions
  const handleQuizAnswer = (questionId, answerId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  const goBackQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      // Remove the answer for the current question when going back
      setQuizAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[quizQuestions[currentQuestion].id]
        return newAnswers
      })
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setQuizAnswers({})
    setShowResult(false)
  }

  const getRecommendation = () => {
    // Simple recommendation logic based on answers
    const answers = quizAnswers
    
    if (answers[2] === 'type_beach') {
      return {
        destination: 'Antalya, Türkiye',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        description: 'Turkuaz sular, altın kumlar ve muhteşem oteller ile mükemmel bir deniz tatili sizi bekliyor!'
      }
    } else if (answers[2] === 'type_culture') {
      return {
        destination: 'İstanbul, Türkiye',
        image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        description: 'Tarihi yarımada, müzeler ve kültürel zenginlikler ile unutulmaz bir deneyim yaşayacaksınız!'
      }
    } else if (answers[2] === 'type_nature') {
      return {
        destination: 'Kapadokya, Türkiye',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Peri bacaları, balon turları ve doğa harikası manzaralar ile büyülü bir macera!'
      }
    } else {
      return {
        destination: 'Bodrum, Türkiye',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        description: 'Marina, gece hayatı ve lüks oteller ile şehirli bir tatil deneyimi!'
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
          
      {/* Top Banner Ads */}
      <section className="bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two Banner Ads Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            
            {/* Left Banner Ad - Ajet */}
            <a 
              href="https://ajet.com/tr"
              target="_blank"
              rel="noopener noreferrer"
              className="adsense-top-banner relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567890"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '728px',
                height: '90px',
                maxWidth: '100%'
              }}
            >
              <img 
                src="/images/Ajet_yeni_reklam.webp" 
                alt="Ajet Reklam"
                className="w-full h-full object-contain bg-white hover:scale-105 transition-transform duration-300"
                style={{
                  width: '728px',
                  height: '90px'
                }}
              />
            </a>

            {/* Right Banner Ad - Rixos */}
            <a 
              href="https://allinclusive-collection.com/tr/hotel/rixos-radamis-sharm-el-sheikh/?utm_source=facebook&utm_medium=cpc&utm_campaign=[Reach]+-+Rixos+Radamis++-+2+Kids+Free+-+TR+-+IG&utm_content=T%C3%BCrkiye&utm_id=120226465279010313_v2_s04&utm_term=120226465278990313&fbclid=PAZXh0bgNhZW0BMABhZGlkAasjTjMJ7rkBpxlMqox_yAVkFCknQHGZV_tJhdlFKolQugScqwi_X0khx8DtvhghLDK8aQaw_aem_rYH2yZcjYotr2k5ywKv7sw"
              target="_blank"
              rel="noopener noreferrer"
              className="adsense-top-banner relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
              data-ad-client="ca-pub-9097929594228195"
              data-ad-slot="1234567891"
              data-ad-format="leaderboard"
              data-full-width-responsive="true"
              style={{
                display: 'block',
                width: '728px',
                height: '90px',
                maxWidth: '100%'
              }}
            >
              <img 
                src="/images/rixos_reklam.webp" 
                alt="Rixos Reklam"
                className="w-full h-full object-contain bg-white hover:scale-105 transition-transform duration-300"
                style={{
                  width: '728px',
                  height: '90px'
                }}
              />
            </a>

          </div>
        </div>
      </section>

      {/* Hero Section - Split Layout */}
      <section className="bg-gray-100 py-8" aria-label="Ana haberler">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-8">
            
            {/* Left Side - Main News Slider */}
            <div className="col-span-1 lg:col-span-2">
              {loading ? (
                <SkeletonLoader type="carousel" className="h-64 sm:h-80 lg:h-[500px]" />
              ) : visibleSlides.length > 0 ? (
                <div className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-xl">
                  {/* Slides */}
                  <div className="relative h-full">
                      {visibleSlides.map((slide, index) =>
                        slide.category_slug && slide.slug ? (
                                <Link
        key={slide.id}
          to={`/${slide.category_slug}/${slide.slug}`}
          className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer block ${
          index === currentSlide ? 'opacity-100' : 'opacity-0'
        }`}
      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
                          style={{ 
                            backgroundImage: `url(${slide.image})`,
                            backgroundSize: 'cover',
                            willChange: 'auto'
                          }}
                        >
                          {/* Preload sadece aktif slide için */}
                          {index === currentSlide && (
                            <img 
                              src={slide.image} 
                              alt="" 
                              className="invisible absolute inset-0 w-full h-full object-cover"
                              loading="eager"
                              decoding="async"
                            />
                          )}
                        </div>
                        
                          <div className="relative z-10 h-full flex items-end p-2 sm:p-8">
                            {/* Alt alan için siyah bant - başlık ve kontrolleri kaplıyor */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-xl h-[55px] sm:h-[105px]"></div>
                            
                            <div className="text-white max-w-4xl relative z-10 text-left">
                              <h1 className="font-bold mb-4 sm:mb-8 leading-tight text-white text-base sm:text-xl lg:text-3xl line-clamp-1 overflow-hidden" style={{transform: isMobile ? 'translateY(-12px)' : 'translateY(3px)'}}>
                              {slide.title}
                            </h1>
                                </div>
                                </div>
                                </Link>
                              ) : (
                        <div
                          key={slide.id}
                          className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
                            style={{ 
                              backgroundImage: `url(${slide.image})`,
                              backgroundSize: 'cover',
                              willChange: 'auto'
                            }}
                          >
                            {/* Preload sadece aktif slide için */}
                            {index === currentSlide && (
                              <img 
                                src={slide.image} 
                                alt="" 
                                className="invisible absolute inset-0 w-full h-full object-cover"
                                loading="eager"
                                decoding="async"
                              />
                            )}
                          </div>
                          
                          <div className="relative z-10 h-full flex items-end p-2 sm:p-8">
                            {/* Alt alan için siyah bant - başlık ve kontrolleri kaplıyor */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-xl h-[55px] sm:h-[105px]"></div>
                            
                            <div className="text-white max-w-4xl relative z-10 text-left">
                              <h1 className="font-bold mb-4 sm:mb-8 leading-tight text-white text-base sm:text-xl lg:text-3xl line-clamp-1 overflow-hidden" style={{transform: isMobile ? 'translateY(-12px)' : 'translateY(3px)'}}>
                                {slide.title}
                              </h1>
                            </div>
                          </div>
                        </div>
                       )
                      )}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="carousel-indicator absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-2 rounded-full transition-all duration-200 z-20"
                    aria-label="Önceki haber"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5" aria-hidden="true" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="carousel-indicator absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-2 rounded-full transition-all duration-200 z-20"
                    aria-label="Sonraki haber"
                  >
                    <ChevronRight className="h-3 w-3 sm:h-5 sm:w-5" aria-hidden="true" />
                  </button>

                  {/* Bottom Controls - News sayfası gibi responsive */}
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
                          <span className="text-xs text-white whitespace-nowrap leading-none" style={{fontSize: '0.6rem'}}>{formatDate(visibleSlides[currentSlide].published_at)}</span>
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
                                <span className="text-xs whitespace-nowrap">{formatDate(visibleSlides[currentSlide].published_at)}</span>
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
                </div>
              ) : (
                <div className="relative h-64 sm:h-80 lg:h-[500px] bg-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">📰</div>
                    <div className="text-sm sm:text-base">Ana sayfa haberi bulunamadı</div>
                    <div className="text-xs sm:text-sm mt-1 sm:mt-2">Admin panelden "Ana Sayfa" etiketli haber ekleyin</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - News List */}
            <div className="col-span-1 lg:col-span-1">
              <div className="h-80 sm:h-96 lg:h-[500px] flex flex-col gap-2 sm:gap-4">
                
                {/* Most Read Section - 5 yazı görünür, fazlası scroll */}
                <div className="flex-[2] flex flex-col min-h-0">
                  <div className="bg-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm sm:text-base">EN ÇOK OKUNANLAR</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg flex-1 overflow-y-auto min-h-0 max-h-96 sm:max-h-96">
                    {loading ? (
                      <div className="p-3 sm:p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="animate-pulse">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : mostReadNews.length > 0 ? (
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
                      <p className="p-3 sm:p-4 text-gray-500 text-sm">Henüz okunacak yazı bulunmuyor.</p>
                    )}
                  </div>
                </div>

                {/* Özel Fırsatlar - Kısa ve eşit yükseklik */}
                <div className="flex-[1.2] flex flex-col">
                  <div className="bg-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
                    <h3 className="font-bold text-sm sm:text-base">ÖZEL FIRSATLAR</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6" style={{ height: 'calc(100% - 60px)' }}>
                    <div 
                      className="adsense-sidebar relative overflow-hidden rounded-lg shadow-md"
                      data-ad-client="ca-pub-9097929594228195"
                      data-ad-slot="1234567895"
                      data-ad-format="banner"
                      data-full-width-responsive="true"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '105px'
                      }}
                    >
                      <img 
                        src="/images/ozel-firsatlar2.png" 
                        alt="Özel Fırsatlar"
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Join Community Section */}
      <section className="py-4 md:py-7 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-4">
            <h2 className="text-xl md:text-xl font-bold text-gray-900 mb-2">
              Join Community
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-start gap-3 sm:gap-4 md:gap-2">
            {featuredWriters.length > 0 ? (
              featuredWriters.map((writer) => {
                // Database'den gelen slug'ı kullan (name'den üretme!)
                const slug = writer.slug || writer.name?.toLowerCase()
                  .replace(/ğ/g, 'g')
                  .replace(/ü/g, 'u')
                  .replace(/ş/g, 's')
                  .replace(/ı/g, 'i')
                  .replace(/ö/g, 'o')
                  .replace(/ç/g, 'c')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim() || 'yazar'

                return (
                  <Link 
                    key={writer.id} 
                    to={`/yazar/${slug}`} 
                    className="text-center group cursor-pointer"
                  >
                    <div className="relative mb-2">
                      {writer.profile_image ? (
                        <img 
                          src={writer.profile_image} 
                          alt={writer.name}
                          className="w-14 h-14 sm:w-17 sm:h-17 md:w-20 md:h-20 rounded-full object-cover mx-auto shadow-lg ring-4 ring-white group-hover:ring-primary-200 transition-all duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-14 h-14 sm:w-17 sm:h-17 md:w-20 md:h-20 rounded-full mx-auto shadow-lg ring-4 ring-white group-hover:ring-primary-200 transition-all duration-300 group-hover:scale-105 flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl ${writer.profile_image ? 'hidden' : 'flex'}`}
                        style={{ backgroundColor: '#3B82F6' }}
                      >
                        {writer.name?.charAt(0)?.toUpperCase() || 'J'}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {writer.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {writer.title || 'Editör & Seyahat Yazarı'}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="w-full text-center py-8">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Henüz öne çıkan yazar yok</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-6 md:mt-6">
            <Link 
              to="/yazarlar"
              className="inline-flex items-center px-4 py-2 md:px-3 md:py-1.5 border border-transparent rounded-lg shadow-sm text-xs md:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              Tüm Yazarları Keşfet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Travel Inspiration Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Özenle Seçilmiş Seyahat İlhamı
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Large Card - Sanat ve Cemiyet */}
            <Link to="/sanat-ve-cemiyet" className="lg:row-span-2 relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="/images/celebrity_destinations_join_escapes_2_.webp" 
                alt="Sanat ve Cemiyet"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 relative z-10 drop-shadow-2xl">Sanat ve Cemiyet</h3>
              </div>
            </Link>

            {/* City Breaks */}
            <Link to="/sehir-molalari" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="/images/city_italy.webp" 
                alt="Şehir Molaları"
                className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Şehir Molaları</h3>
              </div>
            </Link>

            {/* The Luxe Edit */}
            <Link to="/luks" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="/images/lux_seckiler_join_escapes.webp" 
                alt="Lüks Seçkiler"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Lüks Seçkiler</h3>
              </div>
            </Link>

            {/* Spa Breaks */}
                            <Link to="/spa-molalari" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="/images/spa-malaga-cabecera.webp" 
                alt="Spa Molaları"
                className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Spa Molaları</h3>
              </div>
            </Link>

            {/* Summer 2025 */}
            <Link to="/yaz-2025" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Yaz 2025"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Yaz 2025</h3>
              </div>
            </Link>

            {/* Budget Hotels */}
                            <Link to="/butik-oteller" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Butik Oteller"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Butik Oteller</h3>
              </div>
            </Link>

            {/* Package Holidays */}
                            <Link to="/paket-tatiller" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 group cursor-pointer block">
              <img 
                src="/images/paket_tatiller_her_sey_dahil_tatil_.webp" 
                alt="Paket Tatiller"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-2xl"></div>
                <h3 className="text-xl font-bold relative z-10 drop-shadow-2xl">Paket Tatiller</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>





      {/* Seyahat Bulucu Section */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
        <TravelFinder />
      </Suspense>

      {/* YouTube Video Section */}
      {youtubeVideos.length > 0 && (
      <section className="pt-16 pb-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Video - Left Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                      src={`https://www.youtube.com/embed/${youtubeVideos[currentVideo]?.video_id || 'FLNg5aQb9rk'}`}
                      title={youtubeVideos[currentVideo]?.title || 'YouTube Video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {youtubeVideos[currentVideo]?.title || 'Video Başlığı'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                      {youtubeVideos[currentVideo]?.description || 'Video açıklaması'}
                  </p>
                                      {/* Video stats removed as requested */}
                </div>
              </div>
            </div>

            {/* Playlist - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Join Escapes Playlist</h4>
                
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  
                  {youtubeVideos.map((video, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentVideo(index)}
                      className={`flex space-x-3 cursor-pointer p-2 rounded-lg transition-colors ${
                        index === currentVideo 
                          ? 'bg-primary-50 border border-primary-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 relative">
                        <img 
                          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`} 
                          alt="Video Thumbnail"
                          className="w-20 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`
                          }}
                        />
                        {index === currentVideo && (
                          <div className="absolute inset-0 bg-primary-600/20 rounded flex items-center justify-center">
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`text-sm font-medium line-clamp-2 ${
                          index === currentVideo ? 'text-primary-700' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h5>
                      </div>
                    </div>
                  ))}

                </div>

                <div className="mt-6">
                  <a 
                    href="https://www.youtube.com/@JoinContentsTV" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors block text-center"
                  >
                    Kanala Git
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      )}



      {/* Featured Hotels */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                En Seçkin Oteller
              </h2>
              <p className="text-xl text-gray-300">
                Dünya genelindeki en lüks ve prestijli oteller
              </p>
            </div>
            <Link to="/oteller" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center hidden md:inline-flex">
              Tüm Oteller
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination) => {
              // Burj Al Arab için özel link
              if (destination.name === 'Burj Al Arab') {
                return (
                  <Link 
                    key={destination.id} 
                    to="/seyahat-rehberi/luksun-tanimi-burj-al-arab-deneyimi"
                    className="card group cursor-pointer block"
                  >
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{destination.country}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-3">{destination.description}</p>
                  
                  
                  <div className="flex justify-end items-center">
                    <button className="btn-primary">Detaylar</button>
                  </div>
                </div>
                  </Link>
                );
              }
              
              // The Ritz Paris için özel link
              if (destination.name === 'The Ritz Paris') {
                return (
                  <Link 
                    key={destination.id} 
                    to="/destinasyon/the-ritz-paris-zarafetin-ve-tarihin-kesistigi-efsanevi-konaklama-deneyimi"
                    className="card group cursor-pointer block"
                  >
                    <div className="relative overflow-hidden">
                      <LazyImage 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{destination.rating}</span>
              </div>
          </div>
                    <div className="p-5">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{destination.country}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                      <p className="text-gray-600 mb-3">{destination.description}</p>
                      

                      <div className="flex justify-end items-center">
                        <button className="btn-primary">Detaylar</button>
                      </div>
                    </div>
                  </Link>
                );
              }
              
              // Aman Tokyo için özel link
              if (destination.name === 'Aman Tokyo') {
                return (
                  <Link 
                    key={destination.id} 
                    to="/destinasyon/aman-tokyo-minimalizmin-ve-luksun-kusursuz-bulusmasi"
                    className="card group cursor-pointer block"
                  >
                    <div className="relative overflow-hidden">
                      <LazyImage 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{destination.rating}</span>
              </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{destination.country}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                      <p className="text-gray-600 mb-3">{destination.description}</p>
                      
                      
                      <div className="flex justify-end items-center">
                        <button className="btn-primary">Detaylar</button>
                      </div>
                    </div>
                  </Link>
                );
              }
              
              // Diğer kartlar için normal div
              return (
              <div key={destination.id} className="card group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
              </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{destination.country}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-3">{destination.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{destination.duration}</span>
            </div>
                  </div>
                  
                  <div className="flex justify-end items-center">
                    <button className="btn-primary">Detaylar</button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Link to="/oteller" className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
              Tüm Otelleri Gör
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* KAYAKAPI Premium Caves Banner Ads */}
          <div className="mt-12">

          </div>
        </div>
      </section>

      {/* Cheap Flight Routes */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Split Layout: Cheap Flights + Gourmet Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Side - Cheap Flight Routes */}
            <div>
              <div className="mb-10">
                <Link to="/ucuz-ucus-rotalari">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer">
                  Ucuz Uçuş Rotaları
                </h2>
                </Link>
                <p className="text-xl text-gray-600">
                  En uygun fiyatlı uçuş seçenekleri
                </p>
              </div>
              
              <div className="space-y-4">
                {cheapFlights.slice(0, 3).map((flight) => (
                  <div key={flight.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group h-32 md:h-32">
                    <div className="flex h-full">
                      <div className="relative w-40 h-full flex-shrink-0">
                        <img 
                          src={flight.image} 
                          alt={`${flight.from} - ${flight.to}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        </div>
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <div className="flex items-center space-x-1 md:space-x-2 mb-1">
                            <span className="text-sm md:text-base font-bold text-gray-900">{flight.from}</span>
                              <div className="flex items-center">
                              <div className="w-1 md:w-2 h-px bg-gray-300"></div>
                              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mx-0.5"></div>
                              <div className="w-1 md:w-2 h-px bg-gray-300"></div>
                              </div>
                            <span className="text-sm md:text-base font-bold text-gray-900">{flight.to}</span>
                            </div>
                          <div className="hidden md:block">
                            <div className="text-xs text-gray-500">Süre: {flight.duration}</div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                          <Link to="/ucuz-ucus-rotalari" className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                                {flight.action}
                              </Link>
                            </div>
                          </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-6">
                  <Link to="/ucuz-ucus-rotalari" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                    Tüm Uçuşları Gör
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Gourmet Routes */}
            <div>
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Gurme Rotaları
                </h2>
                <p className="text-xl text-gray-600">
                  Michelin yıldızlı lezzet deneyimleri
                </p>
              </div>
              
              <div className="space-y-4">
                {gourmetRoutes.map((route) => (
                  <div key={route.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group h-32 md:h-32">
                    <div className="flex h-full">
                      <div className="relative w-40 h-full flex-shrink-0">
                        <img 
                          src={route.image} 
                          alt={route.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        </div>
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{route.destination}</h3>
                          <p className="text-xs md:text-sm text-gray-500 leading-tight break-words">{route.country}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
                            <span className="text-xs font-medium text-gray-700">{route.specialty}</span>
                      </div>
                            </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                          <Link to="/gurme-rotalari" className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                                {route.action}
                              </Link>
                            </div>
                          </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-6">
                  <Link to="/gurme-rotalari" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                    Tüm Gurme Turları
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>


        </div>
      </section>

      {/* Summer Sale Countdown Banner */}
      <section 
        className="py-8 relative bg-cover bg-center bg-no-repeat bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"
        style={{
          backgroundImage: 'url(/images/kultur2.webp)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-center items-center min-h-[300px]">
            
            {/* Center - Culture Tour Title and Description */}
            <div className="text-center text-white max-w-4xl">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl">
                Kültür Turları
              </h3>
              <p className="text-xl md:text-2xl mb-8 font-medium drop-shadow-xl leading-relaxed">
                Avrupa'nın büyüleyici şehirlerinde tarihi ve kültürel zenginlikleri keşfedin. <br/>
                Müzeler, sanat galerileri ve antik yapılarla dolu unutulmaz bir yolculuk sizi bekliyor.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href="/destinasyonlar"
                  className="group relative bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:from-blue-600 hover:to-blue-800 hover:shadow-2xl hover:-translate-y-1 inline-block text-center"
                >
                  <span className="relative z-10">Kültür Turlarını İncele</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <a 
                  href="/destinasyonlar"
                  className="group relative bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:from-blue-600 hover:to-blue-800 hover:shadow-2xl hover:-translate-y-1 inline-block text-center"
                >
                  <span className="relative z-10">Özel Rotalar</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visa-Free Routes & Cruise Routes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Split Layout: Visa-Free Routes + Cruise Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Side - Visa-Free Routes */}
            <div>
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Vizesiz Rotalar
                </h2>
                <p className="text-xl text-gray-600">
                  Sadece pasaportla seyahat edebileceğiniz rotalar
                </p>
              </div>
              
              <div className="space-y-4">
                {visaFreeRoutes.map((route) => (
                  <div key={route.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group h-32 md:h-32">
                    <div className="flex h-full">
                      <div className="relative w-40 h-full flex-shrink-0">
                        <img 
                          src={route.image} 
                          alt={route.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                          {route.highlight}
                        </div>
                      </div>
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{route.destination}</h3>
                          <p className="text-xs md:text-sm text-gray-500 leading-tight break-words">{route.country}</p>
                            </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                          <Link to="/vizesiz-rotalar" className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                                {route.action}
                              </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-6">
                  <Link to="/vizesiz-rotalar" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                    Tüm Vizesiz Rotalar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Cruise Routes */}
            <div>
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Cruise Rotaları
                </h2>
                <p className="text-xl text-gray-600">
                  Lüks cruise gemileriyle unutulmaz deniz yolculukları
                </p>
              </div>
              
              <div className="space-y-4">
                {cruiseRoutes.map((cruise) => (
                  <Link key={cruise.id} to="/cruise-rotalari" className="block">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group h-32 md:h-32 cursor-pointer">
                    <div className="flex h-full">
                      <div className="relative w-40 h-full flex-shrink-0">
                        <img 
                          src={cruise.image} 
                          alt={cruise.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                      </div>
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{cruise.destination}</h3>
                          <div className="text-xs md:text-sm text-gray-500 leading-tight">
                            {(() => {
                              const cities = cruise.route.split(' → ');
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span>{cities[0]}</span>
                                    <span>→</span>
                                    <span>{cities[1]}</span>
                            </div>
                                  {(cities[2] || cities[3]) && (
                                    <div className="flex items-center space-x-2">
                                      <span className="ml-4">→ {cities[2]}</span>
                                      {cities[3] && (
                                        <>
                                          <span>→</span>
                                          <span>{cities[3]}</span>
                                        </>
                                      )}
                            </div>
                                  )}
                          </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                            <div className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                            {cruise.action}
                        </div>
                      </div>
                    </div>
                  </div>
                    </div>
                  </Link>
                ))}
                
                <div className="text-center pt-6">
                  <Link to="/cruise-rotalari" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                    Tüm Cruise Turları
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Solo Travelers & Couples Special Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Side - Solo Travelers */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Solo Gezginler</h2>
                  <p className="text-gray-600 mt-2">Özgürce keşfet, kendi hızında yaşa, unutulmaz anılar biriktir</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                {soloTravelers.map((traveler) => (
                  <div key={traveler.id} className="group cursor-pointer bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden h-32 md:h-32">
                    <div className="flex h-full">
                      {/* Image */}
                      <div className="w-40 h-full flex-shrink-0">
                        <img 
                          src={traveler.image} 
                          alt={traveler.destination}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{traveler.destination}</h3>
                          <p className="text-xs text-gray-500 leading-tight break-words">{traveler.country}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
                            <span className="text-xs font-medium text-gray-700">{traveler.duration}</span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                          <Link to="/solo-gezginler" className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                                {traveler.action}
                              </Link>
                            </div>
                          </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link to="/solo-gezginler" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                  Tüm Solo Turları Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Side - Couples Special */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Çiftler İçin Özel</h2>
                  <p className="text-gray-600 mt-2">Romantik anlar, özel deneyimler, birlikte keşfedilecek güzel anılar</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                {couplesSpecial.map((couple) => (
                  <Link 
                    key={couple.id} 
                    to="/ciftler-icin-ozel"
                    className="group cursor-pointer bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden h-32 md:h-32 block"
                  >
                    <div className="flex h-full">
                      {/* Image */}
                      <div className="w-40 h-full flex-shrink-0">
                        <img 
                          src={couple.image} 
                          alt={couple.destination}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 md:pr-4">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{couple.destination}</h3>
                          <p className="text-xs text-gray-500 leading-tight break-words">{couple.country}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
                            <span className="text-xs font-medium text-gray-700">{couple.duration}</span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2 md:pt-0 md:flex-shrink-0">
                          <button className="bg-white hover:bg-gray-100 text-gray-800 px-5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200">
                                {couple.action}
                              </button>
                            </div>
                          </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/ciftler-icin-ozel" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
                >
                  Tüm Romantik Turları Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Editör Yorumu */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Editör Yorumu
              </h2>
              <p className="text-xl text-gray-600">
                Editörlerimizden özel yorumlar ve öneriler
              </p>
            </div>
            <Link to="/seyahat-onerileri" className="btn-primary hidden md:inline-flex">
              Tüm Yorumlar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <SkeletonLoader type="card" count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
            ) : editorCommentPosts.length > 0 ? (
              editorCommentPosts.map((post) => (
                <article key={post.id} className="card group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                    {post.category_slug && post.slug ? (
                      <Link 
                        to={`/${post.category_slug}/${post.slug}`}
                        className="block"
                      >
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors">
                          {post.title}
                  </h3>
                      </Link>
                    ) : (
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{post.excerpt}</p>
                    {post.category_slug && post.slug ? (
                      <Link 
                        to={`/${post.category_slug}/${post.slug}`}
                        className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                      >
                    Devamını Oku →
                      </Link>
                    ) : (
                      <span className="text-primary-600 font-medium">
                        Devamını Oku →
                      </span>
                    )}
                </div>
              </article>
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz editör yorumu yok</h3>
                <p className="text-gray-600">Admin panelden "Öneri" etiketli yazı ekleyin</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8 md:hidden px-4">
            <Link 
              to="/seyahat-onerileri" 
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-medium rounded-lg min-w-[200px]"
            >
              Tüm Yorumları Gör
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>



      {/* In-Feed AdSense Reklam */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Sponsorlu İçerik</div>
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9097929594228195" crossOrigin="anonymous"></script>
              <ins 
                className="adsbygoogle"
                style={{display: 'block'}}
                data-ad-format="fluid"
                data-ad-layout-key="-i9+e-x-3t+ad"
                data-ad-client="ca-pub-9097929594228195"
                data-ad-slot="1545937767"
              ></ins>
              <script>
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </script>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription - Professional Full Width */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white">
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Content */}
              <div className="p-12 lg:p-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Güncel Turizm Haberleri
              </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Sektörün en güncel haberlerini, analiz ve raporlarını e-posta adresinize ulaştırıyoruz.
              </p>

            {/* Subscription Form */}
                <form className="mb-8">
                  <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                        placeholder="E-posta adresinizi girin"
                        className="w-full px-4 py-4 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 font-semibold transition-all duration-300"
                >
                      ABONE OL
                </button>
                  </div>
              </form>
              
              {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-sm">Join Escapes Kampanya Duyuruları</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-sm">Günlük sektör haberleri ve analizler</span>
                </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-sm">Özel röportajlar ve derinlemesine haberler</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-sm">Sektör raporları ve istatistikler</span>
                </div>
              </div>

              {/* Privacy Note */}
                <p className="text-xs text-gray-500 mt-6">
                  E-posta adresiniz gizli tutulur. İstediğiniz zaman abonelikten çıkabilirsiniz.
              </p>
            </div>

              {/* Right Side - Mobile App */}
              <div className="bg-white p-12 lg:p-16 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <img
                    src="/images/join_escapes_mobil_app.webp"
                    alt="JoinEscapes Mobil Uygulaması"
                    className="w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Share Component */}
      <SocialShare
        title="JoinEscapes - Türkiye'nin En Kapsamlı Seyahat ve Destinasyon Rehberi"
        url={window.location.href}
        description="Eşsiz destinasyonlar, gurme rotalar, lüks oteller ve unutulmaz seyahat deneyimleri"
        hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Destinasyon']}
        variant="floating"
      />

    </div>
  )
}

export default Home