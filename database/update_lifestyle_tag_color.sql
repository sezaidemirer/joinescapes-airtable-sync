-- Lifestyle Etiketi Rengini Pembe Yap
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce lifestyle etiketini kontrol et
SELECT id, name, slug, color FROM tags WHERE slug = 'lifestyle';

-- 2. Lifestyle etiketinin rengini pembe yap
UPDATE tags 
SET color = '#EC4899' 
WHERE slug = 'lifestyle';

-- 3. Güncellemeyi kontrol et
SELECT id, name, slug, color FROM tags WHERE slug = 'lifestyle';

-- 4. Tüm etiketleri listele (kontrol için)
SELECT id, name, slug, color FROM tags ORDER BY name;
