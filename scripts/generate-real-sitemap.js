import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase client - Gerçek credentials
const supabaseUrl = 'https://jaqwmspegddovmdqfccj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcXdtc3BlZ2Rkb3ZtZHFmY2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzQ0MDAsImV4cCI6MjA0OTk1MDQwMH0.your-actual-key-signature-here';
const supabase = createClient(supabaseUrl, supabaseKey);

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
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        h2 { color: #666; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .url-list { list-style: none; padding: 0; }
        .url-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .url-list li:hover { background: #f8f9fa; }
        .url-list a { color: #007bff; text-decoration: none; }
        .url-list a:hover { text-decoration: underline; }
        .stats { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .category { font-weight: bold; color: #495057; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 JoinEscapes Site Haritası</h1>
        
        <div class="stats">
            <strong>📊 İstatistikler:</strong><br>
            • Toplam URL Sayısı: ${urls.length}<br>
            • Son Güncelleme: ${new Date().toLocaleDateString('tr-TR')}<br>
            • Site: <a href="${SITE_URL}" target="_blank">${SITE_URL}</a>
        </div>`;

  // Ana sayfalar
  const mainPages = urls.filter(url => 
    !url.loc.includes('/kategori/') && 
    !url.loc.includes('/etiket/') && 
    url.loc.split('/').length <= 4
  );

  html += `
        <div class="section">
            <h2>🏠 Ana Sayfalar (${mainPages.length})</h2>
            <ul class="url-list">`;
  
  mainPages.forEach(url => {
    const path = url.loc.replace(SITE_URL, '').replace('/', '') || 'Ana Sayfa';
    html += `<li><a href="${url.loc}" target="_blank">${path || 'Ana Sayfa'}</a></li>`;
  });

  html += `</ul></div>`;

  // Kategori sayfaları
  const categoryPages = urls.filter(url => url.loc.includes('/kategori/'));
  if (categoryPages.length > 0) {
    html += `
        <div class="section">
            <h2>📂 Kategoriler (${categoryPages.length})</h2>
            <ul class="url-list">`;
    
    categoryPages.forEach(url => {
      const category = url.loc.split('/kategori/')[1];
      html += `<li><a href="${url.loc}" target="_blank">${category}</a></li>`;
    });

    html += `</ul></div>`;
  }

  // Etiket sayfaları
  const tagPages = urls.filter(url => url.loc.includes('/etiket/'));
  if (tagPages.length > 0) {
    html += `
        <div class="section">
            <h2>🏷️ Etiketler (${tagPages.length})</h2>
            <ul class="url-list">`;
    
    tagPages.forEach(url => {
      const tag = url.loc.split('/etiket/')[1];
      html += `<li><a href="${url.loc}" target="_blank">${tag}</a></li>`;
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
            <h2>📝 Blog Yazıları (${blogPosts.length} yazı)</h2>
            <ul class="url-list">`;
    
    blogPosts.forEach(url => {
      const parts = url.loc.split('/');
      const category = parts[parts.length - 2];
      const slug = parts[parts.length - 1];
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      html += `<li><span class="category">[${category}]</span> <a href="${url.loc}" target="_blank">${title}</a></li>`;
    });

    html += `</ul></div>`;
  }

  html += `
    </div>
</body>
</html>`;

  return html;
};

// Ana fonksiyon
async function generateRealSitemap() {
  console.log('🚀 Supabase\'den gerçek sitemap oluşturuluyor...');
  
  const urls = [];
  const currentDate = getCurrentDate();
  
  // 1. Ana sayfalar (Static)
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
  
  // 2. Gerçek kategoriler (Supabase'den çek)
  try {
    console.log('📂 Supabase\'den kategoriler çekiliyor...');
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('slug, name')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Kategoriler çekilemedi:', error.message);
    } else {
      console.log(`✅ ${categories.length} kategori bulundu`);
      
      categories.forEach(category => {
        urls.push({
          loc: `${SITE_URL}/kategori/${category.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }
  } catch (error) {
    console.error('❌ Kategoriler çekilirken hata:', error.message);
  }
  
  // 3. Gerçek etiketler (Supabase'den çek)
  try {
    console.log('🏷️ Supabase\'den etiketler çekiliyor...');
    
    const { data: tags, error } = await supabase
      .from('tags')
      .select('slug, name')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Etiketler çekilemedi:', error.message);
    } else {
      console.log(`✅ ${tags.length} etiket bulundu`);
      
      tags.forEach(tag => {
        urls.push({
          loc: `${SITE_URL}/etiket/${tag.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.6'
        });
      });
    }
  } catch (error) {
    console.error('❌ Etiketler çekilirken hata:', error.message);
  }
  
  // 4. Gerçek blog yazıları (Supabase'den çek)
  try {
    console.log('📝 Supabase\'den blog yazıları çekiliyor...');
    
    const { data: posts, error } = await supabase
      .from('posts_with_tags')
      .select('slug, category_slug, title, created_at, updated_at, published_at')
      .eq('status', 'published')
      .not('category_slug', 'is', null)
      .not('slug', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Blog yazıları çekilemedi:', error.message);
    } else {
      console.log(`✅ ${posts.length} blog yazısı bulundu`);
      
      posts.forEach(post => {
        const lastmod = post.updated_at ? 
          new Date(post.updated_at).toISOString().split('T')[0] : 
          currentDate;
        
        urls.push({
          loc: `${SITE_URL}/${post.category_slug}/${post.slug}`,
          lastmod: lastmod,
          changefreq: 'monthly',
          priority: '0.6'
        });
      });
    }
  } catch (error) {
    console.error('❌ Blog yazıları çekilirken hata:', error.message);
  }
  
  // 5. Sitemap'i oluştur ve kaydet
  const sitemapXML = generateSitemapXML(urls);
  const sitemapHTML = generateSitemapHTML(urls);
  
  const sitemapXMLPath = path.join(process.cwd(), 'sitemap.xml');
  const sitemapHTMLPath = path.join(process.cwd(), 'sitemap.html');
  
  fs.writeFileSync(sitemapXMLPath, sitemapXML, 'utf8');
  fs.writeFileSync(sitemapHTMLPath, sitemapHTML, 'utf8');
  
  console.log(`✅ Gerçek sitemap oluşturuldu!`);
  console.log(`📊 Toplam URL sayısı: ${urls.length}`);
  console.log(`📁 XML Dosya konumu: ${sitemapXMLPath}`);
  console.log(`📁 HTML Dosya konumu: ${sitemapHTMLPath}`);
  
  return urls.length;
}

// Script'i çalıştır
generateRealSitemap().catch(console.error);
