import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Clock, Award, Eye, Heart, Sparkles } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const SpaMolalari = () => {
  const [loading, setLoading] = useState(true)
  const [spaPosts, setSpaPosts] = useState([])

  // Yazar ismi gösterme fonksiyonu
  const getAuthorDisplayName = (authorName, authorId) => {
    // Eğer author_name "test" ise, gerçek yazar ismini döndür
    if (authorName === 'test') {
      return 'Join Escapes'
    }
    
    // Eğer author_name varsa onu kullan
    if (authorName && authorName !== 'test') {
      return authorName
    }
    
    // Fallback
    return 'JoinEscapes'
  }

  // SEO tags
  const seoTags = generateSEOTags('spa-molalari')

  useEffect(() => {
    loadSpaPosts()
  }, [])

  const loadSpaPosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // Spa ile ilgili tüm etiketleri bul
      const spaTag = allTags?.find(tag => 
        tag.slug === 'spa-molalari' || 
        tag.slug === 'spa_molalari' || 
        tag.name.toLowerCase().includes('spa') ||
        tag.slug.includes('spa')
      )
      
      
      let posts = []
      let error = null
      
      if (spaTag) {
        // Bulunan etiketle yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(spaTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        // Hiç spa etiketi yoksa tüm yazıları getir ve spa içerenleri filtrele
        const { data: allPosts, error: allError } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        
        if (!allError && allPosts) {
          posts = allPosts.filter(post => 
            post.title.toLowerCase().includes('spa') ||
            post.content?.toLowerCase().includes('spa') ||
            post.excerpt?.toLowerCase().includes('spa')
          )
        }
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Spa ve wellness destinasyon rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setSpaPosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('Spa yazıları yüklenemedi:', error)
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

  // Spa destinasyonları
  const spaDestinations = [
    {
      id: 1,
      name: 'Kerala, Hindistan',
      specialty: 'Ayurveda Spa',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Hindistan\'ın güney eyaleti Kerala, geleneksel Ayurveda tedavileri ve doğal spa deneyimleri ile ünlü.',
      highlights: ['Ayurveda Tedavisi', 'Backwater Cruise', 'Yoga Retreats', 'Herbal Treatments'],
      bestTime: 'Ekim - Mart',
      duration: '7-10 gün',
      budget: '₺8.000 - ₺18.000',
      rating: 4.9,
      featured: true
    },
    {
      id: 2,
      name: 'Alicante, İspanya',
      specialty: 'Luxury Wellness',
      image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Costa del Sol\'un incisi Alicante, lüks spa otelleri ve Akdeniz wellness kültürü ile büyüleyici.',
      highlights: ['Luxury Spas', 'Thalassotherapy', 'Mediterranean Wellness', 'Beach Resorts'],
      bestTime: 'Nisan - Ekim',
      duration: '4-6 gün',
      budget: '₺15.000 - ₺35.000',
      rating: 4.8,
      featured: true
    },
    {
      id: 3,
      name: 'Pamukkale, Türkiye',
      specialty: 'Termal Havuzlar',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Doğal termal havuzları ve kalsiyum travertenlerinin oluşturduğu beyaz cennet, binlerce yıldır şifa kaynağı.',
      highlights: ['Termal Havuzlar', 'Antik Hierapolis', 'Doğal Kalsiyum Travertenleri', 'Wellness Oteller'],
      bestTime: 'Nisan - Ekim',
      duration: '2-3 gün',
      budget: '₺3.000 - ₺8.000',
      rating: 4.9,
      featured: false
    },
    {
      id: 4,
      name: 'Bali, Endonezya',
      specialty: 'Yoga & Wellness',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Tropik cennet Bali\'nin yoga retreat\'leri, geleneksel Balinese masajları ve wellness programları.',
      highlights: ['Yoga Retreats', 'Balinese Masaj', 'Meditation Centers', 'Organic Spa'],
      bestTime: 'Nisan - Ekim',
      duration: '5-7 gün',
      budget: '₺8.000 - ₺20.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 5,
      name: 'Baden-Baden, Almanya',
      specialty: 'Termal Spa',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Avrupa\'nın en ünlü spa şehri, tarihi termal banyoları ve lüks wellness merkezleri.',
      highlights: ['Friedrichsbad', 'Caracalla Therme', 'Luxury Spas', 'Black Forest'],
      bestTime: 'Mayıs - Eylül',
      duration: '3-4 gün',
      budget: '₺12.000 - ₺25.000',
      rating: 4.7,
      featured: false
    },
    {
      id: 6,
      name: 'Karlovy Vary, Çek Cumhuriyeti',
      specialty: 'Kür Tedavisi',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Tarihi spa şehri, şifalı termal suları ve geleneksel kür tedavileri ile ünlü.',
      highlights: ['Termal Kaynaklar', 'Kür Tedavisi', 'Spa Hotels', 'Kolonadlar'],
      bestTime: 'Mayıs - Eylül',
      duration: '4-6 gün',
      budget: '₺8.000 - ₺18.000',
      rating: 4.6,
      featured: false
    },
    {
      id: 7,
      name: 'Antalya, Türkiye',
      specialty: 'Luxury Spa',
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Akdeniz kıyısında lüks spa otelleri, hamam deneyimi ve modern wellness merkezleri.',
      highlights: ['Luxury Resorts', 'Turkish Hamam', 'Thalassotherapy', 'Beachfront Spas'],
      bestTime: 'Nisan - Kasım',
      duration: '4-5 gün',
      budget: '₺6.000 - ₺15.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 8,
      name: 'Toskana, İtalya',
      specialty: 'Wellness Retreats',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Toskana\'nın güzel tepelerinde wellness retreat\'leri, şarap banyoları ve doğal termal kaynaklar.',
      highlights: ['Wine Therapy', 'Termal Havuzlar', 'Wellness Retreats', 'Organic Treatments'],
      bestTime: 'Nisan - Ekim',
      duration: '3-5 gün',
      budget: '₺15.000 - ₺30.000',
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
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Ana Sayfa', link: '/' },
          { label: 'Spa Molaları' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/join_escapes_spa_molalari_spa_otelleri_.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-cyan-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Spa Molaları
              </h1>
              <Sparkles className="h-8 w-8 text-cyan-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Ruhunuzu ve bedeninizi yenileyen spa deneyimleri ve wellness destinasyonları
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-5 w-5" />
                <span>Wellness Destinasyonları</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="h-5 w-5" />
                <span>Spa & Wellness</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Premium Deneyimler</span>
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
              Öne Çıkan Spa Destinasyonları
            </h2>
            <p className="text-xl text-gray-600">
              En popüler wellness ve spa destinasyonları
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {spaDestinations.filter(dest => dest.featured).map((destination) => {
              // Kart içeriği
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                      <span className="text-sm text-cyan-600 font-medium">{destination.specialty}</span>
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
                      <button className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-2 rounded-full hover:from-cyan-600 hover:to-teal-600 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Alicante kartı için özel link
              if (destination.name === 'Alicante, İspanya') {
                return (
                  <Link
                    key={destination.id}
                    to="/seyahat-rehberi/sha-wellness-clinic-ispanyanin-kalbinde-sifa-yolculugu"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Kerala kartı için özel link
              if (destination.name === 'Kerala, Hindistan') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/ananda-in-the-himalayas-hindistanda-spirituel-bir-luks"
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



      {/* Spa Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Spa & Wellness Rehberi
            </h2>
            <p className="text-xl text-gray-600">
              Spa ve wellness deneyimleri hakkında detaylı bilgiler
            </p>
          </div>

          {spaPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {spaPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/spa-molalari/${post.category_slug}/${post.tag_slug || 'spamolalari'}/${post.slug}`}
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
                      <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
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
                      <div className="bg-cyan-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-cyan-600 transition-colors flex items-center space-x-1">
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
                <Sparkles className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Spa Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Spa molaları etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Spa Molasına Hazır mısınız?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/seyahat-onerileri"
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Seyahat Önerileri</span>
            </Link>
            <Link
              to="/destinations"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-cyan-600 transition-colors flex items-center justify-center space-x-2"
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

export default SpaMolalari 