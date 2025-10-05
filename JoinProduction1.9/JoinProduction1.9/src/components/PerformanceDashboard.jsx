import { useState, useEffect } from 'react'
import { Activity, Clock, Zap, Eye, AlertTriangle } from 'lucide-react'
import { usePerformance, getMemoryUsage } from '../hooks/usePerformance'

const PerformanceDashboard = () => {
  const metrics = usePerformance()
  const [memoryUsage, setMemoryUsage] = useState(null)
  const [bundleInfo, setBundleInfo] = useState(null)

  useEffect(() => {
    // Memory usage güncellemesi
    const updateMemory = () => {
      setMemoryUsage(getMemoryUsage())
    }
    
    updateMemory()
    const interval = setInterval(updateMemory, 5000) // Her 5 saniyede güncelle
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Bundle bilgilerini hesapla
    const calculateBundleInfo = async () => {
      try {
        // Tüm script ve CSS dosyalarının boyutunu hesapla
        const scripts = Array.from(document.querySelectorAll('script[src]'))
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        
        let totalSize = 0
        const resources = []
        
        // Performance API'den resource timing bilgilerini al
        const resourceEntries = performance.getEntriesByType('resource')
        
        resourceEntries.forEach(entry => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            const size = entry.transferSize || entry.encodedBodySize || 0
            totalSize += size
            resources.push({
              name: entry.name.split('/').pop(),
              size: Math.round(size / 1024), // KB
              type: entry.name.includes('.js') ? 'JavaScript' : 'CSS'
            })
          }
        })
        
        setBundleInfo({
          totalSize: Math.round(totalSize / 1024), // KB
          resources: resources.sort((a, b) => b.size - a.size)
        })
      } catch (error) {
        console.error('Bundle info calculation error:', error)
      }
    }
    
    calculateBundleInfo()
  }, [])

  const getScoreColor = (metric, value) => {
    if (!value) return 'text-gray-400'
    
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 }
    }
    
    const threshold = thresholds[metric]
    if (!threshold) return 'text-gray-400'
    
    if (value <= threshold.good) return 'text-green-600'
    if (value <= threshold.poor) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatValue = (metric, value) => {
    if (!value) return 'Ölçülüyor...'
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3)
      case 'fcp':
      case 'lcp':
      case 'fid':
      case 'ttfb':
        return `${value}ms`
      default:
        return value
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Web Vitals</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">FCP</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor('fcp', metrics.fcp)}`}>
              {formatValue('fcp', metrics.fcp)}
            </div>
            <div className="text-xs text-gray-500">First Contentful Paint</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">LCP</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor('lcp', metrics.lcp)}`}>
              {formatValue('lcp', metrics.lcp)}
            </div>
            <div className="text-xs text-gray-500">Largest Contentful Paint</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">FID</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor('fid', metrics.fid)}`}>
              {formatValue('fid', metrics.fid)}
            </div>
            <div className="text-xs text-gray-500">First Input Delay</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">CLS</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor('cls', metrics.cls)}`}>
              {formatValue('cls', metrics.cls)}
            </div>
            <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">TTFB</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor('ttfb', metrics.ttfb)}`}>
              {formatValue('ttfb', metrics.ttfb)}
            </div>
            <div className="text-xs text-gray-500">Time to First Byte</div>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      {memoryUsage && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{memoryUsage.used}MB</div>
              <div className="text-sm text-gray-600">Used</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{memoryUsage.total}MB</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{memoryUsage.limit}MB</div>
              <div className="text-sm text-gray-600">Limit</div>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Information */}
      {bundleInfo && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Bundle Analysis</h3>
          <div className="mb-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{bundleInfo.totalSize}KB</div>
              <div className="text-sm text-gray-600">Total Bundle Size</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Resource Breakdown:</h4>
            {bundleInfo.resources.slice(0, 5).map((resource, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 truncate">{resource.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    resource.type === 'JavaScript' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {resource.type}
                  </span>
                  <span className="text-sm font-medium">{resource.size}KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Tips</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <strong>Code Splitting:</strong> Lazy loading aktif - sayfa bazlı chunk'lar oluşturuluyor
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <strong>Bundle Optimization:</strong> Vendor chunk'lar ayrıldı - cache verimliliği artırıldı
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <strong>Image Optimization:</strong> LazyImage component kullanın - WebP desteği aktif
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <strong>Production Build:</strong> Console.log'lar otomatik temizleniyor
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDashboard 