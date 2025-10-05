import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL veya Key bulunamadı!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addOneriTagToJoinEscapesPosts() {
  try {
    console.log('🔍 Join Escapes yazılarına "öneri" etiketi ekleniyor...')
    
    // 1. "öneri" etiketini bul
    const { data: oneriTag, error: tagError } = await supabase
      .from('tags')
      .select('id, name, slug')
      .eq('slug', 'oneri')
      .single()
    
    if (tagError || !oneriTag) {
      console.error('❌ "öneri" etiketi bulunamadı:', tagError)
      return
    }
    
    console.log('✅ "öneri" etiketi bulundu:', oneriTag)
    
    // 2. Join Escapes'in yazılarını bul (author_name = 'test' olanlar)
    const { data: joinEscapesPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, author_name, author_id')
      .eq('author_name', 'test')
      .eq('status', 'published')
    
    if (postsError) {
      console.error('❌ Join Escapes yazıları bulunamadı:', postsError)
      return
    }
    
    console.log(`📊 Join Escapes yazıları bulundu: ${joinEscapesPosts.length} adet`)
    
    if (joinEscapesPosts.length === 0) {
      console.log('⚠️ Join Escapes yazısı bulunamadı')
      return
    }
    
    // 3. Her yazıya "öneri" etiketi ekle (direkt post_tags tablosuna)
    let successCount = 0
    let errorCount = 0
    
    for (const post of joinEscapesPosts) {
      console.log(`📝 "${post.title}" yazısına "öneri" etiketi ekleniyor...`)
      
      try {
        // Önce bu yazıda zaten "öneri" etiketi var mı kontrol et
        const { data: existingTag, error: checkError } = await supabase
          .from('post_tags')
          .select('id')
          .eq('post_id', post.id)
          .eq('tag_id', oneriTag.id)
          .single()
        
        if (existingTag) {
          console.log(`⚠️ "${post.title}" zaten "öneri" etiketine sahip`)
          successCount++
          continue
        }
        
        // Yeni etiket ekle
        const { data, error } = await supabase
          .from('post_tags')
          .insert({
            post_id: post.id,
            tag_id: oneriTag.id
          })
        
        if (error) {
          console.error(`❌ "${post.title}" için hata:`, error)
          errorCount++
        } else {
          console.log(`✅ "${post.title}" için "öneri" etiketi eklendi`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ "${post.title}" için beklenmeyen hata:`, err)
        errorCount++
      }
    }
    
    console.log('\n📊 Sonuç:')
    console.log(`✅ Başarılı: ${successCount} yazı`)
    console.log(`❌ Hata: ${errorCount} yazı`)
    console.log(`📝 Toplam: ${joinEscapesPosts.length} yazı`)
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

// Scripti çalıştır
addOneriTagToJoinEscapesPosts()
  .then(() => {
    console.log('🎉 Script tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script hatası:', error)
    process.exit(1)
  })
