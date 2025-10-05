require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase konfigürasyonu
const supabaseUrl = 'https://zhyrmasdozeptezoomnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeXJtYXNkb3plcHRlem9vbW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4NDg2NSwiZXhwIjoyMDY0NDYwODY1fQ.VOPQzkDxHPWcJ0PS2cZ5hfCnkdqV5ueXyz40UL8Zc8g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Eski yazıların etiketlerini migrate et
async function migrateOldTags() {
  console.log('🔄 Eski yazıların etiketleri migrate ediliyor...');
  
  try {
    // Tags array'i olan ama post_tags ilişkisi olmayan yazıları bul
    const { data: postsWithTags, error: postsError } = await supabase
      .from('posts')
      .select('id, title, tags')
      .not('tags', 'is', null)
      .neq('tags', '{}');
      
    if (postsError) {
      console.error('❌ Yazılar çekilemedi:', postsError);
      return;
    }
    
    console.log(`📋 ${postsWithTags.length} yazı bulundu (tags array'i var)`);
    
    // Her yazı için etiketleri kontrol et
    for (const post of postsWithTags) {
      console.log(`\n🔄 ${post.title} işleniyor...`);
      
      // Bu yazının post_tags ilişkisi var mı kontrol et
      const { data: existingTags, error: checkError } = await supabase
        .from('post_tags')
        .select('id')
        .eq('post_id', post.id)
        .limit(1);
        
      if (checkError) {
        console.log(`⚠️ ${post.title} kontrol hatası:`, checkError.message);
        continue;
      }
      
      // Eğer zaten post_tags ilişkisi varsa atla
      if (existingTags && existingTags.length > 0) {
        console.log(`ℹ️ ${post.title} zaten post_tags ilişkisi var (atlanıyor)`);
        continue;
      }
      
      // Tags array'ini işle
      if (post.tags && post.tags.length > 0) {
        console.log(`🏷️ ${post.tags.length} etiket işleniyor: ${post.tags.join(', ')}`);
        
        // Her etiket için tag ID'sini bul
        for (const tagName of post.tags) {
          const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('id, name')
            .eq('name', tagName)
            .single();
            
          if (tagError) {
            console.log(`⚠️ Etiket bulunamadı: ${tagName}`);
            continue;
          }
          
          // post_tags ilişkisini ekle
          const { error: insertError } = await supabase
            .from('post_tags')
            .insert({
              post_id: post.id,
              tag_id: tag.id
            });
            
          if (insertError) {
            console.log(`⚠️ Etiket ilişkisi eklenemedi: ${tagName}`, insertError.message);
          } else {
            console.log(`✅ Etiket eklendi: ${tagName}`);
          }
        }
      }
    }
    
    console.log('\n✅ Migration tamamlandı!');
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
  }
}

// Script çalıştır
if (require.main === module) {
  migrateOldTags();
}

module.exports = { migrateOldTags };
