-- Test Script - Yeni Kullanıcı Akışı
-- Doğrulama ve test için

-- 1. RLS durumunu kontrol et
SELECT 
    'RLS DURUMU' as test_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;

-- 2. Policy'leri kontrol et
SELECT 
    'POLİTİKALAR' as test_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename, policyname;

-- 3. Fonksiyonları kontrol et
SELECT 
    'FONKSİYONLAR' as test_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('save_writer_profile', 'approve_writer', 'approve_editor_admin', 'handle_new_user')
ORDER BY routine_name;

-- 4. Trigger'ı kontrol et
SELECT 
    'TRIGGER DURUMU' as test_type,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'on_auth_user_created';

-- 5. Gulbahar Semra test
SELECT 
    'GULBAHAR TEST' as test_type,
    u.email,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'editor_approved' as editor_approved,
    u.raw_user_meta_data->>'is_approved' as is_approved,
    p.user_id IS NOT NULL as has_profile,
    p.name as writer_name,
    p.title as writer_title,
    p.is_featured
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.email = 'gulbahar.semra@hotmail.com';

-- 6. Tüm editörleri kontrol et
SELECT 
    'TÜM EDİTÖRLER' as test_type,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    p.user_id IS NOT NULL as has_profile,
    p.is_featured,
    u.last_sign_in_at IS NOT NULL as has_logged_in
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'editor' 
   OR u.raw_user_meta_data->>'user_role' = 'editor'
   OR u.email = 'gulbahar.semra@hotmail.com'
ORDER BY u.created_at DESC;

-- 7. RLS Test - Gulbahar ile profil okuyabilir mi?
-- Bu test'i frontend'den yapacağız, burada sadece hazırlık
SELECT 
    'RLS TEST HAZIRLIK' as test_type,
    'Gulbahar ile giriş yap ve aşağıdaki query çalıştır:' as instruction,
    'SELECT * FROM public.writer_profiles WHERE user_id = auth.uid();' as test_query;
