import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TestSupabase = () => {
  const [status, setStatus] = useState('Bağlantı test ediliyor...')
  const [envVars, setEnvVars] = useState({})
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      // Environment variables kontrolü
      const vars = {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Tanımlı ✅' : 'Tanımsız ❌',
        serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Tanımlı ✅' : 'Tanımsız ❌'
      }
      setEnvVars(vars)

      // Supabase bağlantı testi
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id')
          .limit(1)

        if (error) {
          setStatus('❌ HATA: ' + error.message)
          setTestResult({ success: false, error: error.message })
        } else {
          setStatus('✅ Bağlantı başarılı!')
          setTestResult({ success: true, data })
        }
      } catch (err) {
        setStatus('❌ HATA: ' + err.message)
        setTestResult({ success: false, error: err.message })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Supabase Bağlantı Testi</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Durum</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔑 Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>VITE_SUPABASE_URL:</strong> {envVars.url || '❌ Tanımsız'}</p>
            <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {envVars.anonKey}</p>
            <p><strong>VITE_SUPABASE_SERVICE_ROLE_KEY:</strong> {envVars.serviceKey}</p>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">📝 Test Sonucu</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestSupabase

