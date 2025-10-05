import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Calendar, Star, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const AllWriters = () => {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slug oluştur (name'den)
  const createSlug = (name) => {
    return name?.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'yazar';
  };

  useEffect(() => {
    const fetchAllWriters = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Tüm yazarlar yükleniyor...');
        
        const { data, error } = await supabase
          .from('writer_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Yazarlar yüklenemedi:', error);
          setError('Yazarlar yüklenemedi');
        } else if (data) {
          // Admin hesabını filtrele (test@test.com)
          const filteredWriters = data.filter(writer => 
            writer.email !== 'test@test.com' && 
            writer.name !== 'test' &&
            writer.name !== 'admin'
          );
          console.log('✅ Yazarlar yüklendi:', filteredWriters.length);
          setWriters(filteredWriters);
        } else {
          setError('Hiç yazar bulunamadı');
        }
      } catch (err) {
        console.error('❌ Fetch hatası:', err);
        setError('Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAllWriters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yazarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Tüm Yazarlarımız - JoinEscapes"
        description="JoinEscapes platformundaki tüm yazarlarımızı keşfedin. Seyahat deneyimleri, rehberler ve öneriler."
        keywords="yazarlar, seyahat yazarları, blog yazarları, JoinEscapes"
      />
      
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
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Join Community</h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Join Escapes ailesinin her biri kendi alanında uzman yazarlarıyla tanışın. İlham verici ve unutulmaz seyahat deneyimleri için yazarlarımızı takip edin.
              </p>
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{writers.length} Yazar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Uzman İçerikler</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Link 
                    to="/editor-kayit"
                    className="inline-flex items-center px-6 py-3 border border-white rounded-lg shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Yazar Başvurusu Yap
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Writers Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bir hata oluştu</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : writers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yazar yok</h3>
              <p className="text-gray-500">Yazarlar eklendiğinde burada görünecek.</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {writers.length} Yetenekli Yazar
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Farklı uzmanlık alanlarından yazarlarımız, size en kaliteli seyahat içeriklerini sunuyor.
                </p>
              </div>

              {/* Writers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {writers.map((writer) => {
                  // Database'den gelen slug'ı kullan (name'den üretme!)
                  const slug = writer.slug || createSlug(writer.name);
                  
                  return (
                    <Link 
                      key={writer.id}
                      to={`/yazar/${slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200"
                    >
                      <div className="p-6 text-center">
                        {/* Profile Image */}
                        <div className="relative mb-4">
                          {writer.profile_image ? (
                            <img 
                              src={writer.profile_image} 
                              alt={writer.name}
                              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto shadow-md ring-2 ring-white group-hover:ring-primary-200 transition-all duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-500 rounded-full mx-auto shadow-md ring-2 ring-white group-hover:ring-primary-200 transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                              <span className="text-white font-bold text-2xl md:text-3xl">
                                {writer.name ? writer.name.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                          {writer.is_featured && (
                            <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Writer Info */}
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">
                          {writer.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          {writer.title || 'Yazar'}
                        </p>

                        {/* Location & Date */}
                        <div className="space-y-1 text-xs text-gray-500">
                          {writer.location && (
                            <div className="flex items-center justify-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{writer.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(writer.created_at).toLocaleDateString('tr-TR', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Bio Preview */}
                        {writer.bio && (
                          <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                            {writer.bio}
                          </p>
                        )}

                        {/* Specialties */}
                        {writer.specialties && writer.specialties.length > 0 && (
                          <div className="mt-3 flex flex-wrap justify-center gap-1">
                            {writer.specialties.slice(0, 2).map((specialty, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                              >
                                {specialty}
                              </span>
                            ))}
                            {writer.specialties.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{writer.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AllWriters;
