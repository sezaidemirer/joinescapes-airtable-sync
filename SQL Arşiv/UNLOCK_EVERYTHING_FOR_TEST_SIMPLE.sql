-- ACİL DURUM TESTİ (BÖLÜM 1): TÜM KİLİTLERİ AÇ (BASİT VERSİYON)
-- AMAÇ: Supabase'in dahili 'authenticator' rolüne geçici olarak tüm yetkileri vererek,
-- sorunun bir RLS/yetki kısıtlamasından kaynaklanıp kaynaklanmadığını kesin olarak teşhis etmek.

-- UYARI: BU SCRİPT SADECE TEST AMAÇLIDIR VE SİSTEMİ GEÇİCİ OLARAK GÜVENSİZ HALE GETİRİR.
-- TEST BİTTİKTEN HEMEN SONRA 'RELOCK_EVERYTHING_AFTER_TEST_SIMPLE.sql' ÇALIŞTIRILMALIDIR.

BEGIN;

-- Adım 1: 'authenticator' rolüne 'writer_profiles' tablosunda tam yetki ver.
GRANT ALL ON TABLE public.writer_profiles TO authenticator;

-- Adım 2: 'authenticator' rolüne 'posts' tablosunda tam yetki ver.
GRANT ALL ON TABLE public.posts TO authenticator;

-- Adım 3: 'authenticator' rolüne tüm public fonksiyonları kullanma yetkisi ver.
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticator;

COMMIT;

-- BİLGİ: Yetkiler verildi. ŞİMDİ GİRİŞ YAPMAYI DENE.
