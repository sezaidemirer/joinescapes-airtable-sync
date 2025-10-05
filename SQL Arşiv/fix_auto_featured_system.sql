-- Otomatik öne çıkan yazarlar sistemini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut trigger'ları kontrol et
SELECT 'Mevcut Trigger\'lar:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'writer_profiles';

-- 2. Eski trigger'ları temizle
DROP TRIGGER IF EXISTS trigger_auto_featured_writer ON writer_profiles;
DROP FUNCTION IF EXISTS auto_featured_writer_on_approval();

-- 3. Yeni güçlü trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION auto_featured_writer_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Her INSERT ve UPDATE işleminde çalışsın
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Kullanıcının rolünü kontrol et
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id 
      AND raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
    ) THEN
      -- Otomatik olarak öne çıkan yap
      NEW.is_featured := true;
      RAISE NOTICE 'Otomatik öne çıkarma: % yazara uygulandı (user_id: %)', NEW.name, NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. INSERT trigger'ı oluştur
CREATE TRIGGER trigger_auto_featured_writer_insert
  BEFORE INSERT ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_featured_writer_on_approval();

-- 5. UPDATE trigger'ı oluştur (user_role değişirse)
CREATE TRIGGER trigger_auto_featured_writer_update
  BEFORE UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_featured_writer_on_approval();

-- 6. Auth.users tablosunda da trigger oluştur (user_role değişirse)
CREATE OR REPLACE FUNCTION update_writer_featured_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer user_role değiştiyse
  IF OLD.raw_user_meta_data->>'user_role' != NEW.raw_user_meta_data->>'user_role' THEN
    -- Yeni rol uygunsa writer_profiles'ı güncelle
    IF NEW.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor') THEN
      UPDATE writer_profiles
      SET is_featured = true, updated_at = NOW()
      WHERE user_id = NEW.id;
      
      RAISE NOTICE 'User role değişikliği: % kullanıcısı öne çıkan yapıldı', NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Auth.users trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_update_writer_featured ON auth.users;
CREATE TRIGGER trigger_update_writer_featured
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_writer_featured_status();

-- 8. Mevcut tüm onaylanmış yazarları öne çıkar
UPDATE writer_profiles
SET is_featured = true, updated_at = NOW()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
)
AND (is_featured IS NULL OR is_featured = false);

-- 9. Sonuçları kontrol et
SELECT 'Güncelleme Sonrası Öne Çıkan Yazarlar:' as info;
SELECT wp.id, wp.name, wp.title, wp.is_featured, au.email, au.raw_user_meta_data->>'user_role' as role
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.is_featured = true
ORDER BY wp.created_at DESC;

-- 10. Toplam sayı
SELECT 'Toplam Öne Çıkan Yazar Sayısı:' as info;
SELECT COUNT(*) as featured_count
FROM writer_profiles
WHERE is_featured = true;


