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

// Ana fonksiyon
async function generateSitemap() {
  console.log('🚀 Manuel sitemap oluşturuluyor...');
  
  const urls = [];
  const currentDate = getCurrentDate();
  
  // 1. Ana sayfalar
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
  
  // 2. Güncel kategoriler (Manuel)
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
  
  // 3. Güncel etiketler (Manuel)
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
  
  // 4. Örnek blog yazıları (69 yazı için örnek URL'ler - Manuel)
  // Bu örnekler 2-level URL formatında: /kategori/yazı-adı
  const samplePosts = [
    // Yurt Dışı Haberleri kategorisi
    { category: 'yurt-disi-haberleri', slug: 'rixosun-25-yili-jennifer-lopez-surpriziyle-basladi' },
    { category: 'yurt-disi-haberleri', slug: 'paris-olimpiyatlari-2024-turizm-rehberi' },
    { category: 'yurt-disi-haberleri', slug: 'dubai-yeni-luksturizm-destinasyonu' },
    
    // Sanat ve Cemiyet kategorisi
    { category: 'sanat-ve-cemiyet', slug: 'unlulerin-tercih-ettigi-tatil-yerleri' },
    { category: 'sanat-ve-cemiyet', slug: 'cannes-film-festivali-otel-tavsiyeleri' },
    
    // Lüks Seçkiler kategorisi
    { category: 'luks-seckiler', slug: 'dunyanin-en-luks-resort-otelleri' },
    { category: 'luks-seckiler', slug: 'michelin-yildizli-restoranlar-rehberi' },
    
    // Spa Molaları kategorisi
    { category: 'spa-molalari', slug: 'dunyanin-en-iyi-spa-otelleri' },
    { category: 'spa-molalari', slug: 'termal-turizm-rehberi-turkiye' },
    
    // Şehir Molaları kategorisi
    { category: 'sehir-molalari', slug: 'avrupa-sehir-turlari-rehberi' },
    { category: 'sehir-molalari', slug: 'istanbul-gezilecek-yerler' },
    
    // Solo Gezginler kategorisi
    { category: 'solo-gezginler', slug: 'tek-basina-seyahat-rehberi' },
    { category: 'solo-gezginler', slug: 'guvenli-solo-destinasyonlar' },
    
    // Cruise Rotaları kategorisi
    { category: 'cruise-rotalari', slug: 'akdeniz-cruise-turlari' },
    { category: 'cruise-rotalari', slug: 'karayip-cruise-rehberi' },
    
    // Vizesiz Rotalar kategorisi
    { category: 'vizesiz-rotalar', slug: 'vizesiz-gidebileceginiz-ulkeler' },
    { category: 'vizesiz-rotalar', slug: 'balkanlar-seyahat-rehberi' },
    
    // Butik Oteller kategorisi
    { category: 'butik-oteller', slug: 'dunyanin-en-guzel-butik-otelleri' },
    { category: 'butik-oteller', slug: 'turkiye-butik-otel-tavsiyeleri' },
    
    // Gurme Rotaları kategorisi
    { category: 'gurme-rotalari', slug: 'gastronomi-turizmi-rehberi' },
    { category: 'gurme-rotalari', slug: 'dunya-mutfaklari-turlari' }
  ];
  
  samplePosts.forEach(post => {
    urls.push({
      loc: `${SITE_URL}/${post.category}/${post.slug}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    });
  });
  
  // 5. Sitemap'i oluştur ve kaydet
  const sitemapXML = generateSitemapXML(urls);
  
  const sitemapXMLPath = path.join(process.cwd(), 'sitemap.xml');
  
  fs.writeFileSync(sitemapXMLPath, sitemapXML, 'utf8');
  
  console.log(`✅ Manuel sitemap oluşturuldu!`);
  console.log(`📊 Toplam URL sayısı: ${urls.length}`);
  console.log(`📁 XML Dosya konumu: ${sitemapXMLPath}`);
  
  return urls.length;
}

// Script'i çalıştır
generateSitemap().catch(console.error);

