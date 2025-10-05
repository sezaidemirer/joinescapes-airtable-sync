-- Post 336'yı direkt güncelle (test)

-- 1. Mevcut durum
SELECT id, title, author_name, status
FROM posts
WHERE id = 336;

-- 2. Direkt UPDATE yap
UPDATE posts
SET title = 'TEST: İzlanda Yazısı Güncellendi'
WHERE id = 336;

-- 3. Güncellenmiş durum
SELECT id, title, author_name, status
FROM posts
WHERE id = 336;
