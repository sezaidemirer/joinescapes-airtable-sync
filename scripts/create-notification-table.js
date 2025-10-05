import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase bağlantısı
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createNotificationTable() {
  try {
    console.log('🔧 Bildirim tablosu oluşturuluyor...')
    
    // SQL dosyasını oku
    const sqlPath = path.join(process.cwd(), 'database', 'notification_permissions.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // SQL'i çalıştır
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Tablo oluşturma hatası:', error)
      return
    }
    
    console.log('✅ Bildirim tablosu başarıyla oluşturuldu!')
    console.log('📊 Tablo: notification_permissions')
    console.log('🔐 RLS aktif')
    console.log('📝 Örnek veriler eklendi')
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  }
}

// Manuel SQL çalıştırma (RPC yoksa)
async function createTableManually() {
  try {
    console.log('🔧 Bildirim tablosu manuel olarak oluşturuluyor...')
    
    const sql = `
      -- Bildirim İzinleri Tablosu
      CREATE TABLE IF NOT EXISTS notification_permissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          permission TEXT NOT NULL CHECK (permission IN ('granted', 'denied', 'default')),
          subscription_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { error } = await supabase.from('notification_permissions').select('*').limit(1)
    
    if (error && error.code === '42P01') {
      // Tablo yok, oluştur
      console.log('📝 Tablo bulunamadı, manuel olarak oluşturulması gerekiyor.')
      console.log('🔗 Supabase Dashboard > SQL Editor > Bu SQL\'i çalıştırın:')
      console.log(sql)
    } else {
      console.log('✅ Tablo zaten mevcut!')
    }
    
  } catch (error) {
    console.error('❌ Hata:', error)
  }
}

// Çalıştır
createTableManually()
