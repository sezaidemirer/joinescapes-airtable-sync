#!/usr/bin/env node

/**
 * Expire olan Airtable görsellerini otomatik görsellerle değiştir
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Supabase konfigürasyonu
const supabaseUrl = process.env.SUPABASE_URL || 'https://zhyrmasdozeptezoomnq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeXJtYXNkb3plcHRlem9vbW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4NDg2NSwiZXhwIjoyMDY0NDYwODY1fQ.VOPQzkDxHPWcJ0PS2cZ5hfCnkdqV5ueXyz40UL8Zc8g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Destinasyon haritası
const DESTINATION_MAPPING = {
  'izlanda': 'Iceland',
  'belgrad': 'Belgrade Serbia',
  'solo seyahat': 'solo travel',
  'akdeniz': 'Mediterranean',
  'karadağ': 'Montenegro',
  'türkiye': 'Turkey',
  'istanbul': 'Istanbul Turkey',
  'vize': 'travel visa',
  'yurt dışı': 'international travel',
  'bled': 'Bled Slovenia',
  'güney kore': 'South Korea',
  'kuzey avrupa': 'Northern Europe',
  'tayland': 'Thailand',
  'ispanya': 'Spain',
  'bükreş': 'Bucharest Romania',
  'hong kong': 'Hong Kong',
  'bodrum': 'Bodrum Turkey',
  'datça': 'Datca Turkey',
  'maldivler': 'Maldives',
  'venedik': 'Venice Italy',
  'karayipler': 'Caribbean',
  'fransız polinezyası': 'French Polynesia',
  'uruguay': 'Uruguay',
  'fiji': 'Fiji',
  'dubai': 'Dubai UAE',
  'barbados': 'Barbados',
  'mykonos': 'Mykonos Greece',
  'mallorca': 'Mallorca Spain',
  'phuket': 'Phuket Thailand',
  'torres del paine': 'Torres del Paine Chile',
  'langkawi': 'Langkawi Malaysia',
  'capri': 'Capri Italy',
  'kapadokya': 'Cappadocia Turkey',
  'bahamalar': 'Bahamas',
  'zakintos': 'Zakynthos Greece',
  'kaş': 'Kas Turkey',
  'sardinya': 'Sardinia Italy',
  'romanya': 'Romania',
  'malezya': 'Malaysia',
  'umman': 'Oman',
  'portekiz': 'Portugal',
  'arjantin': 'Argentina',
  'güney afrika': 'South Africa',
  'küba': 'Cuba',
  'polonya': 'Poland',
  'iskoçya': 'Scotland',
  'sevilla': 'Seville Spain',
  'mısır': 'Egypt',
  'avusturya': 'Austria',
  'çekya': 'Czech Republic',
  'lizbon': 'Lisbon Portugal',
  'japonya': 'Japan',
  'roma': 'Rome Italy',
  'berlin': 'Berlin Germany',
  'marrakech': 'Marrakech Morocco',
  'isviçre': 'Switzerland',
  'santorini': 'Santorini Greece',
  'tokyo': 'Tokyo Japan',
  'sırbistan': 'Serbia',
  'fransa': 'France',
  'bangkok': 'Bangkok Thailand',
  'san sebastián': 'San Sebastian Spain',
  'sofya': 'Sofia Bulgaria',
  'tivat': 'Tivat Montenegro',
  'podgorica': 'Podgorica Montenegro',
  'paris': 'Paris France',
  'dominik': 'Dominican Republic',
  'meksika': 'Mexico',
  'kanada': 'Canada',
  'yunanistan': 'Greece',
  'bahreyn': 'Bahrain',
  'katar': 'Qatar',
  'fas': 'Morocco',
  'italya': 'Italy',
  'hindistan': 'India',
  'sharm el sheikh': 'Sharm El Sheikh Egypt',
  'lyon': 'Lyon France',
  'barcelona': 'Barcelona Spain'
};

// Destinasyonları çıkar
function extractDestinations(content) {
  const destinations = [];
  const lowerContent = content.toLowerCase();
  
  for (const [key, searchTerm] of Object.entries(DESTINATION_MAPPING)) {
    if (lowerContent.includes(key)) {
      destinations.push({
        name: key,
        searchTerm: searchTerm
      });
    }
  }
  
  return destinations;
}

// Varsayılan görseller
const DEFAULT_IMAGES = {
  'izlanda': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'belgrad': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'solo seyahat': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'akdeniz': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'karadağ': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'türkiye': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'istanbul': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
  'default': 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop'
};

// Varsayılan görsel al
async function getDestinationImage(destination) {
  try {
    const imageUrl = DEFAULT_IMAGES[destination.name] || DEFAULT_IMAGES['default'];
    return {
      url: imageUrl,
      alt: `${destination.name} görseli`
    };
  } catch (error) {
    console.error('Görsel alma hatası:', error);
    return null;
  }
}

// Otomatik görsel ekle
async function addAutoImageToPost(post) {
  // Yazı içeriğinden destinasyonları çıkar
  const content = `${post.title} ${post.excerpt} ${post.content}`
  const destinations = extractDestinations(content)
  
  if (destinations.length === 0) {
    console.log('📝 Destinasyon bulunamadı, varsayılan görsel kullanılacak')
    return {
      ...post,
      featured_image_url: 'https://images.pexels.com/photos/1488646953014-85cb44e25828/pexels-photo-1488646953014-85cb44e25828.jpeg?w=800&h=600&fit=crop',
      featured_image_alt: 'Seyahat ve tatil görseli'
    }
  }
  
  // İlk bulunan destinasyon için görsel al
  const destination = destinations[0]
  console.log(`🏖️ ${destination.name} için görsel aranıyor...`)
  
  const image = await getDestinationImage(destination)
  
  if (image) {
    console.log(`✅ ${destination.name} için görsel bulundu`)
    return {
      ...post,
      featured_image_url: image.url,
      featured_image_alt: image.alt
    }
  } else {
    console.log(`❌ ${destination.name} için görsel bulunamadı`)
    return post
  }
}

// Airtable URL'si mi kontrol et
function isAirtableUrl(url) {
  return url && (
    url.includes('airtableusercontent.com') || 
    url.includes('dl.airtable.com') ||
    url.includes('airtable.com')
  )
}

// Ana fonksiyon
async function fixExpiredImages() {
  console.log('🔧 Expire olan görseller düzeltiliyor...')
  
  try {
    // Airtable URL'li yazıları çek
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, featured_image_url, excerpt, content')
      .not('featured_image_url', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Yazılar çekilemedi:', error)
      return
    }
    
    // Airtable URL'li yazıları filtrele
    const airtablePosts = posts.filter(post => isAirtableUrl(post.featured_image_url))
    
    console.log(`📋 ${airtablePosts.length} Airtable URL'li yazı bulundu`)
    
    let fixedCount = 0
    
    for (const post of airtablePosts) {
      console.log(`🔄 ${post.title} işleniyor...`)
      
      // Otomatik görsel ekle
      const postWithAutoImage = await addAutoImageToPost(post)
      
      if (postWithAutoImage.featured_image_url !== post.featured_image_url) {
        // Yazıyı güncelle
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            featured_image_url: postWithAutoImage.featured_image_url
          })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ ${post.title} güncellenemedi:`, updateError)
        } else {
          console.log(`✅ ${post.title} güncellendi`)
          fixedCount++
        }
      } else {
        console.log(`⏭️ ${post.title} - Görsel değişmedi`)
      }
      
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`\n🎉 İşlem tamamlandı!`)
    console.log(`✅ Düzeltilen: ${fixedCount} yazı`)
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

// Script'i çalıştır
if (require.main === module) {
  fixExpiredImages()
}

module.exports = { fixExpiredImages }
