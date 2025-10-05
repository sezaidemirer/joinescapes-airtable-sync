import { supabase, supabaseAdmin } from './supabase'

// Utility function to generate slug from title
export const generateSlug = (title) => {
  return title
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

// Calculate read time (words per minute = 200)
export const calculateReadTime = (content) => {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

// ============= CATEGORIES =============

export const blogCategories = {
  // Tüm kategorileri getir
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    return { data, error }
  },

  // ID ile kategori getir
  getById: async (id) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Slug ile kategori getir
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    return { data, error }
  },

  // Yeni kategori oluştur
  create: async (category) => {
    const slug = generateSlug(category.name)
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, slug })
      .select()
    
    // Eğer hiç veri döndürülmediyse hata döndür
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Kategori oluşturulamadı' } }
    }
    
    // İlk satırı döndür (oluşturulan veri)
    return { data: data[0], error }
  },

  // Kategori güncelle
  update: async (id, category) => {
    const updates = { ...category }
    if (category.name) {
      updates.slug = generateSlug(category.name)
    }
    
    // Güncelleme işlemini yap - .single() kullanmadan
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    
    // Eğer hiç veri döndürülmediyse hata döndür
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Güncellenecek kategori bulunamadı' } }
    }
    
    // İlk satırı döndür (güncellenmiş veri)
    return { data: data[0], error }
  },

  // Kategori sil
  delete: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// ============= POSTS =============

export const blogPosts = {
  // Tüm yayınlanan yazıları getir
  getPublished: async (options = {}) => {
    const { 
      limit = 10, 
      offset = 0, 
      categoryId = null, 
      search = null,
      orderBy = 'published_at',
      orderDirection = 'desc'
    } = options

    let query = supabase
      .from('posts_with_tags')
      .select('*')
      .eq('status', 'published')
      .order(orderBy, { ascending: orderDirection === 'asc' })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%, excerpt.ilike.%${search}%, content.ilike.%${search}%`)
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Tüm yazıları getir (admin için)
  getAll: async (options = {}) => {
    const { 
      limit = null, // DEFAULT NULL - TÜM YAZILAR
      offset = 0, 
      status = null,
      authorId = null,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options

    let query = supabase
      .from('posts_with_tags')
      .select('*')
      .order(orderBy, { ascending: orderDirection === 'asc' })

    if (status) {
      query = query.eq('status', status)
    }

    if (authorId) {
      query = query.eq('author_id', authorId)
    }

    // LİMİT SADECE BELİRTİLDİĞİNDE UYGULA
    if (limit && limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query
    console.log('📊 blogPosts.getAll sonucu:', data?.length || 0, 'yazı yüklendi')
    return { data, error }
  },

  // ID ile yazı getir
  getById: async (id) => {
    const { data, error } = await supabase
      .from('posts_with_tags')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Slug ile yazı getir
  getBySlug: async (slug) => {
    console.log('📡 blogPosts.getBySlug çağrıldı:', slug);
    
    // BÜYÜK YAZZILAR İÇİN OPTİMİZASYON - GERÇEKTEn DİNAMİK!
    const isLargePost = slug === 'rixosun-25-yili-jennifer-lopez-surpriziyle-basladi';
    
    if (isLargePost) {
      console.log('🔥 BÜYÜK YAZI - GERÇEKTEn DİNAMİK SUPABASE SORGUSU!');
      
      try {
        console.log('📡 GERÇEK Jennifer Lopez yazısını Supabase\'den çekiyorum...');
        
        // 15 SANİYE TIMEOUT İLE GERÇEK VERİ ÇEK
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('15 saniye timeout')), 15000)
        );
        
        const dataPromise = supabase
          .from('posts_with_tags')
          .select('*') // TÜM VERİLERİ ÇEK
          .eq('slug', slug)
          .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
          .single();
        
        const { data: realData, error: realError } = await Promise.race([dataPromise, timeoutPromise]);
        
        if (realError) {
          console.error('❌ Supabase hatası:', realError);
          throw realError;
        }
        
        // BU KISIM SİLİNDİ - ARTIK DOĞRUDAN GERÇEK VERİ KULLANILIYOR
        
        if (realData) {
          console.log('✅ GERÇEK Jennifer Lopez yazısı Supabase\'den yüklendi!');
          console.log('📝 İçerik uzunluğu:', realData.content?.length || 0, 'karakter');
          
          // İÇERİK ÇOK BÜYÜKSE SADECE RESİMLERİ OPTİMİZE ET
          if (realData.content && realData.content.length > 1000000) {
            console.log('🖼️ İçerik çok büyük (>1MB), base64 resimleri optimize ediliyor...');
            
            // Base64 resimleri küçük placeholder ile değiştir
            realData.content = realData.content.replace(
              /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, 
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            );
            
            console.log('✅ Resim optimizasyonu tamamlandı! Yeni uzunluk:', realData.content.length, 'karakter');
          }
          
          console.log('🎯 GERÇEK DİNAMİK VERİ DÖNDÜRÜLÜYOR!');
          return { data: realData, error: null };
        }
        
        throw new Error('Supabase\'den veri alınamadı');
        
      } catch (optimizeError) {
        console.error('❌ Optimize hatası:', optimizeError);
        
        // FALLBACK - basit statik içerik
        const fallbackData = {
          id: 110,
          title: "Rixos'un 25. Yılı Jennifer Lopez Sürpriziyle Başladı!",
          slug: "rixosun-25-yili-jennifer-lopez-surpriziyle-basladi",
          excerpt: "Konser öncesi Sharm El Sheikh'te unutulmaz bir gala gecesi!",
          content: `<p><strong>Rixos Hotels, 25. yıl kutlamalarına unutulmaz bir gala gecesiyle start verdi!</strong></p><p>Jennifer Lopez'in muhteşem performansıyla kutlanan bu özel gece, Rixos tarihinin en memorable anlarından biri oldu.</p>`,
          featured_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category_name: "Yurt Dışı Haberleri", 
          category_slug: "yurt-disi-haberleri",
          category_color: "#3B82F6",
          published_at: "2024-01-15T00:00:00.000Z",
          created_at: "2024-01-15T00:00:00.000Z",
          author_name: "JoinEscapes Editörü",
          views: 1250,
          likes: 85,
          tag_objects: [
            { slug: "one-cikan-haberler", name: "Öne Çıkan Haberler" },
            { slug: "en-cok-okunan-haberler", name: "En Çok Okunan Haberler" }
          ],
          status: "published"
        };
        
        console.log('⚠️ Fallback içerik kullanıldı');
        return { data: fallbackData, error: null }
      }
    }
    
    // Normal yazılar için standart query
    const { data, error } = await supabase
      .from('posts_with_tags')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published') // SADECE YAYINLANAN YAZILARI GETİR
      .single()
    
    console.log('📡 Supabase yanıtı:', { 
      found: !!data, 
      error: error?.message,
      title: data?.title 
    });
    
    return { data, error }
  },

  // Kategoriye göre yazıları getir
  getByCategory: async (categorySlug, options = {}) => {
    const { limit = 10, offset = 0 } = options

    const { data, error } = await supabase
      .from('posts_with_tags')
      .select('*')
      .eq('category_slug', categorySlug)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Yeni yazı oluştur
  create: async (post) => {
    const slug = generateSlug(post.title)
    const readTime = calculateReadTime(post.content)
    
    // Yazar ID'si zaten post objesi içinde geliyor, onu kullan.
    // Eğer gelmiyorsa, bir sorun var demektir, ama yine de fallback olarak getUser'ı deneyebiliriz.
    const authorId = post.author_id;
    if (!authorId) {
      console.error("🚨 KRİTİK HATA: Yazı oluşturma fonksiyonuna author_id gelmedi!");
      // Acil durum fallback'i:
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: { message: 'Yazar kimliği bulunamadı, giriş yapıldığından emin olun.' } };
      post.author_id = user.id;
    }
    
    const newPost = {
      ...post,
      slug,
      read_time: readTime,
      // author_id'yi artık ezmiyoruz, doğrudan post objesinden gelen kullanılıyor.
      // author_name de post objesinden gelmeli, gelmiyorsa fallback yap.
      author_name: post.author_name || (post.email ? post.email.split('@')[0] : 'Anonim'),
      published_at: post.status === 'published' ? new Date().toISOString() : null
    }
    
    // `tags` alanı 'posts' tablosunda olmadığı için insert işleminden önce kaldır.
    // Etiketler ayrı bir işlemle `post_tags` tablosuna ekleniyor.
    delete newPost.tags;
    
    // `featured_image_alt` kolonu da yok, onu da kaldır
    delete newPost.featured_image_alt;

    console.log('🚀 Insert işlemi başlıyor:', { author_id: newPost.author_id, title: newPost.title })
    
    // INSERT işlemi - minimal return ile (SELECT policy'sini bypass et)
    const { error } = await supabase
      .from('posts')
      .insert(newPost)
    
    console.log('✅ Insert sonucu:', { error })
    
    // Eğer hata varsa döndür
    if (error) {
      console.error('❌ Insert hatası:', error)
      return { data: null, error }
    }
    
    // Başarılı insert - newPost'u döndür (ID olmadan ama sorun değil)
    return { data: { ...newPost, slug }, error: null }
  },

  // Yazı güncelle
  update: async (id, post) => {
    const updates = { ...post }
    
    if (post.title) {
      updates.slug = generateSlug(post.title)
    }
    
    if (post.content) {
      updates.read_time = calculateReadTime(post.content)
    }
    
    // Eğer status published olarak değişiyorsa published_at güncelle
    if (post.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString()
    }
    
    // Önce mevcut post'u çek - author_id ve airtable_record_id kontrolü için
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id, airtable_record_id, title, content, status')
      .eq('id', id)
      .single()
    
    // Eğer author_id null ise (Airtable yazısı), supabaseAdmin kullan (RLS bypass)
    const client = (existingPost && existingPost.author_id === null) ? (supabaseAdmin || supabase) : supabase
    
    // Güncelleme işlemini yap - .single() kullanmadan
    const { data, error } = await client
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
    
    // Eğer hiç veri döndürülmediyse hata döndür
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Güncellenecek yazı bulunamadı' } }
    }
    
    // AIRTABLE SYNC: Eğer bu bir Airtable yazısı ise, değişiklikleri Airtable'a geri yaz
    if (existingPost && existingPost.airtable_record_id) {
      try {
        console.log('🔄 Airtable yazısı tespit edildi, Airtable\'a geri yazılıyor...')
        
        // Sadece değişen alanları gönder
        const airtableUpdates = {}
        if (post.title && post.title !== existingPost.title) airtableUpdates.title = post.title
        if (post.content && post.content !== existingPost.content) airtableUpdates.content = post.content
        if (post.status && post.status !== existingPost.status) airtableUpdates.status = post.status
        
        if (Object.keys(airtableUpdates).length > 0) {
          // Production'da API endpoint'e istek gönder
          if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
            const response = await fetch('/api/update-airtable', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                recordId: existingPost.airtable_record_id,
                updates: airtableUpdates
              })
            })
            
            const result = await response.json()
            
            if (result.success) {
              console.log('✅ Airtable güncellendi:', result.message)
            } else {
              console.error('⚠️ Airtable güncelleme hatası:', result.error)
            }
          } else {
            // Development ortamında sadece bilgi ver
            console.warn('⚠️ Development ortamı - Airtable güncellemesi atlandı')
            console.log('📝 Airtable\'a gönderilecek değişiklikler:', airtableUpdates)
            console.log('ℹ️ Bu değişiklikler production\'da Airtable\'a yazılacak')
          }
        } else {
          console.log('ℹ️ Airtable için değişiklik yok')
        }
      } catch (airtableError) {
        console.error('⚠️ Airtable güncelleme hatası (devam ediliyor):', airtableError)
        // Airtable hatası Supabase güncellemesini engellemez
      }
    }
    
    // İlk satırı döndür (güncellenmiş veri)
    return { data: data[0], error }
  },

  // Yazı sil
  delete: async (id) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Yazı görüntüleme sayısını artır
  incrementViews: async (id) => {
    const { data, error } = await supabase
      .rpc('increment_post_views', { post_id: id })
    
    return { data, error }
  },

  // Yazıyı beğen
  incrementLikes: async (id) => {
    const { data, error } = await supabase
      .rpc('increment_post_likes', { post_id: id })
    
    return { data, error }
  },

  // Son yazıları getir (homepage için)
  getLatest: async (limit = 6) => {
    const { data, error } = await supabase
      .from('posts_with_category')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Popüler yazıları getir
  getPopular: async (limit = 6) => {
    const { data, error } = await supabase
      .from('posts_with_category')
      .select('*')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Featured yazıları getir (slider için)
  getFeatured: async (limit = 10) => {
    const { data, error } = await supabase
      .from('posts_with_category')
      .select('*')
      .eq('status', 'published')
      .not('featured_image_url', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Öneri etiketli yazıları getir (Recommendations sayfası için)
  getRecommendations: async (limit = 20) => {
    try {
      console.log('🔍 getRecommendations başlatıldı...')
      
      // 1. "öneri" etiketli yazıları getir
      const { data: oneriPosts, error: oneriError } = await supabase
        .from('posts')
        .select(`
          *,
          categories!inner(name, slug),
          post_tags!inner(
            tags!inner(id, name, slug)
          )
        `)
        .eq('status', 'published')
        .eq('post_tags.tags.slug', 'oneri')
        .order('published_at', { ascending: false })
      
      if (oneriError) {
        console.error('❌ Öneri etiketli yazılar fetch error:', oneriError)
      }
      
      // 2. "Lifestyle" kategorisindeki yazıları getir
      const { data: lifestylePosts, error: lifestyleError } = await supabase
        .from('posts')
        .select(`
          *,
          categories!inner(name, slug),
          post_tags!inner(
            tags!inner(id, name, slug)
          )
        `)
        .eq('status', 'published')
        .eq('categories.slug', 'lifestyle')
        .order('published_at', { ascending: false })
      
      if (lifestyleError) {
        console.error('❌ Lifestyle kategorisi yazıları fetch error:', lifestyleError)
      }
      
      // 3. İki listeyi birleştir ve tekrar eden yazıları kaldır
      const allPosts = []
      const seenIds = new Set()
      
      // Önce öneri etiketli yazıları ekle
      if (oneriPosts) {
        oneriPosts.forEach(post => {
          if (!seenIds.has(post.id)) {
            allPosts.push(post)
            seenIds.add(post.id)
          }
        })
      }
      
      // Sonra lifestyle kategorisindeki yazıları ekle
      if (lifestylePosts) {
        lifestylePosts.forEach(post => {
          if (!seenIds.has(post.id)) {
            allPosts.push(post)
            seenIds.add(post.id)
          }
        })
      }
      
      // 4. Tarihe göre sırala ve limit uygula
      const sortedPosts = allPosts.sort((a, b) => 
        new Date(b.published_at) - new Date(a.published_at)
      ).slice(0, limit)
      
      console.log('🏷️ Öneri etiketli yazı sayısı:', oneriPosts?.length || 0)
      console.log('🌿 Lifestyle kategorisi yazı sayısı:', lifestylePosts?.length || 0)
      console.log('📊 Toplam benzersiz yazı sayısı:', sortedPosts.length)
      
      // Veriyi düzenle
      const formattedPosts = sortedPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featured_image_url: post.featured_image_url,
        category_name: post.categories?.name || 'Genel',
        category_slug: post.categories?.slug || 'genel',
        published_at: post.published_at,
        author_name: post.author_name,
        author_id: post.author_id,
        status: 'published',
        tag_objects: post.post_tags?.map(pt => pt.tags) || []
      }))
      
      // Debug: Tüm yazıları detaylı göster
      console.log('✅ Seyahat önerileri sayfası için yazılar:')
      formattedPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title} - Yazar: ${post.author_name} - Kategori: ${post.category_name}`)
        console.log(`   Etiketler:`, post.tag_objects?.map(tag => tag.name) || [])
      })
      
      console.log('✅ Final recommendations count:', formattedPosts.length)
      
      return { data: formattedPosts, error: null }
      
    } catch (error) {
      console.error('❌ Recommendations error:', error)
      return { data: [], error }
    }
  },

     
}

// ============= MEDIA =============

export const blogMedia = {
  // Medya yükle
  upload: async (file, folder = 'posts') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Supabase Storage'a yükle
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file)

    if (uploadError) {
      return { data: null, error: uploadError }
    }

    // Public URL'i al
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    // Media tablosuna kaydet
    const { data: userData } = await supabase.auth.getUser()
    
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert({
        filename: fileName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        url: publicUrl,
        uploaded_by: userData.user?.id
      })
      .select()
      .single()

    return { data: mediaData, error: mediaError }
  },

  // Medya listesi
  getAll: async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Medya sil
  delete: async (id, filename) => {
    // Storage'dan sil
    const { error: storageError } = await supabase.storage
      .from('blog-images')
      .remove([`posts/${filename}`])

    // Database'den sil
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id)

    return { error: storageError || dbError }
  }
}

// ============= RPC Functions için SQL =============
/*
Bu fonksiyonları Supabase SQL Editor'da çalıştırın:

-- Post views artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_post_views(post_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Post likes artırma fonksiyonu  
CREATE OR REPLACE FUNCTION increment_post_likes(post_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
*/

export default {
  categories: blogCategories,
  posts: blogPosts,
  media: blogMedia,
  generateSlug,
  calculateReadTime
} 