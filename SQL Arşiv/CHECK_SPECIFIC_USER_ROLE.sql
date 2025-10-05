-- demirersezai@gmail.com kullanıcısının rolünü kontrol et

SELECT 
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.raw_user_meta_data->>'firstName' as first_name,
    au.raw_user_meta_data->>'lastName' as last_name,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    CASE 
        WHEN wp.id IS NOT NULL THEN '✅ Writer Profile VAR'
        ELSE '❌ Writer Profile YOK'
    END as writer_profile_durumu,
    wp.name as writer_name,
    wp.slug as writer_slug
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'demirersezai@gmail.com';

