import { useState, useEffect } from 'react'
import { blogPosts } from '../../lib/blog'
import { blogTags, postTags } from '../../lib/tags'
import { addAutoImageToPost } from '../../lib/autoImage'
import { X, Save, Eye, Upload, AlertCircle, Tag, Clock } from 'lucide-react'
import ImageUploader from './ImageUploader'
import ContentImageManager from './ContentImageManager'
import RichTextEditor from './RichTextEditor'
import DOMPurify from 'dompurify'
import { getTurkeyTimeISO } from '../../utils/dateUtils'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const PostForm = ({ post, categories, onSave, onCancel }) => {
  const { user } = useAuthContext()
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    published_at: '',
    tags: []
  })
  
  const [loading, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState('content')
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [autoImageLoading, setAutoImageLoading] = useState(false)

  // Etiketleri getir
  useEffect(() => {
    fetchTags()
  }, [])

  // Etiketler tab'ına tıklandığında da etiketleri yükle
  useEffect(() => {
    if (activeTab === 'tags' && availableTags.length === 0) {
      fetchTags()
    }
  }, [activeTab])

  // Form verilerini doldur
  useEffect(() => {
    if (post) {
      // published_at'ı datetime-local input için uygun formata çevir (Türkiye saati ile)
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        // Türkiye saati için +3 saat ekle
        const turkeyTime = new Date(date.getTime() + (3 * 60 * 60 * 1000))
        return turkeyTime.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm" formatı
      }
      
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category_id: post.category_id || '',
        status: post.status || 'draft',
        featured_image_url: post.featured_image_url || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        published_at: formatDateForInput(post.published_at),
        tags: post.tags || []
      })
      
      // Mevcut post'un etiketlerini getir
      if (post.id) {
        fetchPostTags(post.id)
      }
    }
  }, [post])

  const fetchTags = async () => {
    setTagsLoading(true)
    try {
      const { data, error } = await blogTags.getAll()
      if (!error && data) {
        setAvailableTags(data)
      }
    } catch (error) {
      console.error('Etiketler yüklenemedi:', error)
    } finally {
      setTagsLoading(false)
    }
  }

  const fetchPostTags = async (postId) => {
    const { data, error } = await postTags.getPostTags(postId)
    if (!error && data) {
      setSelectedTags(data.map(tag => tag.slug))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId)
    
    // Etiketler tab'ına geçerken etiketleri yükle
    if (tabId === 'tags') {
      if (availableTags.length === 0) {
        await fetchTags()
      }
      // Eğer post varsa ve henüz post etiketleri yüklenmediyse
      if (post && post.id && selectedTags.length === 0) {
        await fetchPostTags(post.id)
      }
    }
  }

  const handleTagToggle = (tagSlug) => {
    setSelectedTags(prev => {
      if (prev.includes(tagSlug)) {
        return prev.filter(slug => slug !== tagSlug)
      } else {
        return [...prev, tagSlug]
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'İçerik gereklidir'
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori seçimi gereklidir'
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Özet gereklidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (status = formData.status) => {
    if (!validateForm()) {
      setActiveTab('content') // Hata varsa content tab'ına git
      return
    }

    setSaving(true)
    
    try {
      // published_at'ı ISO string formatına çevir (Türkiye saati ile)
      const formatDateForDB = (dateString) => {
        if (!dateString) return null
        const date = new Date(dateString)
        // Türkiye saati için +3 saat ekle
        const turkeyTime = new Date(date.getTime() + (3 * 60 * 60 * 1000))
        return turkeyTime.toISOString()
      }
      
      // Otomatik görsel ekleme - eğer görsel yoksa
      let finalFormData = { ...formData }
      if (!formData.featured_image_url) {
        console.log('🖼️ Görsel yok, otomatik görsel aranıyor...')
        const postWithAutoImage = await addAutoImageToPost(formData)
        finalFormData = { ...formData, ...postWithAutoImage }
      }
      
      console.log('🔍 USER KONTROLÜ:', {
        user: user,
        user_id: user?.id,
        user_email: user?.email,
        user_metadata: user?.user_metadata
      })

      const postData = {
        ...finalFormData,
        status,
        author_id: user?.id,
        author_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonim',
        category_id: parseInt(finalFormData.category_id),
        published_at: formatDateForDB(finalFormData.published_at)
      }
      
      console.log('📝 POST DATA HAZIR:', {
        author_id: postData.author_id,
        author_name: postData.author_name,
        title: postData.title,
        status: postData.status
      })
      
      // Supabase auth durumunu kontrol et
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('🔐 SUPABASE AUTH USER:', {
        authUser: authUser,
        authUser_id: authUser?.id,
        postData_author_id: postData.author_id,
        ids_match: authUser?.id === postData.author_id
      })
      
      console.log('📝 PostData oluşturuldu:', {
        author_id: postData.author_id,
        author_name: postData.author_name,
        title: postData.title
      })

      let result
      if (post) {
        // Güncelle
        console.log('🔄 Yazı güncelleniyor:', post.id)
        result = await blogPosts.update(post.id, postData)
        
        if (result.error) {
          console.error('❌ Yazı güncelleme hatası:', result.error)
          throw new Error(`Yazı güncellenemedi: ${result.error.message}`)
        }
        
        // Etiketleri güncelle
        console.log('🏷️ Etiketler güncelleniyor...')
        const tagResult = await postTags.updatePostTags(post.id, selectedTags)
        if (tagResult.error) {
          console.warn('⚠️ Etiket güncelleme uyarısı:', tagResult.error)
        }
      } else {
        // Yeni oluştur
        console.log('🆕 Yeni yazı oluşturuluyor...')
        result = await blogPosts.create(postData)
        
        if (result.error) {
          console.error('❌ Yazı oluşturma hatası:', result.error)
          throw new Error(`Yazı oluşturulamadı: ${result.error.message}`)
        }
        
        if (result.data) {
          // Etiketleri ekle
          console.log('🏷️ Etiketler ekleniyor...')
          const tagResult = await postTags.updatePostTags(result.data.id, selectedTags)
          if (tagResult.error) {
            console.warn('⚠️ Etiket ekleme uyarısı:', tagResult.error)
          }
        }
      }

      console.log('✅ İşlem başarılı!')
      onSave()
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error)
      alert('Kaydetme işlemi başarısız: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)

  // Etiketleri featured ve normal olarak ayır
  const featuredTags = availableTags.filter(tag => tag.is_featured)
  const normalTags = availableTags.filter(tag => !tag.is_featured)

  // İçeriğe görsel ekleme fonksiyonu
  const handleImageInsert = (markdownImage) => {
    const currentContent = formData.content
    const newContent = currentContent + markdownImage
    handleInputChange('content', newContent)
  }

  // Basit markdown-to-HTML dönüştürücü (sadece görseller için)
  const renderContent = (content) => {
    if (!content) return 'İçerik girilmemiş'
    
    // Markdown görsellerini HTML'e çevir: ![alt](url) -> <img src="url" alt="alt" />
    const withImages = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
    )
    
    // Satır başlarını <br> etiketlerine çevir
    const withLineBreaks = withImages.replace(/\n/g, '<br />')
    
    // 🔒 GÜVENLİK: XSS saldırılarını önlemek için HTML içeriğini sanitize et
    const sanitizedContent = DOMPurify.sanitize(withLineBreaks, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option'],
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
    })
    
    return sanitizedContent
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {post ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {wordCount} kelime • {readTime} dk okuma
              </div>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Taslak Kaydet
              </button>
              {/* YAZARLAR ONAYA GÖNDER, SADECE ADMINLER DİREKT YAYINLAYABİLİR */}
              {user?.user_metadata?.user_role === 'yazar' ? (
                <button
                  onClick={() => handleSubmit('pending')}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>{loading ? 'Gönderiliyor...' : 'Onaya Gönder'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Kaydediliyor...' : 'Yayınla'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Ana İçerik */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'content', name: 'İçerik', icon: '📝' },
                { id: 'tags', name: 'Etiketler', icon: '🏷️' },
                { id: 'seo', name: 'SEO', icon: '🔍' },
                { id: 'preview', name: 'Önizleme', icon: '👁️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Yazı başlığını girin"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Özet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kısa Açıklama *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.excerpt ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Yazının kısa açıklaması"
                  />
                  {errors.excerpt && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.excerpt}
                    </p>
                  )}
                </div>

                {/* Yayın Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Yayın Tarihi ve Saati
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) => handleInputChange('published_at', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Boş bırakılırsa kaydetme tarihinde otomatik olarak ayarlanır
                  </p>
                </div>

                {/* İçerik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İçerik *
                  </label>
                  <div className={errors.content ? 'ring-2 ring-red-300 rounded-md' : ''}>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Yazı içeriğini buraya yazın..."
                    />
                  </div>
                  {errors.content && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* İçerik Görselleri - NEW */}
                <ContentImageManager onImageInsert={handleImageInsert} />

                {/* Öne Çıkan Görsel - UPDATED */}
                <div className="space-y-3">
                  <ImageUploader
                    onImageChange={(url) => handleInputChange('featured_image_url', url)}
                    currentImage={formData.featured_image_url}
                    label="Öne Çıkan Görsel"
                  />
                  
                  {/* Otomatik Görsel Ekleme Butonu */}
                  {!formData.featured_image_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAutoImageLoading(true)
                        try {
                          console.log('🖼️ Otomatik görsel aranıyor...')
                          const postWithAutoImage = await addAutoImageToPost(formData)
                          if (postWithAutoImage.featured_image_url) {
                            handleInputChange('featured_image_url', postWithAutoImage.featured_image_url)
                            console.log('✅ Otomatik görsel eklendi!')
                          }
                        } catch (error) {
                          console.error('❌ Otomatik görsel ekleme hatası:', error)
                        } finally {
                          setAutoImageLoading(false)
                        }
                      }}
                      disabled={autoImageLoading}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {autoImageLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Görsel Aranıyor...
                        </>
                      ) : (
                        <>
                          🎯 Otomatik Görsel Ekle
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* Tags Tab */}
            {activeTab === 'tags' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                
                {tagsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Etiketler yükleniyor...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Özel Etiketler */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        Özel Etiketler
                        {availableTags.length > 0 && (
                          <span className="ml-2 text-sm text-gray-500">({availableTags.length} etiket)</span>
                        )}
                      </h3>
                      
                      {featuredTags.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Öne Çıkan Etiketler:</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {featuredTags.map((tag) => (
                              <label
                                key={tag.id}
                                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTags.includes(tag.slug)}
                                  onChange={() => handleTagToggle(tag.slug)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  ></span>
                                  <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">({tag.usage_count})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {normalTags.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <h4 className="text-sm font-medium text-gray-700">Diğer Etiketler:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {normalTags.map((tag) => (
                              <label
                                key={tag.id}
                                className="flex items-center space-x-3 p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTags.includes(tag.slug)}
                                  onChange={() => handleTagToggle(tag.slug)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  ></span>
                                  <span className="text-sm text-gray-900">{tag.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">({tag.usage_count})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableTags.length === 0 && !tagsLoading && (
                        <div className="text-center py-8">
                          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Henüz etiket eklenmemiş.</p>
                          <p className="text-sm text-gray-400 mt-1">Supabase'de etiket sistemi SQL'ini çalıştırdığınızdan emin olun.</p>
                        </div>
                      )}
                    </div>

                    {/* Seçilen Etiketler Önizleme */}
                    {selectedTags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Seçilen Etiketler:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tagSlug) => {
                            const tag = availableTags.find(t => t.slug === tagSlug)
                            if (!tag) return null
                            
                            return (
                              <span
                                key={tagSlug}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                                <button
                                  onClick={() => handleTagToggle(tagSlug)}
                                  className="ml-2 hover:bg-black/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Eski Etiket Sistemi (Manuel Etiket Ekleme) */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Manuel Etiket Ekle:</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Yeni etiket ekle ve Enter'a bas"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Ekle
                        </button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                #{tag}
                                <button
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="SEO için özel başlık (boş bırakılırsa ana başlık kullanılır)"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meta_title.length}/60 karakter
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Açıklama
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="SEO için açıklama (boş bırakılırsa özet kullanılır)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meta_description.length}/160 karakter
                  </p>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="prose max-w-none">
                  {formData.featured_image_url && (
                    <img 
                      src={formData.featured_image_url} 
                      alt={formData.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {formData.title || 'Başlık Girilmemiş'}
                  </h1>
                  
                  {/* Etiket önizlemesi */}
                  {selectedTags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tagSlug) => {
                          const tag = availableTags.find(t => t.slug === tagSlug)
                          if (!tag) return null
                          
                          return (
                            <span
                              key={tagSlug}
                              className="inline-block px-2 py-1 text-xs text-white rounded-full"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-lg text-gray-600 mb-6">
                    {formData.excerpt || 'Özet girilmemiş'}
                  </p>
                  
                  {/* İçerik - Markdown render'lı */}
                  <div 
                    className="text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(formData.content) }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Yayın Durumu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yayın Durumu</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Taslak</option>
                    {user?.user_metadata?.user_role === 'yazar' ? (
                      <option value="pending">Onay Bekliyor</option>
                    ) : (
                      <>
                        <option value="pending">Onay Bekliyor</option>
                        <option value="published">Yayınlandı</option>
                        <option value="rejected">Reddedildi</option>
                        <option value="archived">Arşivlendi</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.category_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.category_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            {post && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">İstatistikler</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Görüntülenme:</span>
                    <span className="font-medium">{post.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beğeni:</span>
                    <span className="font-medium">{post.likes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oluşturulma:</span>
                    <span className="font-medium">
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {post.published_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yayınlanma:</span>
                      <span className="font-medium">
                        {new Date(post.published_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default PostForm 