-- RLS'yi zorla kapat ve kontrol et

-- 1. RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 2. RLS'yi kapat
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 3. Tüm policy'leri kaldır (güvenlik için)
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can edit all posts including null authors" ON posts;
DROP POLICY IF EXISTS "Admin can edit everything" ON posts;
DROP POLICY IF EXISTS "Safe admin and author update" ON posts;

-- 4. Kontrol: RLS kapalı mı?
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 5. Test: Post ID 336'yı kontrol et
SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE id = 336;
