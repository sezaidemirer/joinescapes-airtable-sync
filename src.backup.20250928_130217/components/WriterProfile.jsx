import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Star, BookOpen, Camera, Edit, Globe, Heart, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WriterProfile = () => {
  const { slug } = useParams();
  const [writer, setWriter] = useState(null);
  const [writerPosts, setWriterPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slug'dan name'e çevir (ters işlem)
  const slugToName = (slug) => {
    return slug
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Yazarın yazılarını getir
  const fetchWriterPosts = async (authorName) => {
    try {
      // console.log('📝 Yazarın yazıları aranıyor:', authorName);
      
      // Önce tam eşleşme dene
      let { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, featured_image_url, published_at, views, likes, author_name')
        .eq('author_name', authorName)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      // Tam eşleşme bulunamazsa, kısmi eşleşme dene
      if (!data || data.length === 0) {
        // console.log('🔍 Tam eşleşme bulunamadı, kısmi arama yapılıyor...');
        
        // HER YAZAR İÇİN DİNAMİK ARAMA KRİTERLERİ
        const searchTerms = [
          authorName, // "Aleyna Gemi" veya "Beste Duran"
          authorName.split(' ')[0], // "Aleyna" veya "Beste"
          authorName.split(' ')[1] || '', // "Gemi" veya "Duran"
          authorName.toLowerCase(), // "aleyna gemi"
          authorName.split(' ')[0].toLowerCase() // "aleyna"
        ].filter(term => term && term.trim()); // Boş terimleri filtrele
        
        // console.log('🔍 Arama terimleri:', searchTerms);
        
        for (const searchTerm of searchTerms) {
          // console.log('🔍 Deneniyor:', searchTerm);
          const result = await supabase
            .from('posts')
            .select('id, title, slug, excerpt, featured_image_url, published_at, views, likes, author_name')
            .ilike('author_name', `%${searchTerm}%`)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(6);
          
          if (result.data && result.data.length > 0) {
            // console.log('✅ Yazılar bulundu:', searchTerm, 'sayı:', result.data.length);
            data = result.data;
            error = result.error;
            break;
          }
        }
      }

      if (error) {
        console.error('❌ Yazı fetch hatası:', error);
        return [];
      }

      // console.log('📊 Bulunan yazılar:', data?.length || 0);
      if (data && data.length > 0) {
        // console.log('✅ Yazarın yazıları bulundu:', data.map(p => `${p.title} (${p.author_name})`));
      } else {
        // console.log('⚠️ Bu yazarın henüz yazısı yok:', authorName);
      }
      
      if (data && data.length > 0) {
        return data.map(post => ({
          title: post.title,
          date: new Date(post.published_at).toLocaleDateString('tr-TR'),
          image: post.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          slug: post.slug,
          views: post.views || 0,
          likes: post.likes || 0
        }));
      }
      return [];
    } catch (err) {
      console.error('❌ Yazı fetch hatası:', err);
      return [];
    }
  };

  useEffect(() => {
    const fetchWriter = async () => {
      setLoading(true);
      setError(null);

      try {
        // Gerçek verilerden çek - birden fazla arama yöntemi dene
        const searchName = slugToName(slug);
        console.log('🔍 Yazar aranıyor:', searchName, 'slug:', slug);

        // Önce tam eşleşme dene
        let { data, error } = await supabase
          .from('writer_profiles')
          .select('*')
          .eq('name', searchName)
          .single();

        // Tam eşleşme bulunamazsa, kısmi eşleşme dene
        if (error && error.code === 'PGRST116') {
          console.log('🔍 Tam eşleşme bulunamadı, kısmi arama yapılıyor...');
          const result = await supabase
            .from('writer_profiles')
            .select('*')
            .ilike('name', `%${searchName}%`);
          
          data = result.data?.[0] || null;
          error = result.error;
        }

        // Hala bulunamazsa, slug'ın kendisiyle dene
        if (!data && error) {
          console.log('🔍 İsimle bulunamadı, slug ile deneniyor:', slug);
          const result = await supabase
            .from('writer_profiles')
            .select('*')
            .ilike('name', `%${slug.replace(/-/g, '%')}%`);
          
          data = result.data?.[0] || null;
          error = result.error;
        }

        if (error) {
          console.error('❌ Yazar bulunamadı:', error);
          setError('Yazar bulunamadı');
        } else if (data) {
          console.log('✅ Yazar bulundu:', data);
          
          // Yazarın yazılarını getir - tam isimle
          const posts = await fetchWriterPosts(data.name);
          
          // Supabase verisini format et
          const formattedWriter = {
            id: data.id,
            name: data.name,
            title: data.title || 'Yazar',
            image: data.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            bio: data.bio || 'Bu yazar henüz bio bilgisi eklememiş.',
            location: data.location || 'Türkiye',
            joinDate: data.join_date ? new Date(data.join_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : 'Eylül 2024',
            followers: data.followers ? (data.followers >= 1000 ? `${(data.followers / 1000).toFixed(1)}K` : data.followers.toString()) : '0',
            posts: posts.length,
            specialties: typeof data.specialties === 'string' ? JSON.parse(data.specialties) : (data.specialties || []),
            socialMedia: typeof data.social_media === 'string' ? JSON.parse(data.social_media) : (data.social_media || {}),
            recentPosts: posts
          };
          
          setWriter(formattedWriter);
          setWriterPosts(posts);
        } else {
          console.log('⚠️ Yazar profili bulunamadı, slug:', slug);
          setError('Yazar bulunamadı');
        }
      } catch (err) {
        console.error('❌ Fetch hatası:', err);
        setError('Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchWriter();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yazar profili yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !writer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Yazar bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız yazar profili mevcut değil.</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-white/80 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Ana Sayfa
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img 
                src={writer.image} 
                alt={writer.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{writer.name}</h1>
              <p className="text-xl text-white/90 mb-4">{writer.title}</p>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-2xl">
                {writer.bio}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{writer.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Katıldı: {writer.joinDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{writer.followers} Takipçi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{writer.posts} Yazı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-primary-600" />
                Son Yazılar
              </h2>
              
              {writer.recentPosts && writer.recentPosts.length > 0 ? (
                <div className="space-y-6">
                  {writer.recentPosts.map((post, index) => (
                    <div key={index} className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span>{post.date}</span>
                        </div>
                        <Link 
                          to={`/seyahat/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Devamını Oku →
                        </Link>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yazı yok</h3>
                  <p className="text-gray-500">Bu yazar henüz hiç yazı paylaşmamış.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Uzmanlık Alanları */}
            {writer.specialties && writer.specialties.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary-600" />
                  Uzmanlık Alanları
                </h3>
                <div className="flex flex-wrap gap-2">
                  {writer.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sosyal Medya */}
            {writer.socialMedia && Object.keys(writer.socialMedia).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary-600" />
                  Sosyal Medya
                </h3>
                <div className="space-y-3">
                  {writer.socialMedia.instagram && (
                    <a 
                      href={`https://instagram.com/${writer.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{writer.socialMedia.instagram}</span>
                    </a>
                  )}
                  {writer.socialMedia.blog && (
                    <a 
                      href="#"
                      className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{writer.socialMedia.blog}</span>
                    </a>
                  )}
                  {writer.socialMedia.twitter && (
                    <a 
                      href={`https://twitter.com/${writer.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{writer.socialMedia.twitter}</span>
                    </a>
                  )}
                  {writer.socialMedia.blog && (
                    <a 
                      href={writer.socialMedia.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Kişisel Blog</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* İstatistikler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Yazı</span>
                  <span className="font-semibold text-gray-900">{writer.posts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Takipçi</span>
                  <span className="font-semibold text-gray-900">{writer.followers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Üyelik</span>
                  <span className="font-semibold text-gray-900">{writer.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        <button className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WriterProfile;