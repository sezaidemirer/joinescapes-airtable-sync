-- Lifestyle Kategorisi Rengini Pembe Yap
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce lifestyle kategorisini kontrol et
SELECT id, name, slug, color FROM categories WHERE slug = 'lifestyle';

-- 2. Lifestyle kategorisinin rengini pembe yap
UPDATE categories 
SET color = '#EC4899' 
WHERE slug = 'lifestyle';

-- 3. Güncellemeyi kontrol et
SELECT id, name, slug, color FROM categories WHERE slug = 'lifestyle';

-- 4. Tüm kategorileri listele (kontrol için)
SELECT id, name, slug, color FROM categories ORDER BY name;
