-- SADECE ADMIN İÇİN: RLS'yi kapat (güvenlik admin panelinde)

-- 1. Mevcut RLS durumu
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 2. TÜM UPDATE policy'lerini kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can edit all posts including null authors" ON posts;
DROP POLICY IF EXISTS "Admin can edit everything" ON posts;
DROP POLICY IF EXISTS "Safe admin and author update" ON posts;

-- 3. RLS'yi kapat
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 4. Kontrol: RLS kapalı mı?
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 5. Test: Admin artık her şeyi düzenleyebilir
SELECT 'RLS KAPALI - Admin artık tüm yazıları düzenleyebilir!' as durum;
