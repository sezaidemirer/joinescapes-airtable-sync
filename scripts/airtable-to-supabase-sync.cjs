#!/usr/bin/env node

// Airtable'dan Supabase'e otomatik senkronizasyon
// Bu script Vercel Cron Job tarafından her 5 dakikada bir çalıştırılır

require('dotenv').config(); // .env dosyasını yükle

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
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_NAME || 'tblTcxVudBbXo2Svd';

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
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.records;
  } catch (error) {
    console.error('❌ Airtable veri çekme hatası:', error.message);
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
    
    const postData = {
      title: fields.Name,
      slug: generateSlug(fields.Name),
      content: fields.Notes || '',
      excerpt: fields.Notes ? fields.Notes.substring(0, 200) + '...' : '',
      author_name: 'Join PR',
      author_id: joinPRUserId, // Join PR kullanıcısının ID'si
      airtable_record_id: record.id,
      category_id: null, // Kategori yok (şimdilik)
      status: STATUS_MAPPING[fields.Status] || 'published',
      read_time: calculateReadTime(fields.Notes || ''),
      meta_title: fields.Name,
      meta_description: fields.Notes ? fields.Notes.substring(0, 160) : '',
      tags: [], // Boş etiket array'i
      featured_image_url: featuredImageUrl, // Airtable'dan gelen görsel
      published_at: new Date().toISOString() // Done yazıları yayınlanmış
    };
    
    if (existingPost) {
      // Mevcut post'u güncelle
      console.log(`   📝 ${fields.Name} güncelleniyor...`);
      
      const { error } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPost.id);
      
      if (error) {
        console.error(`   ❌ Güncelleme hatası: ${error.message}`);
        skippedCount++;
      } else {
        console.log(`   ✅ Güncellendi: ${fields.Name}`);
        updatedCount++;
      }
    } else {
      // Yeni post ekle
      console.log(`   ➕ ${fields.Name} ekleniyor...`);
      
      const { error } = await supabase
        .from('posts')
        .insert(postData);
      
      if (error) {
        console.error(`   ❌ Ekleme hatası: ${error.message}`);
        skippedCount++;
      } else {
        console.log(`   ✅ Eklendi: ${fields.Name}`);
        addedCount++;
      }
    }
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
