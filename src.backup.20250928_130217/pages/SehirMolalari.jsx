import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, Award, Eye, Heart, Sparkles, Building2, Camera, Coffee } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const SehirMolalari = () => {
  const [loading, setLoading] = useState(true)
  const [cityPosts, setCityPosts] = useState([])

  // SEO tags
  const seoTags = generateSEOTags('sehir-molalari')

  useEffect(() => {
    loadCityPosts()
  }, [])

  const loadCityPosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Şehir Molaları" etiketini bul
      const cityTag = allTags?.find(tag => 
        tag.name === 'Şehir Molaları' ||
        tag.slug === 'sehir-molalari' || 
        tag.slug === 'sehir_molalari'
      )
      
      
      let posts = []
      let error = null
      
      if (cityTag) {
        // "Şehir Molaları" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(cityTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Şehir keşif rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setCityPosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Şehir Molaları" yazıları yüklenemedi:', error)
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

  // Şehir destinasyonları
  const cityDestinations = [
    {
      id: 1,
      name: 'Roma, İtalya',
      specialty: 'Antik Şehir',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Sonsuz Şehir Roma, antik tarihin her köşesinde yaşadığı açık hava müzesi.',
      highlights: ['Colosseum', 'Vatican', 'Trevi Fountain', 'Pantheon'],
      bestTime: 'Nisan - Ekim',
      duration: '3-5 gün',
      budget: '₺8.000 - ₺18.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: 'Marakeş, Fas',
      specialty: 'Egzotik Şehir',
      image: 'https://images.unsplash.com/photo-1517821362941-f7f753200fef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Kırmızı Şehir Marakeş, rengarenk çarşıları, egzotik baharat kokuları ve büyülü atmosferiyle unutulmaz.',
      highlights: ['Jemaa el-Fnaa', 'Majorelle Bahçesi', 'Bahia Sarayı', 'Souks Çarşısı'],
      bestTime: 'Ekim - Nisan',
      duration: '4-6 gün',
      budget: '₺5.000 - ₺15.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 3,
      name: 'Tokyo, Japonya',
      specialty: 'Modern Metropol',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Geleneksel Japon kültürü ile ultra modern teknolojinin buluştuğu fascinant şehir.',
      highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree', 'Harajuku'],
      bestTime: 'Mart - Mayıs',
      duration: '5-7 gün',
      budget: '₺12.000 - ₺25.000',
      rating: 4.9,
      featured: false
    },
    {
      id: 4,
      name: 'Paris, Fransa',
      specialty: 'Romantik Şehir',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Işık Şehri Paris, sanat, kültür ve romantizmin başkenti olarak ziyaretçilerini büyülüyor.',
      highlights: ['Eyfel Kulesi', 'Louvre Müzesi', 'Champs-Élysées', 'Seine Nehri'],
      bestTime: 'Nisan - Ekim',
      duration: '4-6 gün',
      budget: '₺8.000 - ₺20.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 5,
      name: 'Barcelona, İspanya',
      specialty: 'Sanat ve Mimari',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Gaudí\'nin mimarisi ve Akdeniz kültürünün birleştiği eşsiz şehir.',
      highlights: ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Gothic Quarter'],
      bestTime: 'Nisan - Ekim',
      duration: '3-5 gün',
      budget: '₺6.000 - ₺15.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 6,
      name: 'New York, ABD',
      specialty: 'Şehir Hiç Uyumaz',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Dünyanın en dinamik şehri, Broadway\'den Wall Street\'e kadar her köşesinde heyecan.',
      highlights: ['Times Square', 'Central Park', 'Statue of Liberty', 'Brooklyn Bridge'],
      bestTime: 'Nisan - Ekim',
      duration: '4-6 gün',
      budget: '₺15.000 - ₺30.000',
      rating: 4.7,
      featured: false
    },
    {
      id: 7,
      name: 'İstanbul, Türkiye',
      specialty: 'Tarihi Şehir',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'İki kıtayı birleştiren büyülü şehir, tarihi dokusu ve modern yaşamın mükemmel uyumu.',
      highlights: ['Ayasofya', 'Sultanahmet', 'Galata Kulesi', 'Boğaz Turu'],
      bestTime: 'Nisan - Ekim',
      duration: '3-5 gün',
      budget: '₺2.000 - ₺8.000',
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
            backgroundImage: `url('/images/join_escapes_sehir_molalari_.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Şehir Molaları
              </h1>
              <Building2 className="h-8 w-8 text-yellow-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Dünyanın en büyüleyici şehirlerini keşfedin, her köşesinde farklı bir hikaye yaşayın
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-5 w-5" />
                <span>50+ Şehir Rehberi</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Camera className="h-5 w-5" />
                <span>Şehir Keşfi</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Kültür Deneyimi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Şehir Destinasyonları
            </h2>
            <p className="text-xl text-gray-600">
              En popüler şehir molası destinasyonları
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {cityDestinations.filter(dest => dest.featured).map((destination) => {
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                      <span className="text-sm text-teal-600 font-medium">{destination.specialty}</span>
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
                      <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-teal-700 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Roma kartı için özel link
              if (destination.name === 'Roma, İtalya') {
                return (
                  <Link
                    key={destination.id}
                    to="/kultur-ve-miras/italyayi-kesfet-ronesanstan-romaya-askin-ve-sanatin-ulkesi"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Marakeş kartı için özel link
              if (destination.name === 'Marakeş, Fas') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/fas-renklerin-baharatlarin-ve-zamanin-otesinde-bir-yolculuk"
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

      {/* City Posts */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Şehir Keşif Rehberi
            </h2>
            <p className="text-xl text-gray-600">
              Şehir molası deneyimleri hakkında detaylı bilgiler
            </p>
          </div>

          {cityPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cityPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/sehir-molalari/${post.category_slug}/${post.tag_slug || 'sehirmolalari'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
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
                      <div className="bg-teal-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-teal-600 transition-colors flex items-center space-x-1">
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
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Şehir Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Şehir molaları etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Şehir Molasına Hazır mısınız?
          </h2>
          <div className="flex justify-center">
            <Link
              to="/destinations"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-600 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>Diğer Destinasyonlar</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SehirMolalari 