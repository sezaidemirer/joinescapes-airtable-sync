-- posts tablosunun yapısını ve default değerlerini kontrol et

SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- Özellikle category_id'nin default değerini kontrol et!

