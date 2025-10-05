-- ACİL DURUM TESTİ (BÖLÜM 2): TÜM KİLİTLERİ GERİ KAPAT (BASİT VERSİYON)
-- AMAÇ: 'UNLOCK_EVERYTHING_FOR_TEST_SIMPLE.sql' ile verilen geniş yetkileri geri alarak sistemi tekrar güvenli hale getirmek.

-- BU SCRİPT, TEST İŞLEMİ BİTTİKTEN SONRA MUTLAKA ÇALIŞTIRILMALIDIR.

BEGIN;

-- Adım 1: 'authenticator' rolünden 'writer_profiles' tablosundaki tüm yetkileri geri al.
REVOKE ALL ON TABLE public.writer_profiles FROM authenticator;

-- Adım 2: 'authenticator' rolünden 'posts' tablosundaki tüm yetkileri geri al.
REVOKE ALL ON TABLE public.posts FROM authenticator;

-- Adım 3: 'authenticator' rolünden tüm public fonksiyonları kullanma yetkisini geri al.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticator;
REVOKE USAGE ON SCHEMA public FROM authenticator;

COMMIT;

-- BİLGİ: Sistem tekrar güvenli hale getirildi.
