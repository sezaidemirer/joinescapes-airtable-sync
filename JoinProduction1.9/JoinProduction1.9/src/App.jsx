import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import NotificationManager from './components/NotificationManager'
import PWAInstaller from './components/PWAInstaller'
import ErrorBoundary from './components/ErrorBoundary'
import PageErrorBoundary from './components/PageErrorBoundary'
import SocialShare from './components/SocialShare'

// Service Worker kayıt fonksiyonu
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
    } catch (error) {
    }
  }
}

// Cache busting fonksiyonu
const clearOldCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      const currentCacheName = 'joinescapes-cache-v3'
      
      // Eski cache'leri temizle
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== currentCacheName)
          .map(cacheName => caches.delete(cacheName))
      )
      
      console.log('🗑️ Eski cache\'ler temizlendi')
    } catch (error) {
      console.log('Cache temizleme hatası:', error)
    }
  }
}

// Lazy load pages for better performance - error handling ile
const Home = lazy(() => import('./pages/Home').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Destinations = lazy(() => import('./pages/Destinations').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const News = lazy(() => import('./pages/News').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const SeyahatOnerileri = lazy(() => import('./pages/Recommendations').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Contact = lazy(() => import('./pages/Contact').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Admin = lazy(() => import('./pages/Admin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const UserLogin = lazy(() => import('./pages/UserLogin').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const ResetPassword = lazy(() => import('./pages/ResetPassword').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const UserPanel = lazy(() => import('./pages/UserPanel').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const WriterProfile = lazy(() => import('./components/WriterProfile').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const AllWriters = lazy(() => import('./pages/AllWriters').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Editor = lazy(() => import('./pages/Editor').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Supervisor = lazy(() => import('./pages/Supervisor').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const CategoryPosts = lazy(() => import('./pages/CategoryPosts').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const BlogPost = lazy(() => import('./pages/BlogPost').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const TagPosts = lazy(() => import('./pages/TagPosts').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const TermsOfService = lazy(() => import('./pages/TermsOfService').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const About = lazy(() => import('./pages/About').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Celebrity = lazy(() => import('./pages/Celebrity').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const SpaMolalari = lazy(() => import('./pages/SpaMolalari').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const SehirMolalari = lazy(() => import('./pages/SehirMolalari').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const LuksSeçkiler = lazy(() => import('./pages/LuksSeçkiler').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Lüks = lazy(() => import('./pages/Luks').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const SoloGezginler = lazy(() => import('./pages/SoloGezginler').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const CruiseRotalari = lazy(() => import('./pages/CruiseRotalari').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const VizesizRotalar = lazy(() => import('./pages/VizesizRotalar').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))

const CiftlerIcinOzel = lazy(() => import('./pages/CiftlerIcinOzel').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const ButikOteller = lazy(() => import('./pages/ButikOteller').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Oteller = lazy(() => import('./pages/Oteller').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const PaketTatiller = lazy(() => import('./pages/PaketTatiller').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const Yaz2025 = lazy(() => import('./pages/Yaz2025').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const VisaFree = lazy(() => import('./pages/VisaFree').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const UcuzUcusRotalari = lazy(() => import('./pages/UcuzUcusRotalari').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))
const GurmeRotalari = lazy(() => import('./pages/GurmeRotalari').catch(() => ({ default: () => <PageError retry={() => window.location.reload()} /> })))

// Loading component - daha güvenilir
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="flex space-x-1 mb-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          ></div>
        ))}
      </div>
      <p className="text-gray-600 animate-pulse">Sayfa yükleniyor...</p>
    </div>
  </div>
)

// Error component for lazy loading failures
const PageError = ({ error, retry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="text-6xl mb-4">😔</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Yüklenemedi</h1>
      <p className="text-gray-600 mb-6">Bu sayfa şu anda yüklenemiyor. Lütfen tekrar deneyin.</p>
      <button
        onClick={retry}
        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Tekrar Dene
      </button>
    </div>
  </div>
)

// Scroll to top component with GTM tracking
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Sayfa değiştiğinde üste scroll et
    window.scrollTo(0, 0)
    
    // GTM'e sayfa değişikliğini bildir
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href
      })
      
    }
  }, [pathname])

  return null
}

function App() {
  // Service Worker'ı uygulama başladığında kayıt et ve cache'leri temizle
  useEffect(() => {
    registerServiceWorker()
    clearOldCaches()
  }, [])

  return (
    <HelmetProvider>
    <AuthProvider>
                <ErrorBoundary>
      <Router>
        <ScrollToTop />
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Ana içeriğe geç
        </a>
        <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
          <Header />
          <main id="main-content" tabIndex="-1">
            <Suspense fallback={<PageLoader />}>
              <PageErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
                  
                  {/* Ana sayfalar - Türkçe URL'ler */}
                  <Route path="/destinasyonlar" element={<Destinations />} />
                  <Route path="/haberler" element={<News />} />
                  <Route path="/iletisim" element={<Contact />} />
                  <Route path="/hakkimizda" element={<About />} />
                  <Route path="/seyahat-onerileri" element={<SeyahatOnerileri />} />
                  
                  {/* Redirect'ler - İngilizce'den Türkçe'ye */}
                  <Route path="/destinations" element={<Navigate to='/destinasyonlar' replace />} />
                  <Route path="/news" element={<Navigate to='/haberler' replace />} />
                  <Route path="/contact" element={<Navigate to='/iletisim' replace />} />
                  <Route path="/about" element={<Navigate to='/hakkimizda' replace />} />
                  <Route path="/recommendations" element={<Navigate to='/seyahat-onerileri' replace />} />
                  
                  {/* Kategori sayfaları */}
                  <Route path="/sanat-ve-cemiyet" element={<Celebrity />} />
              <Route path="/spa-molalari" element={<SpaMolalari />} />
              <Route path="/sehir-molalari" element={<SehirMolalari />} />
                  <Route path="/luks-seckiler" element={<LuksSeçkiler />} />
                  <Route path="/luks" element={<Lüks />} />
                  <Route path="/solo-gezginler" element={<SoloGezginler />} />
                  <Route path="/cruise-rotalari" element={<CruiseRotalari />} />
                  <Route path="/vizesiz-rotalar" element={<VizesizRotalar />} />
                  <Route path="/ciftler-icin-ozel" element={<CiftlerIcinOzel />} />
                  <Route path="/butik-oteller" element={<ButikOteller />} />
                  <Route path="/oteller" element={<Oteller />} />
                  <Route path="/paket-tatiller" element={<PaketTatiller />} />
                  <Route path="/yaz-2025" element={<Yaz2025 />} />
                  <Route path="/visa-free" element={<Navigate to='/vizesiz-rotalar' replace />} />
                  <Route path="/ucuz-ucus-rotalari" element={<UcuzUcusRotalari />} />
                  <Route path="/gurme-rotalari" element={<GurmeRotalari />} />
                  
                  {/* Admin sayfaları */}
              <Route path="/admin" element={<Admin />} />
            <Route path="/yazar/profil/:slug" element={<Editor />} />
            <Route path="/supervisor" element={<Supervisor />} />
              <Route path="/adminlogin" element={<AdminLogin />} />
              {/* Kullanıcı girişi */}
              <Route path="/kullanici-girisi" element={<UserLogin />} />
              <Route path="/sifre-sifirla" element={<ResetPassword />} />
              <Route path="/kullanici-paneli" element={<UserPanel />} />
              <Route path="/yazarlar" element={<AllWriters />} />
              <Route path="/yazar/:slug" element={<WriterProfile />} />
              
              {/* Legal Pages */}
              <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
              <Route path="/cerez-politikasi" element={<CookiePolicy />} />
              <Route path="/kullanim-sartlari" element={<TermsOfService />} />
              
                                    {/* Blog Routes - HİBRİT FORMAT */}
              <Route path="/kategori/:categorySlug" element={<CategoryPosts />} />
                  <Route path="/etiket/:tagSlug" element={<TagPosts />} />
              <Route path="/blog/:postSlug" element={<BlogPost />} />
                  
                  {/* 3 seviyeli format: /sayfa/kategori/etiket/yazı */}
                  <Route path="/:pageSlug/:categorySlug/:tagSlug/:postSlug" element={<BlogPost />} />
                  
                  {/* 2 seviyeli format: /kategori/yazı-başlığı */}
              <Route path="/:categorySlug/:postSlug" element={<BlogPost />} />
            </Routes>
              </PageErrorBoundary>
            </Suspense>
          </main>
          <Footer />
          <SocialShare variant="floating" />
          <CookieConsent />
          <NotificationManager />
          <PWAInstaller />
        </div>
      </Router>
        </ErrorBoundary>
    </AuthProvider>
    </HelmetProvider>
  )
}

export default App
