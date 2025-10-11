-- Airtable Trigger'ını TAMAMEN Kaldır
-- Bu trigger kategori güncellemelerini engelliyor!

-- 1. Trigger'ı kaldır
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;

-- 2. Trigger fonksiyonunu da kaldır
DROP FUNCTION IF EXISTS trigger_update_airtable();

-- 3. Kontrol et: Trigger tamamen kaldırıldı mı?
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'posts'
  AND trigger_name = 'posts_update_airtable_trigger';

-- ✅ Eğer sonuç boşsa, trigger başarıyla kaldırıldı!
-- ⚠️ Not: Artık Supabase'de manuel yapılan değişiklikler Airtable'a GİTMEYECEK!
-- Ama bu sorun değil çünkü veri akışı: Airtable → Supabase (tek yön)

