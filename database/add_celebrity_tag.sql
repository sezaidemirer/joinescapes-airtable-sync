-- Celebrity Etiketini Ekle
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Celebrity etiketini ekle
INSERT INTO tags (name, slug, description, color, is_featured) VALUES
('Celebrity', 'celebrity', 'Celebrity destinasyon rehberleri ve ünlü seyahat önerileri', '#FF6B6B', true)
ON CONFLICT (slug) DO NOTHING;

-- Kontrol et
SELECT id, name, slug, color, is_featured FROM tags WHERE slug = 'celebrity'; 