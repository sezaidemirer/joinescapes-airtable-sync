#!/usr/bin/env node

/**
 * Mevcut yazıların Airtable görsellerini Supabase Storage'a kopyalar
 * Bu script sadece bir kez çalıştırılmalı
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Supabase konfigürasyonu
const supabaseUrl = process.env.SUPABASE_URL || 'https://zhyrmasdozeptezoomnq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeXJtYXNkb3plcHRlem9vbW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4NDg2NSwiZXhwIjoyMDY0NDYwODY1fQ.VOPQzkDxHPWcJ0PS2cZ5hfCnkdqV5ueXyz40UL8Zc8g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Airtable görselini Supabase Storage'a kopyala
async function copyAirtableImageToSupabase(imageUrl, postTitle) {
  try {
    if (!imageUrl) return null
    
    console.log(`📥 Airtable görseli indiriliyor: ${imageUrl}`)
    
    // Görseli indir
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Dosya adı oluştur
    const fileExt = contentType.split('/')[1] || 'jpg'
    const fileName = `airtable-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `posts/${fileName}`
    
    // Supabase Storage'a yükle
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, imageBuffer, {
        contentType: contentType,
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('❌ Supabase upload hatası:', uploadError)
      return null
    }
    
    // Public URL'i al
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)
    
    console.log(`✅ Görsel Supabase'e kopyalandı: ${publicUrl}`)
    
    return {
      url: publicUrl,
      alt: postTitle
    }
    
  } catch (error) {
    console.error('❌ Görsel kopyalama hatası:', error)
    return null
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
async function fixExistingImages() {
  console.log('🔧 Mevcut yazıların görselleri düzeltiliyor...')
  
  try {
    // Tüm yazıları çek
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, featured_image_url')
      .not('featured_image_url', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Yazılar çekilemedi:', error)
      return
    }
    
    console.log(`📋 ${posts.length} yazı bulundu`)
    
    let fixedCount = 0
    let skippedCount = 0
    
    for (const post of posts) {
      // Airtable URL'si mi kontrol et
      if (!isAirtableUrl(post.featured_image_url)) {
        console.log(`⏭️ ${post.title} - Airtable URL'si değil, atlanıyor`)
        skippedCount++
        continue
      }
      
      console.log(`🔄 ${post.title} işleniyor...`)
      
      // Görseli kopyala
      const copiedImage = await copyAirtableImageToSupabase(post.featured_image_url, post.title)
      
      if (copiedImage) {
        // Yazıyı güncelle
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            featured_image_url: copiedImage.url,
            featured_image_alt: copiedImage.alt
          })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ ${post.title} güncellenemedi:`, updateError)
        } else {
          console.log(`✅ ${post.title} güncellendi`)
          fixedCount++
        }
      } else {
        console.log(`❌ ${post.title} görseli kopyalanamadı`)
      }
      
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`\n🎉 İşlem tamamlandı!`)
    console.log(`✅ Düzeltilen: ${fixedCount} yazı`)
    console.log(`⏭️ Atlanan: ${skippedCount} yazı`)
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

// Script'i çalıştır
if (require.main === module) {
  fixExistingImages()
}

module.exports = { fixExistingImages, copyAirtableImageToSupabase }
