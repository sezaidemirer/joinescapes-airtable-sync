-- Writer profiles için storage bucket ve policies
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Storage bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'writer-profiles',
    'writer-profiles', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies oluştur
-- Herkes profil resimlerini görebilir
CREATE POLICY "Writer profile images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'writer-profiles');

-- Authenticated kullanıcılar kendi profil resimlerini yükleyebilir
CREATE POLICY "Users can upload their own writer profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'writer-profiles' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'writer-profiles'
    );

-- Kullanıcılar kendi profil resimlerini güncelleyebilir
CREATE POLICY "Users can update their own writer profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'writer-profiles' 
        AND auth.role() = 'authenticated'
    );

-- Kullanıcılar kendi profil resimlerini silebilir
CREATE POLICY "Users can delete their own writer profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'writer-profiles' 
        AND auth.role() = 'authenticated'
    );

-- 3. Bucket'ın oluşturulduğunu kontrol et
SELECT * FROM storage.buckets WHERE id = 'writer-profiles';

