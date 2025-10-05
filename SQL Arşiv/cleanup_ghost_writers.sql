-- Hayalet yazarları temizle (auth.users'ta olmayan ama writer_profiles'ta olan yazarlar)
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce hayalet yazarları tespit et
SELECT 'Hayalet yazarlar (auth.users tablosunda olmayan):' as info;
SELECT wp.id, wp.name, wp.title, wp.user_id, wp.created_at
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE au.id IS NULL;

-- 2. Hayalet yazarların sayısını göster
SELECT 'Hayalet yazar sayısı:' as info;
SELECT COUNT(*) as ghost_count
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE au.id IS NULL;

-- 3. HAYALET YAZARLARI SİL (DİKKAT: Bu işlem geri alınamaz!)
DELETE FROM writer_profiles 
WHERE user_id IN (
  SELECT wp.user_id 
  FROM writer_profiles wp
  LEFT JOIN auth.users au ON wp.user_id = au.id
  WHERE au.id IS NULL
  AND wp.user_id IS NOT NULL
);

-- 4. user_id'si NULL olan yazarları da sil (opsiyonel)
DELETE FROM writer_profiles 
WHERE user_id IS NULL;

-- 5. Temizlik sonrası kontrol
SELECT 'Temizlik sonrası kalan yazarlar:' as info;
SELECT wp.id, wp.name, wp.title, wp.user_id, au.email
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
ORDER BY wp.created_at DESC;

-- 6. Toplam yazar sayısı
SELECT 'Toplam yazar sayısı:' as info;
SELECT COUNT(*) as total_writers FROM writer_profiles;
