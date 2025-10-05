#!/usr/bin/env node

// Eksik (null/boş) featured_image_url olan yazılara içerikten destinasyon bazlı otomatik görsel atar

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://zhyrmasdozeptezoomnq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Basit destinasyon çıkarımı
const DESTINATION_MAPPING = {
  'türkiye': 'turkey', 'istanbul': 'istanbul', 'izmir': 'izmir', 'antalya': 'antalya',
  'almanya': 'germany', 'berlin': 'berlin', 'fransa': 'france', 'paris': 'paris',
  'italya': 'italy', 'roma': 'rome', 'venedik': 'venice', 'venedik': 'venice',
  'ispanya': 'spain', 'barselona': 'barcelona', 'yunanistan': 'greece', 'santorini': 'santorini',
  'maldivler': 'maldives', 'dubai': 'dubai', 'japonya': 'japan', 'tokyo': 'tokyo',
}

// Basit default görseller (Pexels/Unsplash telifsiz örnekler)
const DEFAULT_IMAGES = {
  maldives: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop',
  santorini: 'https://images.unsplash.com/photo-1504270997636-07ddfbd48945?q=80&w=1200&auto=format&fit=crop',
  venice: 'https://images.unsplash.com/photo-1526045478516-99145907023c?q=80&w=1200&auto=format&fit=crop',
  rome: 'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?q=80&w=1200&auto=format&fit=crop',
  barcelona: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1200&auto=format&fit=crop',
  paris: 'https://images.unsplash.com/photo-1461319805560-d7d0b3a3b8d8?q=80&w=1200&auto=format&fit=crop',
  dubai: 'https://images.unsplash.com/photo-1498496294664-886f4b4d86fb?q=80&w=1200&auto=format&fit=crop',
  istanbul: 'https://images.unsplash.com/photo-1572939360544-0e8b4b1f3a5a?q=80&w=1200&auto=format&fit=crop',
  turkey: 'https://images.unsplash.com/photo-1603726573559-c9d2d6bbbd78?q=80&w=1200&auto=format&fit=crop',
}

function extractDestinations(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = []
  for (const key of Object.keys(DESTINATION_MAPPING)) {
    if (lower.includes(key)) {
      found.push({ name: key, search: DESTINATION_MAPPING[key] })
    }
  }
  return found
}

async function getDestinationImage(dest) {
  // Burada Pexels API yerine default görseller kullanıyoruz (anahtar gerektirmez)
  if (!dest) return null
  const url = DEFAULT_IMAGES[dest.search]
  if (url) return { url, alt: dest.name }
  // Fallback genel görsel
  return { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', alt: 'Seyahat' }
}

async function addAutoImageToPost(post) {
  if (post.featured_image_url) return post
  const content = `${post.title || ''} ${post.excerpt || ''} ${post.content || ''}`
  const dests = extractDestinations(content)
  const first = dests[0]
  const image = await getDestinationImage(first)
  if (!image) return post
  return { ...post, featured_image_url: image.url }
}

async function fixMissingImages() {
  console.log('🔧 Eksik görseller (null/boş) otomatik dolduruluyor...')
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, featured_image_url, author_name')
    .is('featured_image_url', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Yazılar çekilemedi:', error)
    process.exit(1)
  }

  console.log(`📋 Eksik görselli yazı sayısı: ${posts.length}`)
  let updated = 0

  for (const post of posts) {
    const withImage = await addAutoImageToPost(post)
    if (withImage.featured_image_url && withImage.featured_image_url !== post.featured_image_url) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ featured_image_url: withImage.featured_image_url })
        .eq('id', post.id)
      if (updateError) {
        console.error(`❌ Güncellenemedi: ${post.title}`, updateError)
      } else {
        console.log(`✅ Güncellendi: ${post.title}`)
        updated++
      }
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`🎉 Bitti. Güncellenen: ${updated}`)
}

if (require.main === module) {
  fixMissingImages()
}


