-- Trigger'ın durumunu kontrol et

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
ORDER BY trigger_name;
