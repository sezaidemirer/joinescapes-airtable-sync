import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Mevcut session'ı al
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Auth durumu değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state değişti:', event, session?.user?.email || 'null')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Giriş yapma - Email doğrulama kontrolü
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Email doğrulanmamışsa giriş engelle
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('❌ Email doğrulanmamış:', email)
        return { 
          data: null, 
          error: { 
            message: 'Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin.' 
          } 
        }
      }
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Kayıt olma - Email doğrulama ZORUNLU
  const signUp = async (email, password, userRole = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.hostname === 'localhost' 
            ? `${window.location.protocol}//${window.location.host}/kullanici-girisi?verified=true`
            : `${window.location.origin}/kullanici-girisi?verified=true`,
          data: {
            user_role: userRole,
            full_name: email.split('@')[0],
            author_name: 'JoinEscapes',
            email_confirmed: false // Email doğrulanmamış olarak işaretle
          }
        }
      })
      
      // Email confirmation zorunlu - kullanıcı hemen giriş yapamaz
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('📧 Email doğrulama gerekli:', email)
        return { 
          data: { 
            ...data, 
            needsEmailConfirmation: true,
            message: 'Email doğrulama gerekli'
          }, 
          error: null 
        }
      }
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Çıkış yapma
  const signOut = async () => {
    try {
      console.log('🔐 Supabase signOut çağrılıyor...')
      
      // State'i önce temizle (offline çalışma için)
      setUser(null)
      setSession(null)
      
      // LocalStorage'ı temizle
      localStorage.removeItem('sb-zhyrmasdozeptezoomnq-auth-token')
      localStorage.clear()
      
      // Supabase'den çıkış yap
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Supabase signOut hatası:', error)
        // Hata olsa bile state temizlendi, kullanıcı çıkış yapmış sayılır
        console.log('⚠️ Supabase hatası ama state temizlendi')
      } else {
        console.log('✅ Supabase signOut başarılı')
      }
      
      // Sayfayı yenile (güçlü çıkış için)
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
      return { error: null } // Hata olsa bile null döndür
    } catch (error) {
      console.error('❌ signOut catch hatası:', error)
      // Catch'te de state temizlendi, hata yok sayılır
      setUser(null)
      setSession(null)
      localStorage.clear()
      window.location.href = '/'
      return { error: null }
    }
  }

  // Mevcut kullanıcıyı al
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return { data: { user }, error: null }
    } catch (error) {
      return { data: { user: null }, error }
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    getCurrentUser
  }
} 