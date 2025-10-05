import { Shield, Mail, Phone, MapPin, Calendar, User, Eye, Lock, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const PrivacyPolicy = () => {
  // SEO tags
  const seoTags = generateSEOTags('privacy-policy')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Kişisel verilerinizin güvenliği bizim için çok önemli. 
            Bu belgede verilerinizi nasıl koruduğumuzu açıklıyoruz.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Update Date */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-blue-800">
                <Calendar className="h-5 w-5" />
                <div>
                  <span className="font-medium">Yürürlük Tarihi:</span>
                  <span className="ml-2">15 Ocak 2025</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-blue-800">
                <FileText className="h-5 w-5" />
                <div>
                  <span className="font-medium">Son Güncelleme:</span>
                  <span className="ml-2">12 Ağustos 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Escapes Web | Join Escapes Mobil</h2>
              <p className="text-lg text-gray-700">Bir Join PR girişimidir.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Bu Gizlilik Politikası, JoinEscapes web sitesi (www.joinescapes.com) ve (Join Escapes iOS Mobil Uygulaması) 
                  üzerinden elde edilen kişisel verilerinizin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) 
                  ve ilgili mevzuat çerçevesinde nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.
                </p>
              </div>
            </div>

            {/* 1. Veri Sorumlusu */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                1. Veri Sorumlusu
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">JoinEscapes / Join PR</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Maslak Mahallesi, Büyükdere Caddesi No:123, Şişli, İstanbul</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>destek@joinescapes.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span>+90 (212) 555 0123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Toplanan Kişisel Veriler */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                2. Toplanan Kişisel Veriler
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Kimlik Bilgileri
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ad, soyad</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Doğum tarihi (isteğe bağlı)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    İletişim Bilgileri
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>E-posta adresi</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Telefon numarası</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Posta adresi (talep halinde)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Lock className="h-5 w-5 text-blue-600 mr-2" />
                    Teknik Veriler
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>IP adresi</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Tarayıcı ve işletim sistemi bilgileri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Site kullanım istatistikleri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Çerez verileri</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Pazarlama Verileri
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Seyahat tercihleri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>İlgi alanları</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Bülten abonelik bilgileri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Site etkileşim geçmişi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Toplama Yöntemleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                3. Toplama Yöntemleri
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Formlar</h3>
                  <p className="text-gray-700">İletişim, bülten kayıt, rezervasyon, yorum formları</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Otomatik Yöntemler</h3>
                  <p className="text-gray-700">Çerezler, web analitik araçları, sunucu logları, pixel takip kodları</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sosyal Medya Entegrasyonları</h3>
                  <p className="text-gray-700">Facebook Pixel, Google Analytics, Instagram, YouTube</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">İletişim Kanalları</h3>
                  <p className="text-gray-700">E-posta, telefon, canlı destek, WhatsApp</p>
                </div>
              </div>
            </div>

            {/* 4. Kişisel Verilerin İşlenme Amaçları */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                4. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hizmet Sunumu</h3>
                  <p className="text-gray-700">Seyahat önerileri, rezervasyon işlemleri, müşteri desteği</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Analiz & İyileştirme</h3>
                  <p className="text-gray-700">Site performansı ölçümü, kullanıcı deneyimi geliştirme</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pazarlama & İletişim</h3>
                  <p className="text-gray-700">Bülten gönderimi, özel teklifler, kampanyalar, duyurular</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Yasal Yükümlülükler</h3>
                  <p className="text-gray-700">Kanuni gerekliliklerin yerine getirilmesi, denetim süreçleri</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Güvenlik</h3>
                  <p className="text-gray-700">Sahtecilik önleme, veri ihlali tespiti ve müdahale</p>
                </div>
              </div>
            </div>

            {/* 5. Kişisel Verilerin Paylaşımı */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="h-6 w-6 text-blue-600 mr-3" />
                5. Kişisel Verilerin Paylaşımı
              </h2>
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Açık Rıza Olmaksızın</h3>
                  <p className="text-gray-700">Üçüncü kişilerle ticari amaçlı paylaşım yapılmaz.</p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Paylaşım Yapılabilecek Durumlar</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Hizmet sağlayıcılar (teknik altyapı, ödeme sistemleri, e-posta servisleri)</li>
                    <li>• Yasal zorunluluklar (mahkeme kararı, resmi talepler)</li>
                    <li>• İş ortakları (seyahat acenteleri, otel rezervasyon sistemleri) — açık rıza ile</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Üçüncü Taraf Servisler</h3>
                  <p className="text-gray-700">Google Analytics, MailChimp, Facebook Pixel, Cloudflare</p>
                </div>
              </div>
            </div>

            {/* 6. Veri Güvenliği Önlemleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="h-6 w-6 text-blue-600 mr-3" />
                6. Veri Güvenliği Önlemleri
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Teknik</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• SSL sertifikası</li>
                    <li>• Güvenli sunucu altyapısı</li>
                    <li>• Düzenli güvenlik güncellemeleri</li>
                    <li>• Firewall</li>
                    <li>• Veri yedekleme</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">İdari</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Yetki bazlı erişim</li>
                    <li>• Personel gizlilik eğitimi</li>
                    <li>• Güvenlik politikaları</li>
                    <li>• Düzenli denetimler</li>
                    <li>• İhlal müdahale planları</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. KVKK Kapsamındaki Haklarınız */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                7. KVKK Kapsamındaki Haklarınız
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  KVKK'nın 11. maddesi uyarınca şu haklara sahipsiniz:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verilerinizin işlenip işlenmediğini öğrenme</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>İşlenen veriler hakkında bilgi talep etme</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Yanlış/eksik verilerin düzeltilmesini talep etme</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verilerinizin silinmesini isteme</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Veri işleme faaliyetlerine itiraz etme</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verilerinizi başka bir veri sorumlusuna aktarma</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Başvuru Kanalları</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>E-posta: destek@joinescapes.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>Telefon: +90 (212) 555 0123</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Posta: Maslak Mahallesi, Büyükdere Caddesi No:123, Şişli, İstanbul</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Çerez Politikası */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="h-6 w-6 text-blue-600 mr-3" />
                8. Çerez Politikası
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sitemizde kullanıcı deneyimini geliştirmek için çerezler kullanılmaktadır:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Gerekli Çerezler</h3>
                    <p className="text-sm">Sitenin çalışması için zorunlu</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Analitik Çerezler</h3>
                    <p className="text-sm">Site kullanım istatistiklerini toplar</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Pazarlama Çerezleri</h3>
                    <p className="text-sm">Kişiselleştirilmiş reklam ve teklif sunar</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Detaylar için Çerez Politikamızı inceleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* 9. İletişim */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-3" />
                9. İletişim
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Gizlilik politikası ile ilgili her türlü sorunuz için bize ulaşabilirsiniz:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">E-posta: destek@joinescapes.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Telefon: +90 (212) 555 0123</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Adres: Maslak Mahallesi, Büyükdere Caddesi No:123, Şişli, İstanbul</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Politika Güncellemeleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                10. Politika Güncellemeleri
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Bu politika gerekli görüldüğünde güncellenebilir. Önemli değişiklikler web sitemizde ve e-posta yoluyla duyurulur.
                </p>
                <p>
                  Güncellemelerden haberdar olmak için bültenimize abone olabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicy 