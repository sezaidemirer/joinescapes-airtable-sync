const { syncAirtableToSupabase } = require('./airtable-to-supabase-sync.cjs');

// 60 saniye = 1 dakika
const SYNC_INTERVAL = 60 * 1000;

console.log('🚀 Airtable-Supabase Senkronizasyon Daemon başlatılıyor...');
console.log(`⏰ Tarama aralığı: ${SYNC_INTERVAL / 1000} saniye`);
console.log('🔄 Sürekli tarama başlıyor...\n');

// İlk çalıştırma
syncAirtableToSupabase();

// Sürekli tarama
setInterval(() => {
  console.log('\n' + '='.repeat(50));
  console.log(`🕐 ${new Date().toLocaleString('tr-TR')} - Tarama başlıyor...`);
  console.log('='.repeat(50));
  
  syncAirtableToSupabase();
}, SYNC_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Senkronizasyon daemon durduruluyor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Senkronizasyon daemon durduruluyor...');
  process.exit(0);
});

console.log('✅ Daemon çalışıyor. Durdurmak için Ctrl+C kullanın.');
