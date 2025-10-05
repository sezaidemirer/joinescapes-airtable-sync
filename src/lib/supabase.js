import { createClient } from '@supabase/supabase-js'

// GÜVENLİK: Environment variables kullan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Güvenlik kontrolü
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 HATA: Supabase environment variables eksik! .env dosyasını kontrol edin.')
}

// Supabase client'ını oluştur (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin işlemleri için service role client (sadece admin panelinde kullan)
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Auth helper functions
export const auth = {
  // Kullanıcı giriş yapma
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Kullanıcı kayıt olma
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Kullanıcı çıkış yapma
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Mevcut kullanıcıyı alma
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Auth durumunu dinleme
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Veri çekme
  select: (table) => supabase.from(table).select(),
  
  // Veri ekleme
  insert: (table, data) => supabase.from(table).insert(data),
  
  // Veri güncelleme
  update: (table, data, match) => supabase.from(table).update(data).match(match),
  
  // Veri silme
  delete: (table, match) => supabase.from(table).delete().match(match)
}

export default supabase 