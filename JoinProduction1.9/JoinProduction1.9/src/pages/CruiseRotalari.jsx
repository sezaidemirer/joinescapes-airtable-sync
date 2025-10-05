import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Ship, Anchor, Compass, Eye, Heart } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import Breadcrumb from '../components/Breadcrumb'

const CruiseRotalari = () => {
  const [loading, setLoading] = useState(true)
  const [cruisePosts, setCruisePosts] = useState([])
  
  // SEO tags
  const seoTags = generateSEOTags('cruise-rotalari')

  useEffect(() => {
    loadCruisePosts()
  }, [])

  const loadCruisePosts = async () => {
    setLoading(true)
    try {
      
      // Önce tüm etiketleri kontrol et
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      
      // "Cruise Rotaları" etiketini bul
      const cruiseTag = allTags?.find(tag => 
        tag.name === 'Cruise Rotaları' ||
        tag.slug === 'cruise-rotalari' || 
        tag.slug === 'cruise_rotalari' ||
        tag.name.toLowerCase().includes('cruise') ||
        tag.slug.includes('cruise')
      )
      
      
      let posts = []
      let error = null
      
      if (cruiseTag) {
        // "Cruise Rotaları" etiketli yazıları getir
        const response = await blogPostsWithTags.getPostsByTag(cruiseTag.slug, 12)
        posts = response.data
        error = response.error
      } else {
        posts = []
      }
      
      if (!error && posts && posts.length > 0) {
        const formattedPosts = posts.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.description || 'Cruise seyahat rehberi ve ipuçları...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: post.category_name,
          category_slug: post.category_slug,
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0,
          published_at: post.published_at || post.created_at,
          author_name: post.author_name || 'Editör'
        }))
        setCruisePosts(formattedPosts)
      } else {
      }
    } catch (error) {
      console.error('"Cruise Rotaları" yazıları yüklenemedi:', error)
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

  // Cruise rotaları
  const cruiseRoutes = [
    {
      id: 1,
      name: 'Akdeniz Cruise',
      route: 'İstanbul → Yunanistan → İtalya → Fransa',
      duration: '7 gece',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'MSC Splendida',
      description: 'Akdeniz\'in en güzel limanlarını keşfedin. Tarih, kültür ve lezzet dolu bir yolculuk.',
      highlights: ['All Inclusive', 'Lüks Kabin', 'Gece Hayatı'],
      price: '₺8,500',
      capacity: '4,000 kişi'
    },
    {
      id: 2,
      name: 'Ege Cruise',
      route: 'İzmir → Santorini → Mykonos',
      duration: '5 gece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'Celebrity Edge',
      description: 'Ege Denizi\'nin turkuaz sularında unutulmaz bir yolculuk. Yunan adalarının büyüsü.',
      highlights: ['Romantik', 'Manzara', 'Gün Batımı'],
      price: '₺6,200',
      capacity: '2,900 kişi'
    },
    {
      id: 3,
      name: 'Karadeniz Cruise',
      route: 'İstanbul → Odessa → Soçi',
      duration: '6 gece',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'Royal Caribbean',
      description: 'Karadeniz\'in saklı güzelliklerini keşfedin. Farklı kültürler, farklı tatlar.',
      highlights: ['Kültürel', 'Tarihi', 'Doğal'],
      price: '₺7,800',
      capacity: '3,500 kişi'
    },
    {
      id: 4,
      name: 'Norveç Fiyortları',
      route: 'Bergen → Geiranger → Flam',
      duration: '8 gece',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'Norwegian Star',
      description: 'Dünyanın en muhteşem doğal güzelliklerinden biri. Fiyortların büyüleyici manzarası.',
      highlights: ['Doğa', 'Fiyortlar', 'Aurora'],
      price: '₺15,000',
      capacity: '2,200 kişi'
    },
    {
      id: 5,
      name: 'Karayip Cruise',
      route: 'Miami → Barbados → Jamaika',
      duration: '9 gece',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'Allure of the Seas',
      description: 'Tropik cennetin tadını çıkarın. Beyaz kumlu plajlar ve berrak sular.',
      highlights: ['Tropik', 'Plaj', 'Aktivite'],
      price: '₺12,500',
      capacity: '5,400 kişi'
    },
    {
      id: 6,
      name: 'Baltık Cruise',
      route: 'Stockholm → Helsinki → St. Petersburg',
      duration: '7 gece',
      image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ship: 'Princess Cruises',
      description: 'Kuzey Avrupa\'nın tarihi şehirlerini keşfedin. Kültür ve sanat dolu bir yolculuk.',
      highlights: ['Tarih', 'Kültür', 'Sanat'],
      price: '₺11,200',
      capacity: '3,100 kişi'
    }
  ]

  // Cruise ipuçları
  const cruiseTips = [
    {
      id: 1,
      title: 'Kabin Seçimi',
      icon: Ship,
      description: 'Doğru kabin seçimi cruise deneyiminizi büyük ölçüde etkiler.',
      tips: [
        'Balkonlu kabinleri tercih edin',
        'Orta katlarda kalmayı deneyin',
        'Asansör yakınından kaçının',
        'Deniz manzaralı kabinleri seçin'
      ]
    },
    {
      id: 2,
      title: 'Paket Seçenekleri',
      icon: Compass,
      description: 'Cruise paketlerini karşılaştırarak en uygun olanı seçin.',
      tips: [
        'All-inclusive paketleri değerlendirin',
        'İçecek paketlerini karşılaştırın',
        'Excursion paketlerini araştırın',
        'WiFi paketlerini kontrol edin'
      ]
    },
    {
      id: 3,
      title: 'Hazırlık Listesi',
      icon: Anchor,
      description: 'Cruise\'a çıkmadan önce hazırlanması gereken önemli detaylar.',
      tips: [
        'Pasaport ve vize kontrolü yapın',
        'Deniz tutması ilacı alın',
        'Formal kıyafetler hazırlayın',
        'Güneş kremi ve şapka almayı unutmayın'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Ana Sayfa', link: '/' },
          { label: 'Cruise Rotaları' }
        ]} 
      />
      
      {/* Hero Section */}
      <section 
        className="relative text-white h-[500px] flex items-center"
        style={{
          backgroundImage: 'url(/images/join_escapes_cruise__gemi_turları.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Ship className="h-16 w-16 text-yellow-300" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cruise Rotaları
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Denizlerin büyüsünü keşfedin. Lüks cruise gemileriyle unutulmaz yolculuklar, eşsiz destinasyonlar ve her şey dahil konforu.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <Anchor className="h-5 w-5 mr-2" />
                <span>Lüks Gemiler</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <Compass className="h-5 w-5 mr-2" />
                <span>Eşsiz Rotalar</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <Compass className="h-5 w-5 mr-2" />
                <span>All Inclusive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Yazıları */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cruise Seyahat Rehberleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deneyimli cruise uzmanlarından pratik öneriler ve detaylı seyahat rehberleri.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cruisePosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cruisePosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/cruise-rotalari/${post.category_slug || 'seyahat-rehberi'}/cruise-rotalari/${post.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer block"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Cruise
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.created_at)}</span>
                      <span className="mx-2">•</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || post.content?.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Compass className="h-4 w-4 mr-1" />
                        <span>{post.read_time || 5} dk okuma</span>
                      </div>
                      <Link 
                        to={`/cruise-rotalari/${post.category_slug || 'seyahat-rehberi'}/cruise-rotalari/${post.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Devamını Oku</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Cruise Yazısı Yok
              </h3>
              <p className="text-gray-600 mb-6">
                Admin panelinden "Cruise Rotaları" etiketli yazılar ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Cruise İpuçları */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cruise İpuçları
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Cruise yolculuğunuzdan en iyi şekilde faydalanmak için bilmeniz gereken önemli detaylar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cruiseTips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <tip.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {tip.description}
                </p>
                
                <ul className="space-y-2">
                  {tip.tips.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}

export default CruiseRotalari 