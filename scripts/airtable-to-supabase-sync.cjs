#!/usr/bin/env node

// Airtable'dan Supabase'e otomatik senkronizasyon
// Bu script Vercel Cron Job tarafından her 5 dakikada bir çalıştırılır

// Yerel geliştirmede .env yükle; GitHub Actions/Vercel gibi ortamlarda gerekmez
try {
  if (!process.env.GITHUB_ACTIONS) {
    // eslint-disable-next-line global-require
    require('dotenv').config();
  }
} catch (_) {
  // dotenv yoksa sessizce devam et (CI ortamı)
}

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase konfigürasyonu
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL veya Key eksik. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Airtable konfigürasyonu
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appZdTkkdji3EGDx8';
// Support both AIRTABLE_TABLE_ID and AIRTABLE_TABLE_NAME envs (some setups use name, others id)
const AIRTABLE_BLOG_TABLE_ID = process.env.AIRTABLE_TABLE_ID || process.env.AIRTABLE_TABLE_NAME || 'tblTcxVudBbXo2Svd';
const AIRTABLE_NEWS_TABLE_ID = process.env.AIRTABLE_TABLE_YURT_ICI_HABERLERI || 'tbl2RNxPbj3BVkLHT';

if (!AIRTABLE_API_KEY) {
  console.error('❌ Airtable API Key eksik. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

// Status mapping
const STATUS_MAPPING = {
  'Done': 'published',
  'In progress': 'pending',
  'Todo': 'draft'
};

// Tag yardımcıları
async function upsertTagsByNames(tagNames) {
  if (!Array.isArray(tagNames) || tagNames.length === 0) return [];
  const uniqueNames = Array.from(new Set(tagNames.map((n) => String(n).trim()).filter(Boolean)));
  if (uniqueNames.length === 0) return [];

  // 1) Var olanları çek
  const { data: existing, error: selErr } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', uniqueNames);
  if (selErr) {
    console.error('❌ Tag select hatası:', selErr.message);
    return [];
  }
  const existingNames = new Set((existing || []).map((t) => t.name));
  const missing = uniqueNames.filter((n) => !existingNames.has(n));

                  // 2) Eksikleri ekle
                  if (missing.length > 0) {
                    const { error: insErr } = await supabase
                      .from('tags')
                      .insert(missing.map((name) => ({ 
                        name, 
                        slug: generateSlug(name) 
                      })));
                    if (insErr) {
                      console.error('❌ Tag insert hatası:', insErr.message);
                    }
                  }

  // 3) Hepsini tekrar çek
  const { data: all, error: finalSelErr } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', uniqueNames);
  if (finalSelErr) {
    console.error('❌ Tag final select hatası:', finalSelErr.message);
    return existing || [];
  }
  return all || existing || [];
}

async function linkTagsToPost(postId, tagIds) {
  if (!postId || !Array.isArray(tagIds) || tagIds.length === 0) return;
  const uniqueIds = Array.from(new Set(tagIds));
  const rows = uniqueIds.map((tagId) => ({ post_id: postId, tag_id: tagId }));
  const { error } = await supabase
    .from('post_tags')
    .upsert(rows, { onConflict: 'post_id,tag_id' });
  if (error) {
    console.error('❌ post_tags upsert hatası:', error.message);
  }
}

// Category yardımcıları
async function getOrCreateCategoryIdByName(categoryName) {
  if (!categoryName) return null;
  const name = String(categoryName).trim();
  if (!name) return null;
  const slug = generateSlug(name);
  // Önce slug ile var mı bak
  const { data: existing, error: selErr } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (selErr) {
    console.error('❌ Kategori select hatası:', selErr.message);
  }
  if (existing?.id) return existing.id;

  // Yoksa ekle
  const { data: inserted, error: insErr } = await supabase
    .from('categories')
    .insert([{ name, slug }])
    .select('id')
    .single();
  if (insErr) {
    console.error('❌ Kategori insert hatası:', insErr.message);
    return null;
  }
  return inserted?.id || null;
}

// Slug oluşturma fonksiyonu
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Read time hesaplama
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Join PR kullanıcısının ID'sini bul
async function getJoinPRUserId() {
  try {
    console.log('🔍 Join PR kullanıcısı aranıyor...');
    
    // RPC fonksiyonu ile kullanıcı ID'sini al
    const { data, error } = await supabase.rpc('get_user_id_by_email', {
      user_email: 'joinprmarketing@gmail.com'
    });
    
    if (error) {
      console.error('❌ Join PR kullanıcısı bulunamadı:', error.message);
      return null;
    }
    
    if (data) {
      console.log('✅ Join PR kullanıcısı bulundu:', data);
      return data;
    } else {
      console.log('❌ Join PR kullanıcısı bulunamadı!');
      return null;
    }
  } catch (error) {
    console.error('❌ Join PR kullanıcısı arama hatası:', error.message);
    return null;
  }
}

// Airtable görselini Supabase Storage'a yükle
async function uploadImageToSupabase(airtableImageUrl, postTitle) {
  if (!airtableImageUrl) return null;
  
  try {
    console.log(`   📥 Görsel indiriliyor: ${airtableImageUrl.substring(0, 50)}...`);
    
    // Airtable'dan görseli indir
    const imageResponse = await axios.get(airtableImageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    // Dosya uzantısını belirle
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    
    // Benzersiz dosya adı oluştur
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `posts/${fileName}`;
    
    console.log(`   📤 Supabase'e yükleniyor: ${filePath}`);
    
    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, imageResponse.data, {
        contentType: contentType,
        upsert: false
      });
    
    if (error) {
      console.error(`   ❌ Storage yükleme hatası: ${error.message}`);
      // Hata durumunda Airtable URL'sini kullan
      return airtableImageUrl;
    }
    
    // Public URL'yi oluştur
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);
    
    console.log(`   ✅ Görsel yüklendi: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error(`   ❌ Görsel yükleme hatası: ${error.message}`);
    // Hata durumunda Airtable URL'sini kullan
    return airtableImageUrl;
  }
}

// Airtable'dan veri çek
async function fetchAirtableRecords(tableId) {
  // Handle pagination to fetch all records safely; include light retry/backoff
  const allRecords = [];
  let offset = undefined;
  let attempt = 0;
  const maxAttempts = 3;

  try {
    do {
      const params = offset ? { offset } : undefined;
      const response = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'joinescapes-airtable-sync/1.0'
          },
          params
        }
      );

      if (response.status !== 200) {
        throw new Error(`Airtable HTTP ${response.status}`);
      }

      const { records, offset: nextOffset } = response.data || {};
      if (Array.isArray(records)) {
        allRecords.push(...records);
      }
      offset = nextOffset;
      // brief delay to respect Airtable API rate limits
      await new Promise((r) => setTimeout(r, 200));
    } while (offset);

    return allRecords;
  } catch (error) {
    attempt += 1;
    console.error('❌ Airtable veri çekme hatası:', error.message);
    if (attempt < maxAttempts) {
      const backoffMs = 500 * attempt;
      console.log(`⏳ Tekrar denenecek (${attempt}/${maxAttempts}) ${backoffMs}ms sonra...`);
      await new Promise((r) => setTimeout(r, backoffMs));
      return fetchAirtableRecords(tableId);
    }
    return [];
  }
}

// Ana senkronizasyon fonksiyonu
async function syncAirtableToSupabase(tableId, tableName = 'Tablo', defaultCategoryId = 7) {
  console.log(`🚀 ${tableName} → Supabase senkronizasyonu başlatılıyor... (Kategori ID: ${defaultCategoryId})`);
  
  // Join PR kullanıcısının ID'sini al
  const joinPRUserId = await getJoinPRUserId();
  
  if (!joinPRUserId) {
    console.error('❌ Join PR kullanıcısı bulunamadı, senkronizasyon durduruluyor');
    return;
  }
  
  const records = await fetchAirtableRecords(tableId);
  console.log(`🔄 ${tableName}'dan ${records.length} yazı çekiliyor...`);
  
  if (records.length === 0) {
    console.log('ℹ️ Airtable\'da yazı bulunamadı');
    return;
  }
  
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const record of records) {
    const fields = record.fields;
    
    // Sadece "Done" olanları işle
    if (fields.Status !== 'Done') {
      console.log(`⏭️ ${fields.Name} - Status: ${fields.Status} (atlanıyor)`);
      skippedCount++;
      continue;
    }
    
    console.log(`📝 İşleniyor: ${fields.Name}`);
    
    // Supabase'de zaten var mı kontrol et
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id, title, content, excerpt, featured_image_url, author_id, author_name, tags')
      .eq('airtable_record_id', record.id)
      .single();
    
    const isUpdate = !!existingPost;
    
    if (isUpdate) {
      console.log(`🔄 Güncelleme modu: ${fields.Name} (ID: ${existingPost.id})`);
      
      // Airtable'dan gelen veriler
      const airtableImageUrl = (fields.Attachments && fields.Attachments.length > 0) 
        ? fields.Attachments[0].url 
        : '';
      const airtableTags = Array.isArray(fields.Tags)
        ? fields.Tags.map((t) => (typeof t === 'string' ? t : (t && t.name) ? t.name : '')).filter(Boolean).sort().join(',')
        : '';
      
      // KAPSAMLI değişiklik kontrolü - hash karşılaştırması
      // Title, Content, Image URL, Tags, Category kontrolü
      const currentContentHash = crypto.createHash('md5')
        .update(`${fields.Name}|${fields.Notes || ''}|${airtableImageUrl}|${airtableTags}|${defaultCategoryId}`)
        .digest('hex');
      
      const existingTags = Array.isArray(existingPost.tags) 
        ? existingPost.tags.sort().join(',') 
        : '';
      
      const existingContentHash = crypto.createHash('md5')
        .update(`${existingPost.title}|${existingPost.content}|${existingPost.featured_image_url || ''}|${existingTags}|${defaultCategoryId}`)
        .digest('hex');
      
      if (currentContentHash === existingContentHash) {
        console.log(`   ✅ Hiçbir değişiklik yok (title, content, görsel, etiketler, kategori aynı), atlanıyor`);
        skippedCount++;
        continue;
      }
      
      console.log(`   🔄 Değişiklik tespit edildi, güncellenecek`);
      console.log(`      Hash - Mevcut: ${currentContentHash.substring(0, 8)}... | Eski: ${existingContentHash.substring(0, 8)}...`);
    } else {
      console.log(`🆕 Yeni yazı: ${fields.Name}`);
    }
    
    // Görsel URL'sini al ve Supabase Storage'a yükle
    let featuredImageUrl = null;
    if (fields.Attachments && fields.Attachments.length > 0) {
      const airtableImageUrl = fields.Attachments[0].url;
      
      // Görsel değişiklik kontrolü
      if (isUpdate && existingPost.featured_image_url) {
        // Görsel URL hash'lerini karşılaştır
        const currentImageHash = crypto.createHash('md5').update(airtableImageUrl).digest('hex');
        const existingImageHash = crypto.createHash('md5').update(existingPost.featured_image_url).digest('hex');
        
        if (currentImageHash === existingImageHash) {
          console.log(`   ✅ Görsel değişmemiş, mevcut görsel kullanılıyor`);
          featuredImageUrl = existingPost.featured_image_url;
        } else {
          console.log(`   🖼️ Görsel değişmiş, yeni görsel yükleniyor...`);
          featuredImageUrl = await uploadImageToSupabase(airtableImageUrl, fields.Name);
        }
      } else {
        console.log(`   🖼️ Yeni görsel yükleniyor...`);
        featuredImageUrl = await uploadImageToSupabase(airtableImageUrl, fields.Name);
      }
    } else if (isUpdate) {
      // Update modunda ama attachment yoksa mevcut görseli koru
      featuredImageUrl = existingPost.featured_image_url;
    }
    
    // Airtable Tags alanını diziye çevir
    const tagNames = Array.isArray(fields.Tags)
      ? fields.Tags.map((t) => (typeof t === 'string' ? t : (t && t.name) ? t.name : null)).filter(Boolean)
      : [];

    // Kategori ID'sini kullan (tablo bazlı sabit kategori)
    const categoryId = defaultCategoryId;
    console.log(`📂 Kategori ID: ${categoryId}`);

    const postData = {
      title: fields.Name,
      slug: generateSlug(fields.Name),
      content: fields.Notes || '',
      excerpt: fields.Notes ? fields.Notes.substring(0, 200) + '...' : '',
      author_name: 'Join PR',
      author_id: joinPRUserId, // Join PR kullanıcısının ID'si
      airtable_record_id: record.id,
      category_id: categoryId,
      status: STATUS_MAPPING[fields.Status] || 'published',
      read_time: calculateReadTime(fields.Notes || ''),
      meta_title: fields.Name,
      meta_description: fields.Notes ? fields.Notes.substring(0, 160) : '',
      // UI için isimleri text[] alanında da tutalım (ayrıca N-N ilişki kuracağız)
      tags: tagNames,
      featured_image_url: featuredImageUrl, // Airtable'dan gelen görsel
      published_at: new Date().toISOString(), // Done yazıları yayınlanmış
      last_synced_at: new Date().toISOString() // Son sync zamanı
    };
    
    // Debug: postData'yı göster
    console.log(`   🔍 postData.category_id: ${postData.category_id}`);
    
    let postId;
    
    if (isUpdate) {
      // UPDATE modu
      console.log(`   🔄 Güncelleniyor...`);
      
      const updateData = {
        ...postData,
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', existingPost.id);

      if (error) {
        console.error(`   ❌ Güncelleme hatası: ${error.message}`);
        skippedCount++;
        continue;
      }
      
      console.log(`   ✅ Güncellendi: ${fields.Name}`);
      updatedCount++;
      postId = existingPost.id;
      
    } else {
      // INSERT modu
      console.log(`   🆕 Yeni post ekleniyor...`);
      
      const { error, data: insertedData } = await supabase
        .from('posts')
        .insert(postData)
        .select('id, category_id');

      if (error) {
        console.error(`   ❌ Kaydetme hatası: ${error.message}`);
        skippedCount++;
        continue;
      }
      
      console.log(`   ✅ Eklendi: ${fields.Name}`);
      addedCount++;
      postId = insertedData && insertedData[0] && insertedData[0].id;
    }

    // Tags'i N-N ilişkiye yansıt
    if (postId && tagNames.length > 0) {
      const tagsRows = await upsertTagsByNames(tagNames);
      const tagIds = (tagsRows || []).map((t) => t.id).filter(Boolean);
      await linkTagsToPost(postId, tagIds);
    }

    // small delay to distribute write load
    await new Promise((r) => setTimeout(r, 100));
  }
  
  console.log(`🎉 Senkronizasyon tamamlandı!`);
  console.log(`   📊 Toplam: ${records.length}`);
  console.log(`   ➕ Eklenen: ${addedCount}`);
  console.log(`   📝 Güncellenen: ${updatedCount}`);
  console.log(`   ⏭️ Atlanan: ${skippedCount}`);
}

// Ana çalıştırma fonksiyonu - iki tabloyu sırayla sync et
async function runSync() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   AIRTABLE → SUPABASE SYNC BAŞLATILIYOR   ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  try {
    // 1. Blog tablosunu sync et (Destinasyonlar kategorisi - ID: 7)
    console.log('📋 1/2: BLOG TABLOSU (Destinasyonlar - ID: 7)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await syncAirtableToSupabase(AIRTABLE_BLOG_TABLE_ID, 'Blog Tablosu', 7);
    console.log('\n✅ Blog tablosu sync tamamlandı!\n');
    
    // 2. Haberler tablosunu sync et (Yurt İçi Haberleri kategorisi - ID: 13)
    console.log('📰 2/2: HABERLER TABLOSU (Yurt İçi Haberleri - ID: 13)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await syncAirtableToSupabase(AIRTABLE_NEWS_TABLE_ID, 'Haberler Tablosu', 13);
    console.log('\n✅ Haberler tablosu sync tamamlandı!\n');
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     TÜM TABLOLAR BAŞARIYLA SYNC EDİLDİ    ║');
    console.log('╚════════════════════════════════════════════╝');
  } catch (error) {
    console.error('❌ Sync sırasında hata:', error);
    throw error;
  }
}

// Script'i çalıştır
if (require.main === module) {
  runSync()
    .then(() => {
      console.log('✅ Senkronizasyon başarıyla tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Senkronizasyon hatası:', error);
      process.exit(1);
    });
}

module.exports = { syncAirtableToSupabase, runSync };
