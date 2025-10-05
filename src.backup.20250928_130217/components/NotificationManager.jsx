import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getTurkeyTimeISO, logWithTurkeyTime } from '../utils/dateUtils'

const NotificationManager = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    checkNotificationSupport()
  }, [])

  const checkNotificationSupport = () => {
    logWithTurkeyTime('🔍 Bildirim desteği kontrol ediliyor...')
    
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      const currentPermission = Notification.permission
      setPermission(currentPermission)
      
      logWithTurkeyTime('📱 Bildirim desteği: ✅')
      logWithTurkeyTime('🔐 Mevcut izin:', currentPermission)
      
      // Daha önce sorulup sorulmadığını kontrol et
      const hasAsked = localStorage.getItem('notificationAsked')
      logWithTurkeyTime('❓ Daha önce soruldu mu:', hasAsked)
      
      // Eğer izin reddedilmişse, tekrar sorma
      if (currentPermission === 'denied') {
        logWithTurkeyTime('❌ İzin reddedilmiş')
      } else if (currentPermission === 'default' && !hasAsked) {
        logWithTurkeyTime('⏰ 2 saniye sonra prompt gösterilecek...')
        setTimeout(() => {
          logWithTurkeyTime('🎯 Prompt gösteriliyor...')
          setShowPrompt(true)
        }, 2000)
      } else if (currentPermission === 'default' && hasAsked) {
        logWithTurkeyTime('⚠️ Daha önce sorulmuş, prompt gösterilmiyor')
      } else if (currentPermission === 'granted') {
        logWithTurkeyTime('✅ İzin zaten verilmiş')
      }
    } else {
      logWithTurkeyTime('❌ Bildirim desteği yok')
      setIsSupported(false)
    }
  }

  const requestPermission = async () => {
    try {
      logWithTurkeyTime('🔔 Bildirim izni isteniyor...')
      
      // Buton tıklanabilirliğini geçici olarak devre dışı bırak
      const button = document.querySelector('[data-notification-button]')
      if (button) {
        button.disabled = true
        button.style.pointerEvents = 'none'
        logWithTurkeyTime('🔒 Buton devre dışı bırakıldı')
      }
      
      logWithTurkeyTime('📱 Notification.requestPermission() çağrılıyor...')
      const permission = await Notification.requestPermission()
      logWithTurkeyTime('✅ İzin sonucu:', permission)
      
      // İzin durumunu olduğu gibi kullan (manuel değiştirme)
      let finalPermission = permission
      logWithTurkeyTime('📋 Final izin durumu:', finalPermission)
      logWithTurkeyTime('🔍 Browser Notification.permission:', Notification.permission)
      
      setPermission(finalPermission)
      setShowPrompt(false)
      
      // Kullanıcıya sorulduğunu kaydet
      localStorage.setItem('notificationAsked', 'true')
      localStorage.setItem('notificationPermission', finalPermission)
      logWithTurkeyTime('💾 LocalStorage\'a kaydedildi')
      
      if (finalPermission === 'granted') {
        logWithTurkeyTime('🎉 İzin verildi! Hoş geldin bildirimi gönderiliyor...')
        // Hoş geldin bildirimi gönder
        showWelcomeNotification()
        // Service worker register et
        registerServiceWorker()
        // Supabase'e kaydet
        await saveNotificationPermission(finalPermission)
      } else if (finalPermission === 'denied') {
        logWithTurkeyTime('❌ İzin reddedildi')
        // Reddedilen izni de Supabase'e kaydet
        await saveNotificationPermission(finalPermission)
      } else {
        logWithTurkeyTime('🤔 İzin durumu belirsiz:', permission)
      }
    } catch (error) {
      logWithTurkeyTime('❌ Notification permission error:', error)
      setShowPrompt(false)
    } finally {
      // Buton tıklanabilirliğini geri aç
      const button = document.querySelector('[data-notification-button]')
      if (button) {
        button.disabled = false
        button.style.pointerEvents = 'auto'
        logWithTurkeyTime('🔓 Buton tekrar aktif')
      }
    }
  }

  const showWelcomeNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🎉 JoinEscapes\'e Hoş Geldiniz!', {
        body: 'Yeni destinasyon haberleri ve özel kampanyalardan haberdar olacaksınız.',
        icon: '/images/join_icon.webp',
        badge: '/images/join_icon.webp',
        tag: 'welcome',
        requireInteraction: false,
        silent: false
      })
    }
  }

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        // Push subscription oluştur
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIFSXjqFXgoUWqo2gTEkwvWzaOjzWKl_Qa4DNODZONpPnPvJF6OMM' // VAPID public key
          )
        })
        
        // Subscription'ı backend'e gönder
        await saveSubscription(subscription)
      }
    } catch (error) {
      console.error('Service Worker registration error:', error)
    }
  }

  const saveSubscription = async (subscription) => {
    try {
      // Burada subscription'ı Supabase'e kaydedebiliriz
      
      // localStorage'a da kaydet
      localStorage.setItem('pushSubscription', JSON.stringify(subscription))
    } catch (error) {
      console.error('Save subscription error:', error)
    }
  }

  const saveNotificationPermission = async (permission) => {
    try {
      logWithTurkeyTime('🔔 Bildirim izni kaydediliyor:', permission)
      
      // Kullanıcı ID'sini al
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null
      
      logWithTurkeyTime('👤 Kullanıcı ID:', userId)
      
      // Eğer kullanıcı giriş yapmamışsa, sadece localStorage'a kaydet
      if (!userId) {
        logWithTurkeyTime('⚠️ Kullanıcı giriş yapmamış, sadece localStorage\'a kaydediliyor')
        localStorage.setItem('notificationPermission', permission)
        logWithTurkeyTime('✅ LocalStorage\'a kaydedildi:', permission)
        return
      }
      
      // Supabase'e bildirim izni kaydet (Türkiye saati ile)
      const { data, error } = await supabase
        .from('notification_permissions')
        .upsert({
          user_id: userId,
          permission: permission,
          subscription_data: null,
          created_at: getTurkeyTimeISO(),
          updated_at: getTurkeyTimeISO()
        })
      
      if (error) {
        logWithTurkeyTime('❌ Save notification permission error:', error)
        logWithTurkeyTime('Error details:', error.message, error.details, error.hint)
        
        // Hata olursa da localStorage'a kaydet
        localStorage.setItem('notificationPermission', permission)
        logWithTurkeyTime('⚠️ Supabase hatası, localStorage\'a yedek kaydedildi')
      } else {
        logWithTurkeyTime('✅ Bildirim izni Supabase\'e kaydedildi:', permission)
        logWithTurkeyTime('📊 Kaydedilen veri:', data)
        
        // Supabase'e kaydettikten sonra localStorage'a da kaydet
        localStorage.setItem('notificationPermission', permission)
      }
    } catch (error) {
      logWithTurkeyTime('❌ Save notification permission error:', error)
      
      // Catch'te de localStorage'a kaydet
      localStorage.setItem('notificationPermission', permission)
      logWithTurkeyTime('⚠️ Exception, localStorage\'a yedek kaydedildi')
    }
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const handleDeny = async () => {
    setShowPrompt(false)
    localStorage.setItem('notificationAsked', 'true')
    localStorage.setItem('notificationPermission', 'denied')
    
    // Reddedilen izni de Supabase'e kaydet
    await saveNotificationPermission('denied')
  }


  // Test bildirimi gönder (development için)
  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🧪 Test Bildirimi', {
        body: 'Bu bir test bildirimidir. Sistem çalışıyor!',
        icon: '/images/join_icon.webp',
        badge: '/images/join_icon.webp',
        tag: 'test'
      })
    }
  }

  if (!isSupported) {
    return null
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 animate-slide-in-right">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Bildirimleri Açın
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Yeni destinasyon haberleri ve özel kampanyalardan anında haberdar olun.
            </p>
            
            <div className="flex space-x-2">
              <button
                data-notification-button
                onClick={requestPermission}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>İzin Ver</span>
              </button>
              
              <button
                onClick={handleDeny}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Şimdi Değil
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDeny}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Development Test Button */}
      {process.env.NODE_ENV === 'development' && permission === 'granted' && (
        <button
          onClick={sendTestNotification}
          className="mt-2 w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          🧪 Test Bildirimi Gönder
        </button>
      )}
    </div>
  )
}

export default NotificationManager 