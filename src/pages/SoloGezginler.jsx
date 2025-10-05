import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Heart, Eye, Clock, Award, User } from 'lucide-react'
import { blogPostsWithTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'
import Breadcrumb from '../components/Breadcrumb'

const SoloGezginler = () => {
  const [loading, setLoading] = useState(true)
  const [soloPosts, setSoloPosts] = useState([])
  
  // SEO tags
  const seoTags = generateSEOTags('solo-gezginler')

  useEffect(() => {
    loadSoloPosts()
  }, [])

  const loadSoloPosts = async () => {
    setLoading(true)
    try {
      // Önce tüm etiketleri getir
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      if (tagsError) {
        throw new Error('Etiketler yüklenemedi: ' + tagsError.message)
      }

      // "Bireysel Gezginler" veya "Solo Gezginler" etiketini bul
      const soloTag = allTags?.find(tag => 
        tag.name === 'Bireysel Gezginler' ||
        tag.slug === 'bireysel-gezginler' ||
        tag.slug === 'bireysel_gezginler' ||
        tag.name === 'Solo Gezginler' ||
        tag.slug === 'solo-gezginler' || 
        tag.slug === 'solo_gezginler' ||
        tag.name.toLowerCase().includes('bireysel') ||
        tag.name.toLowerCase().includes('solo') ||
        tag.slug.includes('bireysel') ||
        tag.slug.includes('solo')
      )

      if (soloTag) {
        // Bireysel/Solo Gezginler etiketli yazıları getir
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            ),
            post_tags!inner (
              tags!inner (
                id,
                name,
                slug
              )
            )
          `)
          .eq('post_tags.tags.slug', soloTag.slug)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new Error('Bireysel gezginler yazıları yüklenemedi: ' + error.message)
        }

        // Veriyi formatla
        const formattedPosts = posts?.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || 'Solo seyahat rehberi ve ipuçları...',
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          slug: post.slug,
          created_at: post.created_at,
          author: post.author || 'JoinEscapes',
          category: post.categories?.name || 'Bireysel Gezginler',
          views: post.views || 0,
          likes: post.likes || 0
        })) || []

        setSoloPosts(formattedPosts)
      } else {
        console.warn('"Bireysel Gezginler" veya "Solo Gezginler" etiketi bulunamadı')
        setSoloPosts([])
      }
    } catch (error) {
      console.error('Bireysel gezginler yazıları yüklenirken hata oluştu:', error)
      setSoloPosts([])
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

  // Solo seyahat ipuçları
  const soloTips = [
    {
      id: 1,
      title: 'Güvenlik İpuçları',
      icon: User,
      description: 'Solo seyahat ederken güvenliğinizi sağlamak için temel kurallar.',
      tips: [
        'Konaklama yerini önceden ayırtın',
        'Yakınlarınızla düzenli iletişim kurun',
        'Değerli eşyalarınızı güvenli yerde saklayın',
        'Yerel acil durum numaralarını bilin'
      ]
    },
    {
      id: 2,
      title: 'Bütçe Planlama',
      icon: Clock,
      description: 'Solo seyahatinizin maliyetini optimize etmek için pratik öneriler.',
      tips: [
        'Hostel veya guesthouse tercih edin',
        'Yerel ulaşım araçlarını kullanın',
        'Sokak yemekleri deneyin',
        'Ücretsiz aktiviteleri araştırın'
      ]
    },
    {
      id: 3,
      title: 'Sosyalleşme',
      icon: Users,
      description: 'Yeni insanlarla tanışmak ve arkadaşlık kurmak için yöntemler.',
      tips: [
        'Hostel ortak alanlarını kullanın',
        'Walking tour\'lara katılın',
        'Yerel etkinliklere katılın',
        'Solo traveler gruplarına katılın'
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
          { label: 'Bireysel Gezginler' }
        ]} 
      />
      
      {/* Hero Section */}
      <section 
        className="relative text-white h-[500px] flex items-center"
        style={{
          backgroundImage: 'url(/images/solo_seyahat_rehberi_join_escapes_.webp)',
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
              <User className="h-16 w-16 text-yellow-300" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bireysel Gezginler
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Kendi başınıza seyahat etmenin büyüsünü keşfedin. Bireysel seyahat rehberleri, güvenlik ipuçları ve en iyi destinasyonlar.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <User className="h-5 w-5 mr-2" />
                <span>Güvenli Destinasyonlar</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 mr-2" />
                <span>Detaylı Rehberler</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <Eye className="h-5 w-5 mr-2" />
                <span>Fotoğraf İpuçları</span>
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
              Bireysel Seyahat Rehberleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deneyimli bireysel gezginlerden pratik öneriler ve detaylı seyahat rehberleri.
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
          ) : soloPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {soloPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {post.author}
                      </span>
                      <Link
                        to={`/${post.category.toLowerCase().replace(/\s/g, '-')}/${post.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                      >
                        <span>Oku</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Bireysel Seyahat Yazısı Yok
              </h3>
              <p className="text-gray-600 mb-6">
                Admin panelinden "Bireysel Gezginler" etiketli yazılar ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Solo Seyahat İpuçları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solo Seyahat İpuçları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tek başınıza seyahat ederken bilmeniz gereken pratik bilgiler ve öneriler.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {soloTips.map((tip) => (
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

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Solo Seyahat Maceranız Başlasın!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tek başınıza seyahat etmenin özgürlüğünü yaşayın. Size özel hazırlanmış rehberler ve ipuçları ile güvenli ve keyifli bir deneyim yaşayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/iletisim"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
            >
              <span>Seyahat Planı Al</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/haberler"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
            >
              <span>Tüm Rehberleri Gör</span>
              <Clock className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SoloGezginler 