import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { X, LogIn, UserPlus, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react'
import rateLimiter from '../utils/rateLimiter'
import inputValidator from '../utils/inputValidator'

const AdminLogin = () => {
  const { isAuthenticated, loading, signIn, signUp, user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Form state
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('yazar')
  const [emailSent, setEmailSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState('')

  // Location state'ten mesaj al
  useEffect(() => {
    if (location.state?.message) {
      setPendingApprovalMessage(location.state.message)
      setEmail(location.state.email || '')
    }
  }, [location.state])

  // SAYFA ERİŞİM KONTROLÜ - SADECE test@test.com ERİŞEBİLİR!
  useEffect(() => {
    if (isAuthenticated && !loading && user && user.id) {
      // Eğer giriş yapmış kullanıcı test@test.com değilse bu sayfayı kullanamaz
      if (user.email !== 'test@test.com') {
        console.log('🚫 AdminLogin: Yetkisiz erişim denemesi:', user.email)
        alert('Bu sayfaya giriş yapamazsınız! Sadece admin bu sayfayı kullanabilir.')
        navigate('/', { replace: true })
        return
      }
    }
  }, [isAuthenticated, loading, user, navigate])

  useEffect(() => {
    // Sadece gerçekten giriş yapmış kullanıcıları yönlendir
    if (isAuthenticated && !loading && user && user.id) {
      // Role'e göre yönlendirme
      const userRole = user.user_metadata?.user_role || user.role
      
      // Editör/Süpervizör onay kontrolü (test@test.com hariç)
      if ((userRole === 'editor' || userRole === 'yazar' || userRole === 'supervisor') && user.email !== 'test@test.com') {
        if (!user.user_metadata?.editor_approved) {
          // Onay bekleyen editör
          navigate('/adminlogin', { 
            state: { 
              message: 'Hesabınız henüz onaylanmadı. Admin onayı bekliyor.',
              email: user.email 
            } 
          })
          return
        }
      }
      
      // SADECE test@test.com ADMIN PANELİNE ERİŞEBİLİR!
      if (user.email === 'test@test.com') {
        console.log('✅ Admin: test@test.com girişi, admin paneline yönlendiriliyor')
        navigate('/admin')
      } else {
        // TEST@TEST.COM DIŞINDA HİÇ KİMSE ADMIN PANELİNE ERİŞEMEZ!
        console.log('🚫 Admin: Yetkisiz erişim denemesi:', user.email, 'Rol:', userRole)
        alert('Bu panele sadece test@test.com erişebilir!')
        navigate('/', { replace: true })
        return
      }
      
    }
  }, [isAuthenticated, loading, user, navigate])

  // Şifre sıfırlama fonksiyonu
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setResetLoading(true)

    try {
      const emailValidation = inputValidator.validateEmail(resetEmail)
      if (!emailValidation.isValid) {
        setError('E-posta hatası: ' + emailValidation.errors.join(', '))
        return
      }

      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.hostname === 'localhost' 
          ? `${window.location.protocol}//${window.location.host}/adminlogin?reset=true`
          : `${window.location.origin}/adminlogin?reset=true`
      })

      if (error) {
        setError('Şifre sıfırlama hatası: ' + error.message)
      } else {
        setSuccess('Şifre sıfırlama linki e-posta adresinize gönderildi.')
        setShowForgotPassword(false)
        setResetEmail('')
      }
    } catch (error) {
      setError('Bir hata oluştu: ' + error.message)
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFormLoading(true)

    try {
      // Rate limit
      const rateCheck = rateLimiter.checkAuthEndpoint(isSignUp ? 'signup' : 'signin')
      if (!rateCheck.allowed) {
        setError(rateCheck.message)
        return
      }

      // Validation
      const emailValidation = inputValidator.validateEmail(email)
      if (!emailValidation.isValid) {
        setError('E-posta hatası: ' + emailValidation.errors.join(', '))
        return
      }

      const passwordValidation = inputValidator.validatePassword(password)
      if (!passwordValidation.isValid) {
        setError('Şifre hatası: ' + passwordValidation.errors.join(', '))
        return
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor')
          return
        }

        // Kayıt ol
        console.log('🔍 Kayıt işlemi:', { email, selectedRole })
        const { data, error } = await signUp(email, password, selectedRole)
        
        if (error) {
          setError('Kayıt işlemi başarısız: ' + error.message)
        } else if (data?.needsEmailConfirmation) {
          setEmailSent(true)
          setVerificationEmail(email)
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          
          // Editör/Süpervizör için özel mesaj
          if (selectedRole === 'editor' || selectedRole === 'yazar' || selectedRole === 'supervisor') {
            setSuccess('Kayıt başarılı! E-posta doğrulama sonrası admin onayı bekleyeceksiniz.')
          } else {
            setSuccess('Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.')
          }
        } else {
          setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.')
        }
      } else {
        // Giriş yap - SADECE test@test.com GİRİŞ YAPABİLİR!
        if (email !== 'test@test.com') {
          setError('Bu sayfaya giriş yapamazsınız! Sadece admin bu sayfayı kullanabilir.')
          return
        }
        
        const { data, error } = await signIn(email, password)
        
        if (error) {
          setError('Giriş başarısız: ' + error.message)
        } else {
          setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...')
          // useEffect otomatik yönlendirme yapacak
        }
      }
    } catch (error) {
      setError('Bir hata oluştu: ' + error.message)
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // useEffect yönlendirme yapacak
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Doğrulama</h2>
          <p className="text-gray-600 mb-4">
            <strong>{verificationEmail}</strong> adresine doğrulama linki gönderildi.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Lütfen e-posta kutunuzu kontrol edin ve linke tıklayarak hesabınızı aktifleştirin.
          </p>
          {(selectedRole === 'editor' || selectedRole === 'yazar' || selectedRole === 'supervisor') && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Not:</strong> E-posta doğrulama sonrası admin onayı bekleyeceksiniz.
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setEmailSent(false)
              setVerificationEmail('')
              setIsSignUp(false)
            }}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Yönetici Kaydı' : 'Yönetici Girişi'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'JoinEscapes yönetim ekibine katılın' 
              : 'Yönetim paneline giriş yapın'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {pendingApprovalMessage && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-1">Onay Bekliyor</h4>
                <p className="text-sm text-orange-700">{pendingApprovalMessage}</p>
                <p className="text-xs text-orange-600 mt-2">
                  Admin tarafından onaylandıktan sonra giriş yapabileceksiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="E-posta adresinizi girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Şifrenizi girin"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Şifrenizi tekrar girin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="yazar">Yazar</option>
                  <option value="supervisor">Süpervizör</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {formLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4 mr-2" /> Hesap Oluştur
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" /> Giriş Yap
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            {!isSignUp && (
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowForgotPassword(true)
                  }}
                  className="text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                >
                  Şifremi unuttum
                </button>
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Şifre Sıfırlama Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Şifremi Unuttum</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setError('')
                  setSuccess('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="E-posta adresinizi girin"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setError('')
                    setSuccess('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={resetLoading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogin
