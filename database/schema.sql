-- Blog CMS Database Schema
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Blog yazıları tablosu
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(100),
    category_id BIGINT REFERENCES categories(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 0, -- dakika cinsinden
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[], -- PostgreSQL array
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medya dosyaları tablosu
CREATE TABLE IF NOT EXISTS media (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. İndexler oluştur
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 5. RLS (Row Level Security) politikaları
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Kategoriler - herkes okuyabilir, sadece admin ekleyebilir
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Posts - yayınlanan yazılar herkes tarafından okunabilir
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Authors can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- Media - authenticated users can manage their own media
CREATE POLICY "Users can view all media" ON media
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own media" ON media
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own media" ON media
    FOR DELETE USING (auth.uid() = uploaded_by);

-- 6. Trigger'lar - otomatik updated_at güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Başlangıç kategorileri
INSERT INTO categories (name, slug, description, color) VALUES
('Sektör Haberleri', 'sektor-haberleri', 'Turizm sektöründen güncel haberler', '#3B82F6'),
('Şirket Haberleri', 'sirket-haberleri', 'Turizm şirketlerinden haberler', '#10B981'),
('Tur Operatörleri', 'tur-operatorleri', 'Tur operatörleri haberleri', '#F59E0B'),
('Turizm İstatistikleri', 'turizm-istatistikleri', 'Turizm istatistik ve analizleri', '#EF4444'),
('Otel Yatırımları', 'otel-yatirimlari', 'Otel sektörü yatırım haberleri', '#8B5CF6'),
('Havacılık', 'havacilik', 'Havayolu ve havacılık haberleri', '#06B6D4'),
('Güvenlik', 'guvenlik', 'Turizm güvenlik haberleri', '#F97316'),
('Marina Haberleri', 'marina-haberleri', 'Marina ve yat turizmi haberleri', '#84CC16'),
('Havayolu Haberleri', 'havayolu-haberleri', 'Havayolu şirketleri haberleri', '#EC4899'),
('Doğal Güzellikler', 'dogal-guzellikler', 'Doğal turizm alanları haberleri', '#22C55E')
ON CONFLICT (slug) DO NOTHING;

-- 8. View'lar - kolay veri çekimi için
CREATE OR REPLACE VIEW posts_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id;

-- 9. Storage bucket oluştur (Supabase Storage için)
-- Bu komut Supabase dashboard'dan manuel olarak çalıştırılabilir
/*
-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-images',
    'blog-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policy for blog images
CREATE POLICY "Blog images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own blog images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own blog images" ON storage.objects
    FOR DELETE USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);
*/ 

-- RPC Functions for Blog System
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Post views artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_post_views(post_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Post likes artırma fonksiyonu  
CREATE OR REPLACE FUNCTION increment_post_likes(post_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql; 