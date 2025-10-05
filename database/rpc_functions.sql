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