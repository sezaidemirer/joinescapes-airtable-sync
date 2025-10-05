import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Star, MapPin } from 'lucide-react';

const DestinationCard = ({ destination, index = 0, showBadge = true, showCategoryCount = true }) => {
  // Blog yazısından destinasyon bilgilerini çıkar
  const extractDestinationInfo = (article) => {
    const title = article.title || 'Destinasyon';
    const description = article.excerpt || article.content?.substring(0, 150) + '...' || 'Keşfetmeye hazır mısınız?';
    const image = article.featured_image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    // İçerikten tahmin edilen bilgiler
    const estimatedTags = extractTags(article);
    const estimatedMonths = extractBestMonths(article);
    const estimatedBudget = extractBudget(article);
    
    return {
      id: article.id,
      title,
      description,
      image,
      tags: estimatedTags,
      best_months: estimatedMonths,
      budget: estimatedBudget,
      why: description,
      url: `/${article.category_slug}/${article.slug}`
    };
  };

  // İçerikten etiketleri çıkar
  const extractTags = (article) => {
    const content = (article.title + ' ' + article.excerpt + ' ' + article.content).toLowerCase();
    const tags = [];
    
    // Popüler destinasyon etiketleri
    if (content.includes('deniz') || content.includes('plaj') || content.includes('kum')) tags.push('deniz');
    if (content.includes('kültür') || content.includes('müze') || content.includes('tarih')) tags.push('kültür');
    if (content.includes('doğa') || content.includes('dağ') || content.includes('orman')) tags.push('doğa');
    if (content.includes('şehir') || content.includes('gece') || content.includes('alışveriş')) tags.push('şehir');
    if (content.includes('lüks') || content.includes('spa') || content.includes('otel')) tags.push('lüks');
    if (content.includes('romantik') || content.includes('çift')) tags.push('romantik');
    if (content.includes('aile') || content.includes('çocuk')) tags.push('aile');
    if (content.includes('macera') || content.includes('trekking') || content.includes('rafting')) tags.push('macera');
    
    // İlk 3 etiketi döndür
    return tags.slice(0, 3);
  };

  // İçerikten en iyi ayları çıkar
  const extractBestMonths = (article) => {
    const content = (article.title + ' ' + article.excerpt + ' ' + article.content).toLowerCase();
    const months = [];
    
    // Ayları kontrol et
    const monthMap = {
      'ocak': 'Ocak', 'şubat': 'Şubat', 'mart': 'Mart', 'nisan': 'Nisan',
      'mayıs': 'Mayıs', 'haziran': 'Haziran', 'temmuz': 'Temmuz', 'ağustos': 'Ağustos',
      'eylül': 'Eylül', 'ekim': 'Ekim', 'kasım': 'Kasım', 'aralık': 'Aralık'
    };
    
    Object.keys(monthMap).forEach(month => {
      if (content.includes(month)) {
        months.push(monthMap[month]);
      }
    });
    
    // Eğer hiç ay bulunamazsa varsayılan aylar
    if (months.length === 0) {
      return ['Nisan', 'Mayıs', 'Eylül'];
    }
    
    return months.slice(0, 2);
  };

  // İçerikten bütçe seviyesini çıkar
  const extractBudget = (article) => {
    const content = (article.title + ' ' + article.excerpt + ' ' + article.content).toLowerCase();
    
    if (content.includes('lüks') || content.includes('pahalı') || content.includes('vip')) {
      return 'lüks';
    } else if (content.includes('ucuz') || content.includes('ekonomik') || content.includes('bütçe')) {
      return 'ekonomik';
    } else {
      return 'orta';
    }
  };

  const destInfo = extractDestinationInfo(destination);

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={destInfo.image} 
          alt={destInfo.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        {showBadge && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            #{index + 1} Öneri
          </div>
        )}
        {showCategoryCount && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
            {destInfo.tags.length} kategori
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{destInfo.title}</h3>
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{destInfo.description}</p>
        
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>En iyi: {destInfo.best_months.slice(0, 2).join(', ')}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {destInfo.tags.slice(0, 3).map((tag, tagIndex) => (
            <span key={tagIndex} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <Link 
          to={destInfo.url}
          className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center font-medium text-sm shadow-md hover:shadow-lg"
        >
          Detayları Gör
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;

