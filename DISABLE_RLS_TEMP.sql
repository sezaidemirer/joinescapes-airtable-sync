-- RLS'yi geçici olarak kapat (sadece posts tablosu için)

-- 1. RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 2. RLS'yi kapat
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 3. Kontrol: RLS kapalı mı?
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 4. Test: Admin artık düzenleyebilmeli
SELECT 'RLS KAPALI - Admin artık tüm yazıları düzenleyebilir!' as durum;
