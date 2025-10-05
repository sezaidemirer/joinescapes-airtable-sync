-- Test kullanıcılarını temizle - SADECE GEREKLİ OLANLARI TUT

-- 1. Önce tüm kullanıcıları listele (kontrol için)
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_role' as role,
    raw_user_meta_data->>'full_name' as full_name,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Test kullanıcıları belirle (GEREKLİ OLANLAR HARİÇ)
-- TUTULACAKLAR: test@test.com (admin), gerçek yazarlar
-- SİLİNECEKLER: test, sezai, admin gibi test hesapları

-- 3. Önce writer_profiles tablosunda yazı yazan gerçek yazarları kontrol et
SELECT DISTINCT 
    wp.email,
    wp.name,
    COUNT(p.id) as yazi_sayisi
FROM writer_profiles wp
LEFT JOIN posts p ON p.author_name = wp.name
WHERE wp.email IS NOT NULL
GROUP BY wp.email, wp.name
ORDER BY yazi_sayisi DESC;

-- 4. TEST KULLANICILARI SİL (DİKKATLİ!)
-- NOT: Aşağıdaki satırları çalıştırmadan önce yukarıdaki sorguları kontrol et!

-- Silinecek test email'leri (SADECE TEST AMAÇLI OLUŞTURULANLAR)
DELETE FROM auth.users
WHERE email IN (
    'fulyaargun@test.com',
    'sezaidemirer@test.com', 
    'test123@test.com',
    'admin@test.com',
    'yazar@test.com',
    'editor@test.com',
    'a.sacli82@gmail.com' -- Eğer test ise
)
AND email != 'test@test.com'; -- Admin hesabı ASLA SİLİNMESİN!

-- 5. Veya daha güvenli: Sadece belirli test pattern'lerine uyan kullanıcıları sil
-- DELETE FROM auth.users
-- WHERE (
--     email LIKE '%@test.com' 
--     OR email LIKE 'test%'
-- )
-- AND email NOT IN (
--     'test@test.com', -- Admin
--     'test@test1.com' -- Varsa gerçek hesaplar
-- );

-- 6. Temizlik sonrası kalan kullanıcıları göster
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_role' as role,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 7. Writer profiles'da kullanıcısı olmayan profilleri temizle (opsiyonel)
-- DELETE FROM writer_profiles
-- WHERE user_id IS NULL 
-- OR user_id NOT IN (SELECT id FROM auth.users);

