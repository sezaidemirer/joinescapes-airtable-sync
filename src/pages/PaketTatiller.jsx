import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Heart, Eye, Clock, Award, Plane, Package, Luggage, Globe, CreditCard } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const PaketTatiller = () => {
  const [loading, setLoading] = useState(true)
  const [packagePosts, setPackagePosts] = useState([])

  // SEO tags
  const seoTags = generateSEOTags('paket-tatiller')

  useEffect(() => {
    loadPackagePosts()
  }, [])

  const loadPackagePosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Paket Tatiller" etiketini bul
      const packageTag = allTags?.find(tag => 
        tag.name === 'Paket Tatiller' ||
        tag.slug === 'paket-tatiller' || 
        tag.slug === 'paket_tatiller' ||
        tag.name.toLowerCase().includes('paket') ||
        tag.slug.includes('paket')
      )
      
      
      let posts = []
      let error = null
      
      if (packageTag) {
        // "Paket Tatiller" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(packageTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Paket tatil deneyimi rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setPackagePosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Paket Tatiller" yazıları yüklenemedi:', error)
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

  // Paket tatil destinasyonları - sadece featured kartlar için
  const packageDestinations = [
    {
      id: 1,
      name: 'Punta Cana, Dominik Cumhuriyeti',
      specialty: 'All-Inclusive Paradise',
      image: '/images/dominica_republic_joinescapes.webp',
      description: 'Karayip denizinin turkuaz sularında her şey dahil tatil paketleri, tropikal plajlar ve lüks resort deneyimi.',
      highlights: ['All-Inclusive', 'Tropical Beach', 'Water Sports', 'Luxury Resorts'],
      rating: 4.8,
      featured: true,
      link: '/destinasyon/dominik-cumhuriyeti-all-inclusive'
    },
    {
      id: 2,
      name: 'Malé, Maldivler',
      specialty: 'Luxury Water Villa',
      image: '/images/maldives_maldivler_join_escapes.webp',
      description: 'Kristal berraklığındaki denizde su üstü villalar, özel plajlar ve dünya standartlarında lüks hizmet.',
      highlights: ['Water Villa', 'Private Beach', 'Spa & Wellness', 'Diving'],
      rating: 4.9,
      featured: true,
      link: '/destinasyon/maldivler-luxury-villa'
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
      <Breadcrumb 
        items={[
          { label: 'Ana Sayfa', link: '/' },
          { label: 'Paket Tatiller' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        height: 'calc(100vw * 9 / 16)', // 16:9 aspect ratio (1920x1080)
        minHeight: '300px',
        maxHeight: '500px'
      }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/join_escapes_her_sey_dahil_tatil.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <Package className="h-6 w-6 md:h-8 md:w-8 text-orange-400 mr-2 md:mr-3" />
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
                Paket Tatiller
              </h1>
              <Package className="h-6 w-6 md:h-8 md:w-8 text-orange-400 ml-2 md:ml-3" />
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto mb-6 md:mb-8 drop-shadow-md px-4">
              Her şey dahil tatil paketleri ile rahat ve keyifli seyahat deneyimleri
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 text-white/90 px-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm md:text-base">
                <Luggage className="h-4 w-4 md:h-5 md:w-5" />
                <span>Her Şey Dahil</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm md:text-base">
                <Globe className="h-4 w-4 md:h-5 md:w-5" />
                <span>Rehberli Turlar</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm md:text-base">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                <span>Bütçe Araştırma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Paket Tatil Destinasyonları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Paket Tatil Destinasyonları
            </h2>
            <p className="text-xl text-gray-600">
              En popüler ve kapsamlı tatil paketleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {packageDestinations.filter(dest => dest.featured).map((destination) => {
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                      <span className="text-sm text-orange-600 font-medium">{destination.specialty}</span>
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
                      <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-yellow-600 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Dominik Cumhuriyeti kartı için özel link
              if (destination.name === 'Punta Cana, Dominik Cumhuriyeti') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/dominikte-luksun-yeni-tanimi-the-grand-reserve-at-paradisus-palma-real"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Maldivler kartı için özel link
              if (destination.name === 'Malé, Maldivler') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/maldivlerde-masal-gibi-bir-kacis-saii-lagoon-maldives"
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

      {/* Paket Tatil Rehberi - Birleştirilmiş */}
      {packagePosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Paket Tatil Rehberi
              </h2>
              <p className="text-xl text-gray-600">
                Her şey dahil tatil paketleri ve seyahat deneyimleri
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packagePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/paket-tatiller/${post.category_slug}/${post.tag_slug || 'pakettatiller'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-sm hover:from-orange-600 hover:to-yellow-600 transition-colors flex items-center space-x-1">
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
      <section className="py-16 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Paket Tatil Deneyiminizi Keşfedin
          </h2>
          <div className="flex justify-center">
            <Link
              to="/destinations"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Tüm Destinasyonlar</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PaketTatiller 