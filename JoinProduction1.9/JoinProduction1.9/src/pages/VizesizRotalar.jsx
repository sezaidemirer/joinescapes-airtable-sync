import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, ArrowRight, Plane, Globe, Eye, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const VizesizRotalar = () => {
  const [visaFreePosts, setVisaFreePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // SEO tags
  const seoTags = generateSEOTags('vizesiz-rotalar')

  useEffect(() => {
    fetchVisaFreePosts()
  }, [])

  const fetchVisaFreePosts = async () => {
    setLoading(true)
    try {
      console.log('🔍 Vizesiz rotalar yazıları getiriliyor...')

      // Direkt "vizesizrotalar" etiketli yazıları getir
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories!inner(name, slug),
          post_tags!inner(
            tags!inner(id, name, slug)
          )
        `)
        .eq('status', 'published')
        .eq('post_tags.tags.slug', 'vizesizrotalar')
        .order('published_at', { ascending: false })
        .limit(12)

      if (error) {
        console.error('❌ Vizesiz rotalar fetch error:', error)
        throw new Error('Vizesiz rotalar yazıları yüklenemedi: ' + error.message)
      }

      if (!posts || posts.length === 0) {
        console.log('⚠️ Vizesiz rotalar etiketli yazı bulunamadı')
        setVisaFreePosts([])
        return
      }

      console.log('✅ Vizesiz rotalar yazı sayısı:', posts.length)

      // Veriyi formatla
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.featured_image_url,
        slug: post.slug,
        created_at: post.created_at,
        published_at: post.published_at,
        author_name: post.author_name || 'JoinEscapes',
        author_id: post.author_id,
        category: post.categories?.name || 'Vizesiz Rotalar',
        category_slug: post.categories?.slug || 'vizesiz-rotalar',
        tag_objects: post.post_tags?.map(pt => pt.tags) || []
      }))

      console.log('✅ Formatlanmış yazılar:', formattedPosts.length)
      setVisaFreePosts(formattedPosts)

    } catch (err) {
      console.error('❌ Vizesiz rotalar error:', err)
      setError('Vizesiz rotalar yazıları yüklenirken hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vizesiz rotalar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchVisaFreePosts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO {...seoTags} />
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Ana Sayfa', link: '/' },
          { label: 'Vizesiz Rotalar' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative py-24">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ 
            backgroundImage: `url(/images/join_escapes_vizesiz_rotalar.webp)` 
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Vizesiz Seyahat Rotaları
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto">
              Sadece pasaportla keşfedebileceğiniz muhteşem destinasyonlar ve uzman rehberleri
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-medium">✈️ Vize Yok</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-medium">🎒 Kolay Seyahat</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-medium">💰 Ekonomik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vizesiz Rotalar Rehberi
            </h2>
            <p className="text-lg text-gray-600">
              Uzmanlarımızın hazırladığı vizesiz seyahat rehberleri
            </p>
          </div>

          {visaFreePosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Henüz vizesiz rotalar yazısı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visaFreePosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/vizesiz-rotalar/${post.category_slug}/vizesizrotalar/${post.slug}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Vizesiz
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{post.category}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{post.author_name}</span>
                      </div>
                      
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                        <span>Devamını Oku</span>
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vizesiz Seyahat Rehberi
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Vizesiz Rotalardan Haberdar Olmak İçin Bültene Kayıt Olun
          </p>
          <Link
            to="/iletisim"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          >
            <span>Bültene Kayıt Ol</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VizesizRotalar 