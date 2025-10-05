import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  siteName, 
  author, 
  twitterHandle,
  publishedTime,
  modifiedTime,
  type = 'website',
  noindex = false,
  nofollow = false,
  category,
  tags = []
}) => {
  // Robots meta tag'ini dinamik olarak oluştur
  const robotsContent = noindex 
    ? 'noindex, nofollow' 
    : nofollow 
    ? 'index, nofollow' 
    : 'index, follow'

  // Canonical URL'yi tam URL yap
  const canonicalUrl = url?.startsWith('http') ? url : `https://www.joinescapes.com${url || ''}`
  
  // Open Graph image'ı tam URL yap
  const ogImage = image?.startsWith('http') ? image : `https://www.joinescapes.com${image || '/images/join_escape_logo_siyah.webp'}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {category && <meta property="article:section" content={category} />}
          {tags.length > 0 && tags.map((tag, index) => (
            <meta key={`article-tag-${index}`} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional SEO Tags */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      
      {/* Language and Region */}
      <meta name="language" content="Turkish" />
      <meta name="geo.region" content="TR" />
      <meta name="geo.country" content="Turkey" />
      <meta name="geo.placename" content="Turkey" />
      
      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Performance and Security */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="coverage" content="worldwide" />
      <meta name="target" content="all" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebSite',
          "name": title,
          "description": description,
          "url": canonicalUrl,
          "image": ogImage,
          "author": {
            "@type": "Organization",
            "name": author,
            "url": "https://www.joinescapes.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "url": "https://www.joinescapes.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.joinescapes.com/images/join_escape_logo_siyah.webp",
              "width": 200,
              "height": 60
            },
            "sameAs": [
              "https://twitter.com/joinescapes",
              "https://www.facebook.com/joinescapes",
              "https://www.instagram.com/joinescapes"
            ]
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "inLanguage": "tr-TR",
          "isAccessibleForFree": true,
          ...(type === 'article' && publishedTime && {
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "headline": title,
            "articleSection": category,
            "keywords": keywords,
            "wordCount": description?.split(' ').length || 0
          }),
          ...(type === 'website' && {
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.joinescapes.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        })}
      </script>
      
      {/* Additional Structured Data for Articles */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": {
              "@type": "ImageObject",
              "url": ogImage,
              "width": 1200,
              "height": 630
            },
            "author": {
              "@type": "Organization",
              "name": "JoinEscapes",
              "url": "https://www.joinescapes.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.joinescapes.com/images/join_escape_logo_siyah.webp",
                "width": 200,
                "height": 60
              }
            },
            "publisher": {
              "@type": "Organization",
              "name": "JoinEscapes",
              "url": "https://www.joinescapes.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.joinescapes.com/images/join_escape_logo_siyah.webp",
                "width": 200,
                "height": 60
              },
              "sameAs": [
                "https://twitter.com/joinescapes",
                "https://www.facebook.com/joinescapes",
                "https://www.instagram.com/joinescapes",
                "https://www.youtube.com/@joinescapes"
              ]
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            "articleSection": category,
            "keywords": keywords,
            "wordCount": description?.split(' ').length || 0,
            "inLanguage": "tr-TR",
            "isAccessibleForFree": true,
            "genre": "Travel",
            "about": [
              {
                "@type": "Thing",
                "name": "Travel"
              },
              {
                "@type": "Thing", 
                "name": "Tourism"
              },
              {
                "@type": "Thing",
                "name": "Destinations"
              }
            ],
            "mentions": tags.map((tag, index) => ({
              "@type": "Thing",
              "name": tag,
              "key": `mention-${index}`
            }))
          })}
        </script>
      )}

      {/* BreadcrumbList Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Ana Sayfa",
              "item": "https://www.joinescapes.com"
            },
            ...(category ? [{
              "@type": "ListItem",
              "position": 2,
              "name": category,
              "item": canonicalUrl
            }] : [])
          ]
        })}
      </script>

      {/* WebSite Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "JoinEscapes",
          "alternateName": ["Join Escapes", "JoinEscape"],
          "url": "https://www.joinescapes.com",
          "description": "Türkiye'nin en kapsamlı seyahat ve destinasyon platformu",
          "publisher": {
            "@type": "Organization",
            "name": "JoinEscapes",
            "url": "https://www.joinescapes.com"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.joinescapes.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "inLanguage": "tr-TR",
          "isAccessibleForFree": true
        })}
      </script>

      {/* Additional Structured Data for Travel Website */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "JoinEscapes",
            "alternateName": ["Join Escapes", "JoinEscape", "Join Escapes Türkiye"],
            "description": "Türkiye'nin en kapsamlı seyahat ve destinasyon platformu. En güncel seyahat haberleri, otel önerileri, uçak bileti fırsatları, turizm rehberi ve destinasyon tanıtımları.",
            "url": "https://www.joinescapes.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.joinescapes.com/images/join_escape_logo_siyah.webp",
              "width": 200,
              "height": 60
            },
            "image": {
              "@type": "ImageObject",
              "url": "https://www.joinescapes.com/images/join_escape_logo_siyah.webp",
              "width": 1200,
              "height": 630
            },
            "foundingDate": "2024",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "TR",
              "addressLocality": "İstanbul",
              "addressRegion": "İstanbul"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "info@joinescapes.com",
              "availableLanguage": ["Turkish", "English"]
            },
            "sameAs": [
              "https://www.facebook.com/joinescapes",
              "https://www.instagram.com/joinescapes",
              "https://www.youtube.com/@joinescapes",
              "https://twitter.com/joinescapes"
            ],
            "knowsAbout": [
              "Seyahat Rehberi",
              "Otel Önerileri",
              "Uçak Bileti",
              "Turizm Haberleri",
              "Destinasyon Tanıtımları",
              "Paket Turlar",
              "Lüks Seyahat",
              "Butik Oteller",
              "Spa Molaları",
              "Gurme Rotaları",
              "Vizesiz Rotalar",
              "Cruise Rotaları"
            ],
            "areaServed": {
              "@type": "Country",
              "name": "Türkiye"
            },
            "serviceType": [
              "Seyahat Rehberi",
              "Turizm Haberleri",
              "Otel Önerileri",
              "Destinasyon Tanıtımları"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Seyahat Hizmetleri",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Seyahat Rehberi",
                    "description": "Kapsamlı seyahat rehberi ve önerileri"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Otel Önerileri",
                    "description": "En iyi otel seçenekleri ve değerlendirmeleri"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Turizm Haberleri",
                    "description": "Güncel turizm ve seyahat haberleri"
                  }
                }
              ]
            }
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEO 