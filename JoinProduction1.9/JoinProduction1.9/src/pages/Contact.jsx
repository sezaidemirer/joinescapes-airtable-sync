import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import SEO from '../components/SEO'
import { generateSEOTags } from '../utils/seo'

const Contact = () => {
  // SEO tags
  const seoTags = generateSEOTags('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Form submission logic here
    alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adres',
      details: [
        'Dikilitaş Mah, Hakkı Yekten Caddesi',
        'Selenium Plaza No:10/N Kat:6',
        '34351 Beşiktaş/İstanbul'
      ]
    },
    {
      icon: Phone,
      title: 'Telefon',
      details: [
        '0 (212) 381 86 56',
        '0850 305 63 56 (WhatsApp)'
      ]
    },
    {
      icon: Mail,
      title: 'E-posta',
      details: [
        'destek@joinescapes.com',
        'creator@joinescapes.com'
      ]
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      details: [
        'Pazartesi - Cuma: 09:00 - 18:00',
        'Cumartesi: Kapalı',
        'Pazar: Kapalı'
      ]
    }
  ]

  const departments = [
    { value: 'genel', label: 'Genel Bilgi' },
    { value: 'destek', label: 'Teknik Destek' },
    { value: 'sikayet', label: 'Şikayet ve Öneri' },
    { value: 'ortaklik', label: 'İş Ortaklığı' }
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            İletişim
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Size nasıl yardımcı olabiliriz?
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya yardım talepleriniz için bize ulaşabilirsiniz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">Mesaj Gönderin</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Konu *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Konu seçiniz</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Mesaj Gönder
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Google Maps Embed */}
              <div className="card overflow-hidden">
                <div className="h-64">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d753.1998211256973!2d29.00612!3d41.04221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7e46a84b7e5%3A0x6c1b8e7f9d6a5e3c!2sSelenium%20Plaza%2C%20Dikilitaş%20Mah%2C%20Hakkı%20Yekten%20Cd.%20No%3A10%2C%2034351%20Beşiktaş%2Fİstanbul!5e0!3m2!1str!2str!4v1735052000000!5m2!1str!2str"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Selenium Plaza Google Maps"
                  ></iframe>
                  </div>
                <div className="p-3 bg-gray-50 border-t">
                  <a 
                    href="https://maps.app.goo.gl/ufBR2ye1V5LsUHkz6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 font-medium flex items-center justify-center transition-colors text-sm"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Büyük Haritada Aç
                  </a>
                </div>
              </div>



              {/* FAQ Link */}
              <div className="card">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Sık Sorulan Sorular</h3>
                  <p className="text-gray-600 mb-4">
                    Aradığınız cevap SSS bölümümüzde olabilir. 
                    Hızlı çözümler için göz atın.
                  </p>
                  <button className="btn-primary">
                    SSS'yi İncele
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}

export default Contact 