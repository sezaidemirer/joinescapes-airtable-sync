import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, Award, Eye, Heart, Home, Coffee, Wifi, Car } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const ButikOteller = () => {
  const [loading, setLoading] = useState(true)
  const [boutiquePosts, setBoutiquePosts] = useState([])
  
  // SEO tags
  const seoTags = generateSEOTags('butik-oteller')

  useEffect(() => {
    loadBoutiquePosts()
  }, [])

  const loadBoutiquePosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Butik Oteller" etiketini bul
      const boutiqueTag = allTags?.find(tag => 
        tag.name === 'Butik Oteller' ||
        tag.slug === 'butik-oteller' || 
        tag.slug === 'butik_oteller' ||
        tag.name.toLowerCase().includes('butik') ||
        tag.slug.includes('butik')
      )
      
      
      let posts = []
      let error = null
      
      if (boutiqueTag) {
        // "Butik Oteller" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(boutiqueTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Butik otel deneyimi rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setBoutiquePosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Butik Oteller" yazıları yüklenemedi:', error)
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

  // Butik otel destinasyonları - sadece featured kartlar için
  const boutiqueDestinations = [
    {
      id: 1,
      name: 'Baja California, Meksika',
      specialty: 'Lüks Butik Deneyim',
      image: '/images/hotel-san-cristobal-baja-california-meksika.webp',
      description: 'Maya kalıntıları arasında sürdürülebilir lüks, cenote yüzme havuzları ve tropik orman içinde butik konaklama.',
      highlights: ['Eco Resort', 'Cenote Swimming', 'Maya Ruins', 'Jungle Spa'],
      rating: 4.9,
      featured: true,
      link: '/destinasyon/hotel-san-cristbal-baja-california-meksika'
    },
    {
      id: 2,
      name: 'Santorini, Yunanistan',
      specialty: 'Cycladic Villa',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Ege Denizi\'nin incisi Mykonos\'ta geleneksel Cycladic mimarisi, infinity pool\'lar ve gün batımı manzarası.',
      highlights: ['Cycladic Design', 'Infinity Pool', 'Sunset Views', 'Beach Access'],
      rating: 4.8,
      featured: true,
      link: '/seyahat-rehberi/butik-zevklere-canaves-oia-suites-santorini-yunanistan'
    }
  ]

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
              Butik Oteller
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
            backgroundImage: `url('/images/join_escapes_butik_otel_butiqe_hotek.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Home className="h-8 w-8 text-emerald-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Butik Oteller
              </h1>
              <Home className="h-8 w-8 text-emerald-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Kişisel dokunuşlarla tasarlanmış, karakteristik ve samimi butik otel deneyimleri
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5" />
                <span>Butik Deneyim</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Home className="h-5 w-5" />
                <span>Otantik Tasarımlar</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="h-5 w-5" />
                <span>Samimi Atmosfer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Butik Otel Destinasyonları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Butik Otel Destinasyonları
            </h2>
            <p className="text-xl text-gray-600">
              En karakteristik ve samimi butik otel deneyimleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {boutiqueDestinations.filter(dest => dest.featured).map((destination) => {
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Öne Çıkan
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{destination.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <span className="text-sm text-emerald-600 font-medium">{destination.specialty}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">{destination.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Baja California kartı için özel link
              if (destination.name === 'Baja California, Meksika') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/hotel-san-cristbal-baja-california-meksika"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Santorini kartı için özel link
              if (destination.name === 'Santorini, Yunanistan') {
                return (
                  <Link
                    key={destination.id}
                    to="/seyahat-rehberi/butik-zevklere-canaves-oia-suites-santorini-yunanistan"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Diğer kartlar için normal div
              return (
                <div key={destination.id}>
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Butik Otel Rehberi - Birleştirilmiş */}
      {boutiquePosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Butik Otel Rehberi
              </h2>
              <p className="text-xl text-gray-600">
                Kişisel dokunuşlarla tasarlanmış konaklama deneyimleri
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boutiquePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/butik-oteller/${post.category_slug}/${post.tag_slug || 'butikoteller'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
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
                      <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-emerald-600 transition-colors flex items-center space-x-1">
                        <span>Oku</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Home className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Butik Otel Deneyiminizi Keşfedin
          </h2>
          <div className="flex justify-center">
            <Link
              to="/haberler"
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Tüm Butik Oteller</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ButikOteller 