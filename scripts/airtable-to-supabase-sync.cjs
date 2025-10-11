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
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || process.env.AIRTABLE_TABLE_NAME || 'tblTcxVudBbXo2Svd';

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

// Airtable'dan veri çek
async function fetchAirtableRecords() {
  // Handle pagination to fetch all records safely; include light retry/backoff
  const allRecords = [];
  let offset = undefined;
  let attempt = 0;
  const maxAttempts = 3;

  try {
    do {
      const params = offset ? { offset } : undefined;
      const response = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
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
      return fetchAirtableRecords();
    }
    return [];
  }
}

// Ana senkronizasyon fonksiyonu
async function syncAirtableToSupabase() {
  console.log('🚀 Airtable → Supabase senkronizasyonu başlatılıyor...');
  
  // Join PR kullanıcısının ID'sini al
  const joinPRUserId = await getJoinPRUserId();
  
  if (!joinPRUserId) {
    console.error('❌ Join PR kullanıcısı bulunamadı, senkronizasyon durduruluyor');
    return;
  }
  
  const records = await fetchAirtableRecords();
  console.log(`🔄 Airtable'dan ${records.length} yazı çekiliyor...`);
  
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
      .select('id, title, author_id, author_name')
      .eq('airtable_record_id', record.id)
      .single();
    
    // Görsel URL'sini al
    const featuredImageUrl = fields.Attachments && fields.Attachments.length > 0 
      ? fields.Attachments[0].url 
      : null;
    
    // Airtable Tags alanını diziye çevir
    const tagNames = Array.isArray(fields.Tags)
      ? fields.Tags.map((t) => (typeof t === 'string' ? t : (t && t.name) ? t.name : null)).filter(Boolean)
      : [];

    // Airtable'dan kategori bilgisini al ve Supabase ID'sine çevir
    const airtableCategory = fields.Category;
    
    // Debug: Kategori adını göster
    console.log(`🔍 Airtable'dan gelen kategori: "${airtableCategory}"`);
    
    const categoryMapping = {
      'kampanyalar ve firsatlar': 24,
      'yurt ici haberleri': 13,
      'yurt disi haberleri': 12,
      'vize ve seyahat belgeleri': 16,
      'havayolu haberleri': 9,
      'destinasyon': 7
    };
    
    // Türkçe karakterleri İngilizce'ye çevir ve küçük harfe çevir
    const normalizedCategory = airtableCategory 
      ? airtableCategory
          .toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/İ/g, 'i')
          .replace(/Ğ/g, 'g')
          .replace(/Ü/g, 'u')
          .replace(/Ş/g, 's')
          .replace(/Ö/g, 'o')
          .replace(/Ç/g, 'c')
          .trim()
      : '';
    const categoryId = categoryMapping[normalizedCategory] || 7; // Varsayılan: Destinasyon
    console.log(`📂 Kategori: ${airtableCategory} → normalized: "${normalizedCategory}" → id: ${categoryId}`);

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
      published_at: new Date().toISOString() // Done yazıları yayınlanmış
    };
    
    // Debug: postData'yı göster
    console.log(`   🔍 postData.category_id: ${postData.category_id}`);
    if (existingPost) {
      console.log(`   🔍 Mevcut post var (id: ${existingPost.id}), güncelleniyor...`);
    }
    
                    // Upsert to minimize round-trips and avoid duplicates
                    const { error, data: upsertedData } = await supabase
                      .from('posts')
                      .upsert(
                        existingPost ? { ...postData, id: existingPost.id, updated_at: new Date().toISOString() } : postData,
                        { onConflict: 'slug' }
                      )
                      .select('id, category_id');

    if (error) {
      console.error(`   ❌ Kaydetme hatası: ${error.message}`);
      skippedCount++;
    } else {
      if (existingPost) {
        console.log(`   ✅ Güncellendi: ${fields.Name}`);
        updatedCount++;
      } else {
        console.log(`   ✅ Eklendi: ${fields.Name}`);
        addedCount++;
      }
      
      // DEBUG: UPSERT sonrası category_id'yi kontrol et
      if (upsertedData && upsertedData[0]) {
        console.log(`   🔍 UPSERT sonrası category_id: ${upsertedData[0].category_id} (Beklenen: ${categoryId})`);
        if (upsertedData[0].category_id !== categoryId) {
          console.error(`   ⚠️ UYARI: category_id değişti! ${categoryId} → ${upsertedData[0].category_id}`);
        }
        
        // 2 saniye bekle ve tekrar kontrol et
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { data: recheck } = await supabase
          .from('posts')
          .select('id, category_id')
          .eq('id', upsertedData[0].id)
          .single();
        
        if (recheck) {
          console.log(`   🔍 2 saniye sonra category_id: ${recheck.category_id}`);
          if (recheck.category_id !== categoryId) {
            console.error(`   ⚠️⚠️⚠️ KRİTİK: category_id 2 saniye sonra değişti! ${categoryId} → ${recheck.category_id}`);
          }
        }
      }
    }

    // Post ID'yi garantile (existingPost yoksa yeniden çek)
    let postId = existingPost && existingPost.id;
    if (!postId) {
      const { data: fetched } = await supabase
        .from('posts')
        .select('id')
        .eq('airtable_record_id', record.id)
        .single();
      postId = fetched && fetched.id;
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

// Script'i çalıştır
if (require.main === module) {
  syncAirtableToSupabase()
    .then(() => {
      console.log('✅ Senkronizasyon başarıyla tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Senkronizasyon hatası:', error);
      process.exit(1);
    });
}

module.exports = { syncAirtableToSupabase };
