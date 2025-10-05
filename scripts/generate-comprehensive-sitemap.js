import fs from 'fs';
import path from 'path';

// Site URL
const SITE_URL = 'https://www.joinescapes.com';

// Tarih formatı
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Sitemap XML oluştur
const generateSitemapXML = (urls) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

// Sitemap HTML oluştur
const generateSitemapHTML = (urls) => {
  let html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JoinEscapes - Site Haritası</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        h2 { color: #666; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 15px; }
        .url-list { list-style: none; padding: 0; }
        .url-list li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .url-list li:hover { background: #f8f9fa; }
        .url-list a { color: #007bff; text-decoration: none; flex: 1; }
        .url-list a:hover { text-decoration: underline; }
        .stats { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .category { font-weight: bold; color: #495057; }
        .url-meta { font-size: 0.8em; color: #666; margin-left: 10px; }
        .priority-high { border-left: 3px solid #28a745; }
        .priority-medium { border-left: 3px solid #ffc107; }
        .priority-low { border-left: 3px solid #6c757d; }
        .count-badge { background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 JoinEscapes Site Haritası</h1>
        
        <div class="stats">
            <strong>📊 Site İstatistikleri:</strong><br>
            • Toplam URL Sayısı: ${urls.length}<br>
            • Son Güncelleme: ${new Date().toLocaleDateString('tr-TR')} - ${new Date().toLocaleTimeString('tr-TR')}<br>
            • Site: <a href="${SITE_URL}" target="_blank">${SITE_URL}</a><br>
            • Build: Beta 5.1 FIXED (08.08.2025)<br>
            • URL Formatı: 2-level (/kategori/yazı-adı)
        </div>`;

  // Ana sayfalar
  const mainPages = urls.filter(url => 
    !url.loc.includes('/kategori/') && 
    !url.loc.includes('/etiket/') && 
    url.loc.split('/').length <= 4
  );

  html += `
        <div class="section">
            <h2>🏠 Ana Sayfalar <span class="count-badge">${mainPages.length}</span></h2>
            <ul class="url-list">`;
  
  mainPages.forEach(url => {
    const path = url.loc.replace(SITE_URL + '/', '') || 'Ana Sayfa';
    const priorityClass = parseFloat(url.priority) >= 0.8 ? 'priority-high' : 
                         parseFloat(url.priority) >= 0.6 ? 'priority-medium' : 'priority-low';
    
    html += `<li class="${priorityClass}">
      <a href="${url.loc}" target="_blank">${path || 'Ana Sayfa'}</a>
      <span class="url-meta">Priority: ${url.priority} | ${url.changefreq}</span>
    </li>`;
  });

  html += `</ul></div>`;

  // Kategori sayfaları
  const categoryPages = urls.filter(url => url.loc.includes('/kategori/'));
  if (categoryPages.length > 0) {
    html += `
        <div class="section">
            <h2>📂 Kategoriler <span class="count-badge">${categoryPages.length}</span></h2>
            <ul class="url-list">`;
    
    categoryPages.forEach(url => {
      const category = url.loc.split('/kategori/')[1];
      const displayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      html += `<li class="priority-medium">
        <a href="${url.loc}" target="_blank">${displayName}</a>
        <span class="url-meta">/kategori/${category}</span>
      </li>`;
    });

    html += `</ul></div>`;
  }

  // Etiket sayfaları
  const tagPages = urls.filter(url => url.loc.includes('/etiket/'));
  if (tagPages.length > 0) {
    html += `
        <div class="section">
            <h2>🏷️ Etiketler <span class="count-badge">${tagPages.length}</span></h2>
            <ul class="url-list">`;
    
    tagPages.forEach(url => {
      const tag = url.loc.split('/etiket/')[1];
      const displayName = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      html += `<li class="priority-low">
        <a href="${url.loc}" target="_blank">${displayName}</a>
        <span class="url-meta">/etiket/${tag}</span>
      </li>`;
    });

    html += `</ul></div>`;
  }

  // Blog yazıları
  const blogPosts = urls.filter(url => 
    !url.loc.includes('/kategori/') && 
    !url.loc.includes('/etiket/') && 
    url.loc.split('/').length === 5
  );

  if (blogPosts.length > 0) {
    html += `
        <div class="section">
            <h2>📝 Blog Yazıları <span class="count-badge">${blogPosts.length}</span></h2>
            <ul class="url-list">`;
    
    // Kategorilere göre grupla
    const postsByCategory = {};
    blogPosts.forEach(url => {
      const parts = url.loc.split('/');
      const category = parts[parts.length - 2];
      if (!postsByCategory[category]) {
        postsByCategory[category] = [];
      }
      postsByCategory[category].push(url);
    });
    
    Object.keys(postsByCategory).sort().forEach(category => {
      const categoryDisplayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      html += `<li style="background: #f8f9fa; font-weight: bold; color: #495057;">
        <span>📂 ${categoryDisplayName} (${postsByCategory[category].length} yazı)</span>
      </li>`;
      
      postsByCategory[category].forEach(url => {
        const parts = url.loc.split('/');
        const slug = parts[parts.length - 1];
        const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        html += `<li class="priority-medium" style="padding-left: 20px;">
          <a href="${url.loc}" target="_blank">${title}</a>
          <span class="url-meta">/${category}/${slug}</span>
        </li>`;
      });
    });

    html += `</ul></div>`;
  }

  html += `
        <div class="section">
            <h2>📋 Teknik Bilgiler</h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-size: 0.9em;">
                <strong>URL Formatları:</strong><br>
                • Ana sayfa: ${SITE_URL}/<br>
                • Kategori sayfası: ${SITE_URL}/kategori/kategori-adi<br>
                • Etiket sayfası: ${SITE_URL}/etiket/etiket-adi<br>
                • Blog yazısı: ${SITE_URL}/kategori-adi/yazi-adi<br><br>
                
                <strong>SEO Bilgileri:</strong><br>
                • Sitemap XML: <a href="${SITE_URL}/sitemap.xml" target="_blank">${SITE_URL}/sitemap.xml</a><br>
                • Robots.txt: <a href="${SITE_URL}/robots.txt" target="_blank">${SITE_URL}/robots.txt</a><br>
                • RSS Feed: Yakında eklenecek<br><br>
                
                <strong>Öncelik Seviyeleri:</strong><br>
                • 1.0: Ana sayfa<br>
                • 0.9: Haberler, Destinasyonlar<br>
                • 0.8: Kategori ana sayfaları<br>
                • 0.7: Kategori listesi sayfaları<br>
                • 0.6: Blog yazıları, Etiket sayfaları<br>
                • 0.3: Legal sayfalar
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
};

// Ana fonksiyon
async function generateComprehensiveSitemap() {
  console.log('🚀 Kapsamlı sitemap oluşturuluyor...');
  
  const urls = [];
  const currentDate = getCurrentDate();
  
  // 1. Ana sayfalar (Static - Güncel)
  console.log('📄 Ana sayfalar ekleniyor...');
  const mainPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: 'haberler', priority: '0.9', changefreq: 'daily' },
    { path: 'destinasyonlar', priority: '0.9', changefreq: 'weekly' },
    { path: 'sanat-ve-cemiyet', priority: '0.8', changefreq: 'daily' },
    { path: 'spa-molalari', priority: '0.8', changefreq: 'weekly' },
    { path: 'sehir-molalari', priority: '0.8', changefreq: 'weekly' },
    { path: 'luks-seckiler', priority: '0.8', changefreq: 'weekly' },
    { path: 'solo-gezginler', priority: '0.8', changefreq: 'weekly' },
    { path: 'cruise-rotalari', priority: '0.8', changefreq: 'weekly' },
    { path: 'vizesiz-rotalar', priority: '0.8', changefreq: 'weekly' },
    { path: 'ciftler-icin-ozel', priority: '0.8', changefreq: 'weekly' },
    { path: 'butik-oteller', priority: '0.8', changefreq: 'weekly' },
    { path: 'oteller', priority: '0.8', changefreq: 'weekly' },
    { path: 'paket-tatiller', priority: '0.8', changefreq: 'weekly' },
    { path: 'yaz-2025', priority: '0.8', changefreq: 'weekly' },
    { path: 'ucuz-ucus-rotalari', priority: '0.8', changefreq: 'weekly' },
    { path: 'gurme-rotalari', priority: '0.8', changefreq: 'weekly' },
    { path: 'hakkimizda', priority: '0.6', changefreq: 'monthly' },
    { path: 'iletisim', priority: '0.6', changefreq: 'monthly' },
    { path: 'gizlilik-politikasi', priority: '0.3', changefreq: 'yearly' },
    { path: 'cerez-politikasi', priority: '0.3', changefreq: 'yearly' },
    { path: 'kullanim-sartlari', priority: '0.3', changefreq: 'yearly' }
  ];
  
  mainPages.forEach(page => {
    urls.push({
      loc: `${SITE_URL}/${page.path}`,
      lastmod: currentDate,
      changefreq: page.changefreq,
      priority: page.priority
    });
  });
  
  // 2. Güncel kategoriler
  console.log('📂 Güncel kategoriler ekleniyor...');
  const categories = [
    'sanat-ve-cemiyet', 'spa-molalari', 'sehir-molalari', 'luks-seckiler',
    'solo-gezginler', 'cruise-rotalari', 'vizesiz-rotalar', 'ciftler-icin-ozel',
    'butik-oteller', 'oteller', 'paket-tatiller', 'yaz-2025', 'ucuz-ucus-rotalari',
    'gurme-rotalari', 'yurt-disi-haberleri', 'yurt-ici-haberleri', 'turizm-gundemi',
    'seyahat-rehberi', 'kultur-ve-miras', 'teknoloji-ve-seyahat', 'otel-yatirimlari'
  ];
  
  categories.forEach(category => {
    urls.push({
      loc: `${SITE_URL}/kategori/${category}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    });
  });
  
  // 3. Güncel etiketler
  console.log('🏷️ Güncel etiketler ekleniyor...');
  const tags = [
    'anasayfa', 'encokokunan', 'seckinoteller', 'oneri', 'vizesizrotalar',
    'ucuzucusrotalari', 'bunlariokudunuzmu', 'ciftlericinozelrotalar',
    'bireyselgezginler', 'cruiserotalari', 'gurmerotalari'
  ];
  
  tags.forEach(tag => {
    urls.push({
      loc: `${SITE_URL}/etiket/${tag}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.6'
    });
  });
  
  // 4. Kapsamlı blog yazıları örnekleri (2-level URL formatında)
  console.log('📝 Kapsamlı blog yazıları ekleniyor...');
  const comprehensivePosts = [
    // Yurt Dışı Haberleri (12 yazı)
    { category: 'yurt-disi-haberleri', slug: 'rixosun-25-yili-jennifer-lopez-surpriziyle-basladi' },
    { category: 'yurt-disi-haberleri', slug: 'paris-olimpiyatlari-2024-turizm-rehberi' },
    { category: 'yurt-disi-haberleri', slug: 'dubai-yeni-luksturizm-destinasyonu' },
    { category: 'yurt-disi-haberleri', slug: 'bali-adasi-seyahat-rehberi' },
    { category: 'yurt-disi-haberleri', slug: 'tokyo-2025-travel-guide' },
    { category: 'yurt-disi-haberleri', slug: 'london-city-break-rehberi' },
    { category: 'yurt-disi-haberleri', slug: 'new-york-gezilecek-yerler' },
    { category: 'yurt-disi-haberleri', slug: 'rome-antik-sehir-turlari' },
    { category: 'yurt-disi-haberleri', slug: 'maldivler-luksbalayı-otelleri' },
    { category: 'yurt-disi-haberleri', slug: 'hawaii-tropikal-tatil-rehberi' },
    { category: 'yurt-disi-haberleri', slug: 'santorini-romantik-tatil' },
    { category: 'yurt-disi-haberleri', slug: 'prag-kultur-turizmi-rehberi' },
    
    // Sanat ve Cemiyet (8 yazı)
    { category: 'sanat-ve-cemiyet', slug: 'unlulerin-tercih-ettigi-tatil-yerleri' },
    { category: 'sanat-ve-cemiyet', slug: 'cannes-film-festivali-otel-tavsiyeleri' },
    { category: 'sanat-ve-cemiyet', slug: 'hollywood-yildizlarinin-gizli-destinasyonlari' },
    { category: 'sanat-ve-cemiyet', slug: 'milan-moda-haftasi-seyahat-rehberi' },
    { category: 'sanat-ve-cemiyet', slug: 'art-basel-sanat-fuari-miami' },
    { category: 'sanat-ve-cemiyet', slug: 'oscar-gecesi-after-party-mekanları' },
    { category: 'sanat-ve-cemiyet', slug: 'venedik-bienali-kultur-turlari' },
    { category: 'sanat-ve-cemiyet', slug: 'monaco-grand-prix-loks-deneyimi' },
    
    // Lüks Seçkiler (10 yazı)
    { category: 'luks-seckiler', slug: 'dunyanin-en-luks-resort-otelleri' },
    { category: 'luks-seckiler', slug: 'michelin-yildizli-restoranlar-rehberi' },
    { category: 'luks-seckiler', slug: 'private-jet-seyahat-deneyimi' },
    { category: 'luks-seckiler', slug: 'yacht-charter-akdeniz-turlari' },
    { category: 'luks-seckiler', slug: 'orient-express-loks-tren-yolculugu' },
    { category: 'luks-seckiler', slug: 'dubai-burj-al-arab-konaklama' },
    { category: 'luks-seckiler', slug: 'swiss-alps-loks-ski-otelleri' },
    { category: 'luks-seckiler', slug: 'ritz-carlton-global-collection' },
    { category: 'luks-seckiler', slug: 'four-seasons-best-properties' },
    { category: 'luks-seckiler', slug: 'aman-resorts-exclusive-locations' },
    
    // Spa Molaları (6 yazı)
    { category: 'spa-molalari', slug: 'dunyanin-en-iyi-spa-otelleri' },
    { category: 'spa-molalari', slug: 'termal-turizm-rehberi-turkiye' },
    { category: 'spa-molalari', slug: 'bali-geleneksel-spa-deneyimi' },
    { category: 'spa-molalari', slug: 'iceland-blue-lagoon-spa-rehberi' },
    { category: 'spa-molalari', slug: 'thai-massage-bangkok-spa-guıde' },
    { category: 'spa-molalari', slug: 'dead-sea-spa-jordan-israel' },
    
    // Şehir Molaları (8 yazı)
    { category: 'sehir-molalari', slug: 'avrupa-sehir-turlari-rehberi' },
    { category: 'sehir-molalari', slug: 'istanbul-gezilecek-yerler' },
    { category: 'sehir-molalari', slug: 'barcelona-gaudi-mimarisi-turu' },
    { category: 'sehir-molalari', slug: 'amsterdam-kanal-turlari' },
    { category: 'sehir-molalari', slug: 'vienna-klasik-muzik-turlari' },
    { category: 'sehir-molalari', slug: 'edinburgh-kale-ve-whisky-turlari' },
    { category: 'sehir-molalari', slug: 'prague-beer-gardens-guide' },
    { category: 'sehir-molalari', slug: 'lisbon-tram-tours-rehberi' },
    
    // Solo Gezginler (6 yazı)
    { category: 'solo-gezginler', slug: 'tek-basina-seyahat-rehberi' },
    { category: 'solo-gezginler', slug: 'guvenli-solo-destinasyonlar' },
    { category: 'solo-gezginler', slug: 'backpacking-avrupa-rotasi' },
    { category: 'solo-gezginler', slug: 'solo-female-travel-asia' },
    { category: 'solo-gezginler', slug: 'digital-nomad-destinasyonları' },
    { category: 'solo-gezginler', slug: 'hostel-vs-hotel-solo-seyahat' },
    
    // Cruise Rotaları (5 yazı)
    { category: 'cruise-rotalari', slug: 'akdeniz-cruise-turlari' },
    { category: 'cruise-rotalari', slug: 'karayip-cruise-rehberi' },
    { category: 'cruise-rotalari', slug: 'norwegian-fjords-cruise' },
    { category: 'cruise-rotalari', slug: 'alaska-cruise-wildlife-tours' },
    { category: 'cruise-rotalari', slug: 'river-cruise-europe-danube' },
    
    // Vizesiz Rotalar (7 yazı)
    { category: 'vizesiz-rotalar', slug: 'vizesiz-gidebileceginiz-ulkeler' },
    { category: 'vizesiz-rotalar', slug: 'balkanlar-seyahat-rehberi' },
    { category: 'vizesiz-rotalar', slug: 'gurcistan-kars-siniri-gecisi' },
    { category: 'vizesiz-rotalar', slug: 'ukrayna-lviv-sehir-rehberi' },
    { category: 'vizesiz-rotalar', slug: 'moldova-kishinev-gezi-rehberi' },
    { category: 'vizesiz-rotalar', slug: 'bosna-hersek-saraybosna' },
    { category: 'vizesiz-rotalar', slug: 'makedonya-ohrid-golu-rehberi' },
    
    // Butik Oteller (5 yazı)
    { category: 'butik-oteller', slug: 'dunyanin-en-guzel-butik-otelleri' },
    { category: 'butik-oteller', slug: 'turkiye-butik-otel-tavsiyeleri' },
    { category: 'butik-oteller', slug: 'paris-marais-butik-oteller' },
    { category: 'butik-oteller', slug: 'toscana-agriturismo-oteller' },
    { category: 'butik-oteller', slug: 'santorini-cave-hotels' },
    
    // Gurme Rotaları (8 yazı)
    { category: 'gurme-rotalari', slug: 'gastronomi-turizmi-rehberi' },
    { category: 'gurme-rotalari', slug: 'dunya-mutfaklari-turlari' },
    { category: 'gurme-rotalari', slug: 'french-cuisine-paris-rehberi' },
    { category: 'gurme-rotalari', slug: 'italian-food-tours-rome' },
    { category: 'gurme-rotalari', slug: 'japanese-kaiseki-tokyo-guide' },
    { category: 'gurme-rotalari', slug: 'street-food-bangkok-tours' },
    { category: 'gurme-rotalari', slug: 'wine-tours-tuscany-chianti' },
    { category: 'gurme-rotalari', slug: 'tapas-tours-barcelona-madrid' }
  ];
  
  comprehensivePosts.forEach(post => {
    urls.push({
      loc: `${SITE_URL}/${post.category}/${post.slug}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    });
  });
  
  // 5. Sitemap'i oluştur ve kaydet
  const sitemapXML = generateSitemapXML(urls);
  const sitemapHTML = generateSitemapHTML(urls);
  
  const sitemapXMLPath = path.join(process.cwd(), 'sitemap.xml');
  const sitemapHTMLPath = path.join(process.cwd(), 'sitemap.html');
  
  fs.writeFileSync(sitemapXMLPath, sitemapXML, 'utf8');
  fs.writeFileSync(sitemapHTMLPath, sitemapHTML, 'utf8');
  
  console.log(`✅ Kapsamlı sitemap oluşturuldu!`);
  console.log(`📊 Toplam URL sayısı: ${urls.length}`);
  console.log(`📄 Ana sayfalar: ${mainPages.length}`);
  console.log(`📂 Kategoriler: ${categories.length}`);
  console.log(`🏷️ Etiketler: ${tags.length}`);
  console.log(`📝 Blog yazıları: ${comprehensivePosts.length}`);
  console.log(`📁 XML Dosya konumu: ${sitemapXMLPath}`);
  console.log(`📁 HTML Dosya konumu: ${sitemapHTMLPath}`);
  
  return urls.length;
}

// Script'i çalıştır
generateComprehensiveSitemap().catch(console.error);

