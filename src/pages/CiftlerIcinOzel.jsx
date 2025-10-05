import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Calendar, Users, Coffee, Camera, Moon, Sun, Clock, ArrowRight, Eye, Award } from 'lucide-react';
import { blogPostsWithTags } from '../lib/tags';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';
import { generateSEOTags } from '../utils/seo';

const CiftlerIcinOzel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SEO tags
  const seoTags = generateSEOTags('ciftler-icin-ozel')

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Önce tüm etiketleri getir
      const { data: allTags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      if (tagsError) {
        throw new Error('Etiketler yüklenemedi: ' + tagsError.message)
      }

      // "Çiftler İçin Özel Rotalar" etiketini bul
      const couplesTag = allTags?.find(tag => 
        tag.name === 'Çiftler İçin Özel Rotalar' ||
        tag.slug === 'ciftler-icin-ozel-rotalar' ||
        tag.slug === 'ciftler_icin_ozel_rotalar' ||
        tag.name === 'Çiftler İçin Özel' ||
        tag.slug === 'ciftler-icin-ozel' ||
        tag.slug === 'ciftler_icin_ozel' ||
        tag.name.toLowerCase().includes('çiftler') ||
        tag.slug.includes('ciftler')
      )

      if (couplesTag) {
        // Çiftler İçin Özel etiketli yazıları getir
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            ),
            post_tags!inner (
              tags!inner (
                id,
                name,
                slug
              )
            )
          `)
          .eq('post_tags.tags.slug', couplesTag.slug)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new Error('Çiftler yazıları yüklenemedi: ' + error.message)
        }

        // Veriyi formatla
        const formattedPosts = posts?.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || 'Çiftler için özel seyahat rehberi...',
          image: post.featured_image_url,
          slug: post.slug,
          created_at: post.created_at,
          author: post.author || 'JoinEscapes',
          category: post.categories?.name || 'Çiftler İçin Özel',
          tags: post.post_tags?.map(pt => pt.tags.name) || []
        })) || []

        setPosts(formattedPosts)
      } else {
        console.warn('"Çiftler İçin Özel Rotalar" etiketi bulunamadı')
        setPosts([])
      }
    } catch (error) {
      console.error('Çiftler yazıları yüklenirken hata oluştu:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const coupleTips = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: 'Romantik Planlama',
      description: 'Partnerinizin ilgi alanlarını göz önünde bulundurarak özel anlar yaratın.',
      tips: [
        'Sürpriz etkinlikler planlayın',
        'Ortak hobiler keşfedin',
        'Özel günleri unutmayın',
        'Spontane olun'
      ]
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: 'Zamanı Doğru Seçin',
      description: 'Mevsim koşulları ve kalabalığı göz önünde bulundurarak ideal zamanı seçin.',
      tips: [
        'Omuz sezonları tercih edin',
        'Özel günleri kaçırmayın',
        'Hava durumunu kontrol edin',
        'Yerel festivalleri araştırın'
      ]
    },
    {
      icon: <Camera className="w-8 h-8 text-purple-500" />,
      title: 'Anıları Ölümsüzleştirin',
      description: 'Birlikte yaşadığınız güzel anları kaydetmenin yollarını öğrenin.',
      tips: [
        'Çift fotoğrafları çektirin',
        'Seyahat günlüğü tutun',
        'Video kayıtları yapın',
        'Hatıra eşyalar alın'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* SEO Meta Tags */}
      <SEO {...seoTags} />
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Ana Sayfa', link: '/' },
          { label: 'Çiftler İçin Özel' }
        ]} 
      />
      
      {/* Hero Section */}
      <div 
        className="relative text-white h-[500px] flex items-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/ciftler_icin_tatil_paket_solo_join_escapes_.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Heart className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Çiftler İçin Özel
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100 max-w-3xl mx-auto">
              Sevgilinizle birlikte unutulmaz anlar yaşayabileceğiniz romantik destinasyonlar ve özel deneyimler
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="w-4 h-4" />
                <span>Romantik Destinasyonlar</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="w-4 h-4" />
                <span>Çift Aktiviteleri</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Camera className="w-4 h-4" />
                <span>Özel Anlar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Çiftler İçin Özel İçerikler
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Romantik seyahatlerinizi planlamanıza yardımcı olacak özel yazılar
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(0, 6).map((post) => (
                <Link 
                  key={post.id} 
                  to={`/${post.category.toLowerCase().replace(/\s/g, '-')}/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {post.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.tags[0]}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>{post.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Çiftler İçin Özel Yazı Yok
              </h3>
              <p className="text-gray-600 mb-6">
                Admin panelinden "Çiftler İçin Özel Rotalar" etiketli yazılar ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Couple Tips */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Çiftler İçin Seyahat İpuçları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Birlikte seyahat etmenin keyfini çıkarmanız için özel öneriler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coupleTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  {tip.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{tip.title}</h3>
                <p className="text-gray-600 mb-6 text-center">{tip.description}</p>
                <ul className="space-y-2">
                  {tip.tips.map((tipItem, tipIndex) => (
                    <li key={tipIndex} className="flex items-center gap-2 text-gray-700">
                      <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                      <span className="text-sm">{tipItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-rose-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Aşkınızı Seyahatle Taçlandırın
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Sevgilinizle birlikte unutulmaz anlar yaşamak için hemen planlama yapmaya başlayın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/iletisim" 
              className="bg-white text-pink-600 px-8 py-4 rounded-lg font-medium hover:bg-pink-50 transition-colors duration-300"
            >
              Özel Tur Planla
            </Link>
            <Link 
              to="/haberler" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-pink-600 transition-colors duration-300"
            >
              Daha Fazla İçerik
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CiftlerIcinOzel;