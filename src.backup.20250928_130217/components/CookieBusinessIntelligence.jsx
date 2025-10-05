import { useState, useEffect } from 'react'
import { BarChart3, MapPin, Clock, TrendingUp, Users, Globe } from 'lucide-react'
import supabase from '../lib/supabase'

const CookieBusinessIntelligence = () => {
  const [intelligence, setIntelligence] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinessIntelligence()
  }, [])

  const fetchBusinessIntelligence = async () => {
    try {
      setLoading(true)
      
      // Bugünkü tarih
      const today = new Date().toISOString().split('T')[0]
      
      // Direkt SQL query ile bugünkü veriler
      let { data: rawData, error: rawError } = await supabase
        .from('cookie_consents')
        .select('*')
        .gte('consented_at', today)
        .lte('consented_at', today + 'T23:59:59')
        .order('consented_at', { ascending: false })

      if (rawError) {
        console.error('❌ BI raw data error:', rawError)
        return
      }


      if (!rawData || rawData.length === 0) {
        
        // Eğer bugün veri yoksa, tüm verileri çek
        const { data: allData, error: allError } = await supabase
          .from('cookie_consents')
          .select('*')
          .order('consented_at', { ascending: false })
          .limit(100)
          
        if (allError) {
          console.error('❌ All data error:', allError)
          setIntelligence({
            marketing: { canUseGA: false, canUseFBPixel: false, canPersonalize: false, organicFocusNeeded: true },
            geographical: {},
            timing: {},
            conversion: { quickAcceptRate: '0', customizationRate: '0', rejectRate: '0' },
            recommendations: []
          })
          return
        }
        
        rawData = allData
      }

      // Manuel analytics hesapla
      const totalConsents = rawData.length
      const acceptedAnalytics = rawData.filter(r => r.analytics === true).length
      const acceptedMarketing = rawData.filter(r => r.marketing === true).length
      const acceptedPersonalization = rawData.filter(r => r.personalization === true).length

      const analyticsData = {
        total_consents: totalConsents,
        accepted_analytics: acceptedAnalytics,
        accepted_marketing: acceptedMarketing,
        accepted_personalization: acceptedPersonalization
      }

      // Get geographical data
      const geoData = rawData.filter(r => r.ip_address)

      // Get session behavior
      const sessionData = rawData.filter(r => r.session_id)

      // Process data for insights
      const insights = processBusinessInsights(analyticsData, geoData, sessionData)
      setIntelligence(insights)

    } catch (error) {
      console.error('💥 Business intelligence error:', error)
    } finally {
      setLoading(false)
    }
  }

  const processBusinessInsights = (analytics, geoData, sessionData) => {
    // Marketing insights
    const marketingInsights = {
      canUseGA: analytics.accepted_analytics > 0,
      canUseFBPixel: analytics.accepted_marketing > 0,
      canPersonalize: analytics.accepted_personalization > 0,
      organicFocusNeeded: analytics.accepted_marketing < analytics.accepted_analytics
    }

    // Geographical insights (mock data since we don't have real IP geolocation)
    const geoInsights = geoData.reduce((acc, record) => {
      const region = record.ip_address?.split('.')[0] || 'unknown'
      if (!acc[region]) {
        acc[region] = { total: 0, analytics: 0, marketing: 0 }
      }
      acc[region].total++
      if (record.analytics) acc[region].analytics++
      if (record.marketing) acc[region].marketing++
      return acc
    }, {})

    // Time-based insights
    const hourlyPatterns = sessionData.reduce((acc, record) => {
      const hour = new Date(record.consented_at).getHours()
      if (!acc[hour]) acc[hour] = { total: 0, quick_accept: 0 }
      acc[hour].total++
      if (record.consent_method === 'accept-all') acc[hour].quick_accept++
      return acc
    }, {})

    // Conversion insights
    const conversionInsights = {
      quickAcceptRate: (sessionData.filter(s => s.consent_method === 'accept-all').length / sessionData.length * 100).toFixed(1),
      customizationRate: (sessionData.filter(s => s.consent_method === 'custom-settings').length / sessionData.length * 100).toFixed(1),
      rejectRate: (sessionData.filter(s => s.consent_method === 'reject-all').length / sessionData.length * 100).toFixed(1)
    }

    return {
      marketing: marketingInsights,
      geographical: geoInsights,
      timing: hourlyPatterns,
      conversion: conversionInsights,
      recommendations: generateRecommendations(marketingInsights, analytics)
    }
  }

  const generateRecommendations = (marketing, analytics) => {
    const recommendations = []

    if (analytics.accepted_analytics < analytics.total_consents * 0.5) {
      recommendations.push({
        type: 'warning',
        title: 'Analytics Kabul Oranı Düşük',
        description: 'Kullanıcıların %50\'sinden azı analytics kabul ediyor. Server-side tracking düşünün.',
        action: 'Server-side Google Analytics 4 implementasyonu'
      })
    }

    if (analytics.accepted_marketing < analytics.total_consents * 0.3) {
      recommendations.push({
        type: 'info',
        title: 'Marketing Kabul Oranı Düşük',
        description: 'Paid ads yerine organic content marketing\'e odaklanın.',
        action: 'SEO ve content marketing stratejisi geliştirin'
      })
    }

    if (analytics.accepted_personalization > analytics.total_consents * 0.7) {
      recommendations.push({
        type: 'success',
        title: 'Kişiselleştirme Fırsatı',
        description: 'Kullanıcılar kişiselleştirmeyi seviyor. Recommendation engine ekleyin.',
        action: 'AI-powered içerik öneri sistemi geliştirin'
      })
    }

    return recommendations
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!intelligence) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Business intelligence verileri yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <BarChart3 className="h-7 w-7 mr-3" />
          Cookie Business Intelligence
        </h2>
        <p className="text-blue-100">
          Cookie verilerinizi iş stratejinize dönüştürün
        </p>
      </div>

      {/* Marketing Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
          intelligence.marketing.canUseGA ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center">
            <TrendingUp className={`h-8 w-8 ${
              intelligence.marketing.canUseGA ? 'text-green-600' : 'text-red-600'
            }`} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Google Analytics</p>
              <p className={`text-lg font-bold ${
                intelligence.marketing.canUseGA ? 'text-green-900' : 'text-red-900'
              }`}>
                {intelligence.marketing.canUseGA ? 'Aktif Kullan' : 'Server-side Geç'}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
          intelligence.marketing.canUseFBPixel ? 'border-blue-500' : 'border-orange-500'
        }`}>
          <div className="flex items-center">
            <Users className={`h-8 w-8 ${
              intelligence.marketing.canUseFBPixel ? 'text-blue-600' : 'text-orange-600'
            }`} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Facebook Ads</p>
              <p className={`text-lg font-bold ${
                intelligence.marketing.canUseFBPixel ? 'text-blue-900' : 'text-orange-900'
              }`}>
                {intelligence.marketing.canUseFBPixel ? 'Pixel Kullan' : 'Organic Odaklan'}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
          intelligence.marketing.canPersonalize ? 'border-purple-500' : 'border-gray-500'
        }`}>
          <div className="flex items-center">
            <Globe className={`h-8 w-8 ${
              intelligence.marketing.canPersonalize ? 'text-purple-600' : 'text-gray-600'
            }`} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Kişiselleştirme</p>
              <p className={`text-lg font-bold ${
                intelligence.marketing.canPersonalize ? 'text-purple-900' : 'text-gray-900'
              }`}>
                {intelligence.marketing.canPersonalize ? 'AI Öneri Sys.' : 'Generic Content'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Hızlı Kabul</p>
              <p className="text-lg font-bold text-indigo-900">
                %{intelligence.conversion.quickAcceptRate}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
          Stratejik Öneriler
        </h3>
        
        <div className="space-y-4">
          {intelligence.recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.type === 'success' ? 'bg-green-50 border-green-400' :
              rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <h4 className={`font-semibold ${
                rec.type === 'success' ? 'text-green-900' :
                rec.type === 'warning' ? 'text-yellow-900' :
                'text-blue-900'
              }`}>
                {rec.title}
              </h4>
              <p className={`text-sm mt-1 ${
                rec.type === 'success' ? 'text-green-700' :
                rec.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {rec.description}
              </p>
              <p className={`text-xs mt-2 font-medium ${
                rec.type === 'success' ? 'text-green-800' :
                rec.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                🎯 Aksiyon: {rec.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-amber-900 mb-3">📋 Veri Kullanım Rehberi</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <h5 className="font-medium mb-2">✅ Yapabileceklerin:</h5>
            <ul className="space-y-1 text-xs">
              <li>• Anonim istatistik analizi</li>
              <li>• A/B test optimizasyonu</li>
              <li>• Coğrafi trend analizi</li>
              <li>• Marketing ROI hesaplama</li>
              <li>• UX iyileştirme kararları</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">❌ Yapamazsın:</h5>
            <ul className="space-y-1 text-xs">
              <li>• Kişisel hedefleme (email yok)</li>
              <li>• IP ile kullanıcı takibi</li>
              <li>• 3. parti veri satışı</li>
              <li>• Bireysel profilleme</li>
              <li>• Cross-device tracking</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}

export default CookieBusinessIntelligence 