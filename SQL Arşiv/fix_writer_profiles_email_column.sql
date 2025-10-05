-- writer_profiles tablosuna email kolonu ekle ve düzelt
-- "Database error granting user" hatası için

-- 1. writer_profiles tablosunun mevcut yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'writer_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. email kolonu yoksa ekle
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Mevcut kayıtlar için email bilgisini auth.users'dan çek ve güncelle
UPDATE writer_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = writer_profiles.user_id
)
WHERE email IS NULL;

-- 4. Email kolonunu NOT NULL yap (isteğe bağlı)
-- ALTER TABLE writer_profiles ALTER COLUMN email SET NOT NULL;

-- 5. Email kolonu için index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_writer_profiles_email ON writer_profiles(email);

-- 6. Güncellenmiş writer_profiles yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'writer_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. gulbahar.semra@hotmail.com kullanıcısının durumunu kontrol et
SELECT 
    wp.user_id,
    wp.name,
    wp.email,
    wp.is_featured,
    au.email as auth_email,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE wp.email = 'gulbahar.semra@hotmail.com' 
OR au.email = 'gulbahar.semra@hotmail.com';
