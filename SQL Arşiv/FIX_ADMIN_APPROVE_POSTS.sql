-- Admin'in tüm yazıları onaylayabilmesi (UPDATE edebilmesi) için RLS politikasını düzelt
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut UPDATE policy'lerini kontrol et
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'posts' AND cmd = 'UPDATE'
ORDER BY policyname;

-- 2. Mevcut "Authors can update their own posts" policy'sini kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;

-- 3. Yeni UPDATE policy oluştur - Hem yazarlar kendi yazılarını, hem de adminler/supervisörler tüm yazıları güncelleyebilir
CREATE POLICY "Authors and admins can update posts" ON posts
    FOR UPDATE USING (
        -- Kendi yazısını güncelleyebilir
        auth.uid() = author_id
        OR
        -- Admin veya supervisor tüm yazıları güncelleyebilir
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'user_role' IN ('admin', 'supervisor')
        )
    );

-- 4. Test: Admin olarak pending bir yazıyı published yap
-- (Bu sorguyu çalıştırmadan önce, admin olarak giriş yaptığınızdan emin olun)
-- Aşağıdaki sorguyu comment'ten çıkarıp ID'yi güncelleyerek test edebilirsiniz:
/*
UPDATE posts 
SET status = 'published', published_at = NOW() 
WHERE id = 319;  -- ID'yi pending olan bir yazının ID'si ile değiştirin
*/

-- 5. Tüm UPDATE policy'lerini kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'posts' AND cmd = 'UPDATE'
ORDER BY policyname;

-- 6. Pending yazıları göster (kontrol için)
SELECT 
    id,
    title,
    author_name,
    status,
    created_at
FROM posts
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

