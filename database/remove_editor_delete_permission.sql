-- Editörlerin yazı silme yetkisini kaldır
-- Sadece adminler yazı silebilir

-- Mevcut delete policy'sini kaldır
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;

-- Yeni delete policy - sadece admin ve supervisor silebilir
CREATE POLICY "Only admins can delete posts" ON posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'user_role' IN ('admin', 'supervisor')
        )
    );

-- Mevcut policy'leri kontrol et
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'posts' 
ORDER BY cmd, policyname;

