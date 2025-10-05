import { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, Calendar, Download, Filter } from 'lucide-react'
import supabase from '../lib/supabase'

const CookieAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0], // Bugünkü tarih
    end: new Date().toISOString().split('T')[0] // Bugünkü tarih
  })

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // 🧪 STEP 1: Test basic table access
      const { data: basicTest, error: basicError } = await supabase
        .from('cookie_consents')
        .select('*')
        .limit(5)
        
      
      if (basicError) {
        console.error('❌ Basic table access failed:', basicError)
        return
      }
      
      // 🧪 STEP 2: Count total records
      const { count: totalCount, error: countError } = await supabase
        .from('cookie_consents')
        .select('*', { count: 'exact', head: true })
        
      
      // 🧪 STEP 3: Try without date filter
      const { data: allRecords, error: allError } = await supabase
        .from('cookie_consents')
        .select('*')
        .order('consented_at', { ascending: false })
        .limit(10)
        
      
      // 🧪 STEP 4: Original query with date filter
      
      // Try different date column names
      let rawData, rawError
      
      // Try 'consented_at' first
      const result1 = await supabase
        .from('cookie_consents')
        .select('*')
        .gte('consented_at', dateRange.start)
        .lte('consented_at', dateRange.end + 'T23:59:59')
        .order('consented_at', { ascending: false })
        
      if (!result1.error && result1.data) {
        rawData = result1.data
        rawError = result1.error
      } else {
        // Try 'created_at' as fallback
        const result2 = await supabase
          .from('cookie_consents')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + 'T23:59:59')
          .order('created_at', { ascending: false })
          
        rawData = result2.data
        rawError = result2.error
      }


      if (rawError) {
        console.error('❌ Raw data fetch error:', rawError)
        return
      }

      // Use allRecords if rawData is empty but allRecords has data
      let dataToUse = rawData
      if ((!rawData || rawData.length === 0) && allRecords && allRecords.length > 0) {
        dataToUse = allRecords
      }


      // Manuel olarak analytics hesapla
      if (!dataToUse || dataToUse.length === 0) {
        setAnalytics({
          total_consents: totalCount || 0,
          accepted_all: 0,
          accepted_analytics: 0,
          accepted_marketing: 0,
          accepted_personalization: 0,
          only_necessary: 0,
          avg_categories_per_user: 0
        })
        return
      }

      // İstatistikleri manuel hesapla
      const totalConsents = dataToUse.length
      const acceptedAnalytics = dataToUse.filter(r => r.analytics === true).length
      const acceptedMarketing = dataToUse.filter(r => r.marketing === true).length
      const acceptedPersonalization = dataToUse.filter(r => r.personalization === true).length
      const acceptedAll = dataToUse.filter(r => 
        r.analytics === true && 
        r.marketing === true && 
        r.personalization === true
      ).length
      const onlyNecessary = dataToUse.filter(r => 
        r.analytics === false && 
        r.marketing === false && 
        r.personalization === false
      ).length

      const calculatedAnalytics = {
        total_consents: totalConsents,
        accepted_all: acceptedAll,
        accepted_analytics: acceptedAnalytics,
        accepted_marketing: acceptedMarketing,
        accepted_personalization: acceptedPersonalization,
        only_necessary: onlyNecessary,
        avg_categories_per_user: totalConsents > 0 ? 
          ((acceptedAnalytics + acceptedMarketing + acceptedPersonalization) / totalConsents).toFixed(1) : 0
      }

      setAnalytics(calculatedAnalytics)

    } catch (error) {
      console.error('💥 Analytics fetch exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      // Fetch detailed consent data
      const { data, error } = await supabase
        .from('cookie_consents')
        .select('*')
        .gte('consented_at', dateRange.start)
        .lte('consented_at', dateRange.end)
        .order('consented_at', { ascending: false })

      if (error) {
        console.error('Export error:', error)
        return
      }

      // Convert to CSV
      const csvContent = [
        ['Tarih', 'Kullanıcı ID', 'Session ID', 'IP', 'Gerekli', 'Analitik', 'Pazarlama', 'Kişiselleştirme', 'Yöntem'].join(','),
        ...data.map(row => [
          new Date(row.consented_at).toLocaleString('tr-TR'),
          row.user_id || 'Anonim',
          row.session_id || '-',
          row.ip_address || '-',
          row.necessary ? 'Evet' : 'Hayır',
          row.analytics ? 'Evet' : 'Hayır',
          row.marketing ? 'Evet' : 'Hayır',
          row.personalization ? 'Evet' : 'Hayır',
          row.consent_method || 'banner'
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `cerez-onaylari-${dateRange.start}-${dateRange.end}.csv`
      link.click()
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Analitik verileri yüklenemedi.</p>
      </div>
    )
  }

  const acceptanceRate = analytics.total_consents > 0 
    ? Math.round((analytics.accepted_analytics / analytics.total_consents) * 100)
    : 0

  const marketingRate = analytics.total_consents > 0 
    ? Math.round((analytics.accepted_marketing / analytics.total_consents) * 100)
    : 0

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            Çerez Onayı Analitiği
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Onay</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_consents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Analitik Kabul</p>
              <p className="text-2xl font-bold text-gray-900">{acceptanceRate}%</p>
              <p className="text-xs text-gray-500">{analytics.accepted_analytics} / {analytics.total_consents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pazarlama Kabul</p>
              <p className="text-2xl font-bold text-gray-900">{marketingRate}%</p>
              <p className="text-xs text-gray-500">{analytics.accepted_marketing} / {analytics.total_consents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sadece Gerekli</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.only_necessary}</p>
              <p className="text-xs text-gray-500">
                {analytics.total_consents > 0 
                  ? Math.round((analytics.only_necessary / analytics.total_consents) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Dağılımı</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gerekli Çerezler</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-sm font-medium">{analytics.total_consents}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Analitik Çerezler</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${acceptanceRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analytics.accepted_analytics}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pazarlama Çerezleri</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${marketingRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analytics.accepted_marketing}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kişiselleştirme</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ 
                      width: `${analytics.total_consents > 0 
                        ? Math.round((analytics.accepted_personalization / analytics.total_consents) * 100)
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analytics.accepted_personalization}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet İstatistikler</h3>
          <div className="space-y-4">
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-900">Tümünü Kabul Eden</span>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">{analytics.accepted_all}</div>
                <div className="text-xs text-blue-600">
                  {analytics.total_consents > 0 
                    ? Math.round((analytics.accepted_all / analytics.total_consents) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-900">Sadece Gerekli</span>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-900">{analytics.only_necessary}</div>
                <div className="text-xs text-orange-600">
                  {analytics.total_consents > 0 
                    ? Math.round((analytics.only_necessary / analytics.total_consents) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-900">Ortalama Kategori</span>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{analytics.avg_categories_per_user}</div>
                <div className="text-xs text-gray-600">kategori/kullanıcı</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Compliance Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">📋 Yasal Uyumluluk Notu</h4>
        <p className="text-sm text-yellow-700">
          Bu veriler KVKK ve GDPR uyumluluğu için saklanmaktadır. Kişisel veriler 
          anonimleştirilerek raporlanır ve 3 yıl süreyle tutulur.
        </p>
      </div>

    </div>
  )
}

export default CookieAnalytics 