import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, Users, Search, X, Calendar, User, ArrowRight, Eye, Heart, Globe, Camera, Award } from 'lucide-react'
import { blogPosts, blogCategories } from '../lib/blog'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import DestinationCard from '../components/DestinationCard'

const Destinations = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  const [visibleCount, setVisibleCount] = useState(12)
  
  // SEO tags
  const seoTags = generateSEOTags('destinations')

  // Destinasyon kategorisindeki yazıları getir
  useEffect(() => {
    fetchDestinations()
  }, [])

  // Arama yapıldığında visible count'u resetle
  useEffect(() => {
    setVisibleCount(12)
  }, [searchQuery])

  const fetchDestinations = async () => {
    setLoading(true)
    setError(null)
    try {
      // Destinasyon kategorisini bul
      const { data: categories } = await blogCategories.getAll()
      const destinationCategory = categories?.find(cat => cat.slug === 'destinasyon')
      
      if (!destinationCategory) {
        console.error('Destinasyon kategorisi bulunamadı')
        setDestinations([])
        return
      }

      // Destinasyon kategorisindeki yazıları getir
      const { data: posts } = await blogPosts.getByCategory(destinationCategory.slug, { limit: 100 })
      
      if (posts && posts.length > 0) {
        setDestinations(posts)
      } else {
        setDestinations([])
      }
    } catch (error) {
      console.error('Destinasyon yazıları yüklenirken hata:', error)
      setError('Destinasyon yazıları yüklenirken bir hata oluştu')
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Arama fonksiyonu - dinamik blog yazıları için
  const filteredDestinations = destinations.filter(destination => {
    if (searchQuery === '') return true
    
    const searchLower = searchQuery.toLowerCase()
    return destination.title.toLowerCase().includes(searchLower) ||
           destination.excerpt.toLowerCase().includes(searchLower) ||
           destination.content.toLowerCase().includes(searchLower)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
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
            <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium">
              Destinasyonlar
            </span>
          </nav>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/join_escapes_destinasyonlar.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Destinasyonlar
          </h1>
              <MapPin className="h-8 w-8 text-blue-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Dünyanın en güzel yerlerini keşfedin ve unutulmaz anılar biriktirin
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Globe className="h-5 w-5" />
                <span>Dünya Turu</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Camera className="h-5 w-5" />
                <span>Keşif Rehberi</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Özel Deneyimler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Search Section */}
      <section className="pt-8 pb-3 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Hayalinizdeki destinasyonu bulun
            </h2>
            <p className="text-gray-600 text-lg">
              Aradığınız yeri bulmak için aşağıdaki arama kutusunu kullanabilirsiniz
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="İtalya gezilecek yerler, Kıbrıs otel fiyatları, Kapadokya balon turu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Summary */}
          {searchQuery && (
            <div className="text-center mb-8">
              <p className="text-gray-600">
                {filteredDestinations.length > 0 ? (
                  <>
                    "<span className="font-medium text-gray-900">{searchQuery}</span>" için{' '}
                    <span className="font-medium text-primary-600">{filteredDestinations.length}</span> sonuç bulundu
                  </>
                ) : (
                  <>
                    "<span className="font-medium text-gray-900">{searchQuery}</span>" için herhangi bir sonuç bulunamadı
                  </>
                )}
              </p>
            </div>
          )}

        </div>
      </section>



      {/* Destinations Grid - Dinamik Blog Yazıları */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Destinasyon yazıları yükleniyor...</p>
                  </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bir hata oluştu</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchDestinations}
                className="btn-primary"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Destinations Grid - Yeni Kart Tasarımı */}
          {!loading && !error && filteredDestinations.length > 0 && (
            <div>
              {/* Destinasyon Grid'i - Seyahat Bulucu Tarzı Kartlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDestinations.slice(0, visibleCount).map((article, index) => (
                  <DestinationCard 
                    key={article.id} 
                    destination={article} 
                    index={index}
                  />
                ))}
              </div>

              {/* Devamını Gör Butonu */}
              {filteredDestinations.length > visibleCount && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
                  >
                    <span>Devamını Gör</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    {visibleCount} / {filteredDestinations.length} destinasyon gösteriliyor
                  </p>
                </div>
              )}
            </div>
          )}
              
          {/* Empty State */}
          {!loading && !error && filteredDestinations.length === 0 && (
                <div className="text-center py-16">
              <div className="text-6xl mb-6">
                {searchQuery ? '🔍' : '📍'}
              </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {searchQuery 
                  ? `"${searchQuery}" için sonuç bulunamadı`
                  : 'Henüz destinasyon yazısı yok'
                }
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery 
                  ? 'Farklı anahtar kelimeler deneyin.'
                  : 'Yakında destinasyon yazıları eklenecek.'
                    }
                  </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Aramayı temizle →
                </button>
              )}
            </div>
          )}

        </div>
      </section>

    </div>
  )
}

export default Destinations 