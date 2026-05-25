#!/usr/bin/env node

// Airtable'dan Supabase'e otomatik senkronizasyon
// Bu script Vercel Cron Job tarafından her 5 dakikada bir çalıştırılır

// Yerel geliştirmede .env yükle (proje kökünden); GitHub Actions/Vercel gibi ortamlarda gerekmez
const path = require('path');
try {
  if (!process.env.GITHUB_ACTIONS) {
    // eslint-disable-next-line global-require
    require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
  }
} catch (_) {
  // dotenv yoksa sessizce devam et (CI ortamı)
}

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const AIRTABLE_LAST_MODIFIED_FIELD_CANDIDATES = [
  'Last Modified',
  'Last modified',
  'Last Modified Time',
  'Last modified time',
  'LastModified',
  'Last_Modified'
];
const AIRTABLE_SORT_FIELD_CANDIDATES = [
  ...AIRTABLE_LAST_MODIFIED_FIELD_CANDIDATES,
  'Created',
  'Created Time',
  'createdTime'
];

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

// Slug listesini ID listesine çevirir (mevcut tagları slug ile bulur)
async function lookupTagIdsBySlugs(slugs) {
  if (!slugs || slugs.length === 0) return [];
  const { data } = await supabase.from('tags').select('id, slug').in('slug', slugs);
  return (data || []).map(t => t.id).filter(Boolean);
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

// Airtable değerini normalize et (karşılaştırma için)
function normalizeAirtableValue(val) {
  if (val == null || val === '') return '';
  return String(val)
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

// Airtable Mood, Süre, Tarz, Bütçe kolonlarından Tatil Bulucu tag slug'larını üret
// (Tatil Bulucu answersMap ile uyumlu slug'lar)
function getTatilBulucuTagSlugs(fields) {
  const slugs = [];
  if (!fields || typeof fields !== 'object') return slugs;

  const moodMap = {
    'deniz-kum-gunes': 'deniz-kum-gunes', 'deniz kum güneş': 'deniz-kum-gunes', 'deniz': 'deniz-kum-gunes',
    'tarih-kultur': 'tarih-kultur', 'tarih kültür': 'tarih-kultur', 'tarih': 'tarih-kultur',
    'doga-kesif': 'doga-kesif', 'doğa keşif': 'doga-kesif', 'doga kesif': 'doga-kesif', 'doga': 'doga-kesif',
    'sehir-hayati': 'sehir-hayati', 'şehir-hayati': 'sehir-hayati', 'şehir hayatı': 'sehir-hayati', 'sehir hayati': 'sehir-hayati', 'sehir': 'sehir-hayati',
    'luks-huzur': 'luks-huzur', 'lüks huzur': 'luks-huzur', 'luks huzur': 'luks-huzur', 'luks': 'luks-huzur',
    'gastronomi': 'gastronomi', 'yemek': 'gastronomi', 'mutfak': 'gastronomi',
    'eglence-gece': 'eglence-gece', 'gece hayati': 'eglence-gece', 'eglence': 'eglence-gece'
  };
  // Güncellendi: yeni süre slug'ları (sure-2-3-gun vb.)
  const sureMap = {
    '2-3': 'sure-2-3-gun', '3-4': 'sure-2-3-gun', '3 4': 'sure-2-3-gun', 'kisa': 'sure-2-3-gun', 'kısa': 'sure-2-3-gun',
    '4-7': 'sure-4-7-gun', '5-7': 'sure-4-7-gun', '5 7': 'sure-4-7-gun', 'orta': 'sure-4-7-gun',
    '7+': 'sure-7-gun-uzeri', 'uzun': 'sure-7-gun-uzeri', '10+': 'sure-7-gun-uzeri', '7 uzeri': 'sure-7-gun-uzeri'
  };
  const tarzMap = {
    'solo': 'solo', 'tek': 'solo', 'tek tabanca': 'solo',
    'romantik': 'romantik-cift', 'cift': 'romantik-cift', 'çift': 'romantik-cift', 'romantik-cift': 'romantik-cift',
    'aile': 'aile',
    'grup': 'grup-tatil', 'arkadas': 'grup-tatil', 'arkadaş': 'grup-tatil', 'grup-arkadas': 'grup-tatil', 'grup-tatil': 'grup-tatil'
  };
  const butceMap = {
    'ekonomik': 'ekonomik-tatil', 'ucuz': 'ekonomik-tatil', 'ekonomik-tatil': 'ekonomik-tatil',
    'orta': 'orta-butceli-', 'orta-butce': 'orta-butceli-', 'orta butce': 'orta-butceli-', 'orta-butceli': 'orta-butceli-', 'orta-butceli-': 'orta-butceli-',
    'luks': 'luks-tatil', 'lüks': 'luks-tatil', 'luks-tatil': 'luks-tatil'
  };

  const moodVal = normalizeAirtableValue(fields.Mood);
  if (moodVal && moodMap[moodVal]) slugs.push(moodMap[moodVal]);

  const sureVal = normalizeAirtableValue(fields.Süre);
  if (sureVal && sureMap[sureVal]) slugs.push(sureMap[sureVal]);

  const tarzVal = normalizeAirtableValue(fields.Tarz);
  if (tarzVal && tarzMap[tarzVal]) slugs.push(tarzMap[tarzVal]);

  const butceVal = normalizeAirtableValue(fields.Bütçe);
  if (butceVal && butceMap[butceVal]) slugs.push(butceMap[butceVal]);

  return slugs;
}

// Yurt içi/dışı: başlık + slug'a göre (assign-yurt-ici-yurt-disi-tags.cjs ile aynı mantık)
const TURKEY_KEYWORDS = [
  'turkiye', 'turkey', 'istanbul', 'ankara', 'izmir', 'antalya', 'bodrum', 'kapadokya', 'pamukkale',
  'trabzon', 'rize', 'artvin', 'kars', 'van', 'gaziantep', 'urfa', 'sanliurfa', 'mardin', 'diyarbakir',
  'adana', 'mersin', 'tarsus', 'canakkale', 'bursa', 'cesme', 'alacati', 'datca', 'marmaris', 'fethiye',
  'kas', 'demre', 'kemer', 'side', 'alanya', 'belek', 'kusadasi', 'selcuk', 'efes', 'safranbolu', 'amasra',
  'sinop', 'samsun', 'ordu', 'giresun', 'nevsehir', 'konya', 'kibris', 'yurt ici', 'yurtici', 'memleket',
  'adiyaman', 'afyonkarahisar', 'agri', 'aksaray', 'amasya', 'ardahan', 'aydin', 'balikesir', 'bartin', 'batman', 'bayburt', 'bilecik', 'bingol', 'bitlis', 'bolu', 'burdur', 'cankiri', 'corum', 'denizli', 'duzce', 'edirne', 'elazig', 'erzincan', 'erzurum', 'eskisehir', 'gumushane', 'hakkari', 'hatay', 'igdir', 'isparta', 'kahramanmaras', 'karabuk', 'karaman', 'kastamonu', 'kayseri', 'kilis', 'kirikkale', 'kirklareli', 'kirsehir', 'kocaeli', 'kutahya', 'malatya', 'manisa', 'mugla', 'mus', 'nigde', 'osmaniye', 'sakarya', 'siirt', 'sivas', 'sirnak', 'tekirdag', 'tokat', 'tunceli', 'usak', 'yalova', 'yozgat', 'zonguldak'
];
const FOREIGN_KEYWORDS = [
  'italya', 'italy', 'roma', 'rome', 'milan', 'venedik', 'venice', 'floransa', 'florence',
  'fransa', 'france', 'paris', 'ispanya', 'spain', 'madrid', 'barcelona', 'yunanistan', 'greece', 'atina', 'santorini', 'mikonos', 'zagori', 'kos', 'selanik', 'thessaloniki', 'simi', 'symi',
  'almanya', 'germany', 'berlin', 'ingiltere', 'england', 'londra', 'london', 'amerika', 'united states', 'kanada', 'canada', 'bali', 'dubai', 'abu dhabi', 'meksika', 'mexico', 'thailand', 'tayland', 'japan', 'japonya', 'cin', 'china', 'hindistan', 'india', 'afrika', 'avrupa', 'oceania', 'australia', 'australya', 'reykjavik', 'dublin', 'lisbon', 'budapest', 'misir', 'egypt', 'sharm', 'hurghada', 'katar', 'bahreyn', 'urdun', 'fas', 'portekiz', 'malta', 'iskandinav', 'iskandinavya', 'fiyort', 'norvec', 'norway', 'isvec', 'sweden', 'finlandiya', 'finland', 'danimarka', 'denmark', 'kopenhag', 'singapur', 'singapore', 'malezya', 'malaysia', 'endonezya', 'indonesia', 'vietnam', 'viet nam', 'hong kong', 'guney kore', 'kore', 'filipinler', 'philippines', 'uruguay', 'guney amerika', 'lima', 'peru', 'karadag', 'montenegro', 'umman', 'oman', 'musandam', 'sirbistan', 'serbia', 'belgrad', 'belgrade', 'rusya', 'russia', 'seul', 'seoul', 'sardinya', 'sardinia'
];

function getYurtIciYurtDisiTag(title, slug) {
  const blob = normalizeAirtableValue((title || '') + ' ' + (slug || ''));
  if (!blob) return null;
  const isForeign = FOREIGN_KEYWORDS.some(k => blob.includes(normalizeAirtableValue(k)));
  if (isForeign) return 'yurt-disi';
  const isDomestic = TURKEY_KEYWORDS.some(k => blob.includes(normalizeAirtableValue(k)));
  if (isDomestic) return 'yurt-ici';
  return null;
}

// Read time hesaplama
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Metni normalize et (ChatGPT kopyala-yapıştır karakterlerini temizle)
function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\r\n/g, '\n')      // Windows line endings → Unix
    .replace(/\r/g, '\n')        // Old Mac line endings → Unix
    .replace(/\u200B/g, '')      // Zero-width space (görünmez boşluk)
    .replace(/\u00A0/g, ' ')     // Non-breaking space → normal space
    .replace(/\u2028/g, '\n')    // Line separator
    .replace(/\u2029/g, '\n')    // Paragraph separator
    .replace(/[""]/g, '"')       // Smart quotes → normal quotes
    .replace(/['']/g, "'")       // Smart quotes → normal quotes
    .replace(/[\u2013\u2014]/g, '-')  // En/em dash → normal dash
    .replace(/\s+/g, ' ')        // Multiple spaces → single space
    .trim();
}

function getAirtableLastModified(fields) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of AIRTABLE_LAST_MODIFIED_FIELD_CANDIDATES) {
    if (fields[key]) {
      const date = new Date(fields[key]);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return null;
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
async function fetchAirtableRecords(tableId, options = {}) {
  const {
    maxRecords = 1,
    sortFieldCandidates = [],
    sortDirection = 'desc',
    pageSize = 1,
    initialDelayMs = 0,
    maxAttemptsPerPage = 8
  } = options;

  if (initialDelayMs > 0) {
    console.log(`⏳ Airtable isteği öncesi ${initialDelayMs / 1000}s bekleniyor...`);
    await delay(initialDelayMs);
  }

  async function fetchWithSort(sortField) {
    const allRecords = [];
    let offset;
    let page = 0;

    while (true) {
      page += 1;
      let attempt = 0;
      while (attempt < maxAttemptsPerPage) {
        attempt += 1;
        try {
          const params = {
            pageSize: Math.min(pageSize, Math.max(1, maxRecords - allRecords.length))
          };
          if (offset) params.offset = offset;
          // Son 2 saatte değişen "Done" kayıtları çek
          params['filterByFormula'] = "AND({Status} = 'Done', IS_AFTER(LAST_MODIFIED_TIME(), DATEADD(NOW(), -2, 'hours')))";
          // Son değişiklik yapılan tüm yazıları çekmek için Last Modified'a göre sırala
          // En yeni değiştirilenler önce gelsin (desc = azalan sıra)
          if (sortField) {
            params['sort[0][field]'] = sortField;
            params['sort[0][direction]'] = sortDirection; // 'desc' = en yeni önce
          }

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

          if (allRecords.length >= maxRecords) {
            return allRecords.slice(0, maxRecords);
          }

          // Airtable rate limit (5 req/sn) için küçük bekleme
          await delay(400);
          break;
        } catch (error) {
          const status = error?.response?.status;
          let backoffMs;

          console.error(`❌ Airtable veri çekme hatası (sayfa ${page}, deneme ${attempt}/${maxAttemptsPerPage}):`, error.message);

          if (status === 429) {
            const retryAfterHeader = error?.response?.headers?.['retry-after'];
            const retryAfterSeconds = retryAfterHeader ? parseFloat(Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader) : NaN;
            const retryAfterMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : NaN;
            const incrementalBackoff = (attempt || 1) * 60000; // 60s, 120s, 180s...
            backoffMs = Number.isFinite(retryAfterMs) ? Math.max(retryAfterMs, 45000) : Math.min(incrementalBackoff, 240000);
            console.warn(`   ⚠️ Airtable 429 rate limit. ${backoffMs / 1000}s bekleniyor...`);
          } else {
            backoffMs = Math.min(2000 * attempt, 10000);
            console.warn(`   ⚠️ ${backoffMs / 1000}s sonra tekrar denenecek...`);
          }

          if (attempt >= maxAttemptsPerPage) {
            console.error(`   ❌ Sayfa ${page} ${maxAttemptsPerPage} denemede çekilemedi, senkronizasyon durduruluyor.`);
            throw error;
          }

          await delay(backoffMs);
        }
      }

      if (!offset) break;
    }

    return allRecords.slice(0, maxRecords);
  }

  let lastError;
  const fieldsToTry = [...sortFieldCandidates, null];

  for (const sortField of fieldsToTry) {
    try {
      return await fetchWithSort(sortField);
    } catch (error) {
      lastError = error;
      if (error?.response?.status === 422 && sortField) {
        console.warn(`   ⚠️ "${sortField}" alanı bulunamadı, bir sonraki alan deneniyor...`);
        continue;
      }
      throw error;
    }
  }

  if (lastError) throw lastError;
  return [];
}

// Ana senkronizasyon fonksiyonu
async function syncAirtableToSupabase(tableId, tableName = 'Tablo', defaultCategoryId = 7, options = {}) {
  console.log(`🚀 ${tableName} → Supabase senkronizasyonu başlatılıyor... (Kategori ID: ${defaultCategoryId})`);
  
  // Join PR kullanıcısının ID'sini al
  const joinPRUserId = await getJoinPRUserId();
  
  if (!joinPRUserId) {
    console.error('❌ Join PR kullanıcısı bulunamadı, senkronizasyon durduruluyor');
    return;
  }
  
  // ÖNEMLİ: Son değişiklik yapılan TÜM "Done" yazılarını çek
  // Sadece 1 tane değil, son değişiklik yapılan TÜM yazılar önemli!
  const records = await fetchAirtableRecords(tableId, {
    maxRecords: options.maxRecords ?? 10000, // Tüm "Done" kayıtları çek (limit: 10.000)
    sortFieldCandidates: AIRTABLE_SORT_FIELD_CANDIDATES, // "Last Modified" alanına göre sırala
    sortDirection: 'desc', // En yeni değiştirilenler önce
    pageSize: options.pageSize ?? 100, // Her sayfada 100 kayıt çek
    initialDelayMs: options.initialDelayMs ?? 0,
    maxAttemptsPerPage: options.maxAttemptsPerPage ?? 10
  });
  console.log(`🔄 ${tableName}'dan ${records.length} yazı çekiliyor...`);
  
  if (records.length === 0) {
    console.log('ℹ️ Airtable\'da yazı bulunamadı');
    return;
  }
  
  // "Done" olan kayıtları say
  const doneRecords = records.filter(r => r.fields?.Status === 'Done');
  console.log(`✅ Toplam ${doneRecords.length} adet "Done" kayıt bulundu (Toplam kayıt: ${records.length})`);
  
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let doneProcessedCount = 0;
  
  for (const record of records) {
    const fields = record.fields;
    
    // Sadece "Done" olanları işle
    if (fields.Status !== 'Done') {
      skippedCount++;
      continue;
    }
    
    doneProcessedCount++;
    console.log(`\n📝 [${doneProcessedCount}/${doneRecords.length}] İşleniyor: ${fields.Name}`);
    
    // Supabase'de zaten var mı kontrol et
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id, title, content, excerpt, featured_image_url, author_id, author_name, tags, updated_at')
      .eq('airtable_record_id', record.id)
      .single();
    
    const isUpdate = !!existingPost;
    
    const airtableLastModified = getAirtableLastModified(fields);

    if (isUpdate) {
      const supabaseUpdatedAt = existingPost?.updated_at ? new Date(existingPost.updated_at) : null;
      if (airtableLastModified && supabaseUpdatedAt && supabaseUpdatedAt > airtableLastModified) {
        console.log(`   ⏭️ Admin panel versiyonu daha yeni (Supabase: ${supabaseUpdatedAt.toISOString()} > Airtable: ${airtableLastModified.toISOString()}), Airtable verisi uygulanmadı`);
        skippedCount++;
        continue;
      }

      console.log(`🔄 Güncelleme modu: ${fields.Name} (ID: ${existingPost.id})`);
      
      // Airtable'dan gelen veriler
      const airtableImageUrl = (fields.Attachments && fields.Attachments.length > 0) 
        ? fields.Attachments[0].url 
        : '';
      const airtableTags = Array.isArray(fields.Tags)
        ? fields.Tags.map((t) => (typeof t === 'string' ? t : (t && t.name) ? t.name : '')).filter(Boolean).sort().join(',')
        : '';
      
      // KAPSAMLI değişiklik kontrolü - NORMALIZE ile hash karşılaştırması
      // ChatGPT kopyala-yapıştır karakterleri temizleniyor!
      // Title, Content, Image URL, Tags, Category kontrolü
      const currentContentHash = crypto.createHash('md5')
        .update(`${normalizeText(fields.Name)}|${normalizeText(fields.Notes || '')}|${airtableImageUrl}|${airtableTags}|${defaultCategoryId}`)
        .digest('hex');
      
      const existingTags = Array.isArray(existingPost.tags) 
        ? existingPost.tags.sort().join(',') 
        : '';
      
      const existingContentHash = crypto.createHash('md5')
        .update(`${normalizeText(existingPost.title)}|${normalizeText(existingPost.content)}|${existingPost.featured_image_url || ''}|${existingTags}|${defaultCategoryId}`)
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
    let tagNames = Array.isArray(fields.Tags)
      ? fields.Tags.map((t) => (typeof t === 'string' ? t : (t && t.name) ? t.name : null)).filter(Boolean)
      : [];
    // Mood, Süre, Tarz, Bütçe kolonlarından Tatil Bulucu tag slug'larını ekle (tekrarsız)
    const tatilBulucuSlugs = getTatilBulucuTagSlugs(fields);
    // Yurt içi / Yurt dışı: başlık + slug'a göre otomatik etiket (ayrı script çalıştırmaya gerek yok)
    const yurtTag = getYurtIciYurtDisiTag(fields.Name, generateSlug(fields.Name));
    if (yurtTag) tatilBulucuSlugs.push(yurtTag);

    // Kategori ID'sini kullan (tablo bazlı sabit kategori)
    const categoryId = defaultCategoryId;
    console.log(`📂 Kategori ID: ${categoryId}`);

    // İçeriği HTML formatına çevir (paragrafları koru)
    let formattedContent = fields.Notes || '';
    
    // Çift <strong> tag'lerini düzelt
    formattedContent = formattedContent.replace(/<strong>\s*<strong>/g, '<strong>');
    formattedContent = formattedContent.replace(/<\/strong>\s*<\/strong>/g, '</strong>');
    
    // Çift satır sonlarını paragraf olarak işle
    const paragraphs = formattedContent.split(/\n\n+/);
    formattedContent = paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
    
    const postData = {
      title: fields.Name,
      slug: generateSlug(fields.Name),
      content: formattedContent,
      excerpt: fields.Notes ? fields.Notes.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
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

      // published_at korunuyor — ilk yayın tarihi değiştirilmez
      const { published_at, ...postDataWithoutPublishedAt } = postData;
      const updateData = {
        ...postDataWithoutPublishedAt,
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
    if (postId) {
      // 1) AirTable Tags alanından gelen tag'leri name ile upsert et
      if (tagNames.length > 0) {
        const tagsRows = await upsertTagsByNames(tagNames);
        const tagIds = (tagsRows || []).map((t) => t.id).filter(Boolean);
        await linkTagsToPost(postId, tagIds);
      }
      // 2) Tatil Bulucu + yurt-ici/disi slug'larını mevcut DB tag'lerinden ID ile bul ve ekle
      if (tatilBulucuSlugs.length > 0) {
        const slugIds = await lookupTagIdsBySlugs(tatilBulucuSlugs);
        await linkTagsToPost(postId, slugIds);
      }
    }

    // small delay to distribute write load
    await new Promise((r) => setTimeout(r, 100));
  }
  
  console.log(`\n🎉 Senkronizasyon tamamlandı!`);
  console.log(`   📊 Toplam kayıt: ${records.length}`);
  console.log(`   ✅ "Done" kayıt sayısı: ${doneRecords.length}`);
  console.log(`   ➕ Yeni eklenen: ${addedCount}`);
  console.log(`   📝 Güncellenen: ${updatedCount}`);
  console.log(`   ⏭️ Atlanan (In progress/Todo): ${skippedCount}`);
  console.log(`   ✅ İşlenen "Done" kayıt: ${doneProcessedCount}`);
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
    await syncAirtableToSupabase(AIRTABLE_BLOG_TABLE_ID, 'Blog Tablosu', 7, {
      initialDelayMs: 5000,
      maxRecords: 50, // Son 2 saatte max 50 yazı değişir
      pageSize: 50,
      maxAttemptsPerPage: 10
    });
    console.log('\n✅ Blog tablosu sync tamamlandı!\n');
    
    // 2. Haberler tablosunu sync et (Yurt İçi Haberleri kategorisi - ID: 13)
    console.log('📰 2/2: HABERLER TABLOSU (Yurt İçi Haberleri - ID: 13)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await syncAirtableToSupabase(AIRTABLE_NEWS_TABLE_ID, 'Haberler Tablosu', 13, {
      initialDelayMs: 10000,
      maxRecords: 50, // Son 2 saatte max 50 yazı değişir
      pageSize: 50,
      maxAttemptsPerPage: 10
    });
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
