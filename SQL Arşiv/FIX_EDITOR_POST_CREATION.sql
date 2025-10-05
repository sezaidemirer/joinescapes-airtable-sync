-- Editörlerin yazı oluşturma sorunu için RLS düzeltmesi
-- Bu script editörlerin posts tablosuna INSERT yapabilmesini sağlar

-- Önce mevcut INSERT policy'lerini kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'posts' AND cmd = 'INSERT';

-- Mevcut INSERT policy'lerini sil
DROP POLICY IF EXISTS "allow_authenticated_insert_own_posts" ON posts;
DROP POLICY IF EXISTS "editors_can_create_posts" ON posts;
DROP POLICY IF EXISTS "Authenticated can create posts" ON posts;

-- Yeni, basit ve etkili INSERT policy oluştur
CREATE POLICY "allow_authenticated_users_insert_posts" ON posts
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy'nin oluşturulduğunu doğrula
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'posts' AND cmd = 'INSERT';

-- Test için mevcut kullanıcıların rollerini kontrol et
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved
FROM auth.users au
WHERE au.email = 'sezaidemirer@icloud.com' OR au.email = 'mark.zak@example.com'
ORDER BY au.created_at DESC;
