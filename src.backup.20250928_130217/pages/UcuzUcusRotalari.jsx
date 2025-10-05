import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, DollarSign, Eye, Heart, Navigation, Globe, Ticket } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const UcuzUcusRotalari = () => {
  const [loading, setLoading] = useState(true)
  const [flightPosts, setFlightPosts] = useState([])
  
  // SEO tags
  const seoTags = generateSEOTags('ucuz-ucus-rotalari')

  useEffect(() => {
    loadFlightPosts()
  }, [])

  const loadFlightPosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Ucuz Uçuş Rotaları" etiketini bul
      const flightTag = allTags?.find(tag => 
        tag.name === 'Ucuz Uçuş Rotaları' ||
        tag.slug === 'ucuz-ucus-rotalari' || 
        tag.slug === 'ucuz_ucus_rotalari' ||
        tag.name.toLowerCase().includes('uçuş') ||
        tag.slug.includes('ucus') ||
        tag.name.toLowerCase().includes('flight') ||
        tag.slug.includes('flight')
      )
      
      
      let posts = []
      let error = null
      
      if (flightTag) {
        // "Ucuz Uçuş Rotaları" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(flightTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Ucuz uçuş rotası rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setFlightPosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Ucuz Uçuş Rotaları" yazıları yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
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
              Ucuz Uçuş Rotaları
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
            backgroundImage: `url('/images/ucus_ucus_rotalari_.webp')`,
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-2xl">
                <Plane className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Ucuz Uçuş Rotaları
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              En uygun fiyatlarla dünya genelinde uçuş imkanları ve ekonomik seyahat rehberleri
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/90 mb-8">
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <DollarSign className="h-6 w-6" />
                <span className="font-medium">Ekonomik Seçenekler</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Navigation className="h-6 w-6" />
                <span className="font-medium">Direkt Uçuşlar</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Globe className="h-6 w-6" />
                <span className="font-medium">Dünya Geneli</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Uçuş Fırsatlarını Keşfet
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Raw Agent Reklamları */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Raw Agent Reklam 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <img 
                src="/images/raw_reklam_1.webp" 
                alt="Raw Agent Reklam 1" 
                className="w-full h-auto object-contain"
              />
            </div>
            
            {/* Raw Agent Reklam 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <img 
                src="/images/raw_reklam_2.webp" 
                alt="Raw Agent Reklam 2" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ucuz Uçuş Yazıları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ucuz Uçuş Rehberleri
            </h2>
            <p className="text-xl text-gray-600">
              Ekonomik uçuş seçenekleri ve seyahat ipuçları hakkında detaylı rehberler
            </p>
          </div>

          {flightPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {flightPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/ucuz-ucus-rotalari/${post.category_slug}/${post.tag_slug || 'ucuzucusrotalari'}/${post.slug}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group block"
                >
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1">
                        <span>Oku</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plane className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Ucuz Uçuş Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Ucuz uçuş rotaları etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-8">
            <Ticket className="h-16 w-16 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ucuz Uçuş Fırsatlarını Keşfedin
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            En uygun fiyatlarla seyahat etmek için rehberlerimizi inceleyin ve ekonomik uçuş seçeneklerini keşfedin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/haberler"
              className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>Tüm Rehberleri Gör</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/iletisim"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>İletişime Geç</span>
              <Plane className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UcuzUcusRotalari 