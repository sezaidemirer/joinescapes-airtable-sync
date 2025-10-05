-- Etiket Sistemi
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Etiketler tablosu oluştur
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Post-Tag ilişki tablosu (many-to-many)
CREATE TABLE IF NOT EXISTS post_tags (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, tag_id)
);

-- 3. İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_featured ON tags(is_featured);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- 4. RLS politikaları
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Tags - herkes okuyabilir, sadmin admin ekleyebilir
CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage tags" ON tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Post-Tags - ilişkiler
CREATE POLICY "Post tags are viewable by everyone" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage post tags" ON post_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Trigger - etiket kullanım sayısını güncelle
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage
    AFTER INSERT OR DELETE ON post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- 6. Özel etiketleri ekle
INSERT INTO tags (name, slug, description, color, is_featured) VALUES
('Ana Sayfa', 'main', 'Ana sayfada gösterilecek içerikler', '#3B82F6', true),
('En Çok Okunan', 'encokokunan', 'En çok okunan yazılar', '#EF4444', true),
('Bunları Okudunuz mu?', 'bunlariokudunuzmu', 'Önerilen okuma listesi', '#F59E0B', true),
('Öneri', 'oneri', 'Seyahat önerileri ve ipuçları', '#8B5CF6', true),
('Seçkin Oteller', 'seckinoteller', 'Premium otel önerileri', '#8B5CF6', true),
('Ucuzcular Rotaları', 'ucuzucusrotalari', 'Bütçe dostu seyahat rotaları', '#10B981', true),
('Gurme Rotaları', 'gurmerotalari', 'Gastronomi odaklı seyahatler', '#EC4899', true),
('Vizesiz Rotalar', 'vizesizrotalar', 'Vize gerektirmeyen destinasyonlar', '#06B6D4', true),
('Cruise Rotaları', 'cruiserotalari', 'Cruise gemi turları', '#84CC16', true),
('Bireysel Gezginler', 'bireyselgezginler', 'Solo travelers için içerikler', '#F97316', true),
('Çiftler İçin Özel Rotalar', 'ciftlericinozelrotalar', 'Romantik seyahat önerileri', '#DC2626', true),
('Celebrity', 'celebrity', 'Ünlülerin tercih ettiği destinasyonlar', '#9333EA', true),
('Şehir Molaları', 'sehir-molalari', 'Şehir gezileri ve kısa molalar', '#3B82F6', true),
('Lüks Seçkiler', 'luks-seckiler', 'Lüks seyahat deneyimleri ve premium oteller', '#D946EF', true),
('Spa Molaları', 'spa-molalari', 'Wellness ve spa odaklı seyahatler', '#06B6D4', true),
('Yaz 2025', 'yaz-2025', '2025 yaz sezonu özel destinasyonları', '#F59E0B', true),
('Butik Oteller', 'butik-oteller', 'Özel ve butik otel önerileri', '#8B5CF6', true),
('Paket Tatiller', 'paket-tatiller', 'Hazır paket tur ve tatil önerileri', '#10B981', true)
ON CONFLICT (slug) DO NOTHING;

-- 7. View - posts ile etiketleri birleştir
CREATE OR REPLACE VIEW posts_with_tags AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    COALESCE(
        ARRAY_AGG(
            JSON_BUILD_OBJECT(
                'id', t.id,
                'name', t.name,
                'slug', t.slug,
                'color', t.color,
                'is_featured', t.is_featured
            )
        ) FILTER (WHERE t.id IS NOT NULL), 
        ARRAY[]::json[]
    ) as tag_objects
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image_url, p.author_id, p.author_name, p.category_id, p.status, p.views, p.likes, p.read_time, p.meta_title, p.meta_description, p.tags, p.published_at, p.created_at, p.updated_at, c.name, c.slug, c.color;

-- 8. Etiket yönetimi için RPC fonksiyonları

-- Post'a etiket ekle
CREATE OR REPLACE FUNCTION add_tag_to_post(post_id BIGINT, tag_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    tag_record tags%ROWTYPE;
BEGIN
    -- Etiketi bul
    SELECT * INTO tag_record FROM tags WHERE slug = tag_slug;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- İlişki ekle (UNIQUE constraint sayesinde duplicate olmaz)
    INSERT INTO post_tags (post_id, tag_id) 
    VALUES (post_id, tag_record.id)
    ON CONFLICT (post_id, tag_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Post'tan etiket kaldır
CREATE OR REPLACE FUNCTION remove_tag_from_post(post_id BIGINT, tag_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    tag_record tags%ROWTYPE;
BEGIN
    -- Etiketi bul
    SELECT * INTO tag_record FROM tags WHERE slug = tag_slug;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- İlişki sil
    DELETE FROM post_tags 
    WHERE post_id = remove_tag_from_post.post_id AND tag_id = tag_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Etiketlere göre post getir
CREATE OR REPLACE FUNCTION get_posts_by_tag(tag_slug TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    post_id BIGINT,
    title VARCHAR(255),
    slug VARCHAR(255),
    excerpt TEXT,
    featured_image_url TEXT,
    category_name VARCHAR(100),
    category_slug VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featured_image_url,
        c.name,
        c.slug,
        p.published_at
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.slug = tag_slug
    AND p.status = 'published'
    ORDER BY p.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Kontrol sorguları
SELECT 'Etiketler:' as info;
SELECT id, name, slug, color, is_featured, usage_count FROM tags ORDER BY name;

SELECT 'Toplam etiket sayısı:' as info;
SELECT COUNT(*) as toplam_etiket FROM tags; 