import { Link } from 'react-router-dom'
import { MapPin, Plane, Facebook, Linkedin, Instagram, Youtube, Mail, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 -mt-4">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="space-y-2">
              <div className="block">
                {/* Mobile: İki logo yan yana - koyu alan içinde */}
                <div className="md:hidden flex items-center justify-start space-x-6 mt-3">
                  <Link to="/" className="block">
                    <img 
                      src="/images/joinescape_logo_2025_white.webp" 
                      alt="JoinEscapes Logo" 
                      className="h-24 w-auto"
                    />
                  </Link>
                  <a 
                    href="https://www.joinpr.com.tr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src="/images/joinpr_logo_white.webp" 
                      alt="JoinPR Logo" 
                      className="h-20 w-auto"
                    />
                  </a>
                </div>
                {/* Desktop: İki logo yan yana - sola yaslanmış */}
                <div className="hidden md:flex items-center justify-start space-x-6 -mt-1">
                  <Link to="/" className="block">
                <img 
                  src="/images/joinescape_logo_2025_white.webp" 
                  alt="JoinEscapes Logo" 
                      className="h-32 w-auto"
                />
                  </Link>
                  <a 
                    href="https://www.joinpr.com.tr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                <img 
                  src="/images/joinpr_logo_white.webp" 
                  alt="JoinPR Logo" 
                      className="h-32 w-auto"
                />
                  </a>
                </div>
              </div>
              <p className="text-gray-300 max-w-md text-base md:text-sm leading-relaxed mt-4 md:mt-1">
                Join Escapes bir Join PR iştirakıdır.
            </p>
            </div>
            <div className="flex space-x-4 mt-2">
              <a href="https://www.youtube.com/@JoinContentsTV" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/joinescapes?igsh=MTgxMDVndzEwMjVzag==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://tr.linkedin.com/company/join-pr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/destinasyonlar" className="text-gray-300 hover:text-white transition-colors">
                  Destinasyonlar
                </Link>
              </li>
              <li>
                <Link to="/haberler" className="text-gray-300 hover:text-white transition-colors">
                  Turizm Haberleri
                </Link>
              </li>
              <li>
                <Link to="/seyahat-onerileri" className="text-gray-300 hover:text-white transition-colors">
                  Seyahat Önerileri
                </Link>
              </li>
              <li>
                <Link to="/hakkimizda" className="text-gray-300 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="text-gray-300 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">destek@joinescapes.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <div className="text-gray-300">
                  <div>0 (212) 381 86 56</div>
                  <div>0850 305 63 56 (WhatsApp)</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-1" />
                <span className="text-gray-300">
                  Dikilitaş Mah, Hakkı Yekten Caddesi<br />
                  Selenium Plaza No:10/N Kat:6<br />
                  34351 Beşiktaş/İstanbul
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 JoinEscapes. Tüm hakları saklıdır. 2025 | Raw Agent Yazılım ve AI Teknolojileri
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm">
              <Link 
                to="/gizlilik-politikasi" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                to="/cerez-politikasi" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Çerez Politikası
              </Link>
              <Link 
                to="/kullanim-sartlari" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 