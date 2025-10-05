-- Otomatik öne çıkan yazarlar sistemi
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT 'Mevcut Öne Çıkan Yazarlar:' as info;
SELECT id, name, title, is_featured, user_id, created_at
FROM writer_profiles
WHERE is_featured = true
ORDER BY created_at DESC;

-- 2. Onaylanmış ama öne çıkarılmamış yazarları bul
SELECT 'Onaylanmış Ama Öne Çıkarılmamış Yazarlar:' as info;
SELECT wp.id, wp.name, wp.title, wp.is_featured, au.email, au.raw_user_meta_data->>'user_role' as role
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.is_featured IS NULL OR wp.is_featured = false
AND au.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY wp.created_at DESC;

-- 3. Otomatik öne çıkarma fonksiyonu oluştur
CREATE OR REPLACE FUNCTION auto_featured_writer_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer yeni bir writer_profiles kaydı ekleniyorsa ve user_role uygunsa
  IF TG_OP = 'INSERT' THEN
    -- Kullanıcının rolünü kontrol et
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id 
      AND raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
    ) THEN
      -- Otomatik olarak öne çıkan yap
      NEW.is_featured := true;
      RAISE NOTICE 'Otomatik öne çıkarma: % yazara uygulandı', NEW.name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger oluştur
DROP TRIGGER IF EXISTS trigger_auto_featured_writer ON writer_profiles;
CREATE TRIGGER trigger_auto_featured_writer
  BEFORE INSERT ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_featured_writer_on_approval();

-- 5. Mevcut onaylanmış yazarları otomatik öne çıkar
UPDATE writer_profiles
SET is_featured = true
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
)
AND (is_featured IS NULL OR is_featured = false);

-- 6. Güncelleme sonrası kontrol
SELECT 'Güncelleme Sonrası Öne Çıkan Yazarlar:' as info;
SELECT id, name, title, is_featured, user_id, created_at
FROM writer_profiles
WHERE is_featured = true
ORDER BY created_at DESC;

-- 7. Toplam sayı
SELECT 'Toplam Öne Çıkan Yazar Sayısı:' as info;
SELECT COUNT(*) as featured_count
FROM writer_profiles
WHERE is_featured = true;
