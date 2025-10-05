-- net extension'ını aktif et (HTTP istekleri için gerekli)

-- 1. net extension'ını aktif et
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Kontrol et
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'http';

-- 3. Test: Basit HTTP isteği
SELECT http_get('https://httpbin.org/get');
