require('dotenv').config();
const { syncAirtableToSupabase } = require('./airtable-to-supabase-sync.cjs');

console.log('🚀 Airtable-Supabase Sync Daemon (Cloud Version) başlatılıyor...');
console.log('⏰ 60 saniye aralıklarla Airtable taraması yapılacak');
console.log('🌐 Railway üzerinde 7/24 çalışacak');

// İlk çalıştırma
console.log('\n🔄 İlk senkronizasyon başlatılıyor...');
syncAirtableToSupabase();

// 60 saniye aralıklarla çalıştır
const interval = setInterval(async () => {
  console.log('\n🔄 Senkronizasyon başlatılıyor...');
  try {
    await syncAirtableToSupabase();
    console.log('✅ Senkronizasyon tamamlandı');
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error.message);
  }
}, 60000); // 60 saniye

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Daemon durduruluyor...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Daemon durduruluyor...');
  clearInterval(interval);
  process.exit(0);
});

// Hata yakalama
process.on('uncaughtException', (error) => {
  console.error('❌ Beklenmeyen hata:', error);
  // Hata durumunda daemon'u yeniden başlat
  setTimeout(() => {
    console.log('🔄 Daemon yeniden başlatılıyor...');
    process.exit(1);
  }, 5000);
});

console.log('✅ Daemon başarıyla başlatıldı ve çalışıyor...');
