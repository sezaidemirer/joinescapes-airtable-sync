-- Fulya Argun kullanıcısını kontrol et
-- Editor paneline erişim için gerekli kontroller

-- 1. Kullanıcı bilgileri
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data->>'user_role' as user_role,
    raw_user_meta_data->>'editor_approved' as editor_approved,
    raw_user_meta_data->>'firstName' as first_name,
    raw_user_meta_data->>'lastName' as last_name,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'fufuargn@gmail.com';

-- 2. Writer profili var mı?
SELECT 
    id,
    user_id,
    name,
    slug,
    email,
    is_approved,
    created_at
FROM writer_profiles
WHERE email = 'fufuargn@gmail.com';

-- 3. SORUN: editor_approved meta_data'da FALSE olabilir!
-- Çözüm: editor_approved'ı TRUE yap

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data::jsonb,
    '{editor_approved}',
    'true'
)
WHERE email = 'fufuargn@gmail.com';

-- 4. Writer profile'da is_approved'ı TRUE yap
UPDATE writer_profiles
SET is_approved = true
WHERE email = 'fufuargn@gmail.com';

-- 5. Kontrol: Artık erişebilmeli
SELECT 
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    wp.is_approved as profile_approved,
    '✅ ARTIK ERİŞEBİLİR!' as durum
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'fufuargn@gmail.com';

