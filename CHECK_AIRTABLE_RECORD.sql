-- Airtable kaydını kontrol et
SELECT 
    id,
    title,
    airtable_record_id,
    updated_at,
    created_at
FROM posts 
WHERE airtable_record_id = 'recFTgpq208wd32dX'
   OR airtable_record_id = 'recytawMaeZOzbBed'
   OR airtable_record_id = 'recwWmbmtI3HC9lZS'
ORDER BY updated_at DESC;
