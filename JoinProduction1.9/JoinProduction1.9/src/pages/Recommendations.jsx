import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Heart, Eye, Clock, Award } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import Breadcrumb from '../components/Breadcrumb'
import { blogPosts } from '../lib/blog'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const SeyahatOnerileri = () => {
  const [recommendations, setRecommendations] = useState([])
  const [featuredPost, setFeaturedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  const seoTags = generateSEOTags('seyahat-onerileri')

  // Verileri getir
  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const { data, error } = await blogPosts.getRecommendations(20)
      
      if (error) {
        setError('Seyahat önerileri yüklenemedi')
        console.error('Recommendations fetch error:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('🎯 Seyahat önerileri yüklendi:', data.length, 'yazı')
        
        // Debug: Her yazının etiketlerini kontrol et
        data.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`)
          console.log('   Etiketler:', post.tag_objects?.map(tag => tag.name) || [])
        })
        
        setFeaturedPost(data[0]) // İlk yazı öne çıkan olarak
        setRecommendations(data) // Tümü için grid
      } else {
        setRecommendations([])
        setFeaturedPost(null)
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu')
      console.error('Recommendations error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Statik veriler (fallback için)
  const staticRecommendations = [
    {
      id: 1,
      title: 'Bütçe Dostu Avrupa Turu İçin 10 İpucu',
      excerpt: 'Az parayla Avrupa\'yı gezmenin en etkili yolları ve pratik öneriler.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Elif Kaya',
      date: '2 gün önce',
      readTime: '8 dk',
      likes: 245,
      rating: 4.8,
      category: 'Bütçe Seyahati'
    },
    {
      id: 2,
      title: 'Solo Seyahat İçin Güvenlik Rehberi',
      excerpt: 'Tek başına seyahat ederken dikkat edilmesi gereken güvenlik önlemleri.',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Can Özdemir',
      date: '3 gün önce',
      readTime: '6 dk',
      likes: 189,
      rating: 4.9,
      category: 'Solo Seyahat'
    },
    {
      id: 3,
      title: 'Fotoğraf Çekimi İçin En İyi Destinasyonlar',
      excerpt: 'Instagram\'da viral olacak fotoğraflar için en fotojenik yerler.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Zeynep Arslan',
      date: '5 gün önce',
      readTime: '10 dk',
      likes: 312,
      rating: 4.7,
      category: 'Fotoğrafçılık'
    },
    {
      id: 4,
      title: 'Yerel Kültürü Deneyimlemenin Yolları',
      excerpt: 'Turistik yerler dışında yerel yaşamı keşfetmek için pratik öneriler.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Ahmet Yılmaz',
      date: '1 hafta önce',
      readTime: '7 dk',
      likes: 156,
      rating: 4.6,
      category: 'Kültür'
    },
    {
      id: 5,
      title: 'Seyahat Çantası Hazırlama Rehberi',
      excerpt: 'Pratik ve etkili bavul hazırlama teknikleri ve unutulmaması gerekenler.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Ayşe Yıldız',
      date: '1 hafta önce',
      readTime: '5 dk',
      likes: 203,
      rating: 4.5,
      category: 'Seyahat İpuçları'
    },
    {
      id: 6,
      title: 'Gastronomi Turizmi Rehberi',
      excerpt: 'Yerel lezzetleri keşfetmek ve gastronomi deneyimi yaşamak için öneriler.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Murat Demir',
      date: '2 hafta önce',
      readTime: '9 dk',
      likes: 278,
      rating: 4.8,
      category: 'Gastronomi'
    }
  ]

  // Tarih formatla
  const formatDate = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Dün'
    if (diffDays < 7) return `${diffDays} gün önce`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
    return `${Math.floor(diffDays / 30)} ay önce`
  }

  // Okuma süresi hesapla
  const calculateReadTime = (content) => {
    if (!content) return '5 dk'
    const words = content.trim().split(/\s+/).length
    const readTime = Math.ceil(words / 200)
    return `${readTime} dk`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Seyahat önerileri yükleniyor...</p>
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
          { label: 'Seyahat Önerileri' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/seyahat_onerileri_join_escapes.webp")'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Seyahat Önerileri
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Uzmanlardan pratik ipuçları ve deneyimler
          </p>
        </div>
      </section>

      {/* Featured Recommendation */}
      {featuredPost && (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Öne Çıkan Seyahat Önerisi</h2>
          </div>
          
          <div className="card overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                    src={featuredPost.featured_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                    alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    featuredPost.category_slug === 'lifestyle' ? 'bg-pink-500 text-white' : 'bg-primary-100 text-primary-800'
                  }`}>
                      {featuredPost.category_name || 'Seyahat Önerisi'}
                  </span>
                  
                  {/* Etiketler */}
                  <div className="flex items-center space-x-2">
                    {/* Öne çıkan etiketi */}
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium">Öne Çıkan</span>
                    </div>
                    
                    {/* Diğer etiketler */}
                    {featuredPost.tag_objects && featuredPost.tag_objects.length > 0 && 
                     featuredPost.tag_objects
                       .filter(tag => tag.slug !== 'oneri') // Öneri etiketini tekrar gösterme
                       .slice(0, 3) // Maksimum 3 etiket göster
                       .map((tag, index) => (
                         <span key={tag.slug} className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm border border-white">
                           {tag.name}
                         </span>
                       ))
                    }
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredPost.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt || 'Bu yazıda sizler için hazırladığımız özel seyahat önerilerini keşfedeceksiniz...'}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                        <span>{getAuthorDisplayName(featuredPost.author_name, featuredPost.author_id)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                        <span>{calculateReadTime(featuredPost.content)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(featuredPost.published_at)}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/${featuredPost.category_slug}/${featuredPost.slug}`}
                    className="btn-primary inline-block"
                  >
                  Devamını Oku
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Recommendations Grid */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Tüm Seyahat Önerileri
              {recommendations.length > 0 && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({recommendations.length} öneri)
                </span>
              )}
            </h2>
          </div>
          
          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz seyahat önerisi yok</h3>
              <p className="text-gray-500 mb-6">
                Admin panelden "öneri" etiketiyle yazı ekleyin
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Nasıl seyahat önerisi eklerim?</strong><br/>
                  1. Admin panele gidin<br/>
                  2. Yazı ekle'ye tıklayın<br/>
                  3. "Öneri" etiketini seçin<br/>
                  4. Yazıyı yayınlayın
                </p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((recommendation) => (
                <Link 
                  key={recommendation.id} 
                  to={`/${recommendation.category_slug}/${recommendation.slug}`}
                  className="card group cursor-pointer hover:shadow-lg transition-shadow"
                >
                <div className="relative overflow-hidden">
                  <img 
                      src={recommendation.featured_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                    alt={recommendation.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-medium ${
                    recommendation.category_slug === 'lifestyle' ? 'bg-pink-500' : 'bg-primary-600'
                  }`}>
                      {recommendation.category_name || 'Seyahat Önerisi'}
                  </div>
                  
                  {/* Etiketler */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-1">
                    {/* Öneri etiketi */}
                    <div className="bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-sm">
                      <Award className="h-3 w-3 text-primary-600" />
                      <span className="text-xs font-medium">Öneri</span>
                    </div>
                    
                    {/* Diğer etiketler (Lifestyle, vb.) */}
                    {recommendation.tag_objects && recommendation.tag_objects.length > 0 && 
                     recommendation.tag_objects
                       .filter(tag => tag.slug !== 'oneri') // Öneri etiketini tekrar gösterme
                       .slice(0, 3) // Maksimum 3 etiket göster
                       .map((tag, index) => (
                         <div key={tag.slug} className="bg-pink-500 text-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-sm border border-white">
                           <span className="text-xs font-medium">{tag.name}</span>
                         </div>
                       ))
                    }
                    

                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                    {recommendation.title}
                  </h3>
                  
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {recommendation.excerpt || 'Bu yazıda sizler için hazırladığımız özel seyahat önerilerini keşfedeceksiniz...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                          <span>{getAuthorDisplayName(recommendation.author_name, recommendation.author_id)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                          <span>{calculateReadTime(recommendation.content)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {formatDate(recommendation.published_at)}
                      </div>
                      <span className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                        Devamını Oku →
                      </span>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Kendi Seyahat Deneyiminizi Paylaşın
          </h2>
          <Link 
            to="/iletisim" 
            className="bg-white text-primary-600 font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Seyahat Önerisi Gönder
          </Link>
        </div>
      </section>
    </div>
  )
}

export default SeyahatOnerileri 