-- TÜM SLUG SORUNLARINI TEK SEFERDE ÇÖZ!

-- 1. Test/Admin hesaplarını writer_profiles'dan temizle
DELETE FROM writer_profiles WHERE email = 'test@test.com';
DELETE FROM writer_profiles WHERE email = 'sezaidemirer@icloud.com'; -- Duplicate Sezai

-- 2. Kalan yazarların slug'larını kontrol et ve düzelt
SELECT 
    id,
    name,
    slug,
    email,
    profile_image IS NOT NULL as has_photo
FROM writer_profiles
ORDER BY created_at;

-- 3. Profil fotoğrafı olan ama profili açılmayan yazar var mı?
SELECT 
    id,
    name,
    slug,
    email,
    '⚠️ FOTO VAR AMA SLUG BOŞ!' as problem
FROM writer_profiles
WHERE profile_image IS NOT NULL 
    AND profile_image != ''
    AND (slug IS NULL OR slug = '');

-- 4. Şimdi ana sayfayı test et - Join Community'de görünmesi gerekenler:
SELECT 
    id,
    name,
    slug,
    email,
    profile_image IS NOT NULL as has_photo,
    '✅ ANA SAYFADA GÖRÜNMELİ' as durum
FROM writer_profiles
WHERE email NOT IN ('test@test.com', 'admin@joinescapes.com')
ORDER BY created_at DESC;

