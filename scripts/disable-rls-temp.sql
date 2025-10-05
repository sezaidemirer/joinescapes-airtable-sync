-- RLS'yi geçici olarak devre dışı bırak (TEST İÇİN)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Test sonrası tekrar aktif etmek için:
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
