import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, User, ArrowRight, ArrowLeft } from 'lucide-react'
import { blogPostsWithTags, postTags } from '../lib/tags'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="flex space-x-1 mb-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          ></div>
        ))}
      </div>
      <p className="text-gray-600 animate-pulse">Sayfa yükleniyor...</p>
    </div>
  </div>
)

const TagPosts = () => {
  const { tagSlug } = useParams()
  const [posts, setPosts] = useState([])
  const [tag, setTag] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTagPosts = async () => {
      if (!tagSlug) return

      setLoading(true)
      setError(null)

      try {
        console.log('🏷️ Etiket yazıları getiriliyor:', tagSlug)

        // Etiket bilgilerini getir
        console.log('🔍 Etiket aranıyor:', tagSlug)
        const { data: tagData, error: tagError } = await postTags.getTagInfo(tagSlug)
        
        console.log('🏷️ Etiket sonucu:', { tagData, tagError })
        
        if (tagError) {
          console.error('❌ Etiket bilgisi alınamadı:', tagError)
          // Etiket bulunamadıysa, tüm etiketleri listele
          const { data: allTags } = await supabase.from('tags').select('*')
          console.log('📋 Mevcut etiketler:', allTags?.map(t => ({ name: t.name, slug: t.slug })))
          setError('Etiket bulunamadı')
          setLoading(false)
          return
        }

        if (!tagData) {
          console.log('⚠️ Etiket verisi boş')
          setError('Etiket bulunamadı')
          setLoading(false)
          return
        }

        setTag(tagData)
        console.log('✅ Etiket bilgisi:', tagData)

        // Etiketli yazıları getir
        const { data: postsData, error: postsError } = await postTags.getPostsByTagHighLimit(tagSlug, 50)

        if (postsError) {
          console.error('❌ Etiketli yazılar alınamadı:', postsError)
          setError('Yazılar yüklenemedi')
          setLoading(false)
          return
        }

        if (postsData && postsData.length > 0) {
          setPosts(postsData)
          console.log(`✅ ${postsData.length} yazı bulundu`)
        } else {
          console.log('⚠️ Bu etikete ait yazı bulunamadı')
          setPosts([])
        }

      } catch (error) {
        console.error('❌ Etiket sayfası hatası:', error)
        setError('Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchTagPosts()
  }, [tagSlug])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏷️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Etiket Bulunamadı</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            to="/haberler" 
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Haberlere Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏷️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Etiket Bulunamadı</h1>
          <p className="text-gray-600 mb-8">Aradığınız etiket mevcut değil</p>
          <Link 
            to="/haberler" 
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Haberlere Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title={`${tag.name} Etiketli Yazılar - JoinEscapes`}
        description={`${tag.name} etiketli seyahat ve turizm yazıları. En güncel ${tag.name} içerikleri JoinEscapes'te.`}
        keywords={`${tag.name}, seyahat, turizm, ${tag.name} yazıları, JoinEscapes`}
        ogImage={tag.image_url || '/images/default-og.webp'}
        ogUrl={`https://www.joinescapes.com/etiket/${tagSlug}`}
      />
      
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4 mb-6">
              <Link 
                to="/haberler" 
                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Haberlere Dön
              </Link>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <span 
                  className="px-4 py-2 text-sm font-medium text-white rounded-full"
                  style={{ backgroundColor: tag.color || '#3B82F6' }}
                >
                  {tag.name}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {tag.name} Etiketli Yazılar
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {posts.length} yazı bulundu
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-sm font-medium text-white rounded-full"
                        style={{ backgroundColor: post.category_color || '#3B82F6' }}
                      >
                        {post.category_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views || 0} görüntülenme</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>{post.author_name}</span>
                      </div>
                      
                      <Link 
                        to={`/${post.category_slug}/${post.slug}`}
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Devamını Oku
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Henüz yazı yok</h2>
              <p className="text-gray-600 mb-8">
                Bu etikete ait henüz yazı bulunmuyor. Daha sonra tekrar kontrol edin.
              </p>
              <Link 
                to="/haberler" 
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Tüm Haberleri Gör
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TagPosts
