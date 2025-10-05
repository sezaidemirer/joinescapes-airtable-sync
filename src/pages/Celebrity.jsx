import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, Award, Eye } from 'lucide-react'
import { postTags } from '../lib/tags'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const Celebrity = () => {
  const [loading, setLoading] = useState(true)
  const [celebrityPosts, setCelebrityPosts] = useState([])

  // SEO tags
  const seoTags = generateSEOTags('celebrity')

  useEffect(() => {
    loadCelebrityPosts()
  }, [])

  const loadCelebrityPosts = async () => {
    setLoading(true)
    try {
      // Celebrity etiketli yazıları getir
      const { data: posts, error } = await postTags.getPostsByTag('celebrity', { limit: 12 })
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Celebrity destinasyon rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setCelebrityPosts(formattedPosts)
      } else {
        // Eğer celebrity etiketli yazı yoksa boş array bırak, static data gösterilsin
        setCelebrityPosts([])
      }
    } catch (error) {
      console.error('Celebrity yazıları yüklenemedi:', error)
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

  // Celebrity destinasyonları
  const celebrityDestinations = [
    {
      id: 1,
      name: 'Sharm El Sheikh, Mısır',
      celebrity: 'Kylie Jenner',
      image: '/images/sharm_populer_.webp',
      description: 'Kızıldeniz\'in kristal berraklığındaki suları ve muhteşem mercan resifleriyle ünlülerin tercihi.',
      highlights: ['Coral Reefs', 'Luxury Resorts', 'Desert Adventures', 'Red Sea Diving'],
      bestTime: 'Ekim - Nisan',
      duration: '4-6 gün',
      budget: '₺12.000 - ₺25.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: 'Maldivler',
      celebrity: 'Gigi Hadid',
      image: '/images/maldivler_popular.webp',
      description: 'Kristal berraklığındaki sular ve overwater villaları ile ünlülerin vazgeçilmez tercihi Maldivlerde 2025 Yazı başladı!',
      highlights: ['Overwater Villas', 'Private Beaches', 'Snorkeling', 'Spa Treatments'],
      bestTime: 'Kasım - Nisan',
      duration: '5-7 gün',
      budget: '₺25.000 - ₺50.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 3,
      name: 'Bali, Endonezya',
      celebrity: 'Kendall Jenner',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Tropik cennet Bali, yoga retreat\'leri ve lüks resort\'ları ile ünlülerin kaçış noktası.',
      highlights: ['Yoga Retreats', 'Rice Terraces', 'Beach Clubs', 'Temple Tours'],
      bestTime: 'Nisan - Ekim',
      duration: '4-6 gün',
      budget: '₺12.000 - ₺25.000',
      rating: 4.7,
      featured: false
    },
    {
      id: 4,
      name: 'Mykonos, Yunanistan',
      celebrity: 'Lindsay Lohan',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Gece hayatı ve beach club\'ları ile ünlü Mykonos, parti severlerin tercihi.',
      highlights: ['Beach Clubs', 'Nightlife', 'Windmills', 'Shopping'],
      bestTime: 'Mayıs - Eylül',
      duration: '3-4 gün',
      budget: '₺18.000 - ₺35.000',
      rating: 4.6,
      featured: false
    },
    {
      id: 5,
      name: 'Dubai, BAE',
      celebrity: 'Kim Kardashian',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Lüks alışveriş ve ikonik mimarisi ile ünlülerin Dubai\'yi tercih etme sebebi.',
      highlights: ['Luxury Shopping', 'Burj Khalifa', 'Desert Safari', 'Fine Dining'],
      bestTime: 'Kasım - Mart',
      duration: '3-5 gün',
      budget: '₺20.000 - ₺40.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 6,
      name: 'Capri, İtalya',
      celebrity: 'Beyoncé',
      image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Akdeniz\'in incisi Capri, lüks yatları ve muhteşem manzaralarıyla ünlülerin favorisi.',
      highlights: ['Blue Grotto', 'Luxury Yachts', 'Designer Boutiques', 'Fine Dining'],
      bestTime: 'Mayıs - Eylül',
      duration: '2-4 gün',
      budget: '₺22.000 - ₺45.000',
      rating: 4.9,
      featured: false
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
      
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/join_escape_celebrity_destinations_.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Star className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Sanat ve Cemiyet
              </h1>
              <Star className="h-8 w-8 text-yellow-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Dünya Yıldızlarının ayak izlerini takip edin ve onların tercih ettiği muhteşem destinasyonları keşfedin
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-5 w-5" />
                <span>Özel Destinasyonlar</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5" />
                <span>Premium Deneyimler</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Lüks Yaşam</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Destinations */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Destinasyonlar
            </h2>
            <p className="text-xl text-gray-600">
              Ünlülerin tatil rotaları, sanat etkinlikleri, yeme-içme durakları ve özel keşifler.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {celebrityDestinations.filter(dest => dest.featured).map((destination) => {
              // Maldivler kartı için özel link
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Öne Çıkan
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{destination.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <span className="text-sm text-purple-600 font-medium">{destination.celebrity}</span>
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
                      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Maldivler kartı için özel link
              if (destination.name === 'Maldivler') {
                return (
                  <Link
                    key={destination.id}
                    to="/seyahat-rehberi/maldivlerde-unlu-tatili-2025de-maldivlerde-kimler-konakladi"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Sharm El Sheikh kartı için özel link
              if (destination.name === 'Sharm El Sheikh, Mısır') {
                return (
                  <Link
                    key={destination.id}
                    to="/seyahat-rehberi/sharm-el-sheikh-unlulerin-gozdesi-tatil-cenneti"
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

      {/* Celebrity Posts */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sizin İçin Seçtiklerimiz
            </h2>
            <p className="text-xl text-gray-600">
              Sanat ve cemiyet dünyasından en güncel haberler ve özel içerikler
            </p>
          </div>
          
          {celebrityPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {celebrityPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/sanat-ve-cemiyet/${post.category_slug}/${post.tag_slug || 'celebrity'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">⭐ Celebrity</span>
                      <div className="bg-purple-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-purple-600 transition-colors flex items-center space-x-1">
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
                <Star className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Celebrity Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Celebrity etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ünlüler Gibi Seyahat Etmeye Hazır mısınız?
          </h2>
          <div className="flex justify-center">
            <Link
              to="/destinations"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>Hemen Keşfet!</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Celebrity 