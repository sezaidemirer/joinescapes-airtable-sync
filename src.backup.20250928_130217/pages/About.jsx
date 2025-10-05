import { Users, MapPin, Award, Heart, Globe, Target, Eye, Zap } from 'lucide-react'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const About = () => {
  // SEO tags
  const seoTags = generateSEOTags('about')
  const stats = [
    { number: '200+', label: 'Destinasyon İncelemesi', icon: MapPin },
    { number: '75K+', label: 'Aylık Okuyucu', icon: Users },
    { number: '5+', label: 'Yıllık Deneyim', icon: Award },
    { number: '50+', label: 'Ülke Kapsamı', icon: Globe }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Tutkuyla Keşif',
      description: 'Destinasyonları sadece yerler değil, keşfedilmeyi bekleyen hikayeler olarak görüyoruz.'
    },
    {
      icon: Target,
      title: 'Özgün İçerik',
      description: 'Kendi deneyimlerimiz ve uzman görüşlerimizle özgün destinasyon içerikleri üretiyoruz.'
    },
    {
      icon: Eye,
      title: 'Keşfetme Ruhu',
      description: 'Gizli cennetleri ve az bilinen destinasyonları keşfetmenize yardımcı oluyoruz.'
    },
    {
      icon: Zap,
      title: 'Güncel Tanıtımlar',
      description: 'Destinasyonlardaki yeni gelişmeleri ve fırsatları anında paylaşıyoruz.'
    }
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Hakkımızda
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Seyahat tutkusu ile başlayan hikayemiz
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                JoinEscapes Hikayesi
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  <strong className="text-primary-600">JoinEscapes</strong>, destinasyon keşif tutkusu ile başlayan ve bugün binlerce seyahat severinin güvendiği bir destinasyon rehberi platformu haline gelen hikayemizle gurur duyuyoruz.
                </p>
                <p>
                  2019 yılında kurulan sitemiz, dünya çapındaki destinasyonları keşfetmek ve okuyucularımıza kendi deneyimlerimizle zenginleştirilmiş özgün içerikler sunmak için her türlü detayı düşünerek hizmet vermektedir. Türkiye'nin gizli cennetlerinden dünya çapındaki egzotik destinasyonlara kadar geniş bir yelpazede destinasyon tanıtımları yapıyoruz.
                </p>
                <p>
                  Misyonumuz, seyahat etmeyi seven herkesin en güzel destinasyonları keşfetmesini sağlamak ve bu süreçte onlara kişisel deneyimlerimizle rehberlik etmektir. Deneyimli seyahat yazarı kadromuz ve kendi keşiflerimizle, özgün ve ilham verici destinasyon içerikleri sunuyoruz.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="JoinEscapes Ekibi"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm">Yıllık Deneyim</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rakamlarla JoinEscapes
            </h2>
            <p className="text-xl text-primary-100">
              Başarılarımızı sizinle paylaşıyoruz
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Değerlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bizi farklı kılan ve her adımımızda rehberlik eden ilkelerimiz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center card p-6">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Misyonumuz
              </h2>
                             <p className="text-lg text-gray-300 mb-6">
                 Seyahat etmeyi seven herkesin en güzel destinasyonları keşfetmesini sağlamak, kişisel deneyimlerle zenginleştirilmiş içerikler sunmak ve seyahat planlamasını kolaylaştırmak.
               </p>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Kişisel deneyim odaklı içerikler</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Özgün destinasyon tanıtımları</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Uzman seyahat tavsiyeleri</span>
                 </div>
               </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Vizyonumuz
              </h2>
                             <p className="text-lg text-gray-300 mb-6">
                 Türkiye'nin lider destinasyon rehberi platformu olarak, dünya çapında seyahat severlerinin ilk tercihi haline gelmek ve seyahat deneyimlerini dönüştürmek.
               </p>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Teknoloji destekli destinasyon rehberi</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Sürdürülebilir seyahat anlayışı</span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                   <span>Global destinasyon ağı</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
             Yeni Destinasyonları Keşfetmeye Hazır mısınız?
           </h2>
           <p className="text-xl text-primary-100 mb-8">
             Bizimle birlikte dünyanın en güzel yerlerini keşfetmeye başlayın
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a 
               href="/destinations" 
               className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
             >
               Destinasyonları Keşfedin
             </a>
             <a 
               href="/contact" 
               className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
             >
               Bizimle İletişime Geçin
             </a>
           </div>
        </div>
      </section>
    </div>
  )
}

export default About 