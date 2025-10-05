import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import SocialShare from '../components/SocialShare'

const News = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [mostReadPosts, setMostReadPosts] = useState([]) // En çok okunanlar için ayrı state
  const [recentPosts, setRecentPosts] = useState([]) // Tüm haberler için
  const [allPosts, setAllPosts] = useState([]) // Tüm haberler için
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(12)
  
  // SEO tags
  const seoTags = generateSEOTags('news')

  // Arama state'leri - basitleştirildi
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Yazar ismi gösterme fonksiyonu
  const getAuthorDisplayName = (authorName, authorId) => {
    // Eğer author_name "test" ise, gerçek yazar ismini döndür
    if (authorName === 'test') {
      // author_id'ye göre gerçek yazar ismini belirle
      if (authorId) {
        // Burada author_id'ye göre gerçek yazar ismini döndürebiliriz
        // Şimdilik sabit değerler kullanıyoruz
        return 'Join Escapes'
      }
      return 'Join Escapes'
    }
    
    // Eğer author_name varsa onu kullan
    if (authorName && authorName !== 'test') {
      return authorName
    }
    
    // Fallback
    return 'JoinEscapes'
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    console.log('📰 Haberler sayfası yükleniyor...')
    
    try {
      // DİREKT SUPABASEi'DEN VERİ ÇEK
      console.log('📡 Haberler için Supabase\'den veri çekiliyor...')
      
      const [categoriesResult, postsResult] = await Promise.all([
        blogCategories.getAll().catch(err => ({ data: [], error: err })),
        supabase
          .from('posts_with_tags')
          .select('id,title,slug,excerpt,featured_image_url,category_name,category_slug,category_color,published_at,created_at,author_name,tag_objects')
          .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
          .in('category_slug', [
            'etkinlik-ve-festivaller',
            'havayolu-haberleri', 
            'marina-haberleri',
            'kampanyalar-ve-firsatlar',
            'sektorel-gelismeler',
            'surdurulebilir-ve-eko-turizm',
            'teknoloji-ve-seyahat',
            'turizm-gundemi',
            'tur-operatorleri',
            'tursab',
            'vize-ve-seyahat-belgeleri',
            'yol-gunlukleri-ve-blog',
            'yurt-disi-haberleri',
            'yurt-ici-haberleri'
          ]) // SADECE HABER KATEGORİLERİNDEKİ YAZILARI GETİR
          .order('published_at', { ascending: false })
          .limit(100)
          .then(result => ({ data: result.data, error: result.error }))
          .catch(err => ({ data: [], error: err }))
      ])
      
      console.log('✅ Haberler verileri yüklendi:', {
        categories: categoriesResult.data?.length || 0,
        posts: postsResult.data?.length || 0
      })
      
      setCategories(categoriesResult.data || [])
      const allPosts = postsResult.data
      
      if (allPosts && allPosts.length > 0) {
        console.log('📝 Toplam yazı sayısı:', allPosts.length)
        
        // TÜM YAZILARI GÖSTER (kategori filtresi kaldırıldı)
        setAllPosts(allPosts)
        
        // SON 10 YAZI CAROUSEL İÇİN
        const latestPosts = allPosts.slice(0, 10)
        setFeaturedPosts(latestPosts)
        console.log('🔥 Featured posts:', latestPosts.length)
        
        // EN ÇOK OKUNAN HABERLERİ FİLTRELE (Haberler sayfası için)
        const enCokOkunanPosts = allPosts.filter(post => 
          post.tag_objects && post.tag_objects.some(tag => 
            tag.slug === 'en-cok-okunan-haberler' || 
            tag.name === 'En Çok Okunan Haberler'
          )
        )
        setMostReadPosts(enCokOkunanPosts.slice(0, 7))
        console.log('📈 En çok okunan posts:', enCokOkunanPosts.length)
        
        // İLK SAYFA HABERLERİNİ GÖSTER
        const firstPagePosts = allPosts.slice(0, postsPerPage)
        setRecentPosts(firstPagePosts)
        console.log('📰 İlk sayfa posts:', firstPagePosts.length)
        
        // DAHA FAZLA HABER VAR MI?
        setHasMore(allPosts.length > postsPerPage)
        setCurrentPage(1)
      } else {
        setAllPosts([])
        setRecentPosts([])
        setFeaturedPosts([])
        setMostReadPosts([])
        setHasMore(false)
      }

    } catch (error) {
      console.error('❌ Haberler veri yükleme hatası:', error)
      
      // TIMEOUT durumunda fallback veriler
      if (error.message.includes('timeout')) {
        console.log('⏰ Haberler sayfası timeout, fallback veriler yükleniyor...')
      }
      
      // Hata durumunda boş array'ler bırak
      setAllPosts([])
      setRecentPosts([])
      setFeaturedPosts([])
      setMostReadPosts([])
      setHasMore(false)
    } finally {
      console.log('✅ Haberler loading tamamlandı')
      setLoading(false)
    }
  }

  // Basitleştirilmiş arama fonksiyonu
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // SADECE YURT DIŞI VE YURT İÇİ HABERLERİ KATEGORİLERİNDE ARA
    // ✅ allPosts undefined kontrolü eklendi
    if (!allPosts || allPosts.length === 0) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Haber kategorileri listesi
    const newsCategories = [
      'etkinlik-ve-festivaller',
      'havayolu-haberleri', 
      'marina-haberleri',
      'kampanyalar-ve-firsatlar',
      'sektorel-gelismeler',
      'surdurulebilir-ve-eko-turizm',
      'teknoloji-ve-seyahat',
      'turizm-gundemi',
      'tur-operatorleri',
      'tursab',
      'vize-ve-seyahat-belgeleri',
      'yol-gunlukleri-ve-blog',
      'yurt-disi-haberleri',
      'yurt-ici-haberleri'
    ]

    const results = allPosts.filter(post => 
      // Sadece belirtilen haber kategorilerinde ara
      newsCategories.includes(post.category_slug) && (
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.category_name.toLowerCase().includes(query.toLowerCase())
      )
    )

    // Tarihe göre sırala (en yeni önce)
    results.sort((a, b) => 
      new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
    )

    setSearchResults(results)
  }

  // Arama temizleme
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }

  // Arama input değiştiğinde otomatik arama
  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearch(query)
  }

  // Responsive haber sayısı - mobilde 8, desktop'ta 10
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Gösterilecek haber sayısını belirle
  const getVisiblePostsCount = () => {
    return isMobile ? 8 : 10
  }

  const visiblePosts = featuredPosts.slice(0, getVisiblePostsCount())

  // Auto-slide functionality
  useEffect(() => {
    if (visiblePosts.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visiblePosts.length)
    }, 5000) // 5 seconds

    return () => clearInterval(timer)
  }, [visiblePosts.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % visiblePosts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + visiblePosts.length) % visiblePosts.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 3 seviyeli URL oluşturma fonksiyonu
  const generatePostURL = (post) => {
    if (!post.category_slug || !post.slug) return '#'
    
    // Eğer etiket varsa 3 seviyeli URL oluştur
    if (post.tag_slug) {
      return `/haberler/${post.category_slug}/${post.tag_slug}/${post.slug}`
    }
    
    // Etiket yoksa 2 seviyeli URL oluştur
    return `/${post.category_slug}/${post.slug}`
  }

  // Daha fazla haber yükleme fonksiyonu
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    
    try {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage
      
      const nextPagePosts = allPosts.slice(startIndex, endIndex)
      
      if (nextPagePosts.length > 0) {
        setRecentPosts(prevPosts => [...prevPosts, ...nextPagePosts])
        setCurrentPage(nextPage)
        
        // Daha fazla haber var mı kontrol et
        const newHasMore = endIndex < allPosts.length
        setHasMore(newHasMore)
        
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Daha fazla haber yükleme hatası:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Haber kategorileri listesi
  const newsCategories = [
    'etkinlik-ve-festivaller',
    'havayolu-haberleri', 
    'marina-haberleri',
    'kampanyalar-ve-firsatlar',
    'sektorel-gelismeler',
    'surdurulebilir-ve-eko-turizm',
    'teknoloji-ve-seyahat',
    'turizm-gundemi',
    'tur-operatorleri',
    'tursab',
    'vize-ve-seyahat-belgeleri',
    'yol-gunlukleri-ve-blog',
    'yurt-disi-haberleri',
    'yurt-ici-haberleri'
  ]

  // Kategori filtreleme - Sadece haber kategorilerini göster
  const filteredPosts = allPosts.filter(post => 
    newsCategories.includes(post.category_slug)
  )

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* Hero Skeleton */}
          <div className="h-96 lg:h-[600px] bg-gray-200"></div>
          
          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      {/* Google AdSense - Two Top Banners Below Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
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

      {/* Hero Section - Ana sayfa ile aynı */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side - Main News Slider */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="relative h-64 sm:h-80 lg:h-[500px] bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-gray-500 text-xs sm:text-sm">Ana sayfa haberleri yükleniyor...</div>
                </div>
              ) : visiblePosts.length > 0 ? (
                <div className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-xl">
          {/* Slides */}
              <div className="relative h-full">
                      {visiblePosts.map((slide, index) =>
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
                          style={{ backgroundImage: `url(${slide.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})` }}
                          ></div>
                        
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
                            style={{ backgroundImage: `url(${slide.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})` }}
                          ></div>
                    
                          <div className="relative z-10 h-full flex items-end p-2 sm:p-8">
                            {/* Alt alan için siyah bant - başlık ve kontrolleri kaplıyor */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-xl h-[55px] sm:h-[105px]"></div>
                            
                            <div className="text-white max-w-4xl relative z-10 text-left">
                              <h1 className="font-bold mb-4 sm:mb-8 leading-tight text-white text-base sm:text-xl lg:text-3xl line-clamp-1 overflow-hidden" style={{transform: isMobile ? 'translateY(-67px)' : 'translateY(3px)'}}>
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
                    {visiblePosts.map((_, index) => (
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
                      {isMobile && visiblePosts[currentSlide]?.published_at && (
                        <>
                          <div className="text-white text-sm font-light mx-0.5">|</div>
                          <span className="text-xs text-white whitespace-nowrap leading-none" style={{fontSize: '0.6rem'}}>{formatDate(visiblePosts[currentSlide].published_at)}</span>
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
                            {visiblePosts[currentSlide]?.published_at && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-2 w-2 sm:h-3 sm:w-3" />
                                <span className="text-xs whitespace-nowrap">{formatDate(visiblePosts[currentSlide].published_at)}</span>
              </div>
                            )}
            </>
                        )}
                      </div>
                      
                      {/* Devamını Oku Button - Mobilde Kompakt */}
                      {visiblePosts[currentSlide]?.category_slug && visiblePosts[currentSlide]?.slug ? (
                        <Link
                          to={generatePostURL(visiblePosts[currentSlide])}
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
            <div className="lg:col-span-1">
              <div className="h-[480px] sm:h-[576px] lg:h-[500px] flex flex-col gap-2 sm:gap-4">
                
                {/* Most Read Section - 4 yazı görünür, 3 yazı scroll */}
                <div className="flex-[1.5] flex flex-col min-h-0">
                  <div className="bg-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm sm:text-base">En Çok Okunan Haberler</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                      <div className="p-3 sm:p-4 space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : mostReadPosts.length > 0 ? (
                      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {mostReadPosts.map((news, index) => (
                          <div 
                            key={news.id} 
                            className="p-2 sm:p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            {news.category_slug && news.slug ? (
                              <Link 
                                to={generatePostURL(news)}
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
                      <div className="p-4 sm:p-6 text-center text-gray-500">
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📰</div>
                                <div className="text-sm sm:text-base">En çok okunan haber bulunamadı</div>
        <div className="text-xs sm:text-sm mt-1 sm:mt-2">"En Çok Okunan Haber" etiketli haber ekleyin</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Özel Fırsatlar - Biraz daha büyük */}
                <div className="flex-[1.2] flex-shrink-0">
                  <div className="bg-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm sm:text-base">ÖZEL FIRSATLAR</h3>
                  </div>
                  <div className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6">
                    <div 
                      className="adsense-sidebar relative overflow-hidden rounded-lg shadow-md"
                      data-ad-client="ca-pub-9097929594228195"
                      data-ad-slot="1234567895"
                      data-ad-format="banner"
                      data-full-width-responsive="true"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100px'
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

      {/* Main Content */}
      <section className="pt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Haber Ara
            </h2>
            
            {/* Arama Motoru */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Türkiye Otel Yatırımları, Avrupa Seyahat Acentası..."
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value
                    setSearchQuery(query)
                    
                    if (query.trim() === '') {
                      setIsSearching(false)
                      setSearchResults([])
                    } else {
                      setIsSearching(true)
                      // Arama fonksiyonu
                      const results = filteredPosts.filter(post =>
                        post.title.toLowerCase().includes(query.toLowerCase()) ||
                        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                        post.category_name.toLowerCase().includes(query.toLowerCase())
                      )
                      setSearchResults(results)
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearching(false)
                      setSearchResults([])
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Arama Sonuçları Bilgisi */}
              {isSearching && (
                <div className="mt-4 text-sm text-gray-600">
                  {searchResults.length > 0 ? (
                    <span>"{searchQuery}" için {searchResults.length} sonuç bulundu</span>
                  ) : (
                    <span>"{searchQuery}" için sonuç bulunamadı</span>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Category Filter - GİZLENDİ: Kullanıcıya gösterilmiyor, sadece backend filtreleme için */}

          {/* News Grid - Her 6 haberden sonra reklam alanı */}
          <div className="space-y-8">
            {(() => {
              const articles = isSearching ? searchResults : filteredPosts;
              const chunks = [];
              
              // Haberleri 6'şarlı gruplara böl
              for (let i = 0; i < articles.length; i += 6) {
                chunks.push(articles.slice(i, i + 6));
              }
              
              return chunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex}>
                  {/* Haber Grid'i */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {chunk.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                        <Link to={`/${article.category_slug}/${article.slug}`} className="block">
                <div className="relative overflow-hidden">
                  <img
                    src={article.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                  <div className="absolute top-4 left-4">
                    <span 
                                className="text-black px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                                style={{ backgroundColor: '#FFFFFF' }}
                    >
                      {article.category_name}
                    </span>
                  </div>
                </div>
                        </Link>
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <Link to={generatePostURL(article)}>
                      {article.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Link
                      to={generatePostURL(article)}
                      className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1 transition-colors"
                    >
                      <span>Devamını Oku</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    
                    <div className="flex items-center space-x-3 text-gray-500 text-sm"></div>
                  </div>
                </div>
              </article>
            ))}
                  </div>
                  
                  {/* Reklam Alanı - Her 6 haberden sonra (son grup hariç) */}
                  {chunkIndex < chunks.length - 1 && (
                    <div className="mt-12 mb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
                        
                        {/* Sol Banner Reklam - Ajet */}
                        <a 
                          href="https://ajet.com/tr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adsense-news-banner relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
                          data-ad-client="ca-pub-9097929594228195"
                          data-ad-slot={`123456789${chunkIndex}0`}
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
                          className="adsense-news-banner relative overflow-hidden rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow cursor-pointer block"
                          data-ad-client="ca-pub-9097929594228195"
                          data-ad-slot={`123456789${chunkIndex}1`}
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
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Daha Fazla Yükle Butonu */}
          {!isSearching && hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <span>Daha Fazla Haber Yükle</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {/* İstatistik */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredPosts.length} / {allPosts.length} haber gösteriliyor
              </div>
            </div>
          )}

          {/* Empty State */}
          {(isSearching ? searchResults : filteredPosts).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {isSearching ? '🔍' : '📰'}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {isSearching 
                  ? searchQuery 
                    ? `"${searchQuery}" için sonuç bulunamadı`
                    : 'Arama yapmak için yukarıdaki kutuya yazın'
                  : 'Henüz bu kategoride haber yok'
                }
              </h3>
              <p className="text-gray-600">
                {isSearching 
                  ? 'Farklı anahtar kelimeler deneyin.'
                  : 'Yakında bu kategoriye yeni haberler eklenecek.'
                }
              </p>
              {isSearching && searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Aramayı temizle →
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Floating Sosyal Medya Paylaşım Butonu */}
      <SocialShare
        title="JoinEscapes Haberler - Güncel Seyahat ve Turizm Haberleri"
        url={window.location.href}
        description="En güncel seyahat haberleri, turizm sektörü gelişmeleri ve seyahat trendleri"
        hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Haberler']}
        variant="floating"
      />
    </div>
  )
}

export default News 