const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase bağlantısı - Doğru credentials
const supabaseUrl = 'https://zhyrmasdozeptezoomnq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeXJtYXNkb3plcHRlem9vbW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ4NjUsImV4cCI6MjA2NDQ2MDg2NX0.u1Mq0iRPOExGHZ-crZXgR9gAlSjk097yashJmPRysy4'

const supabase = createClient(supabaseUrl, supabaseKey)

const SITE_URL = 'https://www.joinescapes.com'

// Statik sayfalar
const STATIC_PAGES = [
  // Ana sayfalar
  { url: '', priority: 1.0, changefreq: 'daily', section: 'Ana Sayfalar' },
  { url: '/haberler', priority: 0.9, changefreq: 'daily', section: 'Ana Sayfalar' },
  { url: '/destinasyonlar', priority: 0.9, changefreq: 'weekly', section: 'Ana Sayfalar' },
  
  // Kategori sayfaları
  { url: '/sanat-ve-cemiyet', priority: 0.8, changefreq: 'daily', section: 'Kategori Sayfaları' },
  { url: '/spa-molalari', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/butik-oteller', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/paket-tatiller', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/oteller', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/luks-seckiler', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/sehir-molalari', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  { url: '/yaz-2025', priority: 0.8, changefreq: 'weekly', section: 'Kategori Sayfaları' },
  
  // Statik sayfalar
  { url: '/hakkimizda', priority: 0.6, changefreq: 'monthly', section: 'Statik Sayfalar' },
  { url: '/iletisim', priority: 0.6, changefreq: 'monthly', section: 'Statik Sayfalar' },
  { url: '/gizlilik-politikasi', priority: 0.3, changefreq: 'yearly', section: 'Statik Sayfalar' },
  { url: '/cerez-politikasi', priority: 0.3, changefreq: 'yearly', section: 'Statik Sayfalar' },
  { url: '/kullanim-sartlari', priority: 0.3, changefreq: 'yearly', section: 'Statik Sayfalar' }
]

// Gerçek kategorileri Supabase'den çek
async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('❌ Kategoriler çekilemedi:', error)
      return []
    }
    
    console.log(`✅ ${data?.length || 0} kategori çekildi`)
    return data || []
  } catch (error) {
    console.error('❌ Kategoriler çekilemedi:', error)
    return []
  }
}

// Gerçek etiketleri Supabase'den çek
async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
    
    if (error) {
      console.error('❌ Etiketler çekilemedi:', error)
      return []
    }
    
    console.log(`✅ ${data?.length || 0} öne çıkan etiket çekildi`)
    return data || []
  } catch (error) {
    console.error('❌ Etiketler çekilemedi:', error)
    return []
  }
}

// Gerçek blog yazılarını Supabase'den çek
async function getBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('posts_with_category')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('❌ Blog yazıları çekilemedi:', error)
      return []
    }
    
    console.log(`✅ ${data?.length || 0} yayınlanan blog yazısı çekildi`)
    return data || []
  } catch (error) {
    console.error('❌ Blog yazıları çekilemedi:', error)
    return []
  }
}

// XML sitemap oluştur
async function generateXMLSitemap() {
  try {
    console.log('🗺️ XML Sitemap oluşturuluyor...')
    
    const [categories, tags, posts] = await Promise.all([
      getCategories(),
      getTags(),
      getBlogPosts()
    ])
    
    const currentDate = new Date().toISOString().split('T')[0]
    let urls = []
    
    // Statik sayfalar
    STATIC_PAGES.forEach(page => {
      urls.push({
        url: `${SITE_URL}${page.url}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority,
        section: page.section
      })
    })
    
    // Kategori arşiv sayfaları
    categories.forEach(category => {
      urls.push({
        url: `${SITE_URL}/kategori/${category.slug}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.7,
        section: 'Kategori Arşivleri'
      })
    })
    
    // Etiket sayfaları
    tags.forEach(tag => {
      urls.push({
        url: `${SITE_URL}/etiket/${tag.slug}`,
        lastmod: currentDate,
    changefreq: 'weekly',
        priority: 0.6,
        section: 'Etiket Sayfaları'
      })
    })
    
    // Blog yazıları
    posts.forEach(post => {
      const postDate = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : currentDate
      urls.push({
        url: `${SITE_URL}/${post.category_slug}/${post.slug}`,
        lastmod: postDate,
    changefreq: 'monthly',
        priority: 0.6,
        section: 'Blog Yazıları'
      })
    })
    
    // İstatistikler
    const stats = {
      total: urls.length,
      sections: {
        'Ana Sayfalar': urls.filter(u => u.section === 'Ana Sayfalar').length,
        'Kategori Sayfaları': urls.filter(u => u.section === 'Kategori Sayfaları').length,
        'Kategori Arşivleri': urls.filter(u => u.section === 'Kategori Arşivleri').length,
        'Etiket Sayfaları': urls.filter(u => u.section === 'Etiket Sayfaları').length,
        'Blog Yazıları': urls.filter(u => u.section === 'Blog Yazıları').length,
        'Statik Sayfalar': urls.filter(u => u.section === 'Statik Sayfalar').length
      }
    }
    
    console.log('📊 Sitemap İstatistikleri:')
    Object.entries(stats.sections).forEach(([section, count]) => {
      console.log(`   ${section}: ${count}`)
    })
    console.log(`   Toplam: ${stats.total}`)
    
    // XML formatında oluştur
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return { xml, urls, stats }
  } catch (error) {
    console.error('❌ XML sitemap oluşturma hatası:', error)
    throw error
  }
}

// HTML sitemap oluştur
async function generateHTMLSitemap() {
  try {
    console.log('🌐 HTML Sitemap oluşturuluyor...')
    
    const [categories, tags, posts] = await Promise.all([
      getCategories(),
      getTags(),
      getBlogPosts()
    ])
    
    const currentDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Statik sayfaları kategorilere göre grupla
    const mainPages = STATIC_PAGES.filter(p => p.section === 'Ana Sayfalar')
    const categoryPages = STATIC_PAGES.filter(p => p.section === 'Kategori Sayfaları')
    const staticPages = STATIC_PAGES.filter(p => p.section === 'Statik Sayfalar')
    
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Haritası - JoinEscapes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; padding: 40px 0; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
        .header p { color: #7f8c8d; font-size: 1.1em; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #3498db; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        .sitemap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
        .section { background: white; border-radius: 10px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section h2 { color: #2c3e50; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #3498db; }
        .section ul { list-style: none; }
        .section li { margin-bottom: 8px; }
        .section a { color: #3498db; text-decoration: none; padding: 5px 0; display: block; transition: color 0.3s; }
        .section a:hover { color: #2980b9; text-decoration: underline; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; color: #7f8c8d; background: white; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗺️ Site Haritası</h1>
            <p>JoinEscapes sitesinin tüm sayfalarına buradan ulaşabilirsiniz</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${mainPages.length}</div>
                <div class="stat-label">Ana Sayfalar</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${categoryPages.length}</div>
                <div class="stat-label">Kategori Sayfaları</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${categories.length}</div>
                <div class="stat-label">Kategori Arşivleri</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${tags.length}</div>
                <div class="stat-label">Etiket Sayfaları</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${posts.length}</div>
                <div class="stat-label">Blog Yazıları</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${staticPages.length}</div>
                <div class="stat-label">Statik Sayfalar</div>
            </div>
        </div>
        
        <div class="sitemap-grid">
            <div class="section">
                <h2>📍 Ana Sayfalar</h2>
                <ul>
                    ${mainPages.map(page => `<li><a href="${page.url || '/'}">${page.url === '' ? 'Ana Sayfa' : page.url.replace('/', '').replace('-', ' ').toUpperCase()}</a></li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>📂 Kategori Sayfaları</h2>
                <ul>
                    ${categoryPages.map(page => `<li><a href="${page.url}">${page.url.replace('/', '').replace('-', ' ').toUpperCase()}</a></li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>🗂️ Kategori Arşivleri</h2>
                <ul>
                    ${categories.map(category => `<li><a href="/kategori/${category.slug}">${category.name}</a></li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>🏷️ Etiket Sayfaları</h2>
                <ul>
                    ${tags.map(tag => `<li><a href="/etiket/${tag.slug}">${tag.name}</a></li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>📝 Blog Yazıları</h2>
                <ul>
                    ${posts.slice(0, 50).map(post => `<li><a href="/${post.category_slug}/${post.slug}">${post.title}</a></li>`).join('')}
                    ${posts.length > 50 ? `<li><em>... ve ${posts.length - 50} yazı daha</em></li>` : ''}
                </ul>
            </div>
            
            <div class="section">
                <h2>📄 Statik Sayfalar</h2>
                <ul>
                    ${staticPages.map(page => `<li><a href="${page.url}">${page.url.replace('/', '').replace('-', ' ').toUpperCase()}</a></li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Son güncelleme: ${currentDate}</p>
            <p>Toplam ${mainPages.length + categoryPages.length + categories.length + tags.length + posts.length + staticPages.length} sayfa</p>
        </div>
    </div>
</body>
</html>`
    
    return html
  } catch (error) {
    console.error('❌ HTML sitemap oluşturma hatası:', error)
    throw error
  }
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🚀 Sitemap oluşturma başlatılıyor...')
    console.log('📡 Supabase bağlantısı kuruluyor...')
    
    // XML ve HTML sitemap'leri oluştur
    const [xmlResult, htmlResult] = await Promise.all([
      generateXMLSitemap(),
      generateHTMLSitemap()
    ])
    
    // Dosyaları kaydet
    const publicDir = path.join(__dirname, '..', 'public')
    const rootDir = path.join(__dirname, '..')
    
    // Public klasörü yoksa oluştur
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    // XML sitemap'i kaydet
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xmlResult.xml)
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xmlResult.xml)
    
    // HTML sitemap'i kaydet
    fs.writeFileSync(path.join(rootDir, 'sitemap.html'), htmlResult)
    fs.writeFileSync(path.join(publicDir, 'sitemap.html'), htmlResult)
    
    console.log('✅ Sitemap dosyaları başarıyla oluşturuldu!')
    console.log('📁 Dosya yolları:')
    console.log(`   - ${path.join(rootDir, 'sitemap.xml')}`)
    console.log(`   - ${path.join(publicDir, 'sitemap.xml')}`)
    console.log(`   - ${path.join(rootDir, 'sitemap.html')}`)
    console.log(`   - ${path.join(publicDir, 'sitemap.html')}`)
    
  } catch (error) {
    console.error('❌ Sitemap oluşturma hatası:', error)
    process.exit(1)
  }
}

// Scripti çalıştır
if (require.main === module) {
  main()
}

module.exports = {
  generateXMLSitemap,
  generateHTMLSitemap,
  getCategories,
  getTags,
  getBlogPosts
} 