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

const staticPages = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/haberler', changefreq: 'daily', priority: 0.9 },
  { path: '/destinasyonlar', changefreq: 'weekly', priority: 0.9 },
  { path: '/seyahat-onerileri', changefreq: 'weekly', priority: 0.8 },
  { path: '/sanat-ve-cemiyet', changefreq: 'weekly', priority: 0.7 },
  { path: '/spa-molalari', changefreq: 'weekly', priority: 0.7 },
  { path: '/sehir-molalari', changefreq: 'weekly', priority: 0.7 },
  { path: '/luks-seckiler', changefreq: 'weekly', priority: 0.7 },
  { path: '/luks', changefreq: 'weekly', priority: 0.7 },
  { path: '/solo-gezginler', changefreq: 'weekly', priority: 0.7 },
  { path: '/cruise-rotalari', changefreq: 'weekly', priority: 0.7 },
  { path: '/vizesiz-rotalar', changefreq: 'weekly', priority: 0.7 },
  { path: '/ciftler-icin-ozel', changefreq: 'weekly', priority: 0.7 },
  { path: '/butik-oteller', changefreq: 'weekly', priority: 0.7 },
  { path: '/oteller', changefreq: 'weekly', priority: 0.7 },
  { path: '/paket-tatiller', changefreq: 'weekly', priority: 0.7 },
  { path: '/yaz-2025', changefreq: 'weekly', priority: 0.6 },
  { path: '/ucuz-ucus-rotalari', changefreq: 'weekly', priority: 0.7 },
  { path: '/gurme-rotalari', changefreq: 'weekly', priority: 0.7 },
  { path: '/travel-finder', changefreq: 'weekly', priority: 0.6 },
  { path: '/yazarlar', changefreq: 'weekly', priority: 0.5 },
  { path: '/hakkimizda', changefreq: 'monthly', priority: 0.5 },
  { path: '/iletisim', changefreq: 'monthly', priority: 0.5 },
  { path: '/gizlilik-politikasi', changefreq: 'yearly', priority: 0.3 },
  { path: '/cerez-politikasi', changefreq: 'yearly', priority: 0.3 },
  { path: '/kullanim-sartlari', changefreq: 'yearly', priority: 0.3 }
];

const publicDir = path.join(__dirname, '..', 'public');

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;

const writeSitemapFile = (filename, urls) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlEntry).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, filename), xml.trim(), 'utf8');
};

async function generateSitemaps() {
  console.log('🔄 Sitemap dosyaları oluşturuluyor...');

  try {
    const nowIso = new Date().toISOString();

    const [{ data: posts, error: postsError }, { data: categories, error: categoriesError }, { data: tags, error: tagsError }] = await Promise.all([
      supabase
        .from('posts_with_tags')
        .select('slug, category_slug, published_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
      supabase
        .from('categories')
        .select('slug, updated_at')
        .order('name'),
      supabase
        .from('tags')
        .select('slug, updated_at')
        .order('name')
    ]);

    if (postsError) throw postsError;
    if (categoriesError) throw categoriesError;
    if (tagsError) throw tagsError;

    console.log(`📄 Statik sayfalar: ${staticPages.length}`);
    console.log(`📁 Kategoriler: ${categories.length}`);
    console.log(`🏷️ Etiketler: ${tags.length}`);
    console.log(`📝 Yayınlanmış yazılar: ${posts.length}`);

    const pageUrls = staticPages.map(page => ({
      loc: `${baseUrl}${page.path}`,
      lastmod: nowIso,
      changefreq: page.changefreq,
      priority: page.priority
    }));

    const categoryUrls = categories.map(category => ({
      loc: `${baseUrl}/kategori/${category.slug}`,
      lastmod: category.updated_at ? new Date(category.updated_at).toISOString() : nowIso,
      changefreq: 'daily',
      priority: 0.8
    }));

    const tagUrls = tags.map(tag => ({
      loc: `${baseUrl}/etiket/${tag.slug}`,
      lastmod: tag.updated_at ? new Date(tag.updated_at).toISOString() : nowIso,
      changefreq: 'daily',
      priority: 0.7
    }));

    const postUrls = posts.map(post => ({
      loc: `${baseUrl}/${post.category_slug}/${post.slug}`,
      lastmod: (post.updated_at || post.published_at || nowIso),
      changefreq: 'weekly',
      priority: 0.7
    }));

    writeSitemapFile('sitemap-pages.xml', pageUrls);
    writeSitemapFile('sitemap-categories.xml', categoryUrls);
    writeSitemapFile('sitemap-tags.xml', tagUrls);
    writeSitemapFile('sitemap-posts.xml', postUrls);

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-tags.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-posts.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
</sitemapindex>`;

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex.trim(), 'utf8');

    console.log('✅ Tüm sitemap dosyaları oluşturuldu!');
    console.log(`📍 Çıktı dizini: ${publicDir}`);
    console.log(`📊 Toplam URL: ${pageUrls.length + categoryUrls.length + tagUrls.length + postUrls.length}`);
  } catch (error) {
    console.error('❌ Sitemap oluşturma hatası:', error);
    process.exit(1);
  }
}

generateSitemaps();