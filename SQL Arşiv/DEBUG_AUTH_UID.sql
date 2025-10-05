-- AUTH.UID() kontrolü
-- Bu SQL'i sezaidemirer@icloud.com ile giriş yaptıktan sonra çalıştır

SELECT 
    'AUTH.UID() Kontrolü' as test,
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    (SELECT id FROM auth.users WHERE email = 'sezaidemirer@icloud.com') as expected_user_id,
    auth.uid() = (SELECT id FROM auth.users WHERE email = 'sezaidemirer@icloud.com') as ids_match;

-- Kullanıcının rolünü kontrol et
SELECT 
    'Kullanıcı Rolü' as test,
    id,
    email,
    raw_user_meta_data->>'user_role' as user_role,
    raw_user_meta_data->>'editor_approved' as editor_approved
FROM auth.users
WHERE email = 'sezaidemirer@icloud.com';

-- Policy'lerin durumunu kontrol et
SELECT 
    'INSERT Policy' as test,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'posts' AND schemaname = 'public' AND cmd = 'INSERT';

