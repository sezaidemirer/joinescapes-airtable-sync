import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, MapPin, Plane, User, LogOut, Settings } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import useAccessibility from '../hooks/useAccessibility'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, loading, isAuthenticated } = useAuthContext()
  const { handleKeyboardNavigation, announceToScreenReader } = useAccessibility()

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Haberler', href: '/haberler' },
    { name: 'Destinasyonlar', href: '/destinasyonlar' },
    { name: 'Konaklama', href: '/oteller' },
    { name: 'Seyahat Önerileri', href: '/seyahat-onerileri' },
  ]

  const isActive = (path) => location.pathname === path

  // Kullanıcı adından slug oluştur
  const createUserSlug = (user) => {
    if (!user) return ''
    
    // Önce full_name'i kontrol et, yoksa email'den al
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'kullanici'
    
    // Türkçe karakterleri değiştir ve slug oluştur
    return fullName
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
      .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
      .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
      .trim('-') // Başta ve sonda tire varsa kaldır
  }

  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
    console.log('🔐 Çıkış yapılıyor...')
    const { error } = await signOut()
    if (error) {
      console.error('❌ Çıkış hatası:', error)
        alert('Çıkış yapılırken bir hata oluştu: ' + error.message)
    } else {
      console.log('✅ Başarıyla çıkış yapıldı')
      announceToScreenReader('Çıkış yapıldı, ana sayfaya yönlendiriliyorsunuz')
      navigate('/') // Ana sayfaya yönlendir
      }
    } catch (error) {
      console.error('❌ Çıkış catch hatası:', error)
      alert('Çıkış yapılırken bir hata oluştu: ' + error.message)
    }
  }

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    announceToScreenReader(isMenuOpen ? 'Menü kapatıldı' : 'Menü açıldı')
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-22 md:h-24 lg:h-28">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 flex-shrink-0"
            aria-label="JoinEscapes ana sayfa"
          >
            <img 
              src="/images/join_escape_logo_siyah.webp" 
              alt="JoinEscapes - Seyahat ve Destinasyon Rehberi" 
              className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto"
            />
          </Link>

          {/* Right Side Container */}
          <div className="flex items-center space-x-4 lg:space-x-6 ml-auto mr-4">
            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex space-x-3 lg:space-x-4" role="navigation" aria-label="Ana navigasyon">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onKeyDown={(e) => handleKeyboardNavigation(e, () => {
                  e.target.click()
                })}
              >
                {item.name}
              </Link>
            ))}
          </nav>

            {/* Giriş Yap Button - Desktop only, at the end */}
            {!loading && !isAuthenticated && (
              <Link
                to="/kullanici-girisi"
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                aria-label="Giriş Yap"
              >
                Giriş Yap
              </Link>
            )}

          {/* Auth Section */}
            <div className="flex items-center space-x-1 lg:space-x-2">
            {loading ? (
              <div className="text-gray-500 text-sm">Yükleniyor...</div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-1 lg:space-x-2">
                {/* User Info - Compact */}
                <div className="flex items-center space-x-1.5 px-2 lg:px-3 py-1.5 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700 max-w-20 lg:max-w-32 truncate">
                    Hoş Geldin {user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                  </span>
                </div>
                
                {/* Role Based Panel Button */}
                {(() => {
                  const userRole = user?.user_metadata?.role || user?.user_metadata?.user_role
                  console.log('🔍 DEBUG - userRole:', userRole)
                  console.log('🔍 DEBUG - user_metadata:', user?.user_metadata)
                  
                  // Normal kullanıcı için kullanıcı paneli
                  if (userRole === 'user') {
                    return (
                      <Link
                        to="/kullanici-paneli"
                        className={`flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/kullanici-paneli')
                            ? 'text-white bg-primary-600'
                            : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                        }`}
                        aria-label="Kullanıcı Paneli"
                        aria-current={isActive('/kullanici-paneli') ? 'page' : undefined}
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Profil</span>
                      </Link>
                    )
                  }
                  
                  // Admin/Editor/Supervisor için mevcut sistem
                  if (user?.email === 'test@test.com') {
                    // Sadece test@test.com admin
                    return (
                      <Link
                        to="/admin"
                        className={`flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/admin')
                            ? 'text-white bg-primary-600'
                            : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                        }`}
                        aria-label="Admin paneli"
                        aria-current={isActive('/admin') ? 'page' : undefined}
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Admin</span>
                      </Link>
                    )
                  } else if (userRole === 'yazar') {
                    const userSlug = createUserSlug(user)
                    return (
                      <Link
                        to={`/yazar/profil/${userSlug}`}
                        className={`flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive(`/yazar/profil/${userSlug}`) || isActive('/yazar')
                            ? 'text-white bg-primary-600'
                            : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                        }`}
                        aria-label="Yazar paneli"
                        aria-current={isActive(`/yazar/profil/${userSlug}`) ? 'page' : undefined}
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Editör</span>
                      </Link>
                    )
                  } else if (userRole === 'supervisor') {
                    return (
                      <Link
                        to="/admin"
                        className={`flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/admin')
                            ? 'text-white bg-primary-600'
                            : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                        }`}
                        aria-label="Süpervizör paneli"
                        aria-current={isActive('/admin') ? 'page' : undefined}
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Süpervizör</span>
                      </Link>
                    )
                  }
                  
                  // Varsayılan durum - normal kullanıcı paneli
                  const panelRoute = '/kullanici-paneli'
                  const panelName = 'Profil'
                  
                  return (
                    <Link
                      to={panelRoute}
                      className={`flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(panelRoute)
                          ? 'text-white bg-primary-600'
                          : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                      }`}
                      aria-label={`${panelName} paneli`}
                      aria-current={isActive(panelRoute) ? 'page' : undefined}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden lg:inline">{panelName}</span>
                    </Link>
                  )
                })()}
                
                {/* Logout Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔴 Çıkış butonuna tıklandı')
                    handleSignOut(e)
                  }}
                  className="flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  aria-label="Çıkış yap"
                  onKeyDown={(e) => handleKeyboardNavigation(e, handleSignOut)}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Çıkış</span>
                </button>
              </div>
            ) : null}
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Giriş Yap Button */}
              {!loading && !isAuthenticated && (
                <Link
                  to="/kullanici-girisi"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  aria-label="Giriş Yap"
                >
                  Giriş Yap
                </Link>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                onKeyDown={(e) => handleKeyboardNavigation(e, toggleMobileMenu)}
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t" role="navigation" aria-label="Mobil navigasyon">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  onKeyDown={(e) => handleKeyboardNavigation(e, () => {
                    e.target.click()
                    setIsMenuOpen(false)
                  })}
                >
                  {item.name}
                </Link>
              ))}
              
            </nav>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {loading ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">Yükleniyor...</div>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="px-3 py-2 bg-gray-50 rounded-lg mx-3 flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">
                        Hoş Geldin {user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                      </span>
                    </div>
                    
                    {/* Role Based Panel Link */}
                    {(() => {
                      const userRole = user?.user_metadata?.user_role
                      
                      // Normal kullanıcı için kullanıcı paneli
                      if (userRole === 'user') {
                        return (
                          <Link
                            to="/kullanici-paneli"
                            className={`block mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive('/kullanici-paneli')
                                ? 'text-white bg-primary-600'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            } flex items-center space-x-2`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Profil</span>
                          </Link>
                        )
                      }
                      
                      // Admin/Editor/Supervisor için mevcut sistem
                      if (user?.email === 'test@test.com') {
                        return (
                          <Link
                            to="/admin"
                            className={`block mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive('/admin')
                                ? 'text-white bg-primary-600'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            } flex items-center space-x-2`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Paneli</span>
                          </Link>
                        )
                      } else if (userRole === 'yazar') {
                        const userSlug = createUserSlug(user)
                        return (
                          <Link
                            to={`/yazar/profil/${userSlug}`}
                            className={`block mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive(`/yazar/profil/${userSlug}`) || isActive('/yazar')
                                ? 'text-white bg-primary-600'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            } flex items-center space-x-2`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Editör Paneli</span>
                          </Link>
                        )
                      } else if (userRole === 'supervisor') {
                        return (
                          <Link
                            to="/admin"
                            className={`block mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive('/admin')
                                ? 'text-white bg-primary-600'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            } flex items-center space-x-2`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Süpervizör Paneli</span>
                          </Link>
                        )
                      }
                      
                      // Varsayılan durum
                      const panelRoute = '/kullanici-paneli'
                      const panelName = 'Profil'
                      
                      return (
                        <Link
                          to={panelRoute}
                          className={`block mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive(panelRoute)
                              ? 'text-white bg-primary-600'
                              : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                          } flex items-center space-x-2`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>{panelName}</span>
                        </Link>
                      )
                    })()}
                    
                    {/* Logout Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('🔴 Mobile çıkış butonuna tıklandı')
                        handleSignOut(e)
                      }}
                      className="w-full mx-3 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 flex items-center space-x-2 text-sm font-medium transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıkış</span>
                    </button>
                  </div>
                ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 