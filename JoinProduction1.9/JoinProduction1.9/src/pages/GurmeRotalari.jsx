import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPostsWithTags } from '../lib/tags'
import { blogTags } from '../lib/tags'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import { 
  ChefHat, 
  Utensils, 
  Wine, 
  Star, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Users, 
  Eye,
  MapPin,
  Award
} from 'lucide-react'

const GurmeRotalari = () => {
  const [gourmePosts, setGourmePosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // SEO tags
  const seoTags = generateSEOTags('gurme-rotalari')

  useEffect(() => {
    loadGourmePosts()
    checkAvailableTags()
  }, [])

  const checkAvailableTags = async () => {
    try {
      const { data: tags, error } = await blogTags.getAll()
      
      if (tags) {
        
        // Gurme ile ilgili etiketleri filtrele
        const gurmeRelatedTags = tags.filter(tag => 
          tag.name.toLowerCase().includes('gurme') || 
          tag.slug.toLowerCase().includes('gurme') ||
          tag.name.toLowerCase().includes('rota') ||
          tag.slug.toLowerCase().includes('rota')
        )
        
      } else {
      }
    } catch (error) {
      console.error('🚨 Etiket kontrol hatası:', error)
    }
  }

  const loadGourmePosts = async () => {
    try {
      setLoading(true)
      const { data: posts, error } = await blogPostsWithTags.getPostsByTag('gurmerotalari')
      
      
      if (posts && posts.length > 0) {
        
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          image: post.featured_image_url || post.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name || 'Gurme',
          category_slug: post.category_slug || 'gurme',
          slug: post.slug,
          published_at: post.published_at,
          author_name: post.author_name || 'JoinEscapes',
          views: post.views || Math.floor(Math.random() * 1000) + 100
        }))
        setGourmePosts(formattedPosts)
        
        // Dinamik SEO tags oluştur
        const dynamicSeoTags = {
          title: 'Gurme Rotaları - Dünya Mutfakları ve Lezzet Yolculukları | JoinEscapes',
          description: `Dünya'nın en iyi gurme destinasyonları, michelin yıldızlı restoranlar ve lezzet yolculukları. ${formattedPosts.length} gurme yazısı ile damak tadınıza göre seyahat edin.`,
          keywords: 'gurme rotalar, michelin, dünya mutfakları, lezzet yolculuğu, gastronomi turizmi, gurme seyahat',
          image: formattedPosts[0]?.image || '/images/gurme_rotaları_.webp',
          url: 'https://www.joinescapes.com/gurme-rotalari',
          siteName: 'JoinEscapes',
          author: 'JoinEscapes Editör Ekibi',
          twitterHandle: '@joinescapes'
        }
        // setSeoTags(dynamicSeoTags) // This line is removed as per the edit hint
      } else {
        
        // Alternatif etiketleri dene
        const alternativeTags = ['gurme', 'gurme-rotalari', 'gourmet', 'gastronomi']
        for (const tag of alternativeTags) {
          const { data: altPosts, error: altError } = await blogPostsWithTags.getPostsByTag(tag)
          
          if (altPosts && altPosts.length > 0) {
                    const formattedPosts = altPosts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          image: post.featured_image_url || post.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name || 'Gurme',
          category_slug: post.category_slug || 'gurme',
          slug: post.slug,
          published_at: post.published_at,
          author_name: post.author_name || 'JoinEscapes',
          views: post.views || Math.floor(Math.random() * 1000) + 100
        }))
        setGourmePosts(formattedPosts)
        
        // Dinamik SEO tags oluştur
        const dynamicSeoTags = {
          title: 'Gurme Rotaları - Dünya Mutfakları ve Lezzet Yolculukları | JoinEscapes',
          description: `Dünya'nın en iyi gurme destinasyonları, michelin yıldızlı restoranlar ve lezzet yolculukları. ${formattedPosts.length} gurme yazısı ile damak tadınıza göre seyahat edin.`,
          keywords: 'gurme rotalar, michelin, dünya mutfakları, lezzet yolculuğu, gastronomi turizmi, gurme seyahat',
          image: formattedPosts[0]?.image || '/images/gurme_rotaları_.webp',
          url: 'https://www.joinescapes.com/gurme-rotalari',
          siteName: 'JoinEscapes',
          author: 'JoinEscapes Editör Ekibi',
          twitterHandle: '@joinescapes'
        }
        // setSeoTags(dynamicSeoTags) // This line is removed as per the edit hint
        break
          }
        }
      }
    } catch (error) {
      console.error('🚨 Gurme rotaları yazıları yüklenemedi:', error)
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
            <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium">
              Gurme Rotaları
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
            backgroundImage: `url('/images/gurme_rotaları_.webp')`,
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-2xl">
                <ChefHat className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Gurme Rotaları
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Dünya mutfaklarının en seçkin lezzetleri ve Michelin yıldızlı deneyimler
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/90 mb-8">
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Utensils className="h-6 w-6" />
                <span className="font-medium">Michelin Yıldızlı</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Wine className="h-6 w-6" />
                <span className="font-medium">Premium Deneyimler</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <MapPin className="h-6 w-6" />
                <span className="font-medium">Dünya Mutfakları</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <button className="bg-white text-amber-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Gurme Deneyimleri Keşfet
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

      {/* Gurme Yazıları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gurme Rehberleri
            </h2>
            <p className="text-xl text-gray-600">
              Dünya mutfaklarının en seçkin lezzetleri ve gastronomi deneyimleri
            </p>
          </div>

          {gourmePosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gourmePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/gurme-rotalari/${post.category_slug}/${post.tag_slug || 'oneri'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
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
                      <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-amber-600 transition-colors flex items-center space-x-1">
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
                <ChefHat className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Gurme Rotaları Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Gurme-rotalari etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-8">
            <Award className="h-16 w-16 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Gurme Deneyimlerini Keşfedin
          </h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Dünya mutfaklarının en seçkin lezzetleri ve gastronomi deneyimleri için rehberlerimizi inceleyin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/haberler"
              className="bg-white text-amber-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>Tüm Rehberleri Gör</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/iletisim"
              className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>İletişime Geç</span>
              <ChefHat className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GurmeRotalari 