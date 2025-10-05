-- Yazar profilleri tablosu
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Writer profiles tablosu oluştur
CREATE TABLE IF NOT EXISTS writer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    specialties TEXT[], -- PostgreSQL array
    social_media JSONB DEFAULT '{}', -- Instagram, Twitter, Blog links
    profile_image TEXT,
    followers_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_writer_profiles_user_id ON writer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_writer_profiles_name ON writer_profiles(name);

-- 3. RLS (Row Level Security) etkinleştir
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS politikaları
-- Herkes yazar profillerini okuyabilir
CREATE POLICY "Writer profiles are viewable by everyone" ON writer_profiles
    FOR SELECT USING (true);

-- Sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update their own writer profile" ON writer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Sadece kendi profilini oluşturabilir
CREATE POLICY "Users can insert their own writer profile" ON writer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sadece kendi profilini silebilir
CREATE POLICY "Users can delete their own writer profile" ON writer_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger - otomatik updated_at güncellemesi
CREATE OR REPLACE FUNCTION update_writer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_writer_profiles_updated_at 
    BEFORE UPDATE ON writer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_writer_profiles_updated_at();

-- 6. Örnek veri (Beste için)
INSERT INTO writer_profiles (
    user_id, 
    name, 
    title, 
    bio, 
    location, 
    specialties, 
    social_media,
    profile_image,
    followers_count,
    posts_count
) VALUES (
    (SELECT id FROM auth.users WHERE email LIKE '%beste%' LIMIT 1), -- Beste'nin user_id'si
    'Beste',
    'Editör & Seyahat Yazarı',
    'Deneyimli editör ve seyahat yazarı. JoinEscapes platformunda kaliteli içerikler üretiyor. Özellikle kültürel seyahatler ve yerel deneyimler konusunda uzman. Okuyucularına özgün bakış açıları sunuyor.',
    'İstanbul, Türkiye',
    ARRAY['İçerik Editörlüğü', 'Kültürel Turlar', 'Yerel Deneyimler'],
    '{"instagram": "@beste_travels", "twitter": "@beste_editor", "blog": ""}',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    8500,
    89
) ON CONFLICT (user_id) DO NOTHING;

