import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Clock, Users, Star } from 'lucide-react'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const VisaFree = () => {
  // SEO tags
  const seoTags = generateSEOTags('vizesiz-rotalar')
  const visaFreeDestinations = [
    {
      id: 1,
      country: 'Gürcistan',
      city: 'Tiflis',
      duration: '365 gün',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Tarihi ve modern mimarinin buluştuğu büyüleyici başkent',
      highlights: ['Tarihi Merkez', 'Termal Banyolar', 'Gürcü Mutfağı'],
      season: 'Tüm Yıl'
    },
    {
      id: 2,
      country: 'Karadağ',
      city: 'Budva',
      duration: '90 gün',
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Adriyatik kıyısında muhteşem plajlar ve tarihi kasaba',
      highlights: ['Budva Kalesi', 'Plajlar', 'Gece Hayatı'],
      season: 'Mayıs-Ekim'
    },
    {
      id: 3,
      country: 'Sırbistan',
      city: 'Belgrad',
      duration: '90 gün',
      image: 'https://images.unsplash.com/photo-1565027165535-c4b4c5e0e4b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Balkanların nabzının attığı dinamik başkent',
      highlights: ['Kalemegdan Kalesi', 'Nehir Turları', 'Gece Hayatı'],
      season: 'Nisan-Ekim'
    },
    {
      id: 4,
      country: 'Bosna Hersek',
      city: 'Saraybosna',
      duration: '90 gün',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Doğu ve Batı kültürlerinin buluştuğu tarihi şehir',
      highlights: ['Baščaršija', 'Köprüler', 'Osmanlı Mimarisi'],
      season: 'Mayıs-Ekim'
    },
    {
      id: 5,
      country: 'Arnavutluk',
      city: 'Tiran',
      duration: '90 gün',
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Balkanların gizli cenneti ve muhteşem Riviera',
      highlights: ['Arnavut Rivierası', 'Butrint', 'Alpler'],
      season: 'Mayıs-Ekim'
    },
    {
      id: 6,
      country: 'Kuzey Makedonya',
      city: 'Üsküp',
      duration: '90 gün',
      image: 'https://images.unsplash.com/photo-1565027165535-c4b4c5e0e4b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Antik Makedonya\'nın modern başkenti',
      highlights: ['Ohrid Gölü', 'Matka Kanyonu', 'Tarihi Merkez'],
      season: 'Nisan-Ekim'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Vizesiz Seyahat Rotaları
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Sadece pasaportla seyahat edebileceğiniz destinasyonlar
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span>✈️ Vize Yok</span>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span>🎒 Kolay Seyahat</span>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span>💰 Ekonomik</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vizesiz Destinasyonlar
            </h2>
            <p className="text-lg text-gray-600">
              Türkiye Cumhuriyeti pasaportu ile vizesiz seyahat edebileceğiniz ülkeler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visaFreeDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {destination.duration}
                  </div>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
                    {destination.season}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-900">{destination.city}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{destination.country}</p>
                  <p className="text-gray-700 mb-4">{destination.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Öne Çıkanlar:</h4>
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Kalış: {destination.duration}</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Detaylar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Vizesiz Seyahat Hakkında
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  Türkiye Cumhuriyeti pasaportu ile vizesiz seyahat edebileceğiniz ülkeler listesi sürekli güncellenmektedir. 
                  Seyahat öncesi mutlaka güncel bilgileri kontrol ediniz.
                </p>
                <p>
                  Vizesiz seyahatte genellikle turist amaçlı kısa süreli kalışlar mümkündür. 
                  İş amaçlı seyahatler için ayrı düzenlemeler gerekebilir.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Seyahat Önerileri
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pasaport Geçerliliği</h4>
                    <p className="text-gray-600 text-sm">Pasaportunuzun en az 6 ay geçerli olduğundan emin olun</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Kalış Süresi</h4>
                    <p className="text-gray-600 text-sm">Belirtilen süreleri aşmamaya dikkat edin</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Seyahat Sigortası</h4>
                    <p className="text-gray-600 text-sm">Seyahat sigortası yaptırmayı unutmayın</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Seyahat Planınızı Yapın
          </h3>
          <p className="text-blue-100 mb-8">
            Vizesiz destinasyonlar hakkında daha detaylı bilgi almak için iletişime geçin
          </p>
          <Link
            to="/iletisim"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          >
            <span>Vize Danışmanlığı Al</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VisaFree 