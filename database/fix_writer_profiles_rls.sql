-- Writer profiles RLS policy'lerini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Users can insert their own writer profile" ON writer_profiles;
DROP POLICY IF EXISTS "Users can update their own writer profile" ON writer_profiles;

-- 2. Yeni policy'ler oluştur (daha basit)
-- INSERT policy - authenticated kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Authenticated users can insert writer profiles" ON writer_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE policy - authenticated kullanıcılar kendi profillerini güncelleyebilir  
CREATE POLICY "Authenticated users can update writer profiles" ON writer_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Geçici olarak RLS'i kapat (test için)
-- ALTER TABLE writer_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Policy'leri kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'writer_profiles';
