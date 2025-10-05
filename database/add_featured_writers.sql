-- Öne çıkan yazarlar için is_featured kolonu ekleme
-- Bu kolonu writer_profiles tablosuna ekleyeceğiz

-- is_featured kolonu ekle (varsayılan false)
ALTER TABLE writer_profiles 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- İndeks ekle performans için
CREATE INDEX idx_writer_profiles_featured ON writer_profiles(is_featured) WHERE is_featured = TRUE;

-- Mevcut yazarlardan birkaçını örnek olarak featured yap (isteğe bağlı)
-- Bu kısmı çalıştırmak zorunda değilsin, sadece test için
/*
UPDATE writer_profiles 
SET is_featured = TRUE 
WHERE user_id IN (
    SELECT user_id 
    FROM writer_profiles 
    ORDER BY created_at ASC 
    LIMIT 6
);
*/

-- Kontrol sorgusu
-- SELECT name, title, is_featured FROM writer_profiles WHERE is_featured = TRUE;
