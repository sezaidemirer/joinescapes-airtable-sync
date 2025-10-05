-- Silinen kullanıcıları kontrol et ve gerekirse tamamen temizle
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. auth.users tablosundaki tüm kullanıcıları göster (silinmiş olanlar dahil)
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_role' as user_role,
    email_confirmed_at,
    deleted_at,
    created_at,
    CASE 
        WHEN deleted_at IS NOT NULL THEN '🗑️ SİLİNMİŞ'
        ELSE '✅ AKTİF'
    END as durum
FROM auth.users
ORDER BY created_at DESC;

-- 2. Yalnız kalmış writer_profiles (user'ı silinmiş ama profile kalmış)
SELECT 
    wp.id,
    wp.email,
    wp.name,
    wp.user_id,
    wp.created_at,
    '⚠️ YALNIZ PROFILE - User yok!' as problem
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE au.id IS NULL;

-- 3. Yalnız writer_profiles'ları temizle
DELETE FROM writer_profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 4. Belirli bir email için tüm izleri temizle (örnek)
-- NOT: Bu kısmı çalıştırmadan önce email'i değiştir!
-- DELETE FROM auth.users WHERE email = 'silinecek@email.com';
-- DELETE FROM writer_profiles WHERE email = 'silinecek@email.com';

-- 5. Kontrol: Temizlik sonrası durum
SELECT 
    'auth.users' as tablo,
    COUNT(*) as toplam_kayit,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as silinmis_kayit
FROM auth.users
UNION ALL
SELECT 
    'writer_profiles' as tablo,
    COUNT(*) as toplam_kayit,
    0 as silinmis_kayit
FROM writer_profiles;

-- 6. Email tekrar kullanılabilir mi? (Supabase otomatik kontrol eder)
-- Eğer bir email'i tekrar kullanmak istiyorsan, önce eski kaydı TAMAMEN sil:
-- 
-- DELETE FROM auth.users WHERE email = 'tekrar_kullanilacak@email.com';
--
-- Sonra yeni kayıt oluşturabilirsin. Cache problemi olmaz.

