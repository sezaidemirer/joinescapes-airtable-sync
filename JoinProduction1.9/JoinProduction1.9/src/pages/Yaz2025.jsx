import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, Award, Eye, Heart, Sparkles, Sun, Waves, Palmtree } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const Yaz2025 = () => {
  const [loading, setLoading] = useState(true)
  const [summerPosts, setSummerPosts] = useState([])

  // SEO tags
  const seoTags = generateSEOTags('yaz-2025')

  useEffect(() => {
    loadSummerPosts()
  }, [])

  const loadSummerPosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Yaz 2025" etiketini bul
      const summerTag = allTags?.find(tag => 
        tag.name === 'Yaz 2025' ||
        tag.slug === 'yaz-2025' || 
        tag.slug === 'yaz_2025' ||
        tag.name.toLowerCase().includes('yaz') ||
        tag.slug.includes('yaz')
      )
      
      
      let posts = []
      let error = null
      
      if (summerTag) {
        // "Yaz 2025" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(summerTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Yaz 2025 seyahat rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setSummerPosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Yaz 2025" yazıları yüklenemedi:', error)
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

  // Yaz 2025 destinasyonları
  const summerDestinations = [
    {
      id: 1,
      name: 'Sharm El Sheikh, Mısır',
      specialty: 'Dalış Cenneti',
      image: '/images/SHARM.webp',
      description: 'Kızıldeniz\'in berrak sularında dalış, renkli mercan resifleri ve çöl safarisi deneyimi.',
      highlights: ['Diving', 'Coral Reefs', 'Desert Safari', 'All-Inclusive'],
      bestTime: 'Mayıs - Ekim',
      duration: '7-10 gün',
      budget: '₺25.000 - ₺80.000',
      rating: 4.7,
      featured: true
    },
    {
      id: 2,
      name: 'Santorini, Yunanistan',
      specialty: 'Ege Güzeli',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Beyaz evler, mavi kubbeler ve dünyanın en güzel gün batımları ile Ege\'nin incisi.',
      highlights: ['Sunset View', 'Wine Tasting', 'Beach Clubs', 'Oia Village'],
      bestTime: 'Haziran - Eylül',
      duration: '5-7 gün',
      budget: '₺15.000 - ₺45.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 3,
      name: 'Bali, Endonezya',
      specialty: 'Yoga & Wellness',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Pirinç tarlaları, antik tapınaklar ve wellness merkezleri ile ruhsal yeniden doğuş.',
      highlights: ['Yoga Retreat', 'Rice Terraces', 'Temple Tours', 'Spa Treatments'],
      bestTime: 'Mayıs - Eylül',
      duration: '8-12 gün',
      budget: '₺12.000 - ₺35.000',
      rating: 4.7,
      featured: false
    },
    {
      id: 4,
      name: 'Mykonos, Yunanistan',
      specialty: 'Beach Party',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Beyaz kumlu plajlar, beach club\'lar ve eğlencenin hiç bitmediği Yunan adası.',
      highlights: ['Beach Clubs', 'Nightlife', 'Windmills', 'Little Venice'],
      bestTime: 'Haziran - Eylül',
      duration: '4-6 gün',
      budget: '₺18.000 - ₺50.000',
      rating: 4.6,
      featured: false
    },
    {
      id: 5,
      name: 'Amalfi Kıyısı, İtalya',
      specialty: 'Romantik Kaçış',
      image: 'https://images.unsplash.com/photo-1534445538923-ab38438550d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Kayalıklara kurulmuş renkli kasabalar, limon bahçeleri ve Akdeniz\'in en güzel manzaraları.',
      highlights: ['Positano', 'Limoncello', 'Coastal Drive', 'Italian Cuisine'],
      bestTime: 'Mayıs - Eylül',
      duration: '6-8 gün',
      budget: '₺20.000 - ₺60.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 6,
      name: 'Ibiza, İspanya',
      specialty: 'Party Island',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Dünya çapında DJ\'ler, beach club\'lar ve hiç bitmeyen eğlence ile partinin kalbi.',
      highlights: ['World Class DJs', 'Beach Parties', 'Sunset Strip', 'VIP Clubs'],
      bestTime: 'Haziran - Eylül',
      duration: '4-5 gün',
      budget: '₺15.000 - ₺40.000',
      rating: 4.5,
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
            backgroundImage: `url('/images/join_escape_yaz_2025.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Sun className="h-8 w-8 text-orange-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Yaz 2025
              </h1>
              <Sun className="h-8 w-8 text-orange-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Bu yaz unutulmaz anılar biriktireceğiniz en özel destinasyonlar
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Waves className="h-5 w-5" />
                <span>Plaj Keyfi</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Palmtree className="h-5 w-5" />
                <span>Tropik Cennet</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Yaz Fırsatları</span>
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
              Yaz 2025 Öne Çıkan Destinasyonlar
            </h2>
            <p className="text-xl text-gray-600">
              Bu yaz keşfetmeniz gereken en popüler yerler
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-5">
            {summerDestinations.filter(dest => dest.featured).map((destination) => {
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                      <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Santorini kartı için özel link
              if (destination.name === 'Santorini, Yunanistan') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/santorini-aska-yakisan-beyazlar-icinde-bir-tatil-masali"
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
                    to="/destinasyon/sharm-el-sheikh-tatil-rehberi-kizildenizin-en-ozel-dalis-ve-tatil-merkezi"
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

      {/* Summer Posts */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yaz 2025 Seyahat Rehberi
            </h2>
            <p className="text-xl text-gray-600">
              Bu yaz sizin için hazırlanan özel öneriler
            </p>
          </div>

          {summerPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {summerPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/yaz-2025/${post.category_slug}/${post.tag_slug || 'yaz2025'}/${post.slug}`}
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
                      <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1">
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
                <Sun className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Yaz 2025 Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Yaz 2025 etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Yaz 2025 Maceranız Başlasın!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bu yaz unutulmaz anılar biriktirmek için hazır mısınız?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/destinations"
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Destinasyonları Keşfet</span>
              <Plane className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Yaz2025 