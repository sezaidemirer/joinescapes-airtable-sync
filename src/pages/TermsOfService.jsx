import { FileText, Scale, Shield, AlertCircle, Calendar, Mail, Phone, MapPin, CheckCircle, XCircle, Info, Globe, Users, Lock, ExternalLink, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const TermsOfService = () => {
  // SEO tags
  const seoTags = generateSEOTags('terms-of-service')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Scale className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kullanım Şartları
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            JoinEscapes web sitesini kullanırken uymanız gereken kurallar ve şartlar.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Update Date */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-3 text-indigo-800">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Son Güncelleme:</span>
              <span>12 Ağustos 2025</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            
            {/* 1. Genel Hükümler */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-indigo-600 mr-3" />
                1. Genel Hükümler
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Bu kullanım şartları (bundan sonra "Şartlar" olarak anılacaktır), Join Escapes iOS Mobil Uygulama ve Join Escapes web sitesi (www.joinescapes.com) ve sunduğumuz hizmetlerin kullanımına ilişkin kuralları belirler.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    Önemli Bilgiler
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Join Escapes Mobil Uygulamamızı ve Web sitemizi kullanarak bu şartları kabul etmiş olursunuz</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Şartlar, önceden haber verilmeksizin değiştirilebilir</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Güncel şartlar web sitemizde yayınlanır</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Değişiklikler yayın tarihi itibariyle geçerlidir</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    Yasal Uyarı
                  </h3>
                  <p className="text-gray-700">
                    Bu şartları kabul etmiyorsanız, web sitemizi kullanmamalısınız.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Hizmet Tanımı ve Kapsamı */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="h-6 w-6 text-indigo-600 mr-3" />
                2. Hizmet Tanımı ve Kapsamı
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sunduğumuz Hizmetler</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        İçerik Hizmetleri
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Seyahat haberleri</li>
                        <li>• Destinasyon rehberleri</li>
                        <li>• Turizm sektör analizi</li>
                        <li>• Uzman yorumları</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="h-5 w-5 text-green-600 mr-2" />
                        Bilgi Hizmetleri
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Otel önerileri</li>
                        <li>• Uçuş bilgileri</li>
                        <li>• Vize gereksinimleri</li>
                        <li>• Seyahat tavsiyeleri</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="h-5 w-5 text-purple-600 mr-2" />
                        Etkileşim Hizmetleri
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Yorum yapma</li>
                        <li>• İçerik paylaşma</li>
                        <li>• Bülten aboneliği</li>
                        <li>• İletişim formu</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <ExternalLink className="h-5 w-5 text-orange-600 mr-2" />
                        Bağlantı Hizmetleri
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Üçüncü taraf linkler</li>
                        <li>• Sosyal medya entegrasyonu</li>
                        <li>• Partner bağlantıları</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hizmet Amacı</h3>
                  <p className="text-gray-700">
                    JoinEscapes, turizm sektörüne dair güncel bilgiler sunmak, seyahat planlama sürecinde rehberlik etmek ve seyahat deneyimlerini paylaşmak amacıyla hizmet vermektedir.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Kullanıcı Yükümlülükleri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 text-indigo-600 mr-3" />
                3. Kullanıcı Yükümlülükleri
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Yapmanız Gerekenler
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Doğru Bilgi Verme</h4>
                      <p className="text-sm text-gray-700">Form ve kayıtlarda doğru, güncel ve tam bilgi vermelisiniz.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Saygılı Davranış</h4>
                      <p className="text-sm text-gray-700">Diğer kullanıcılara ve site yöneticilerine karşı saygılı olmalısınız.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Yasal Uyum</h4>
                      <p className="text-sm text-gray-700">Türkiye Cumhuriyeti yasalarına ve uluslararası kurallara uymalısınız.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Güvenlik</h4>
                      <p className="text-sm text-gray-700">Hesap bilgilerinizi güvenli tutmalı, şifrenizi paylaşmamalısınız.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    Yapmamanız Gerekenler
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Yasadışı İçerik</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Telif hakkı ihlali</li>
                        <li>• Nefret söylemi</li>
                        <li>• Şiddet içeriği</li>
                        <li>• Pornografik içerik</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Zararlı Aktiviteler</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Spam gönderme</li>
                        <li>• Virüs yayma</li>
                        <li>• Sistem saldırıları</li>
                        <li>• Otomatik bot kullanımı</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Ticari Kötüye Kullanım</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• İzinsiz reklam</li>
                        <li>• Sahte promosyon</li>
                        <li>• Dolandırıcılık</li>
                        <li>• Pyramid şeması</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Güvenlik İhlalleri</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Başkasının hesabını kullanma</li>
                        <li>• Şifre çalma</li>
                        <li>• Kimlik hırsızlığı</li>
                        <li>• Kişisel veri ihlali</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Telif Hakları ve Fikri Mülkiyet */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                4. Telif Hakları ve Fikri Mülkiyet
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">JoinEscapes Telif Hakları</h3>
                  <p className="text-gray-700">
                    Join Escapes Mobil Uygulama ve Web sitemizdeki tüm içerikler (yazılar, fotoğraflar, videolar, logolar, tasarım) JoinEscapes'e aittir ve telif hakkı yasalarıyla korunmaktadır.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Korunan İçerikler</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Özgün makaleler ve haberler</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fotoğraf ve video içerikler</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Logo ve marka tasarımları</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Web sitesi arayüzü ve kodları</span>
                    </li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">İzin Verilen</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Kişisel kullanım için okuma</li>
                      <li>• Sosyal medyada paylaşım (kaynak belirterek)</li>
                      <li>• Eğitim amaçlı alıntı</li>
                      <li>• Yazdırma (ticari olmayan)</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">İzin Verilmeyen</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• İçerikleri kopyalayıp satma</li>
                      <li>• Kaynak belirtmeden kullanma</li>
                      <li>• İçerikleri değiştirip yayınlama</li>
                      <li>• Ticari amaçlı kullanım</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">İzin Talebi</h3>
                  <p className="text-gray-700">
                    Ticari kullanım veya özel izin gerektiren durumlar için destek@joinescapes.com adresinden bizimle iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Sorumluluk Sınırlamaları */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="h-6 w-6 text-indigo-600 mr-3" />
                5. Sorumluluk Sınırlamaları
              </h2>
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Önemli Uyarı</h3>
                  <p className="text-gray-700">
                    JoinEscapes, web sitesinde yer alan bilgilerin doğruluğu, güncelliği ve eksiksizliği konusunda garanti vermez.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sorumluluk kapsamı dışında kalanlar</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Üçüncü taraf web sitelerinin içeriği</li>
                    <li>• Rezervasyon ve ödeme işlemlerinde yaşanan sorunlar</li>
                    <li>• Seyahat planlarınızdan doğabilecek zararlar</li>
                    <li>• Teknik arızalar ve kesintiler</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sorumluluk Alanlarımız</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">İçerik Kalitesi</h4>
                      <p className="text-sm text-gray-700">Özgün ve kaliteli içerik üretmek için elimizden geleni yaparız.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Veri Güvenliği</h4>
                      <p className="text-sm text-gray-700">Kişisel verilerinizi korumak için gerekli tedbirleri alırız.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Hizmet Sürekliliği</h4>
                      <p className="text-sm text-gray-700">Web sitesinin kesintisiz çalışması için çaba gösteririz.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tavsiye</h3>
                  <p className="text-gray-700">
                    Seyahat planlarınızı yaparken, bilgileri başka kaynaklarla da doğrulamanızı ve profesyonel danışmanlık almanızı öneririz.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Üçüncü Taraf Bağlantıları */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ExternalLink className="h-6 w-6 text-indigo-600 mr-3" />
                6. Üçüncü Taraf Bağlantıları
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  Web sitemizde üçüncü taraf web sitelerine bağlantılar bulunmaktadır. Bu bağlantılar kullanıcı deneyimini iyileştirmek amacıyla sağlanmıştır.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bağlantı Türleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Otel rezervasyon siteleri</li>
                    <li>• Havayolu şirketleri</li>
                    <li>• Tur operatörleri</li>
                    <li>• Sosyal medya platformları</li>
                    <li>• Haber kaynakları</li>
                    <li>• Partner kuruluşlar</li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sorumluluk Reddi</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• İçeriklerini kontrol etmeyiz</li>
                    <li>• Gizlilik politikalarına tabi değiliz</li>
                    <li>• Güvenliklerini garanti etmeyiz</li>
                    <li>• Doğruluklarını onaylamayız</li>
                    <li>• Zararlardan sorumlu değiliz</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kullanıcı Önerisi</h3>
                  <p className="text-gray-700">
                    Üçüncü taraf sitelere geçmeden önce, o sitenin kullanım şartlarını ve gizlilik politikasını incelemenizi öneririz.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Hesap Sonlandırma ve Erişim Engeli */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="h-6 w-6 text-indigo-600 mr-3" />
                7. Hesap Sonlandırma ve Erişim Engeli
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hesap Sonlandırma Sebepleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Kullanım şartlarını tekrarlayan ihlaller</li>
                    <li>• Yasadışı aktiviteler</li>
                    <li>• Spam veya kötüye kullanım</li>
                    <li>• Diğer kullanıcılara zarar verme</li>
                    <li>• Sahte bilgi paylaşımı</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kullanıcı Tarafından</h3>
                    <p className="text-gray-700 mb-3">Hesabınızı istediğiniz zaman kapatabilirsiniz:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• İletişim formundan talep</li>
                      <li>• E-posta ile bildirim</li>
                      <li>• Veri silme talebi</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">JoinEscapes Tarafından</h3>
                    <p className="text-gray-700 mb-3">Gerekli durumlarda hesabınızı askıya alabiliriz:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Geçici askıya alma</li>
                      <li>• Kalıcı hesap silme</li>
                      <li>• IP adres engelleme</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Şartların Değiştirilmesi */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-indigo-600 mr-3" />
                8. Şartların Değiştirilmesi
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  JoinEscapes, bu kullanım şartlarını önceden haber vermeksizin değiştirme hakkını saklı tutar.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bildirim Yöntemleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Web sitesinde duyuru</li>
                    <li>• E-posta bildirimi</li>
                    <li>• Pop-up uyarısı</li>
                    <li>• Ana sayfa banner'ı</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Yürürlük Süreci</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Değişiklik yayınlanır</li>
                    <li>• 7 gün süre verilir</li>
                    <li>• Otomatik kabul edilir</li>
                    <li>• Güncel tarih güncellenir</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Takip Önerisi</h3>
                  <p className="text-gray-700">
                    Bu sayfayı düzenli olarak kontrol ederek güncel şartlardan haberdar olmanızı öneririz.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. İletişim Bilgileri */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="h-6 w-6 text-indigo-600 mr-3" />
                9. İletişim Bilgileri
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700">
                  Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
                    <p className="text-gray-700">destek@joinescapes.com</p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
                    <p className="text-gray-700">+90 (212) 555 0123</p>
                    <p className="text-sm text-gray-600">Hafta içi 09:00-18:00</p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
                    <div className="text-gray-700 text-sm">
                      <p>JoinEscapes</p>
                      <p>Maslak Mahallesi</p>
                      <p>Büyükdere Caddesi No:123</p>
                      <p>Şişli, İstanbul</p>
                      <p>Türkiye</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Yasal Başvurular</h3>
                  <p className="text-gray-700">
                    Yasal konulardaki başvurularınızı yazılı olarak yapmanızı ve kimlik bilgilerinizi eklemenizi rica ederiz.
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <Link to="/gizlilik-politikasi" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Gizlilik Politikası
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/cerez-politikasi" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Çerez Politikası
                  </Link>
                </div>
              </div>
            </div>

            {/* 10. Son Hükümler */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Scale className="h-6 w-6 text-indigo-600 mr-3" />
                10. Son Hükümler
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Uygulanacak Hukuk</h3>
                    <p className="text-gray-700">
                      Bu şartlar Türkiye Cumhuriyeti yasalarına tabi olup, İstanbul mahkemeleri yetkilidir.
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Şartların Bütünlüğü</h3>
                    <p className="text-gray-700">
                      Herhangi bir maddenin geçersiz olması, diğer maddelerin geçerliliğini etkilemez.
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Resmi Dil</h3>
                  <p className="text-gray-700">
                    Bu şartların resmi dili Türkçe'dir. Çevirilerde farklılık olması durumunda Türkçe metin geçerlidir.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kabul Beyanı</h3>
                  <p className="text-gray-700">
                    Web sitemizi kullanarak bu şartları okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.
                  </p>
                </div>

                <div className="text-center pt-6">
                  <p className="text-sm text-gray-500">
                    Bu kullanım şartları 12 Ağustos 2025 tarihinde güncellenmiştir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TermsOfService 