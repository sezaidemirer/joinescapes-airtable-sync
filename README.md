# JoinEscapes - Seyahat Rehberi Sitesi

Modern ve responsive React tabanlı seyahat rehberi sitesi. Kullanıcıların destinasyonları keşfetmesi, turizm haberlerini takip etmesi ve seyahat önerilerini alması için tasarlanmıştır.

## 🌟 Özellikler

- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Modern UI/UX**: Tailwind CSS ile şık ve kullanıcı dostu arayüz
- **Destinasyon Keşfi**: Filtrelenebilir destinasyon listesi
- **Turizm Haberleri**: Güncel seyahat haberleri ve trendler
- **Seyahat Önerileri**: Uzmanlardan pratik ipuçları
- **İletişim Formu**: Kullanıcı geri bildirimleri için
- **Reklam Alanları**: Monetizasyon için entegre reklam bölümleri

## 🚀 Teknolojiler

- **React 18** - Modern React hooks ve bileşenler
- **Vite** - Hızlı geliştirme ve build aracı
- **React Router** - Sayfa yönlendirme
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern ikonlar
- **PostCSS** - CSS işleme

## 📦 Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd joinescapes
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcınızda açın:**
   ```
   http://localhost:5173
   ```

## 🏗️ Build

Üretim için build almak için:

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Header.jsx      # Site başlığı ve navigasyon
│   └── Footer.jsx      # Site alt bilgi
├── pages/              # Sayfa bileşenleri
│   ├── Home.jsx        # Ana sayfa
│   ├── Destinations.jsx # Destinasyonlar
│   ├── News.jsx        # Haberler
│   ├── Recommendations.jsx # Öneriler
│   ├── About.jsx       # Hakkımızda
│   └── Contact.jsx     # İletişim
├── App.jsx             # Ana uygulama bileşeni
├── main.jsx           # Uygulama giriş noktası
└── index.css          # Global stiller
```

## 🎨 Tasarım Sistemi

### Renkler
- **Primary**: Mavi tonları (#0ea5e9 - #0c4a6e)
- **Secondary**: Sarı tonları (#eab308 - #713f12)
- **Gray**: Nötr tonlar

### Tipografi
- **Font**: Inter (Google Fonts)
- **Boyutlar**: Responsive text sizing

### Bileşenler
- **Kartlar**: Gölgeli, yuvarlatılmış köşeli
- **Butonlar**: Primary ve secondary varyantları
- **Form Elemanları**: Modern, erişilebilir

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Geliştirme

### Yeni Sayfa Ekleme

1. `src/pages/` klasöründe yeni bileşen oluşturun
2. `src/App.jsx` dosyasında route ekleyin
3. `src/components/Header.jsx` dosyasında navigasyon linkini ekleyin

### Stil Özelleştirme

Tailwind CSS kullanılmaktadır. Özel stiller için:
- `src/index.css` dosyasında `@layer components` kullanın
- `tailwind.config.js` dosyasında tema özelleştirmesi yapın

## 🌐 Deployment

### Vercel
```bash
npm run build
# Vercel'e deploy edin
```

### Netlify
```bash
npm run build
# dist/ klasörünü Netlify'a yükleyin
```

## 📈 Gelecek Özellikler

- [ ] Kullanıcı hesap sistemi
- [ ] Rezervasyon sistemi
- [ ] Çoklu dil desteği
- [ ] Blog sistemi
- [ ] Sosyal medya entegrasyonu
- [ ] PWA desteği
- [ ] SEO optimizasyonu

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website**: [joinescapes.com](https://joinescapes.com)
- **Email**: info@joinescapes.com
- **Phone**: +90 (212) 555 0123

---

**JoinEscapes** - Dünyanın en güzel yerlerini keşfedin! 🌍✈️
