-- ACİL DURUM TESTİ (BÖLÜM 2): TÜM KİLİTLERİ GERİ KAPAT
-- AMAÇ: 'UNLOCK_EVERYTHING_FOR_TEST.sql' ile verilen geniş yetkileri geri alarak sistemi tekrar güvenli hale getirmek.

-- BU SCRİPT, TEST İŞLEMİ BİTTİKTEN SONRA MUTLAKA ÇALIŞTIRILMALIDIR.

BEGIN;

-- Adım 1: 'authenticator' rolünden 'writer_profiles' tablosundaki tüm yetkileri geri al.
REVOKE ALL ON TABLE public.writer_profiles FROM authenticator;
RAISE NOTICE '[GÜVENLİK] ''authenticator'' rolünün writer_profiles üzerindeki TÜM YETKİLERİ geri alındı.';

-- Adım 2: 'authenticator' rolünden 'posts' tablosundaki tüm yetkileri geri al.
REVOKE ALL ON TABLE public.posts FROM authenticator;
RAISE NOTICE '[GÜVENLİK] ''authenticator'' rolünün posts üzerindeki TÜM YETKİLERİ geri alındı.';

-- Adım 3: 'authenticator' rolünden tüm public fonksiyonları kullanma yetkisini geri al.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticator;
REVOKE USAGE ON SCHEMA public FROM authenticator;
RAISE NOTICE '[GÜVENLİK] ''authenticator'' rolünün tüm fonksiyonları kullanma yetkisi geri alındı.';

COMMIT;

-- SİSTEM TEKRAR GÜVENLİ HALE GETİRİLDİ.
