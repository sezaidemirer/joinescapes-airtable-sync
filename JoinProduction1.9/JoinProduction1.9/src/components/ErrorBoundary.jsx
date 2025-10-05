import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Hata durumunu güncelle
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Hata bilgilerini kaydet
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Hata raporlama (console'a yazdır)
    console.error('🚨 Error Boundary yakaladı:', error, errorInfo)
    
    // Burada hata raporlama servisi eklenebilir
    // örn: Sentry, LogRocket vs.
  }

  handleRetry = () => {
    // Hata durumunu sıfırla
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            {/* Hata İkonu */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Hata Mesajı */}
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Bir şeyler ters gitti!
            </h1>
            <p className="text-gray-600 mb-6">
              Üzgünüz, beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            
            {/* Butonlar */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Tekrar Dene
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>
            
            {/* Geliştirici Bilgisi (sadece development'ta) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Geliştirici Bilgisi
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div className="mb-2">
                    <strong>Hata:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 