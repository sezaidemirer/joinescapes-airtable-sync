require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL veya Key bulunamadı!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addLuxuryTag() {
  try {
    console.log('🏷️ Lüks Seçkiler etiketi ekleniyor...')
    
    // Önce etiketin var olup olmadığını kontrol et
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', 'luks-seckiler')
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Etiket kontrol hatası:', checkError)
      return
    }
    
    if (existingTag) {
      console.log('✅ Lüks Seçkiler etiketi zaten mevcut:', existingTag)
      return existingTag
    }
    
    // Yeni etiket oluştur
    const { data: newTag, error: insertError } = await supabase
      .from('tags')
      .insert({
        name: 'Lüks Seçkiler',
        slug: 'luks-seckiler',
        description: 'Premium ve lüks seyahat deneyimleri',
        color: '#FFD700',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Etiket oluşturma hatası:', insertError)
      return
    }
    
    console.log('✅ Lüks Seçkiler etiketi oluşturuldu:', newTag)
    return newTag
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

async function addLuxuryTagToPosts() {
  try {
    console.log('📝 Lüks Seçkiler etiketini yazılara ekleniyor...')
    
    // Önce posts tablosunun yapısını kontrol et
    const { data: samplePost, error: sampleError } = await supabase
      .from('posts')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Posts tablosu erişim hatası:', sampleError)
      return
    }
    
    console.log('📋 Posts tablosu kolonları:', Object.keys(samplePost[0] || {}))
    
    // Lüks içerikli yazıları bul (published_at kontrolü ile)
    const { data: luxuryPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, tags, published_at')
      .not('published_at', 'is', null)
      .or('title.ilike.%lüks%,title.ilike.%luxury%,title.ilike.%premium%,title.ilike.%exclusive%')
      .limit(10)
    
    if (postsError) {
      console.error('❌ Yazı arama hatası:', postsError)
      return
    }
    
    console.log(`📋 ${luxuryPosts.length} lüks yazı bulundu`)
    
    // Her yazıya lüks-seckiler etiketini ekle
    for (const post of luxuryPosts) {
      const currentTags = post.tags || []
      
      if (!currentTags.includes('luks-seckiler')) {
        const updatedTags = [...currentTags, 'luks-seckiler']
        
        const { error: updateError } = await supabase
          .from('posts')
          .update({ tags: updatedTags })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ ${post.title} güncellenemedi:`, updateError)
        } else {
          console.log(`✅ ${post.title} güncellendi`)
        }
      } else {
        console.log(`ℹ️ ${post.title} zaten lüks-seckiler etiketli`)
      }
    }
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

async function main() {
  console.log('🚀 Lüks Seçkiler etiketi işlemi başlıyor...')
  
  // Etiketi oluştur
  await addLuxuryTag()
  
  // Yazılara etiketi ekle
  await addLuxuryTagToPosts()
  
  console.log('✅ İşlem tamamlandı!')
}

main()
