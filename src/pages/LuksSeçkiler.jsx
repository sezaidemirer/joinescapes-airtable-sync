import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Crown, Award, Gem, Eye, Heart } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import Breadcrumb from '../components/Breadcrumb'

const LuksSeçkiler = () => {
  const [loading, setLoading] = useState(true)
  const [luxuryPosts, setLuxuryPosts] = useState([])
  
  // SEO tags
  const seoTags = generateSEOTags('luks-seckiler')

  useEffect(() => {
    loadLuxuryPosts()
  }, [])

  const loadLuxuryPosts = async () => {
    setLoading(true)
    try {
      console.log('🏷️ Lüks Seçkiler yazıları yükleniyor...')
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      console.log('📋 Tüm etiketler:', allTags?.map(t => ({ name: t.name, slug: t.slug })))
      
      // Tüm etiketleri listele ve lüks olanları bul
      console.log('🔍 Lüks etiketleri aranıyor...')
      const luxuryTags = allTags?.filter(tag => 
        tag.name.toLowerCase().includes('lüks') ||
        tag.name.toLowerCase().includes('luks') ||
        tag.slug.includes('luks') ||
        tag.slug.includes('seckiler') ||
        tag.slug.includes('seçkiler')
      )
      
      console.log('💎 Bulunan lüks etiketleri:', luxuryTags)
      
      // "Lüks Seçkiler" etiketini öncelikle bul
      const luksSeckilerTag = luxuryTags?.find(tag => 
        tag.slug === 'luks-seckiler' || 
        tag.name === 'Lüks Seçkiler'
      )
      
      // Eğer "Lüks Seçkiler" yoksa ilk lüks etiketini kullan
      const luxuryTag = luksSeckilerTag || luxuryTags?.[0]
      
      console.log('💎 Bulunan lüks etiketi:', luxuryTag)
      
      let posts = []
      let error = null
      
      if (luxuryTag) {
        // "Lüks Seçkiler" etiketli yazıları getir
        console.log('🔍 Lüks etiketli yazılar aranıyor:', luxuryTag.slug)
        const response = await blogPostsWithTags.getPostsByTag(luxuryTag.slug, 12)
        posts = response.data
        error = response.error
        console.log('📝 Bulunan yazılar:', posts?.length || 0)
      } else {
        console.log('⚠️ Lüks etiketi bulunamadı')
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Lüks seyahat deneyimi rehberi...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setLuxuryPosts(formattedPosts)
        console.log('✅ Lüks yazıları yüklendi:', formattedPosts.length)
      } else {
        console.log('⚠️ Lüks yazıları bulunamadı')
        setLuxuryPosts([])
      }
    } catch (error) {
      console.error('"Lüks Seçkiler" yazıları yüklenemedi:', error)
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

  // Lüks destinasyonları
  const luxuryDestinations = [
    {
      id: 1,
      name: 'Dubai, BAE',
      specialty: 'Ultra Luxury',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Dünyanın en lüks otellerinde konaklama, özel alışveriş deneyimi ve exclusive aktiviteler.',
      highlights: ['Burj Al Arab', 'Private Shopping', 'Desert Safari', 'Yacht Charter'],
      bestTime: 'Kasım - Mart',
      duration: '4-5 gün',
      budget: '₺30.000 - ₺100.000',
      rating: 4.9,
      featured: true,
      link: '/destinasyon/burj-khalifada-luksun-zirvesi-dubaide-efsanevi-bir-konaklama-deneyimi'
    },
    {
      id: 2,
      name: 'Katar, Doha',
      specialty: 'Premium Experience',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Modern mimarinin zirvesi, geleneksel Arap misafirperverliği ve exclusive kültür deneyimi.',
      highlights: ['Luxury Hotels', 'Cultural Tours', 'Private Dining', 'Desert Experience'],
      bestTime: 'Kasım - Mart',
      duration: '3-4 gün',
      budget: '₺20.000 - ₺75.000',
      rating: 4.7,
      featured: true
    },
    {
      id: 3,
      name: 'Santorini, Yunanistan',
      specialty: 'Luxury Cave Hotel',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Ege Denizi\'nin büyüleyici manzarasında lüks cave oteller, özel infinity pool\'lar ve gün batımı.',
      highlights: ['Cave Suite', 'Infinity Pool', 'Private Terrace', 'Sunset View'],
      bestTime: 'Nisan - Ekim',
      duration: '4-6 gün',
      budget: '₺25.000 - ₺80.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 4,
      name: 'Toskana, İtalya',
      specialty: 'Wine Estate',
      image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Özel şarap malikânelerinde konaklama, michelin yıldızlı restoranlar ve kişisel sommelier hizmeti.',
      highlights: ['Wine Estate', 'Michelin Dining', 'Private Chef', 'Vineyard Tours'],
      bestTime: 'Nisan - Ekim',
      duration: '5-7 gün',
      budget: '₺40.000 - ₺120.000',
      rating: 4.8,
      featured: false
    },
    {
      id: 5,
      name: 'Seychelles',
      specialty: 'Private Island',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Özel ada deneyimi, butik resort konaklama ve dünyanın en güzel plajlarında exclusive hizmet.',
      highlights: ['Private Island', 'Butler Service', 'Helicopter Transfer', 'Exclusive Beach'],
      bestTime: 'Nisan - Ekim',
      duration: '6-8 gün',
      budget: '₺60.000 - ₺200.000',
      rating: 4.9,
      featured: false
    },
    {
      id: 6,
      name: 'Aspen, ABD',
      specialty: 'Ski Resort',
      image: 'https://images.unsplash.com/photo-1551524164-6cf2ac426ab8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Dünya klasında kayak pistleri, lüks chalet konaklama ve exclusive après-ski deneyimi.',
      highlights: ['Luxury Chalet', 'Private Ski Instructor', 'Heli-Skiing', 'Spa & Wellness'],
      bestTime: 'Aralık - Mart',
      duration: '5-7 gün',
      budget: '₺45.000 - ₺130.000',
      rating: 4.8,
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
          { label: 'Lüks Seçkiler' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/join_escapes_lux_seckiler.webp')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Lüks Seçkiler
              </h1>
              <Crown className="h-8 w-8 text-yellow-400 ml-3" />
            </div>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Dünyanın en seçkin destinasyonlarında unutulmaz lüks seyahat deneyimleri
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Gem className="h-5 w-5" />
                <span>Premium Deneyimler</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>Exclusive Hizmet</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-5 w-5" />
                <span>5 Yıldız Konfor</span>
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
              Öne Çıkan Lüks Destinasyonlar
            </h2>
            <p className="text-xl text-gray-600">
              En prestijli ve exclusive seyahat deneyimleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {luxuryDestinations.filter(dest => dest.featured).map((destination) => {
              const CardContent = (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                      <span className="text-sm text-amber-600 font-medium">{destination.specialty}</span>
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
                      <button className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-2 rounded-full hover:from-amber-700 hover:to-yellow-700 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              // Dubai kartı için özel link
              if (destination.name === 'Dubai, BAE') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/burj-khalifada-luksun-zirvesi-dubaide-efsanevi-bir-konaklama-deneyimi"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Katar kartı için özel link
              if (destination.name === 'Katar, Doha') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/katarda-luksun-yeni-adresi-rixos-gulf-hotel-doha"
                    className="block"
                  >
                    {CardContent}
                  </Link>
                );
              }

              // Maldivler kartı için özel link
              if (destination.name === 'Maldivler') {
                return (
                  <Link
                    key={destination.id}
                    to="/destinasyon/maldivler-cennet-adalar"
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
                    to="/destinasyon/santorini-lüks-tatil"
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

      {/* Luxury Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lüks Seyahat Rehberi
            </h2>
            <p className="text-xl text-gray-600">
              Premium seyahat deneyimleri hakkında detaylı bilgiler
            </p>
          </div>

          {luxuryPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {luxuryPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/${post.category_slug}/${post.slug}`}
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
                <Crown className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Lüks Seçkiler Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Lüks seçkiler etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Lüks Seyahat Deneyimine Hazır mısınız?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/seyahat-onerileri"
              className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Heart className="h-5 w-5" />
              <span>Seyahat Önerileri</span>
            </Link>
            <Link
              to="/destinations"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>Tüm Lüks Destinasyonlar</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LuksSeçkiler 