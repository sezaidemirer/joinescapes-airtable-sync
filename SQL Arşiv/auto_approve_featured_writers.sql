-- Onaylanan editör hesapları otomatik öne çıkan yap
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT 'Mevcut Durum:' as info;
SELECT 
  wp.id, 
  wp.name, 
  wp.title, 
  wp.is_featured,
  au.email,
  au.raw_user_meta_data->>'user_role' as user_role,
  au.raw_user_meta_data->>'is_approved' as is_approved
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
ORDER BY wp.created_at DESC;

-- 2. Onaylanan ama öne çıkarılmamış editörleri bul
SELECT 'Onaylanan Ama Öne Çıkarılmamış Editörler:' as info;
SELECT 
  wp.id, 
  wp.name, 
  wp.title, 
  au.email,
  au.raw_user_meta_data->>'user_role' as user_role
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE au.raw_user_meta_data->>'is_approved' = 'true'
AND au.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
AND (wp.is_featured IS NULL OR wp.is_featured = false);

-- 3. Onaylanan tüm editörleri otomatik öne çıkan yap
UPDATE writer_profiles
SET 
  is_featured = true,
  updated_at = NOW()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.raw_user_meta_data->>'is_approved' = 'true'
  AND au.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
);

-- 4. Otomatik sistem için trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION auto_featured_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer kullanıcı onaylandıysa ve rol uygunsa
  IF NEW.raw_user_meta_data->>'is_approved' = 'true' 
  AND NEW.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor') THEN
    
    -- Writer_profiles tablosunda kayıt varsa güncelle
    UPDATE writer_profiles
    SET 
      is_featured = true,
      updated_at = NOW()
    WHERE user_id = NEW.id;
    
    -- Eğer writer_profiles kaydı yoksa oluştur
    INSERT INTO writer_profiles (
      name,
      title,
      bio,
      location,
      is_featured,
      user_id,
      created_at,
      updated_at
    )
    SELECT 
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || 
      COALESCE(NEW.raw_user_meta_data->>'last_name', '') as name,
      'Editör & Seyahat Yazarı' as title,
      '' as bio,
      '' as location,
      true as is_featured,
      NEW.id as user_id,
      NOW() as created_at,
      NOW() as updated_at
    WHERE NOT EXISTS (
      SELECT 1 FROM writer_profiles WHERE user_id = NEW.id
    );
    
    RAISE NOTICE 'Otomatik öne çıkarma: % kullanıcısı onaylandı ve öne çıkan yapıldı', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger oluştur
DROP TRIGGER IF EXISTS trigger_auto_featured_on_approval ON auth.users;
CREATE TRIGGER trigger_auto_featured_on_approval
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_featured_on_approval();

-- 6. Sonuçları kontrol et
SELECT 'Güncelleme Sonrası Öne Çıkan Yazarlar:' as info;
SELECT 
  wp.id, 
  wp.name, 
  wp.title, 
  wp.is_featured,
  au.email,
  au.raw_user_meta_data->>'user_role' as user_role,
  au.raw_user_meta_data->>'is_approved' as is_approved
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.is_featured = true
ORDER BY wp.created_at DESC;

-- 7. Toplam sayı
SELECT 'Toplam Öne Çıkan Yazar Sayısı:' as info;
SELECT COUNT(*) as featured_count
FROM writer_profiles
WHERE is_featured = true;

-- 8. Trigger'ın çalıştığını doğrula
SELECT 'Oluşturulan Trigger:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND trigger_name = 'trigger_auto_featured_on_approval';
