import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, ArrowRight, Calendar, Users, Eye, Building2, Crown, Award, Gem } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const Oteller = () => {
  const [hotelPosts, setHotelPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // SEO tags
  const seoTags = generateSEOTags('oteller')

  useEffect(() => {
    loadHotelPosts()
  }, [])

  const loadHotelPosts = async () => {
    try {
      setLoading(true)
      console.log('🏨 Seçkin Oteller yazıları yükleniyor...')
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags } = await supabase.from('tags').select('*')
      console.log('📋 Tüm etiketler:', allTags?.length, 'adet')
      
      // Tüm etiketleri listele ve otel olanları bul
      console.log('🔍 Otel etiketleri aranıyor...')
      const hotelTags = allTags?.filter(tag => 
        tag.name.toLowerCase().includes('seçkin') ||
        tag.name.toLowerCase().includes('seckin') ||
        tag.name.toLowerCase().includes('otel') ||
        tag.slug.includes('otel') ||
        tag.slug.includes('hotel') ||
        tag.slug.includes('seckin') ||
        tag.slug.includes('seçkin')
      )
      
      console.log('🏨 Bulunan otel etiketleri:', hotelTags)
      
      // "Seçkin Oteller" etiketini öncelikle bul
      const seckinOtellerTag = hotelTags?.find(tag => 
        tag.slug === 'seckinoteller' || 
        tag.name === 'Seçkin Oteller'
      )
      
      // Eğer "Seçkin Oteller" yoksa ilk otel etiketini kullan
      const hotelTag = seckinOtellerTag || hotelTags?.[0]
      
      console.log('🏨 Bulunan otel etiketi:', hotelTag)
      
      let posts = []
      if (hotelTag) {
        const response = await blogPostsWithTags.getPostsByTag(hotelTag.slug, 12)
        posts = response.data || []
        console.log('📝 Bulunan otel yazıları:', posts.length)
      } else {
        console.log('⚠️ Otel etiketi bulunamadı')
      }
      
      // Her yazının görselini kontrol et
      posts.forEach((post, index) => {
      })
      setHotelPosts(posts)
      console.log('✅ Otel yazıları yüklendi:', posts.length)
    } catch (error) {
      console.error('Seçkin Oteller yazıları yüklenirken hata:', error)
      setHotelPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  // Öne çıkan oteller (2 tane featured)
  const featuredHotels = [
    {
      id: 1,
      name: 'Burj Al Arab',
      location: 'Dubai, Birleşik Arap Emirlikleri',
      image: '/images/burh_al_arab_dubai_otel.webp',
      description: 'Dünyanın en lüks otellerinden biri, yelken şeklindeki ikonik mimarisi ile göz kamaştırıyor.',
      highlights: ['7 Yıldızlı Lüks', 'Özel Plaj', 'Butler Servis', 'Helipad'],
      rating: 4.9,
      link: '/seyahat-rehberi/luksun-tanimi-burj-al-arab-deneyimi',
      featured: true
    },
    {
      id: 2,
      name: 'The Ritz Paris',
      location: 'Paris, Fransa',
      image: '/images/The Ritz Paris – Fransa.webp',
      description: 'Place Vendôme\'deki efsanevi otel, Fransız lüksünün ve zarafetin simgesi.',
      highlights: ['Tarihi Lüks', 'Michelin Yıldızlı', 'Spa Ritz', 'Haute Couture'],
      rating: 4.8,
      link: '/destinasyon/the-ritz-paris-zarafetin-ve-tarihin-kesistigi-efsanevi-konaklama-deneyimi',
      featured: true
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
          { label: 'Seçkin Oteller' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0">
          <img
            src="/images/join_escapes_her_sey_dahil_tatil.webp"
            alt="Seçkin Oteller - Lüks Konaklama Deneyimleri"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/join_escapes_her_sey_dahil_tatil.webp'
            }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-white mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Seçkin Oteller
            </h1>
            <Building2 className="h-8 w-8 text-white ml-3" />
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Dünyanın en seçkin otellerinde unutulmaz konaklama deneyimleri
          </p>
          <div className="flex items-center justify-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Lüks Konaklama</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>5 Yıldız Konfor</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gem className="h-5 w-5" />
              <span>Exclusive Hizmet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Oteller */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Lüks Oteller
            </h2>
            <p className="text-xl text-gray-600">
              En prestijli ve exclusive otel deneyimleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featuredHotels.map((hotel) => (
              <Link 
                key={hotel.id} 
                to={hotel.link}
                className="block"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        👑 Öne Çıkan
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{hotel.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">{hotel.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-2 rounded-full hover:from-amber-700 hover:to-yellow-700 transition-colors flex items-center space-x-2">
                        <span>Detayları Gör</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seçkin Oteller Blog Yazıları */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seçkin Oteller
            </h2>
            <p className="text-xl text-gray-600">
              Dünya çapında seçkin oteller ve konaklama deneyimleri hakkında detaylı bilgiler
            </p>
          </div>

          {hotelPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotelPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/${post.category_slug}/${post.slug}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group block"
                >
                  <div className="relative h-48">
                    <img
                      src={post.featured_image_url || post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }}
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
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Seçkin Otel Yazısı Yok
              </h3>
              <p className="text-gray-600">
                Seçkin oteller etiketli yazılar eklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Lüks Otel Deneyiminizi Keşfedin
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Dünyanın en prestijli otellerinde unutulmaz konaklama deneyimleri
          </p>
          <div className="flex justify-center">
            <Link
              to="/haberler"
              className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Tüm Oteller</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Oteller 