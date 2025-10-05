import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { X, LogIn, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react'

const LoginForm = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuthContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('E-posta ve şifre gereklidir')
        return
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor')
          return
        }
        if (password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır')
          return
        }
        
        const { error: signUpError } = await signUp(email, password)
        if (signUpError) {
          setError('Kayıt işlemi başarısız: ' + signUpError.message)
        } else {
          setSuccess('Kayıt Başarılı! Giriş Yapılıyor...')
          
          // 1.5 saniye bekle, sonra otomatik giriş yap
          setTimeout(async () => {
            const { error: signInError } = await signIn(email, password)
            if (signInError) {
              setError('Giriş işlemi başarısız: ' + signInError.message)
              setSuccess('')
            } else {
              onClose?.()
            }
          }, 1500)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError('Giriş başarısız: ' + error.message)
        } else {
          onClose?.()
        }
      }
    } catch (err) {
      setError('Bir hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isSignUp 
                ? 'Admin paneline erişim için hesap oluşturun' 
                : 'Admin paneline erişmek için giriş yapın'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-green-700 text-sm font-medium">{success}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ornek@email.com"
                required
                disabled={loading || success}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                  placeholder="En az 6 karakter"
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading || success}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrar
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Şifrenizi tekrar girin"
                  required
                  disabled={loading || success}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  <span>{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                </>
              )}
            </button>
          </form>

          {!success && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccess('')
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="text-primary-600 hover:text-primary-700 text-sm"
                disabled={loading}
              >
                {isSignUp 
                  ? 'Zaten hesabınız var mı? Giriş yapın' 
                  : 'Hesabınız yok mu? Kayıt olun'
                }
              </button>
            </div>
          )}

          {/* Test Bilgileri */}
          {!success && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Test İçin:</p>
              <p className="text-xs text-blue-600">
                Yeni hesap oluşturun veya mevcut hesabınızla giriş yapın
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm 