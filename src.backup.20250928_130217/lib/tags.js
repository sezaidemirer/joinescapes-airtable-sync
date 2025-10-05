import { supabase } from './supabase'

// ============= TAGS HELPER FUNCTIONS =============

export const blogTags = {
  // Tüm etiketleri getir
  getAll: async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    return { data, error }
  },

  // Öne çıkan etiketleri getir
  getFeatured: async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
    
    return { data, error }
  },

  // Slug ile etiket getir
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()
    
    return { data, error }
  },

  // Etiket bilgilerini getir (TagPosts sayfası için)
  getTagInfo: async (slug) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()
    
    return { data, error }
  },

  // En çok kullanılan etiketleri getir
  getMostUsed: async (limit = 10) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .gt('usage_count', 0)
      .order('usage_count', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Yeni etiket oluştur
  create: async (tag) => {
    const slug = generateSlug(tag.name)
    
    const { data, error } = await supabase
      .from('tags')
      .insert({ ...tag, slug })
      .select()
    
    // Eğer hiç veri döndürülmediyse hata döndür
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Etiket oluşturulamadı' } }
    }
    
    // İlk satırı döndür (oluşturulan veri)
    return { data: data[0], error }
  },

  // Etiket güncelle
  update: async (id, tag) => {
    const updates = { ...tag }
    if (tag.name) {
      updates.slug = generateSlug(tag.name)
    }
    
    // Güncelleme işlemini yap - .single() kullanmadan
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
    
    // Eğer hiç veri döndürülmediyse hata döndür
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Güncellenecek etiket bulunamadı' } }
    }
    
    // İlk satırı döndür (güncellenmiş veri)
    return { data: data[0], error }
  },

  // Etiket sil
  delete: async (id) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// ============= POST-TAG RELATIONSHIP FUNCTIONS =============

export const postTags = {
  // Post'un etiketlerini getir
  getPostTags: async (postId) => {
    const { data, error } = await supabase
      .from('post_tags')
      .select(`
        tags (
          id,
          name,
          slug,
          color,
          is_featured
        )
      `)
      .eq('post_id', postId)
    
    return { 
      data: data?.map(item => item.tags) || [], 
      error 
    }
  },

  // Post'a etiket ekle
  addTagToPost: async (postId, tagSlug) => {
    const { data, error } = await supabase
      .rpc('add_tag_to_post', {
        post_id: postId,
        tag_slug: tagSlug
      })
    
    return { data, error }
  },

  // Post'tan etiket kaldır
  removeTagFromPost: async (postId, tagSlug) => {
    const { data, error } = await supabase
      .rpc('remove_tag_from_post', {
        post_id: postId,
        tag_slug: tagSlug
      })
    
    return { data, error }
  },

  // Post'un tüm etiketlerini güncelle
  updatePostTags: async (postId, tagSlugs) => {
    // Önce mevcut etiketleri sil
    const { error: deleteError } = await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', postId)
    
    if (deleteError) return { error: deleteError }
    
    if (tagSlugs.length === 0) {
      return { data: true, error: null }
    }
    
    // Etiket ID'lerini al
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, slug')
      .in('slug', tagSlugs)
    
    if (tagsError) return { error: tagsError }
    
    // Yeni ilişkileri ekle
    const postTagsData = tags.map(tag => ({
      post_id: postId,
      tag_id: tag.id
    }))
    
    const { data, error } = await supabase
      .from('post_tags')
      .insert(postTagsData)
    
    return { data, error }
  },

  // Etikete göre yazıları getir
  getPostsByTag: async (tagSlug, options = {}) => {
    const { limit = 12, offset = 0 } = options
    
    try {
      // Önce RPC fonksiyonunu dene
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_posts_by_tag', {
          tag_slug: tagSlug,
          limit_count: limit
        })
      
      if (!rpcError && rpcData) {
        return { data: rpcData, error: null }
      }
      
      // RPC başarısız olursa posts_with_tags view'ını kullan
      const { data: viewData, error: viewError } = await supabase
        .from('posts_with_tags')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (viewError) {
        return { data: [], error: viewError }
      }
      
      // Etiket filtreleme
      const filteredData = viewData?.filter(post => {
        return post.tag_objects?.some(tag => tag.slug === tagSlug)
      }) || []
      
      return { data: filteredData, error: null }
      
    } catch (err) {
      console.error('getPostsByTag error:', err)
      return { data: [], error: err }
    }
  }
}

// ============= ENHANCED BLOG POSTS WITH TAGS =============

export const blogPostsWithTags = {
  // Etiketli yazıları getir
  getWithTags: async (options = {}) => {
    const { 
      limit = 10, 
      offset = 0, 
      status = 'published',
      categoryId = null,
      tagSlug = null
    } = options

    let query = supabase
      .from('posts_with_tags')
      .select('*')
      .order('published_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query
    
    // Eğer belirli bir etiket filtresi varsa
    if (tagSlug && data) {
      const filteredData = data.filter(post => {
        return post.tag_objects?.some(tag => tag.slug === tagSlug)
      })
      return { data: filteredData, error }
    }
    
    return { data, error }
  },

  // Ana sayfa için etiketli yazılar - RPC kullan
  getMainPagePosts: async (limit = 20) => {
    try {
      console.log('📌 Ana sayfa yazıları getiriliyor...')
      
      // Direkt RPC fonksiyonunu kullan - daha hızlı ve güvenilir
      const { data, error } = await supabase
        .rpc('get_posts_by_tag', {
          tag_slug: 'main',
          limit_count: limit
        })
      
      if (error) {
        console.error('❌ Ana sayfa RPC error:', error)
        // Fallback: posts_with_tags view'ını kullan
        const { data: viewData, error: viewError } = await supabase
          .from('posts_with_tags')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(limit)
        
        if (viewError) {
          console.error('❌ Fallback view error:', viewError)
          return { data: [], error: viewError }
        }
        
        // Ana Sayfa etiketli olanları filtrele
        const filteredData = viewData?.filter(post => 
          post.tag_objects?.some(tag => tag.slug === 'main' || tag.name === 'Ana Sayfa')
        ) || []
        
        console.log('✅ Fallback view sonucu:', filteredData.length, 'yazı')
        return { data: filteredData, error: null }
      }
      
      // RPC sonucunu posts_with_tags formatına çevir
      const formattedData = data?.map(post => ({
        id: post.post_id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featured_image_url: post.featured_image_url,
        category_name: post.category_name,
        category_slug: post.category_slug,
        category_color: '#3B82F6',
        published_at: post.published_at,
        status: 'published',
        views: 0,
        likes: 0,
        author_name: 'Editör'
      })) || []
      
      console.log('✅ Ana sayfa yazıları:', formattedData.length, 'adet')
      return { data: formattedData, error: null }
      
    } catch (error) {
      console.error('Ana sayfa yazıları getirilemedi:', error)
      return { data: [], error }
    }
  },

  // En çok okunanlar (Ana sayfa için - encokokunan slug)
  getMostReadPosts: async (limit = 6) => {
    console.log('📊 En çok okunan yazılar getiriliyor... (Ana sayfa)')
    // RPC fonksiyonu kullan - Ana sayfa için encokokunan slug!
    const { data, error } = await supabase
      .rpc('get_posts_by_tag', {
        tag_slug: 'encokokunan',  // Ana sayfa için doğru slug!
        limit_count: limit
      })
    
    if (error || !data || data.length === 0) {
      console.log('⚠️ En çok okunan RPC başarısız, fallback deneniyor...')
      // Fallback: posts_with_tags kullan
      return await blogPostsWithTags.getWithTags({
        tagSlug: 'encokokunan',  // Ana sayfa için doğru slug!
        limit,
        status: 'published'
      })
    }
    
    // RPC sonucunu posts_with_tags formatına çevir
    const formattedData = data.map(post => ({
      id: post.post_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      category_name: post.category_name,
      category_slug: post.category_slug,
      published_at: post.published_at,
      status: 'published'
    }))
    
    return { data: formattedData, error: null }
  },

  // Önerilen yazılar
  getRecommendedPosts: async (limit = 6) => {
    // RPC fonksiyonu kullan
    const { data, error } = await supabase
      .rpc('get_posts_by_tag', {
        tag_slug: 'bunlariokudunuzmu',
        limit_count: limit
      })
    
    if (error || !data || data.length === 0) {
      // Fallback: posts_with_tags kullan
      return await blogPostsWithTags.getWithTags({
        tagSlug: 'bunlariokudunuzmu',
        limit,
        status: 'published'
      })
    }
    
    // RPC sonucunu posts_with_tags formatına çevir
    const formattedData = data.map(post => ({
      id: post.post_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      category_name: post.category_name,
      category_slug: post.category_slug,
      published_at: post.published_at,
      status: 'published'
    }))
    
    return { data: formattedData, error: null }
  },

  // Editör Yorumu - Öneri etiketli yazılar
  getEditorCommentPosts: async (limit = 3) => {
    console.log('✏️ Editör önerileri getiriliyor...')
    // RPC fonksiyonu kullan
    const { data, error } = await supabase
      .rpc('get_posts_by_tag', {
        tag_slug: 'oneri',
        limit_count: limit
      })
    
    if (error || !data || data.length === 0) {
      // Fallback: posts_with_tags kullan
      return await blogPostsWithTags.getWithTags({
        tagSlug: 'oneri',
        limit,
        status: 'published'
      })
    }
    
    // RPC sonucunu posts_with_tags formatına çevir
    const formattedData = data.map(post => ({
      id: post.post_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      category_name: post.category_name,
      category_slug: post.category_slug,
      published_at: post.published_at,
      created_at: post.created_at,
      author_name: post.author_name || 'Editör',
      status: 'published'
    }))
    
    return { data: formattedData, error: null }
  },

  // Lifestyle etiketli yazıları getir
  getLifestylePosts: async (limit = 12) => {
    console.log('🌿 Lifestyle yazıları getiriliyor...')
    // RPC fonksiyonu kullan
    const { data, error } = await supabase
      .rpc('get_posts_by_tag', {
        tag_slug: 'lifestyle',
        limit_count: limit
      })
    
    if (error || !data || data.length === 0) {
      console.log('⚠️ RPC başarısız, fallback kullanılıyor...')
      // Fallback: posts_with_tags kullan
      return await blogPostsWithTags.getWithTags({
        tagSlug: 'lifestyle',
        limit,
        status: 'published'
      })
    }
    
    // RPC sonucunu posts_with_tags formatına çevir
    const formattedData = data.map(post => ({
      id: post.post_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      category_name: post.category_name,
      category_slug: post.category_slug,
      published_at: post.published_at,
      created_at: post.created_at,
      author_name: post.author_name || 'Editör',
      views: post.views || 0,
      likes: post.likes || 0,
      status: 'published'
    }))
    
    return { data: formattedData, error: null }
  },

  // Belirli etiketli yazıları getir (generic function)
  getPostsByTag: async (tagSlug, limit = 12) => {
    try {
      console.log('🏷️ Etiketli yazılar getiriliyor:', tagSlug, 'limit:', limit)
      
      // Önce RPC fonksiyonunu dene
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_posts_by_tag', {
          tag_slug: tagSlug,
          limit_count: limit
        })
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`✅ RPC ile ${rpcData.length} yazı bulundu`)
        return { data: rpcData, error: null }
      }
      
      // RPC başarısızsa posts_with_tags view'ını dene
      console.log('🔄 RPC başarısız, posts_with_tags view deneniyor...')
      const { data, error } = await supabase
        .from('posts_with_tags')
        .select('*')
        .eq('status', 'published')
        .contains('tag_slugs', [tagSlug])
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('getPostsByTag error:', error)
        return { data: [], error }
      }
      
      console.log(`✅ ${data?.length || 0} yazı bulundu`)
      return { data: data || [], error: null }
      
    } catch (err) {
      console.error('getPostsByTag error:', err)
      return { data: [], error: err }
    }
  },

  // En son yazılan postları getir (TÜM POSTLAR)
  getLatestPosts: async (limit = 1000) => {
    try {
      const { data, error } = await supabase
        .from('posts_with_tags')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('getLatestPosts error:', error)
        return { data: [], error }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('getLatestPosts error:', err)
      return { data: [], error: err }
    }
  },

  // Belirli bir etikete ait yazıları getir (TagPosts sayfası için - YÜKSEK LİMİT)
  getPostsByTagHighLimit: async (tagSlug, limit = 50) => {
    try {
      console.log('🏷️ Etiketli yazılar getiriliyor (yüksek limit):', tagSlug)
      
      // Önce RPC fonksiyonunu dene
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_posts_by_tag', {
          tag_slug: tagSlug,
          limit_count: limit
        })
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`✅ RPC ile ${rpcData.length} yazı bulundu`)
        return { data: rpcData, error: null }
      }
      
      // RPC başarısızsa posts_with_tags view'ını dene
      console.log('🔄 RPC başarısız, posts_with_tags view deneniyor...')
      const { data, error } = await supabase
        .from('posts_with_tags')
        .select('*')
        .eq('status', 'published')
        .contains('tag_slugs', [tagSlug])
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('getPostsByTagHighLimit error:', error)
        return { data: [], error }
      }
      
      console.log(`✅ ${data?.length || 0} yazı bulundu`)
      return { data: data || [], error: null }
    } catch (err) {
      console.error('getPostsByTag error:', err)
      return { data: [], error: err }
    }
  },

  // Etiket bilgilerini getir (TagPosts sayfası için)
  getTagInfo: async (slug) => {
    try {
      console.log('🏷️ Etiket bilgisi getiriliyor:', slug)
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        console.error('getTagInfo error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Etiket bilgisi:', data)
      return { data, error: null }
    } catch (err) {
      console.error('getTagInfo error:', err)
      return { data: null, error: err }
    }
  }
}

// ============= UTILITY FUNCTIONS =============

// Slug oluştur (Türkçe karakter desteği ile)
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Etiket rengine göre text color belirle
export const getTextColorForTag = (backgroundColor) => {
  // Koyu renkler için beyaz, açık renkler için siyah text
  const darkColors = ['#0F172A', '#1F2937', '#374151', '#4B5563']
  return darkColors.includes(backgroundColor) ? '#FFFFFF' : '#000000'
}

// Etiket tipini belirle
export const getTagType = (slug) => {
  const specialTags = {
    'ana-sayfa': 'Ana Sayfa',
    'anasayfa': 'Ana Sayfa',
    'main': 'Ana Sayfa',
    'encokokunan': 'Popüler',
    'bunlariokudunuzmu': 'Önerilen',
    'seckinoteller': 'Premium',
    'ucuzucusrotalari': 'Ekonomik',
    'gurmerotalari': 'Gastronomi',
    'vizesizrotalar': 'Vizesiz',
    'cruiserotalari': 'Cruise',
    'bireyselgezginler': 'Solo',
    'ciftlericinozelrotalar': 'Romantik'
  }
  
  return specialTags[slug] || 'Genel'
}

export default {
  blogTags,
  postTags,
  blogPostsWithTags,
  generateSlug,
  getTextColorForTag,
  getTagType
} 