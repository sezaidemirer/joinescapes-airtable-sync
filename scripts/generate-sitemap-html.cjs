#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment değişkenleri eksik. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_SERVICE_ROLE_KEY değerlerini sağlayın.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://www.joinescapes.com';
const outputPath = path.join(__dirname, '..', 'public', 'sitemap.html');

const staticPageGroups = [
  {
    title: 'Ana Sayfalar',
    pages: [
      { path: '/', name: 'Ana Sayfa' },
      { path: '/haberler', name: 'Haberler' },
      { path: '/destinasyonlar', name: 'Destinasyonlar' },
      { path: '/seyahat-onerileri', name: 'Seyahat Önerileri' },
      { path: '/sanat-ve-cemiyet', name: 'Sanat ve Cemiyet' }
    ]
  },
  {
    title: 'Öne Çıkan Temalar',
    pages: [
      { path: '/spa-molalari', name: 'Spa Molaları' },
      { path: '/sehir-molalari', name: 'Şehir Molaları' },
      { path: '/luks-seckiler', name: 'Lüks Seçkiler' },
      { path: '/solo-gezginler', name: 'Solo Gezginler' },
      { path: '/cruise-rotalari', name: 'Cruise Rotaları' },
      { path: '/vizesiz-rotalar', name: 'Vizesiz Rotalar' },
      { path: '/ciftler-icin-ozel', name: 'Çiftler İçin Özel' },
      { path: '/butik-oteller', name: 'Butik Oteller' },
      { path: '/oteller', name: 'Oteller' },
      { path: '/paket-tatiller', name: 'Paket Tatiller' },
      { path: '/yaz-2025', name: 'Yaz 2025' },
      { path: '/ucuz-ucus-rotalari', name: 'Uygun Uçuş Rotaları' },
      { path: '/gurme-rotalari', name: 'Gurme Rotaları' }
    ]
  },
  {
    title: 'Kurumsal Sayfalar',
    pages: [
      { path: '/travel-finder', name: 'Travel Finder' },
      { path: '/yazarlar', name: 'Yazarlar' },
      { path: '/hakkimizda', name: 'Hakkımızda' },
      { path: '/iletisim', name: 'İletişim' },
      { path: '/gizlilik-politikasi', name: 'Gizlilik Politikası' },
      { path: '/cerez-politikasi', name: 'Çerez Politikası' },
      { path: '/kullanim-sartlari', name: 'Kullanım Şartları' }
    ]
  }
];

async function fetchData() {
  const [categoriesRes, tagsRes, postsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name'),
    supabase
      .from('tags')
      .select('id, name, slug')
      .order('name'),
    supabase
      .from('posts_with_tags')
      .select('id, title, slug, category_slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (tagsRes.error) throw tagsRes.error;
  if (postsRes.error) throw postsRes.error;

  return {
    categories: categoriesRes.data || [],
    tags: tagsRes.data || [],
    posts: postsRes.data || []
  };
}

function buildHtml({ categories, tags, posts }) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const postsChunkSize = 200;
  const postChunks = [];

  for (let i = 0; i < posts.length; i += postsChunkSize) {
    postChunks.push(posts.slice(i, i + postsChunkSize));
  }

  const buildList = (items, buildItem) =>
    items.map(buildItem).join('\n');

  const staticSections = staticPageGroups
    .map(group => `
        <section class="card">
          <h2>${group.title}</h2>
          <ul>
            ${buildList(group.pages, page => `<li><a href="${baseUrl}${page.path}">${page.name}</a></li>`)}
          </ul>
        </section>`)
    .join('\n');

  const categorySection = `
        <section class="card">
          <h2>Kategoriler</h2>
          <ul>
            ${buildList(categories, category => `<li><a href="${baseUrl}/kategori/${category.slug}">${category.name}</a></li>`)}
          </ul>
        </section>`;

  const tagSection = `
        <section class="card">
          <h2>Etiketler</h2>
          <ul>
            ${buildList(tags, tag => `<li><a href="${baseUrl}/etiket/${tag.slug}">${tag.name}</a></li>`)}
          </ul>
        </section>`;

  const postSections = postChunks
    .map((chunk, index) => `
        <section class="card">
          <h2>Blog Yazıları ${postChunks.length > 1 ? `(${index + 1}/${postChunks.length})` : ''}</h2>
          <ul>
            ${buildList(chunk, post => `<li><a href="${baseUrl}/${post.category_slug}/${post.slug}">${post.title}</a></li>`)}
          </ul>
        </section>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Site Haritası | JoinEscapes</title>
  <style>
    :root {
      color-scheme: light;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f7fa;
      color: #333;
    }
    body {
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 16px 64px;
    }
    header {
      text-align: center;
      margin-bottom: 48px;
    }
    header h1 {
      margin: 0;
      font-size: 2.5rem;
      color: #1a365d;
    }
    header p {
      margin: 12px 0 0;
      color: #4a5568;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
      border: 1px solid rgba(15, 23, 42, 0.08);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
    }
    .card h2 {
      margin: 0 0 16px;
      font-size: 1.25rem;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
    }
    .card li {
      margin: 0;
    }
    .card a {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.08);
      color: #1d4ed8;
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .card a:hover {
      background: #1d4ed8;
      color: #fff;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 32px 0 48px;
      justify-content: center;
    }
    .stat {
      background: #1a365d;
      color: #fff;
      padding: 16px 24px;
      border-radius: 12px;
      text-align: center;
      min-width: 160px;
    }
    footer {
      margin-top: 48px;
      text-align: center;
      color: #4a5568;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>JoinEscapes Site Haritası</h1>
      <p>Son güncelleme: ${formattedDate} • Toplam ${staticPageGroups.reduce((acc, group) => acc + group.pages.length, 0) + categories.length + tags.length + posts.length} sayfa</p>
    </header>

    <div class="stats">
      <div class="stat"><strong>${staticPageGroups.reduce((acc, group) => acc + group.pages.length, 0)}</strong><br>Statik Sayfa</div>
      <div class="stat"><strong>${categories.length}</strong><br>Kategori</div>
      <div class="stat"><strong>${tags.length}</strong><br>Etiket</div>
      <div class="stat"><strong>${posts.length}</strong><br>Blog Yazısı</div>
    </div>

    <div class="grid">
      ${staticSections}
      ${categorySection}
      ${tagSection}
      ${postSections}
    </div>

    <footer>
      Bu site haritası SEO ve kullanıcı navigasyonu için otomatik olarak oluşturulmuştur.
    </footer>
  </div>
</body>
</html>`;
}

async function generateHtmlSitemap() {
  try {
    console.log('🌐 HTML sitemap oluşturuluyor...');

    const data = await fetchData();
    const html = buildHtml(data);

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ HTML sitemap oluşturuldu:', outputPath);
  } catch (error) {
    console.error('❌ HTML sitemap oluşturma hatası:', error);
    process.exit(1);
  }
}

generateHtmlSitemap();

