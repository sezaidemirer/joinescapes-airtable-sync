-- Trigger fonksiyonunun kodunu göster

SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc
WHERE proname = 'trigger_update_airtable';

