# 🚀 JoinEscape Deployment Guide - GoDaddy cPanel

## 📁 Klasör Yapısı
```
JoinEscape_04.06.2025/
├── source_code/          # Tam kaynak kod (geliştirme için)
├── website_files/        # Build edilmiş site (cPanel'e yükle)
└── DEPLOYMENT_GUIDE.md   # Bu rehber
```

## 🌐 GoDaddy cPanel'e Yükleme

### Adım 1: Website Files'ı Yükle
1. **cPanel → File Manager** aç
2. **public_html** klasörüne git
3. `website_files/` içindeki **TÜM dosyaları** public_html'e kopyala:
   - `index.html`
   - `assets/` klasörü (CSS, JS dosyaları)

### Adım 2: Supabase Ayarları
- Supabase bağlantı bilgileri zaten kodda mevcut
- **Herhangi bir ek ayar gerekmez**

### Adım 3: SSL & Domain
- GoDaddy'de SSL aktif olduğundan emin ol
- Domain: `https://yourdomain.com`

## 🍪 Cookie Sistem Özellikleri

### ✅ Çalışan Özellikler:
- Cookie consent banner
- Kullanıcı tercih kaydetme (localStorage + Supabase)
- Admin panel cookie analytics
- Business intelligence dashboard
- KVKK/GDPR uyumlu veri saklama

### 📊 Admin Panel Erişim:
- URL: `https://yourdomain.com/adminlogin`
- Giriş yap → `/admin` sayfasına git
- **Cookie Analytics** ve **Cookie Business Intelligence** sekmelerini kullan

## 🔧 Teknik Detaylar

### Database (Supabase):
- Tablo: `cookie_consents`
- Otomatik veri toplama aktif
- 1 yıl otomatik silme sistemi

### Cookie Kategorileri:
- **Necessary**: Her zaman aktif
- **Analytics**: Google Analytics için
- **Marketing**: Facebook Pixel, reklamlar için  
- **Personalization**: Öneri sistemi için

### Admin Özellikleri:
- Real-time analytics
- CSV export
- Date range filtering
- Business intelligence insights

## 🎯 Marketing Kullanımı

### Google Analytics:
- User consent alındığında otomatik aktif
- Event tracking hazır

### Facebook Pixel:
- Marketing consent ile aktif
- Lookalike audience için hazır

### AI Recommendations:
- Personalization consent ile aktif
- User behavior bazlı öneriler

## 📱 Responsive Tasarım
- ✅ Mobile-first design
- ✅ Tablet uyumlu
- ✅ Desktop optimize

## 🛡️ Güvenlik
- ✅ Supabase RLS (Row Level Security)
- ✅ HTTPS zorunlu
- ✅ XSS koruması
- ✅ KVKK uyumlu

---

## 🆘 Destek
Herhangi bir sorun olursa:
1. Browser console'u kontrol et (F12)
2. Supabase bağlantısını test et
3. SSL sertifikasını kontrol et

**Deployment Date:** 04.06.2025
**Version:** 1.0 Production Ready 🚀 