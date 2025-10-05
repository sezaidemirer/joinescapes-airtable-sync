-- Çalışan Kullanıcı Yapısını Kopyala
-- demirersezai@gmail.com'un yapısını diğer kullanıcılara uygula

-- 1. demirersezai@gmail.com'un yapısını analiz et
SELECT 
    'ÇALIŞAN KULLANICI ANALİZİ' as test_type,
    u.email,
    u.raw_user_meta_data,
    p.*
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.email = 'demirersezai@gmail.com';

-- 2. Tüm kullanıcıları demirersezai@gmail.com'un yapısına getir
-- Sadece RLS ve yapıyı düzelt, isimleri değiştirme
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'editor',
    'user_role', 'editor',
    'editor_approved', 'true',
    'is_approved', 'true',
    'email_confirmed', true
)
WHERE email != 'demirersezai@gmail.com'  -- Çalışan kullanıcıyı bozma
AND email IS NOT NULL;

-- 3. Writer profiles'ları oluştur/güncelle
-- Sadece eksik olanları oluştur, mevcut isimleri değiştirme
INSERT INTO public.writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'first_name',
        u.raw_user_meta_data->>'author_name',
        split_part(u.email, '@', 1)
    ),
    u.email,
    'Yazar',
    CASE 
        WHEN u.raw_user_meta_data->>'editor_approved' = 'true' THEN true 
        ELSE false 
    END
FROM auth.users u
WHERE u.email != 'demirersezai@gmail.com'  -- Çalışan kullanıcıyı bozma
AND u.email IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.writer_profiles wp WHERE wp.user_id = u.id)
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    title = EXCLUDED.title,
    is_featured = EXCLUDED.is_featured;

-- 4. Sonuçları kontrol et
SELECT 
    'SONUÇ KONTROL' as test_type,
    u.email,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'editor_approved' as editor_approved,
    u.raw_user_meta_data->>'is_approved' as is_approved,
    u.raw_user_meta_data->>'full_name' as full_name,
    p.user_id IS NOT NULL as has_profile,
    p.name as writer_name,
    p.title as writer_title,
    p.is_featured
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.email IS NOT NULL
ORDER BY u.created_at DESC;
