-- Airtable Trigger'ını Devre Dışı Bırak
-- Bu trigger, posts tablosunda yapılan UPDATE'leri Airtable'a geri gönderiyor
-- ve bu sync döngüsü kategori değişikliklerini bozuyor

-- 1. Trigger'ı kaldır
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;

-- 2. Trigger fonksiyonunu da kaldır (gerekirse)
-- DROP FUNCTION IF EXISTS trigger_update_airtable();

-- 3. Kontrol et: Trigger kaldırıldı mı?
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
  AND trigger_name = 'posts_update_airtable_trigger';

-- ✅ Eğer sonuç boşsa, trigger başarıyla kaldırıldı!

