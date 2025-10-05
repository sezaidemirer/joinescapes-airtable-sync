-- Debug Login Issue - Giriş Sorununu Analiz Et
-- Hangi kullanıcı ile test ediyorsun?

-- 1. Test kullanıcısını belirt
-- Aşağıdaki email'i değiştir:
-- gulbahar.semra@hotmail.com
-- demirersezai@gmail.com
-- veya başka bir kullanıcı

-- 2. Kullanıcı durumunu kontrol et
SELECT 
    'KULLANICI DURUMU' as test_type,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    u.confirmed_at,
    u.banned_until,
    u.email_change_confirm_status,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'editor_approved' as editor_approved,
    u.raw_user_meta_data->>'is_approved' as is_approved,
    u.raw_user_meta_data->>'first_name' as first_name,
    u.raw_user_meta_data->>'last_name' as last_name,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'author_name' as author_name
FROM auth.users u
WHERE u.email = 'gulbahar.semra@hotmail.com'  -- BU EMAIL'I DEĞİŞTİR
ORDER BY u.created_at DESC;

-- 3. Writer profile durumunu kontrol et
SELECT 
    'WRITER PROFILE DURUMU' as test_type,
    p.user_id,
    p.name,
    p.email,
    p.title,
    p.is_featured,
    p.created_at,
    p.updated_at
FROM public.writer_profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email = 'gulbahar.semra@hotmail.com'  -- BU EMAIL'I DEĞİŞTİR;

-- 4. RLS Policy durumunu kontrol et
SELECT 
    'RLS POLICY DURUMU' as test_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename, policyname;

-- 5. RLS aktif mi kontrol et
SELECT 
    'RLS AKTİF Mİ' as test_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;

-- 6. Fonksiyon durumunu kontrol et
SELECT 
    'FONKSİYON DURUMU' as test_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('save_writer_profile', 'approve_writer', 'approve_editor_admin', 'handle_new_user')
ORDER BY routine_name;

-- 7. Tüm editörleri listele
SELECT 
    'TÜM EDİTÖRLER' as test_type,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'editor_approved' as editor_approved,
    u.raw_user_meta_data->>'is_approved' as is_approved,
    p.user_id IS NOT NULL as has_profile,
    p.is_featured,
    u.last_sign_in_at IS NOT NULL as has_logged_in
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'editor' 
   OR u.raw_user_meta_data->>'user_role' = 'editor'
   OR u.email LIKE '%@%'  -- Tüm kullanıcıları göster
ORDER BY u.created_at DESC;
