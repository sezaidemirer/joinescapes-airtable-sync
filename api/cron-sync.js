import { syncAirtableToSupabase } from '../scripts/airtable-to-supabase-sync.cjs';

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cron job secret kontrolü - Vercel otomatik gönderir
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    console.log('🔄 Vercel Cron Job - Airtable senkronizasyonu başlatılıyor...');
    
    // Senkronizasyonu çalıştır
    await syncAirtableToSupabase();
    
    console.log('✅ Vercel Cron Job - Senkronizasyon tamamlandı');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Airtable senkronizasyonu başarıyla tamamlandı',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vercel Cron Job - Senkronizasyon hatası:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
