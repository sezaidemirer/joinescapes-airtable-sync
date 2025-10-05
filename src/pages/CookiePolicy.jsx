import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Cookie, Eye, BarChart3, Target, Settings, AlertCircle, CheckCircle, Info, ExternalLink, Lock, Globe, Heart, Palette, Calendar, Mail, MapPin, FileText } from 'lucide-react'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const CookiePolicy = () => {
  // SEO tags
  const seoTags = generateSEOTags('cookie-policy')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Cookie className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Çerez Politikası
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            JoinEscapes web sitesinde kullanılan çerezler hakkında detaylı bilgi
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Update Date */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-3 text-green-800">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Son Güncelleme:</span>
              <span>12 Ağustos 2025</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            
            {/* Çerez Nedir */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Cookie className="h-6 w-6 text-green-600 mr-3" />
                Çerez Nedir?
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Çerezler, web sitelerinin düzgün çalışabilmesi için bilgisayarınıza veya mobil cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin işlevselliğini artırmak, kullanıcı deneyimini iyileştirmek ve site performansını analiz etmek için kullanılır.
                </p>
                <p>
                  JoinEscapes olarak, web sitemizin en iyi şekilde çalışabilmesi ve size daha iyi hizmet verebilmek için çerezleri kullanıyoruz. Bu politika, hangi çerezleri kullandığımızı, neden kullandığımızı ve bu konudaki haklarınızı açıklamaktadır.
                </p>
              </div>
            </div>

            {/* Yasal Dayanak */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                Yasal Dayanak
              </h2>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Bu çerez politikası, aşağıdaki yasal düzenlemeler çerçevesinde hazırlanmıştır:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>KVKK (Kişisel Verilerin Korunması Kanunu)</strong> - 6698 sayılı kanun
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>ETK (Elektronik Ticaretin Düzenlenmesi Hakkında Kanun)</strong> - 6563 sayılı kanun
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Elektronik Haberleşme Kanunu</strong> - 5809 sayılı kanun
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Çerez Türleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 text-green-600 mr-3" />
                Kullandığımız Çerez Türleri
              </h2>
              
              <div className="space-y-8">
                {/* Zorunlu Çerezler */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Lock className="h-5 w-5 text-red-600 mr-2" />
                    Zorunlu Çerezler
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-red-800 font-medium">Gerekli</p>
                    <p className="text-sm text-red-700">Web sitesinin temel işlevleri için gerekli olan çerezlerdir. Bu çerezler olmadan site düzgün çalışamaz.</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lock className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-gray-900">Oturum Çerezleri</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Kullanıcı oturumunu yönetir</p>
                      <p className="text-xs text-gray-500">Süre: Oturum boyunca</p>
                    </div>
                    <div className="bg-white border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-gray-900">Güvenlik Çerezleri</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Site güvenliğini sağlar</p>
                      <p className="text-xs text-gray-500">Süre: 24 saat</p>
                    </div>
                    <div className="bg-white border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-gray-900">Dil Tercihleri</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Seçilen dil ayarlarını hatırlar</p>
                      <p className="text-xs text-gray-500">Süre: 1 yıl</p>
                    </div>
                  </div>
                </div>

                {/* Analitik Çerezler */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    Analitik Çerezler
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 font-medium">İsteğe Bağlı</p>
                    <p className="text-sm text-blue-700">Site kullanımını analiz etmek ve performansı iyileştirmek için kullanılır. Bu çerezleri reddetebilirsiniz.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">Google Analytics</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Sayfa görüntülenmeleri ve kullanıcı davranışları</p>
                      <p className="text-xs text-gray-500">Süre: 2 yıl</p>
                    </div>
                    <div className="bg-white border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">Performans Analizi</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Site hızı ve performans metrikleri</p>
                      <p className="text-xs text-gray-500">Süre: 1 yıl</p>
                    </div>
                  </div>
                </div>

                {/* Fonksiyonel Çerezler */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 text-purple-600 mr-2" />
                    Fonksiyonel Çerezler
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-purple-800 font-medium">İsteğe Bağlı</p>
                    <p className="text-sm text-purple-700">Gelişmiş özellikler ve kişiselleştirme için kullanılır. Bu çerezler olmadan bazı özellikler çalışmayabilir.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-purple-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Heart className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">Favoriler</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Beğenilen içerikleri hatırlar</p>
                      <p className="text-xs text-gray-500">Süre: 6 ay</p>
                    </div>
                    <div className="bg-white border border-purple-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">Tema Tercihleri</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Koyu/açık tema seçimini hatırlar</p>
                      <p className="text-xs text-gray-500">Süre: 1 yıl</p>
                    </div>
                  </div>
                </div>

                {/* Pazarlama Çerezleri */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 text-orange-600 mr-2" />
                    Pazarlama Çerezleri
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-orange-800 font-medium">İsteğe Bağlı</p>
                    <p className="text-sm text-orange-700">Size daha uygun içerik ve reklamlar göstermek için kullanılır. Bu çerezleri tamamen reddetebilirsiniz.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-orange-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-gray-900">Google Ads</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Kişiselleştirilmiş reklamlar</p>
                      <p className="text-xs text-gray-500">Süre: 90 gün</p>
                    </div>
                    <div className="bg-white border border-orange-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-gray-900">Sosyal Medya</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Facebook, Instagram entegrasyonu</p>
                      <p className="text-xs text-gray-500">Süre: 180 gün</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Çerez Tercihleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 text-green-600 mr-3" />
                Çerez Tercihlerinizi Yönetin
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  KVKK kapsamında çerezler konusunda aşağıdaki haklarınız bulunmaktadır:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Onay Verme/Geri Çekme</h3>
                    <p className="text-sm text-gray-700">İsteğe bağlı çerezler için onayınızı verebilir veya geri çekebilirsiniz.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Bilgi Talep Etme</h3>
                    <p className="text-sm text-gray-700">Hangi çerezlerin kullanıldığı hakkında bilgi talep edebilirsiniz.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Tarayıcı Ayarları</h3>
                    <p className="text-sm text-gray-700">Tarayıcınızın ayarlarından çerezleri yönetebilirsiniz.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Silme Talep Etme</h3>
                    <p className="text-sm text-gray-700">Mevcut çerezlerin silinmesini talep edebilirsiniz.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarayıcı Ayarları */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 text-green-600 mr-3" />
                Tarayıcı Ayarları ile Çerez Yönetimi
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Masaüstü Tarayıcılar</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Gizlilik → Çerezler</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Gizlilik → Çerezler</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                      <p className="text-sm text-gray-700">Tercihler → Gizlilik → Çerezler</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Edge</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Gizlilik → Çerezler</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobil Tarayıcılar</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Chrome (Android)</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Site Ayarları</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Safari (iOS)</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Safari → Gizlilik</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Samsung Internet</h4>
                      <p className="text-sm text-gray-700">Ayarlar → Gizlilik → Çerezler</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Üçüncü Taraf Çerezleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ExternalLink className="h-6 w-6 text-green-600 mr-3" />
                Üçüncü Taraf Çerezleri
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  Sitemizde kullanılan bazı çerezler, üçüncü taraf hizmet sağlayıcıları tarafından yerleştirilir:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Google Analytics</h3>
                    <p className="text-gray-700 mb-3">Site trafiğini ve kullanıcı davranışlarını analiz etmek için kullanılır.</p>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Google Gizlilik Politikası
                    </a>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Google AdSense</h3>
                    <p className="text-gray-700 mb-3">Kişiselleştirilmiş reklamlar göstermek için kullanılır.</p>
                    <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 text-sm flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Google Reklam Politikası
                    </a>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Facebook Pixel</h3>
                    <p className="text-gray-700 mb-3">Sosyal medya entegrasyonu ve reklam optimizasyonu için kullanılır.</p>
                    <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 text-sm flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Facebook Gizlilik Politikası
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim ve Başvuru */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="h-6 w-6 text-green-600 mr-3" />
                İletişim ve Başvuru
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  Çerezler konusunda sorularınız varsa veya haklarınızı kullanmak istiyorsanız bizimle iletişime geçebilirsiniz:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">İletişim Bilgileri</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">destek@joinescapes.com</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Türkiye</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">KVKK Sorumlusu: privacy@joinescapes.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Başvuru Hakları</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                      <li>• İşlenen verileriniz hakkında bilgi talep etme</li>
                      <li>• Verilerin düzeltilmesini veya silinmesini talep etme</li>
                      <li>• Veri Koruma Kurulu'na şikayette bulunma</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Politika Değişiklikleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-green-600 mr-3" />
                Politika Değişiklikleri
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Bu çerez politikası, yasal değişiklikler veya hizmet güncellemeleri nedeniyle zaman zaman güncellenebilir. Önemli değişiklikler hakkında sizi bilgilendireceğiz.
                </p>
                <p>
                  Bu sayfayı düzenli olarak kontrol etmenizi öneririz.
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex flex-wrap justify-center space-x-6">
                <Link to="/gizlilik-politikasi" className="text-green-600 hover:text-green-800 font-medium">
                  Gizlilik Politikası
                </Link>
                <Link to="/kullanim-sartlari" className="text-green-600 hover:text-green-800 font-medium">
                  Kullanım Şartları
                </Link>
                <Link to="/iletisim" className="text-green-600 hover:text-green-800 font-medium">
                  İletişim
                </Link>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  © 2025 JoinEscapes. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CookiePolicy 