import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogPosts, blogCategories } from '../lib/blog'
import { blogTags, postTags } from '../lib/tags'
import { Calendar, User, Eye, ArrowLeft, Grid, List, Tag } from 'lucide-react'
import SEO from '../components/SEO'
import { generateCategorySEOTags } from '../utils/seo'
import SocialShare from '../components/SocialShare'

const CategoryPosts = () => {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [tag, setTag] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [page, setPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [isTagPage, setIsTagPage] = useState(false)
  const postsPerPage = 12
  
  // Dinamik SEO tags - kategori/tag yüklendikten sonra oluşturulacak
  const [seoTags, setSeoTags] = useState(null)

  useEffect(() => {
    fetchCategoryAndPosts()
  }, [categorySlug, page])

  const fetchCategoryAndPosts = async () => {
    setLoading(true)
    setError(null)

    try {
      // Önce etiket olup olmadığını kontrol et
      const { data: tagData, error: tagError } = await blogTags.getBySlug(categorySlug)
      
      if (!tagError && tagData) {
        // Bu bir etiket sayfası
        setIsTagPage(true)
        setTag(tagData)
        
        // Etikete ait yazıları getir
        const { data: postsData, error: postsError } = await postTags.getPostsByTag(
          categorySlug, 
          { 
            limit: postsPerPage, 
            offset: (page - 1) * postsPerPage 
          }
        )
        
        if (postsError) {
          setError('Yazılar yüklenirken hata oluştu')
          return
        }

        setPosts(postsData || [])
        
        // Toplam yazı sayısını da al (pagination için)
        const { data: allPosts } = await postTags.getPostsByTag(categorySlug, { limit: 1000 })
        setTotalPosts(allPosts?.length || 0)
        
        // Tag için dinamik SEO tags oluştur
        const dynamicSeoTags = generateCategorySEOTags(tagData, postsData || [])
        setSeoTags(dynamicSeoTags)
        
      } else {
        // Bu bir kategori sayfası
        setIsTagPage(false)
        
        // Kategoriyi getir
        const { data: categoryData, error: categoryError } = await blogCategories.getBySlug(categorySlug)
        if (categoryError || !categoryData) {
          setError('Kategori bulunamadı')
          return
        }
        setCategory(categoryData)

        // Kategoriye ait yazıları getir
        const { data: postsData, error: postsError } = await blogPosts.getByCategory(
          categorySlug, 
          { 
            limit: postsPerPage, 
            offset: (page - 1) * postsPerPage 
          }
        )
        
        if (postsError) {
          setError('Yazılar yüklenirken hata oluştu')
          return
        }

        setPosts(postsData || [])
        
        // Toplam yazı sayısını da al (pagination için)
        const { data: allPosts } = await blogPosts.getByCategory(categorySlug, { limit: 1000 })
        setTotalPosts(allPosts?.length || 0)
        
        // Kategori için dinamik SEO tags oluştur
        const dynamicSeoTags = generateCategorySEOTags(categoryData, postsData || [])
        setSeoTags(dynamicSeoTags)
      }

    } catch (err) {
      setError('Bir hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-2/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📂</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategori Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/news')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Haberlere Dön
          </button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dinamik SEO Meta Tags */}
      {seoTags && <SEO {...seoTags} />}
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
            <Link 
              to="/" 
              className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
            >
              Ana Sayfa
            </Link>
            <span className="text-gray-400 mx-1">›</span>
            <Link 
              to="/haberler" 
              className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
            >
              Haberler
            </Link>
            <span className="text-gray-400 mx-1">›</span>
            {isTagPage ? (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium truncate max-w-xs">
                {tag?.name}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium truncate max-w-xs">
                {category?.name}
              </span>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {isTagPage ? (
                  <>
                    <span 
                      className="inline-flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ backgroundColor: tag?.color || '#3B82F6' }}
                    >
                      <Tag className="h-4 w-4" />
                      <span>{tag?.name}</span>
                    </span>
                    <span className="text-gray-600">
                      {totalPosts} yazı
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      className="inline-block px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ backgroundColor: category?.color || '#3B82F6' }}
                    >
                      {category?.name}
                    </span>
                    <span className="text-gray-600">
                      {totalPosts} yazı
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isTagPage ? `${tag?.name} Yazıları` : `${category?.name} Haberleri`}
              </h1>
              {(isTagPage ? tag?.description : category?.description) && (
                <p className="text-gray-600 mt-2 max-w-2xl">
                  {isTagPage ? tag.description : category.description}
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Geri Dön</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Sayfa {page} / {totalPages} 
              {totalPages > 1 && ` • ${totalPosts} yazının ${(page - 1) * postsPerPage + 1}-${Math.min(page * postsPerPage, totalPosts)} arası`}
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Bu kategoride henüz yazı yok
            </h2>
            <p className="text-gray-600">
              Yakında bu kategoriye yeni yazılar eklenecek.
            </p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/${post.category_slug}/${post.slug}`}
                    className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-600">{post.read_time} dk</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6 mb-12">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/${post.category_slug}/${post.slug}`}
                    className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="md:flex">
                      {post.featured_image_url && (
                        <div className="md:w-64 md:flex-shrink-0">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-gray-600">{post.read_time} dakika okuma</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            <Eye className="h-3 w-3 inline mr-1" />
                            {post.views || 0}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{post.author_name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  const isCurrentPage = pageNum === page
                  const shouldShow = 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= page - 2 && pageNum <= page + 2)
                  
                  if (!shouldShow) {
                    if (pageNum === page - 3 || pageNum === page + 3) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>
                    }
                    return null
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        isCurrentPage
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Sosyal Medya Paylaşım Butonu */}
      <SocialShare
        title={isTagPage ? `${tag?.name} - JoinEscapes` : `${category?.name} - JoinEscapes`}
        url={window.location.href}
        description={isTagPage ? `${tag?.name} etiketli yazılar` : `${category?.name} kategorisindeki yazılar`}
        hashtags={['JoinEscapes', 'Seyahat', 'Turizm', 'Destinasyon']}
        variant="floating"
      />
    </div>
  )
}

export default CategoryPosts 