// SEO Utility Functions
export const seoConfig = {
  siteName: 'JoinEscapes',
  siteUrl: 'https://www.joinescapes.com',
  defaultTitle: 'JoinEscapes - Türkiye\'nin En Kapsamlı Seyahat ve Destinasyon Rehberi | Join Escapes',
  defaultDescription: 'Eşsiz destinasyonlar, gurme rotalar, lüks oteller, vizesiz seyahat rehberleri ve unutulmaz seyahat deneyimleri. Türkiye\'nin en güncel seyahat platformu Join Escapes.',
  defaultKeywords: 'joinescapes, join escapes, seyahat, turizm, destinasyon, otel, tatil, gezi, rehber, türkiye, seyahat önerileri, gurme rotalar, vizesiz seyahat, lüks oteller, cruise rotaları',
  defaultImage: '/images/join_escape_logo_siyah.webp',
  twitterHandle: '@joinescapes',
  author: 'JoinEscapes Editör Ekibi',
  language: 'tr-TR',
  country: 'TR'
};

export const specialPageConfigs = {
  '/solo-gezginler': {
    title: 'Solo Gezginler İçin Seyahat Rehberi ve Güvenli Destinasyonlar | JoinEscapes | Join Escapes',
    description: 'Tek başına seyahat etmek isteyenler için güvenli destinasyonlar, pratik ipuçları ve solo seyahat rehberi. Bağımsız gezginler için özel öneriler ve güvenlik tavsiyeleri. Join Escapes ile özgür olun.',
    keywords: 'joinescapes, join escapes, solo seyahat, tek başına gezi, bağımsız seyahat, solo gezginler, tek kişilik tatil, solo backpacking, güvenli solo destinasyonlar, solo travel tips',
    ogImage: '/images/solo-travel-og.webp'
  },
  '/cruise-rotalari': {
    title: 'Cruise Rotaları ve Lüks Gemi Turları Rehberi | JoinEscapes | Join Escapes',
    description: 'En popüler cruise rotaları, lüks gemi turları ve deniz seyahati rehberi. Akdeniz, Ege, Karayip ve dünya cruise rotaları hakkında detaylı bilgiler ve öneriler. Join Escapes ile denizde olun.',
    keywords: 'joinescapes, join escapes, cruise rotaları, gemi turları, deniz seyahati, cruise tatili, akdeniz cruise, ege cruise, karayip cruise, norveç cruise, lüks cruise, all inclusive cruise',
    ogImage: '/images/cruise-routes-og.webp'
  },
  '/vizesiz-rotalar': {
    title: 'Vizesiz Seyahat Rotaları | Türk Vatandaşları İçin Güncel Rehber | JoinEscapes | Join Escapes',
    description: 'Türk vatandaşlarının vize almadan seyahat edebileceği ülkeler ve destinasyonlar. Güncel vizesiz seyahat rehberi, pratik bilgiler ve en iyi vizesiz rotalar. Join Escapes ile kolayca seyahat edin.',
    keywords: 'joinescapes, join escapes, vizesiz seyahat, vize gerektirmeyen ülkeler, türk vatandaşları vizesiz, pasaport ile seyahat, vizesiz destinasyonlar, schengen vizesiz, vizesiz tatil',
    ogImage: '/images/visa-free-og.webp'
  },
  '/ciftler-icin-ozel': {
    title: 'Çiftler İçin Özel Romantik Seyahat Rehberi ve Balayı Destinasyonları | JoinEscapes | Join Escapes',
    description: 'Sevgilinizle birlikte unutulmaz anlar yaşayabileceğiniz romantik destinasyonlar, çift aktiviteleri ve özel seyahat önerileri. Balayı ve romantik tatil rehberi. Join Escapes ile aşkı yaşayın.',
    keywords: 'joinescapes, join escapes, çiftler için seyahat, romantik destinasyonlar, balayı yerleri, çift tatili, romantik tatil, sevgililer günü seyahati, çift aktiviteleri, romantik şehirler, balayı rehberi',
    ogImage: '/images/couples-special-og.webp'
  }
};

// Sayfa bazında SEO konfigürasyonları
export const pageConfigs = {
  home: {
    title: 'JoinEscapes - Türkiye\'nin En Kapsamlı Seyahat ve Destinasyon Rehberi | Join Escapes',
    description: 'JoinEscapes, Türkiye\'nin en kapsamlı seyahat ve destinasyon platformudur. Eşsiz destinasyonlar, gurme rotalar, lüks oteller, vizesiz seyahat rehberleri ve unutulmaz seyahat deneyimleri sunar. En güncel seyahat haberleri, otel önerileri ve turizm rehberi.',
    keywords: 'joinescapes, join escapes, seyahat, turizm, destinasyon, otel, tatil, gezi, rehber, türkiye, seyahat önerileri, gurme rotalar, vizesiz seyahat, lüks oteller, cruise rotaları, butik oteller, spa molaları, paket tatiller',
    image: '/images/join_escape_logo_siyah.webp'
  },
  destinations: {
    title: 'Destinasyonlar - Dünya\'nın En Güzel Yerleri ve Seyahat Rehberleri | JoinEscapes | Join Escapes',
    description: 'Dünya\'nın en güzel destinasyonları, gezilecek yerler ve detaylı seyahat rehberleri. Hayalinizdeki tatili planlayın ve unutulmaz deneyimler yaşayın. Join Escapes ile keşfedin.',
    keywords: 'joinescapes, join escapes, destinasyon, gezilecek yerler, seyahat rehberi, tatil yerleri, dünya turu, popüler destinasyonlar, seyahat planı',
    image: '/images/destinations/maldives.webp'
  },
  news: {
    title: 'Seyahat Haberleri - Güncel Turizm Haberleri ve Seyahat Trendleri | JoinEscapes | Join Escapes',
    description: 'En güncel seyahat haberleri, turizm sektörü gelişmeleri ve seyahat trendleri. Seyahat dünyasından son haberler ve önemli gelişmeler. Join Escapes ile takip edin.',
    keywords: 'joinescapes, join escapes, seyahat haberleri, turizm haberleri, seyahat trendleri, turizm sektörü, güncel seyahat, turizm gelişmeleri',
    image: '/images/seyahat_onerileri_join_escapes.webp'
  },
  'seyahat-onerileri': {
    title: 'Seyahat Önerileri - Uzmanlardan Pratik İpuçları ve Deneyimler | JoinEscapes | Join Escapes',
    description: 'Uzmanlardan pratik seyahat ipuçları, deneyimler ve öneriler. Seyahat planlamanızı kolaylaştıran rehberler ve tavsiyeler. Join Escapes ile öğrenin.',
    keywords: 'joinescapes, join escapes, seyahat önerileri, seyahat ipuçları, seyahat deneyimleri, seyahat rehberi, pratik öneriler',
    image: '/images/seyahat_onerileri_join_escapes.webp'
  },
  'gurme-rotalari': {
    title: 'Gurme Rotaları - Dünya Mutfakları ve Lezzet Yolculukları Rehberi | JoinEscapes | Join Escapes',
    description: 'Dünya\'nın en iyi gurme destinasyonları, michelin yıldızlı restoranlar ve lezzet yolculukları. Damak tadınıza göre seyahat edin ve gastronomi deneyimleri yaşayın. Join Escapes ile keşfedin.',
    keywords: 'joinescapes, join escapes, gurme rotalar, michelin, dünya mutfakları, lezzet yolculuğu, gastronomi turizmi, gurme seyahat, michelin restoranları',
    image: '/images/gurme_rotaları_.webp'
  },
  'ucuz-ucus-rotalari': {
    title: 'Ucuz Uçuş Rotaları - En Uygun Uçak Bileti Fırsatları ve Ekonomik Seyahat | JoinEscapes | Join Escapes',
    description: 'En ucuz uçuş rotaları, ekonomik uçak biletleri ve seyahat fırsatları. Bütçe dostu seyahat planları ve uygun fiyatlı tatil önerileri. Join Escapes ile tasarruf edin.',
    keywords: 'joinescapes, join escapes, ucuz uçuş, ekonomik uçak bileti, budget seyahat, uygun fiyat uçuş, ucuz tatil, ekonomik seyahat, uçak bileti fırsatları',
    image: '/images/join_Escapes_ucuz_ucus_rotalari.webp'
  },
  'luks-seckiler': {
    title: 'Lüks Seçkiler - Premium Seyahat Deneyimleri ve Lüks Tatil Rehberi | JoinEscapes | Join Escapes',
    description: 'Lüks oteller, premium seyahat deneyimleri ve özel tatil paketleri. Hayalinizdeki lüks tatili yaşayın ve unutulmaz anlar biriktirin. Join Escapes ile lüks yaşayın.',
    keywords: 'joinescapes, join escapes, lüks otel, premium seyahat, lüks tatil, özel deneyim, lüks turizm, 5 yıldızlı otel, premium tatil',
    image: '/images/join_escapes_lux_seckiler.webp'
  },
  'solo-gezginler': {
    title: 'Solo Gezginler - Tek Başına Seyahat Rehberi ve Güvenli Destinasyonlar | JoinEscapes | Join Escapes',
    description: 'Solo seyahat rehberleri, güvenli destinasyonlar ve tek başına seyahat ipuçları. Özgürce keşfetmenin tadını çıkarın ve bağımsız seyahat deneyimleri yaşayın. Join Escapes ile özgür olun.',
    keywords: 'joinescapes, join escapes, solo seyahat, tek başına seyahat, solo gezgin, güvenli destinasyon, solo travel, bağımsız seyahat, tek kişilik tatil',
    image: '/images/solo_seyahat_rehberi_join_escapes_.webp'
  },
  'cruise-rotalari': {
    title: 'Cruise Rotaları - Lüks Cruise Seyahatleri ve Gemi Turları Rehberi | JoinEscapes | Join Escapes',
    description: 'Lüks cruise gemileriyle unutulmaz yolculuklar, popüler cruise rotaları ve deniz seyahati rehberleri. Deniz üzerinde tatil deneyimi yaşayın. Join Escapes ile denizde olun.',
    keywords: 'joinescapes, join escapes, cruise, deniz seyahati, lüks cruise, cruise rotaları, gemi turu, all inclusive cruise, akdeniz cruise, ege cruise',
    image: '/images/join_escapes_cruise__gemi_turları.webp'
  },
  'vizesiz-rotalar': {
    title: 'Vizesiz Rotalar - Pasaportla Gidilen Ülkeler ve Vizesiz Seyahat Rehberi | JoinEscapes | Join Escapes',
    description: 'Türk vatandaşlarının sadece pasaportla gidebileceği ülkeler, vizesiz seyahat rehberleri ve pratik bilgiler. Vize almadan seyahat edin. Join Escapes ile kolayca seyahat edin.',
    keywords: 'joinescapes, join escapes, vizesiz seyahat, vize gerektirmeyen ülkeler, türk vatandaşları vizesiz, pasaport ile seyahat, vizesiz destinasyonlar, schengen vizesiz, vizesiz tatil',
    image: '/images/visa-free-og.webp'
  },
  'butik-oteller': {
    title: 'Butik Oteller - Özel ve Karakteristik Konaklama Deneyimleri | JoinEscapes | Join Escapes',
    description: 'Dünya\'nın en güzel butik otelleri, karakteristik konaklama seçenekleri ve özel atmosferli oteller. Benzersiz konaklama deneyimleri yaşayın. Join Escapes ile özel olun.',
    keywords: 'joinescapes, join escapes, butik otel, özel konaklama, karakteristik otel, tasarım otel, boutique hotel, özel atmosfer',
    image: '/images/join_escapes_butik_otel_butiqe_hotek.webp'
  },
  'oteller': {
    title: 'Seçkin Oteller - Lüks Konaklama Deneyimleri ve Premium Oteller | JoinEscapes | Join Escapes',
    description: 'Dünyanın en seçkin otellerinde unutulmaz konaklama deneyimleri. Lüks oteller, premium hizmetler ve exclusive konaklama seçenekleri. Join Escapes ile lüks yaşayın.',
    keywords: 'joinescapes, join escapes, seçkin oteller, lüks otel, premium konaklama, 5 yıldızlı otel, lüks tatil, exclusive otel',
    image: '/images/join_escapes_her_sey_dahil_tatil.webp'
  },
  'paket-tatiller': {
    title: 'Paket Tatiller - Her Şey Dahil Tatil Paketleri ve Seyahat Fırsatları | JoinEscapes | Join Escapes',
    description: 'Her şey dahil tatil paketleri ile rahat ve keyifli seyahat deneyimleri. En uygun fiyatlı tatil paketleri ve seyahat fırsatları. Join Escapes ile paket tatil yapın.',
    keywords: 'joinescapes, join escapes, paket tatil, her şey dahil, tatil paketi, seyahat paketi, all inclusive, tatil fırsatları',
    image: '/images/join_escapes_her_sey_dahil_tatil.webp'
  },
  'spa-molalari': {
    title: 'Spa Molaları - Wellness Destinasyonları ve Spa Deneyimleri | JoinEscapes | Join Escapes',
    description: 'Ruhunuzu ve bedeninizi yenileyen spa deneyimleri ve wellness destinasyonları. Dünya çapında en iyi spa ve wellness merkezleri. Join Escapes ile yenilenin.',
    keywords: 'joinescapes, join escapes, spa molaları, wellness, spa deneyimi, termal havuzlar, ayurveda, yoga retreat, spa oteller',
    image: '/images/join_escapes_spa_molalari_spa_otelleri_.webp'
  },
  'sehir-molalari': {
    title: 'Şehir Molaları - Dünya Şehirleri ve Kültür Deneyimleri | JoinEscapes | Join Escapes',
    description: 'Dünyanın en büyüleyici şehirlerini keşfedin, her köşesinde farklı bir hikaye yaşayın. Şehir keşfi ve kültür deneyimleri. Join Escapes ile şehirleri keşfedin.',
    keywords: 'joinescapes, join escapes, şehir molaları, şehir keşfi, kültür deneyimi, şehir turu, metropol seyahat, şehir rehberi',
    image: '/images/join_escapes_sehir_molalari_.webp'
  },
  'yaz-2025': {
    title: 'Yaz 2025 - Bu Yaz Unutulmaz Anılar Biriktireceğiniz Destinasyonlar | JoinEscapes | Join Escapes',
    description: 'Bu yaz unutulmaz anılar biriktireceğiniz en özel destinasyonlar. Yaz 2025 için hazırlanan özel rehberler ve tatil önerileri. Join Escapes ile yazı yaşayın.',
    keywords: 'joinescapes, join escapes, yaz 2025, yaz tatili, yaz destinasyonları, yaz fırsatları, yaz seyahat, yaz rehberi',
    image: '/images/join_escape_yaz_2025.webp'
  },
  'celebrity': {
    title: 'Sanat ve Cemiyet - Ünlülerin Tercih Ettiği Destinasyonlar | JoinEscapes | Join Escapes',
    description: 'Sanat ve cemiyet dünyasından en güncel haberler: Ünlülerin tatil rotaları, sanat etkinlikleri, yeme-içme durakları ve özel keşifler.',
    keywords: 'joinescapes, join escapes, sanat ve cemiyet, ünlü destinasyonları, premium deneyimler, lüks yaşam, ünlü tatil, exclusive destinasyonlar',
    image: '/images/join_escape_celebrity_destinations_.webp'
  },
  about: {
    title: 'Hakkımızda - JoinEscapes Kimdir? Misyonumuz ve Vizyonumuz | Join Escapes',
    description: 'JoinEscapes hakkında bilgi edinin. Misyonumuz, vizyonumuz ve seyahat dünyasına katkılarımız. Seyahat tutkusu ile başlayan hikayemiz. Join Escapes ile tanışın.',
    keywords: 'joinescapes, join escapes, hakkımızda, seyahat platformu, turizm, misyon, vizyon, seyahat rehberi',
    image: '/images/join_escapes_destinasyonlar.webp'
  },
  contact: {
    title: 'İletişim - JoinEscapes ile İletişime Geçin | Sorularınız ve Önerileriniz | Join Escapes',
    description: 'JoinEscapes ile iletişime geçin. Sorularınız, önerileriniz ve işbirliği teklifleriniz için bizimle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız. Join Escapes ile konuşun.',
    keywords: 'joinescapes, join escapes, iletişim, seyahat, turizm, işbirliği, öneri, müşteri hizmetleri',
    image: '/images/join_escapes_destinasyonlar.webp'
  },
  'privacy-policy': {
    title: 'Gizlilik Politikası - JoinEscapes Kişisel Veri Koruma | Join Escapes',
    description: 'JoinEscapes gizlilik politikası. Kişisel verilerinizin nasıl korunduğu ve kullanıldığı hakkında detaylı bilgi. KVKK uyumlu veri koruma. Join Escapes ile güvende olun.',
    keywords: 'joinescapes, join escapes, gizlilik politikası, kişisel veri koruma, kvkk, veri güvenliği, gizlilik',
    image: '/images/join_escapes_destinasyonlar.webp'
  },
  'terms-of-service': {
    title: 'Kullanım Şartları - JoinEscapes Hizmet Şartları | Join Escapes',
    description: 'JoinEscapes kullanım şartları ve hizmet koşulları. Platform kullanımı, haklar ve sorumluluklar hakkında detaylı bilgi. Join Escapes ile güvenli kullanım.',
    keywords: 'joinescapes, join escapes, kullanım şartları, hizmet koşulları, platform kuralları, kullanıcı hakları',
    image: '/images/join_escapes_destinasyonlar.webp'
  },
  'cookie-policy': {
    title: 'Çerez Politikası - JoinEscapes Çerez Kullanımı | Join Escapes',
    description: 'JoinEscapes çerez politikası. Web sitesinde kullanılan çerezler ve amaçları hakkında detaylı bilgi. Çerez tercihlerinizi yönetin. Join Escapes ile şeffaf kullanım.',
    keywords: 'joinescapes, join escapes, çerez politikası, cookie policy, çerez kullanımı, veri toplama',
    image: '/images/join_escapes_destinasyonlar.webp'
  }
}

// SEO meta tags oluşturma fonksiyonu
export const generateSEOTags = (pageKey, customData = {}) => {
  const config = specialPageConfigs[`/${pageKey}`] || pageConfigs[pageKey] || pageConfigs.home
  const baseConfig = seoConfig

  return {
    title: customData.title || config.title,
    description: customData.description || config.description,
    keywords: customData.keywords || config.keywords,
    image: customData.image || config.image,
    url: customData.url || `${baseConfig.siteUrl}${pageKey === 'home' ? '' : `/${pageKey}`}`,
    siteName: baseConfig.siteName,
    author: baseConfig.author,
    twitterHandle: baseConfig.twitterHandle,
    language: baseConfig.language,
    country: baseConfig.country
  }
}

// Blog post için SEO tags
export const generateBlogSEOTags = (post) => {
  const baseConfig = seoConfig
  
  // Post etiketlerini al
  const postTags = post.tag_objects?.map(tag => tag.name) || []
  const keywords = postTags.length > 0 ? `joinescapes, join escapes, ${postTags.join(', ')}` : baseConfig.defaultKeywords
  
  return {
    title: `${post.title} | JoinEscapes | Join Escapes`,
    description: post.excerpt || post.description || baseConfig.defaultDescription,
    keywords: keywords,
    image: post.featured_image_url || baseConfig.defaultImage,
    url: `${baseConfig.siteUrl}/${post.category_slug}/${post.slug}`,
    siteName: baseConfig.siteName,
    author: post.author_name || baseConfig.author,
    publishedTime: post.published_at || post.created_at,
    modifiedTime: post.updated_at,
    type: 'article',
    category: post.category_name,
    tags: postTags
  }
}

// Kategori sayfası için SEO tags
export const generateCategorySEOTags = (category, posts = []) => {
  const baseConfig = seoConfig
  const postCount = posts.length
  
  // Kategori için en uygun görseli seç
  let categoryImage = baseConfig.defaultImage
  
  if (posts.length > 0) {
    // İlk yazının görselini kullan
    categoryImage = posts[0]?.featured_image_url || baseConfig.defaultImage
  }
  
  return {
    title: `${category.name} - ${postCount} İçerik ve Seyahat Rehberi | JoinEscapes`,
    description: `${category.name} kategorisindeki en güncel ${postCount} içerik. Seyahat rehberleri, öneriler ve detaylı bilgiler.`,
    keywords: `${category.name}, seyahat, turizm, rehber, ${category.slug}, ${category.name.toLowerCase()}`,
    image: categoryImage,
    url: `${baseConfig.siteUrl}/kategori/${category.slug}`,
    siteName: baseConfig.siteName,
    author: baseConfig.author,
    category: category.name
  }
}

// Etiket sayfası için SEO tags
export const generateTagSEOTags = (tag, posts = []) => {
  const baseConfig = seoConfig
  const postCount = posts.length
  
  return {
    title: `${tag.name} - ${postCount} İçerik | JoinEscapes`,
    description: `${tag.name} etiketli ${postCount} seyahat içeriği. ${tag.name} ile ilgili seyahat rehberleri ve öneriler.`,
    keywords: `${tag.name}, seyahat, turizm, ${tag.slug}, ${tag.name.toLowerCase()}`,
    image: baseConfig.defaultImage,
    url: `${baseConfig.siteUrl}/etiket/${tag.slug}`,
    siteName: baseConfig.siteName,
    author: baseConfig.author,
    tags: [tag.name]
  }
} 