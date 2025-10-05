-- Kategori Güncellemesi
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut kategorileri sil (posts tablosundaki foreign key constraint nedeniyle dikkatli olmalıyız)
-- Öncelikle mevcut yazıları kontrol edin, varsa kategorilerini null yapın veya yeni kategorilere atayın

-- UYARI: Eğer mevcut yazılar varsa, önce onları yeni kategorilere atamalısınız!
-- Bu scripti çalıştırmadan önce posts tablosunu kontrol edin:
-- SELECT COUNT(*) FROM posts;

-- Mevcut kategorileri sil (sadece yazı yoksa güvenli)
DELETE FROM categories;

-- 2. Yeni kategorileri ekle
INSERT INTO categories (name, slug, description, color) VALUES
('Turizm Gündemi', 'turizm-gundemi', 'Güncel turizm haberleri ve gelişmeleri', '#3B82F6'),
('Yurt Dışı Haberleri', 'yurt-disi-haberleri', 'Dünya genelinden turizm haberleri', '#10B981'),
('Yurt İçi Haberleri', 'yurt-ici-haberleri', 'Türkiye turizm haberleri', '#F59E0B'),
('Sektörel Gelişmeler', 'sektorel-gelismeler', 'Turizm sektöründeki gelişmeler', '#EF4444'),
('Seyahat Rehberi', 'seyahat-rehberi', 'Seyahat ipuçları ve rehberleri', '#8B5CF6'),
('Vize ve Seyahat Belgeleri', 'vize-ve-seyahat-belgeleri', 'Vize ve belgeler hakkında bilgiler', '#06B6D4'),
('Ulaşım ve Havayolu Haberleri', 'ulasim-ve-havayolu-haberleri', 'Ulaşım ve havayolu gelişmeleri', '#F97316'),
('Etkinlik ve Festivaller', 'etkinlik-ve-festivaller', 'Etkinlik ve festival haberleri', '#84CC16'),
('Gastronomi ve Lezzet Rotaları', 'gastronomi-ve-lezzet-rotalari', 'Gastronomi turizmi ve yemek kültürü', '#EC4899'),
('Röportajlar ve Söyleşiler', 'roportajlar-ve-soylesiler', 'Sektör temsilcileri ile röportajlar', '#22C55E'),
('Sürdürülebilir ve Eko Turizm', 'surdurulebilir-ve-eko-turizm', 'Çevre dostu turizm haberleri', '#059669'),
('Kültür ve Miras', 'kultur-ve-miras', 'Kültürel turizm ve miras haberleri', '#7C3AED'),
('Teknoloji ve Seyahat', 'teknoloji-ve-seyahat', 'Turizm teknolojileri ve dijital gelişmeler', '#0F172A'),
('Kampanyalar ve Fırsatlar', 'kampanyalar-ve-firsatlar', 'Seyahat kampanyaları ve fırsat haberleri', '#DC2626'),
('Yol Günlükleri ve Blog', 'yol-gunlukleri-ve-blog', 'Kişisel seyahat deneyimleri ve blog yazıları', '#7E22CE');

-- 3. Kategorileri kontrol et
SELECT id, name, slug, color FROM categories ORDER BY name;

-- 4. Toplam kategori sayısını göster
SELECT COUNT(*) as toplam_kategori FROM categories; 