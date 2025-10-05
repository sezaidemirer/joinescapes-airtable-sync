-- Kullanıcı Özellikleri - Favoriler ve Playlist Sistemi
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Kullanıcı Favorileri Tablosu
CREATE TABLE IF NOT EXISTS user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id) -- Bir kullanıcı aynı yazıyı sadece bir kez favorilere ekleyebilir
);

-- 2. Kullanıcı Playlistleri Tablosu
CREATE TABLE IF NOT EXISTS user_playlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Playlist Postları Tablosu (Many-to-Many)
CREATE TABLE IF NOT EXISTS playlist_posts (
    id BIGSERIAL PRIMARY KEY,
    playlist_id BIGINT REFERENCES user_playlists(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, post_id) -- Aynı yazı aynı playlistte sadece bir kez olabilir
);

-- 4. İndexler
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_post_id ON user_favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_created_at ON user_playlists(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_playlist_posts_playlist_id ON playlist_posts(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_posts_post_id ON playlist_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_playlist_posts_created_at ON playlist_posts(created_at DESC);

-- 5. RLS (Row Level Security) Politikaları
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_posts ENABLE ROW LEVEL SECURITY;

-- Favoriler - kullanıcılar sadece kendi favorilerini görebilir/yönetebilir
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Playlistler - kullanıcılar sadece kendi playlistlerini görebilir/yönetebilir
CREATE POLICY "Users can view their own playlists" ON user_playlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" ON user_playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON user_playlists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON user_playlists
    FOR DELETE USING (auth.uid() = user_id);

-- Playlist Postları - kullanıcılar sadece kendi playlistlerindeki postları yönetebilir
CREATE POLICY "Users can view posts in their own playlists" ON playlist_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_playlists 
            WHERE user_playlists.id = playlist_posts.playlist_id 
            AND user_playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert posts to their own playlists" ON playlist_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_playlists 
            WHERE user_playlists.id = playlist_posts.playlist_id 
            AND user_playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete posts from their own playlists" ON playlist_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_playlists 
            WHERE user_playlists.id = playlist_posts.playlist_id 
            AND user_playlists.user_id = auth.uid()
        )
    );

-- 6. Trigger'lar
CREATE TRIGGER update_user_playlists_updated_at BEFORE UPDATE ON user_playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RPC Fonksiyonları

-- Favorilere ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_to_favorites(user_uuid UUID, post_id_param BIGINT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Favorilere ekle
    INSERT INTO user_favorites (user_id, post_id)
    VALUES (user_uuid, post_id_param)
    ON CONFLICT (user_id, post_id) DO NOTHING;
    
    -- Sonucu döndür
    SELECT json_build_object(
        'success', true,
        'message', 'Favorilere eklendi'
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Hata: ' || SQLERRM
        ) INTO result;
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Favorilerden çıkarma fonksiyonu
CREATE OR REPLACE FUNCTION remove_from_favorites(user_uuid UUID, post_id_param BIGINT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Favorilerden çıkar
    DELETE FROM user_favorites 
    WHERE user_id = user_uuid AND post_id = post_id_param;
    
    -- Sonucu döndür
    SELECT json_build_object(
        'success', true,
        'message', 'Favorilerden çıkarıldı'
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Hata: ' || SQLERRM
        ) INTO result;
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Playlist'e ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_to_playlist(playlist_id_param BIGINT, post_id_param BIGINT)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_uuid UUID;
BEGIN
    -- Kullanıcı ID'sini al
    SELECT user_id INTO user_uuid FROM user_playlists WHERE id = playlist_id_param;
    
    -- Kullanıcı kontrolü
    IF user_uuid != auth.uid() THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Bu playliste erişim yetkiniz yok'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Playlist'e ekle
    INSERT INTO playlist_posts (playlist_id, post_id)
    VALUES (playlist_id_param, post_id_param)
    ON CONFLICT (playlist_id, post_id) DO NOTHING;
    
    -- Sonucu döndür
    SELECT json_build_object(
        'success', true,
        'message', 'Playlist\'e eklendi'
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Hata: ' || SQLERRM
        ) INTO result;
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Playlist'ten çıkarma fonksiyonu
CREATE OR REPLACE FUNCTION remove_from_playlist(playlist_id_param BIGINT, post_id_param BIGINT)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_uuid UUID;
BEGIN
    -- Kullanıcı ID'sini al
    SELECT user_id INTO user_uuid FROM user_playlists WHERE id = playlist_id_param;
    
    -- Kullanıcı kontrolü
    IF user_uuid != auth.uid() THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Bu playliste erişim yetkiniz yok'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Playlist'ten çıkar
    DELETE FROM playlist_posts 
    WHERE playlist_id = playlist_id_param AND post_id = post_id_param;
    
    -- Sonucu döndür
    SELECT json_build_object(
        'success', true,
        'message', 'Playlist\'ten çıkarıldı'
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Hata: ' || SQLERRM
        ) INTO result;
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının favori durumunu kontrol etme fonksiyonu
CREATE OR REPLACE FUNCTION is_favorite(user_uuid UUID, post_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_favorites 
        WHERE user_id = user_uuid AND post_id = post_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. View'lar - kolay veri çekimi için

-- Kullanıcı favorileri view'ı
CREATE OR REPLACE VIEW user_favorites_with_posts AS
SELECT 
    uf.*,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.created_at as post_created_at,
    c.name as category_name,
    c.slug as category_slug
FROM user_favorites uf
JOIN posts p ON uf.post_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published';

-- Kullanıcı playlistleri view'ı
CREATE OR REPLACE VIEW user_playlists_with_counts AS
SELECT 
    up.*,
    COUNT(pp.id) as post_count
FROM user_playlists up
LEFT JOIN playlist_posts pp ON up.id = pp.playlist_id
GROUP BY up.id, up.user_id, up.name, up.description, up.created_at, up.updated_at;

-- Playlist postları view'ı
CREATE OR REPLACE VIEW playlist_posts_with_details AS
SELECT 
    pp.*,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.created_at as post_created_at,
    c.name as category_name,
    c.slug as category_slug
FROM playlist_posts pp
JOIN posts p ON pp.post_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published';
