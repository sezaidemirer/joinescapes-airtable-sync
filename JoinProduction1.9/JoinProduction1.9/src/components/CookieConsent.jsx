import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X, Settings } from 'lucide-react'
import { getTurkeyTimeISO } from '../utils/dateUtils'

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    checkExistingConsent()
  }, [])

  const checkExistingConsent = async () => {
    try {
      const consent = localStorage.getItem('cookieConsent')
      if (!consent) {
        setShowBanner(true)
      } else {
        const consentData = JSON.parse(consent)
        setPreferences(consentData.preferences || preferences)
      }
    } catch (error) {
      console.error('Cookie consent check error:', error)
      setShowBanner(true)
    }
  }

  const handleAcceptAll = async () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }
    
    setPreferences(allAccepted)
    saveConsent(allAccepted)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleRejectAll = async () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }
    
    setPreferences(onlyNecessary)
    saveConsent(onlyNecessary)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleSavePreferences = async () => {
    saveConsent(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const saveConsent = (prefs) => {
    try {
      const consentData = {
        preferences: prefs,
        timestamp: getTurkeyTimeISO(),
        version: '1.0'
      }
      localStorage.setItem('cookieConsent', JSON.stringify(consentData))
    } catch (error) {
      console.error('Cookie consent save error:', error)
    }
  }

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Consent Banner - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden">
            {/* Content - 2 lines max */}
            <div className="flex items-start space-x-3 mb-3">
              <Cookie className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-tight line-clamp-2">
                  Size daha iyi hizmet verebilmek için çerezleri kullanıyoruz. Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
                  <Link to="/cerez-politikasi" className="text-primary-600 underline ml-1 font-medium">
                    Çerez Politikası
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Buttons - Bottom row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAcceptAll}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  İzin Ver
                </button>
                
                <button
                  onClick={handleRejectAll}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Red
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded transition-colors"
                  title="Ayarlar"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setShowBanner(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded transition-colors"
                  title="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Layout - Original */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            
            {/* Content - Desktop */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <Cookie className="h-6 w-6 text-primary-600 flex-shrink-0" />
                <p className="text-base text-gray-700 leading-tight">
                  Size daha iyi hizmet verebilmek için çerezleri kullanıyoruz. Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
                  <Link to="/cerez-politikasi" className="text-primary-600 underline ml-1 font-medium">
                    Çerez Politikası
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons - Desktop */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleAcceptAll}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Kabul
              </button>
              
              <button
                onClick={handleRejectAll}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Red
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded transition-colors"
                title="Ayarlar"
              >
                <Settings className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded transition-colors"
                title="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Cookie className="h-6 w-6 text-primary-600" />
                  <span>Çerez Ayarları</span>
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  Aşağıdan çerez kategorilerini bireysel olarak kontrol edebilirsiniz. 
                  Tercihleriniz hem yerel olarak hem de güvenli sunucularımızda saklanacaktır.
                </p>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-6">
                
                {/* Necessary Cookies */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      Gerekli Çerezler
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Her Zaman Aktif
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Web sitesinin temel işlevleri için gerekli çerezler. Bu çerezler devre dışı bırakılamaz.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Analitik Çerezler</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Site kullanımını analiz etmek ve performansı iyileştirmek için kullanılır. 
                      (Google Analytics, Hotjar)
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Pazarlama Çerezleri</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Size özel reklamlar sunmak ve pazarlama etkinliğini ölçmek için kullanılır.
                      (Facebook Pixel, Google Ads)
                    </p>
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={() => handlePreferenceChange('personalization')}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Kişiselleştirme Çerezleri</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Size özel içerik sunmak ve tercihlerinizi hatırlamak için kullanılır.
                      (Tema ayarları, içerik önerileri)
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Ayarları Kaydet
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Tümünü Kabul Et
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Daha fazla bilgi için{' '}
                  <Link to="/cerez-politikasi" className="text-primary-600 hover:underline">
                    Çerez Politikamızı
                  </Link>
                  {' '}ziyaret edebilirsiniz.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tercihleriniz hem yerel olarak hem de güvenli sunucularımızda saklanır
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieConsent 