-- Logo için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets', 
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Storage policies ekle
CREATE POLICY "Allow public access to assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "Allow authenticated users to upload assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
