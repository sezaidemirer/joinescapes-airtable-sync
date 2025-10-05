import React from 'react'

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error })
    console.error('📄 Sayfa Error Boundary yakaladı:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-96 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* Küçük Hata İkonu */}
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Hata Mesajı */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bu bölüm yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Bu sayfanın bir kısmında sorun yaşanıyor. Lütfen tekrar deneyin.
            </p>
            
            {/* Retry Butonu */}
            <button
              onClick={this.handleRetry}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Tekrar Yükle
            </button>
            
            {/* Geliştirici Bilgisi */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  Hata Detayı
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  {this.state.error && this.state.error.toString()}
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

export default PageErrorBoundary 