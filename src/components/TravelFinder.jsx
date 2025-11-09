import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { blogPosts, blogCategories } from '../lib/blog';
import DestinationCard from './DestinationCard';

const TravelFinder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [matchedDestinations, setMatchedDestinations] = useState([]);

  // Sorular ve cevaplar
  const questions = [
    {"id": "destination", "question": "Tatilin rotasını çizelim: Pasaportu kapıp dünyaya mı açılıyorsun yoksa \"Memleket candır\" deyip yurt içinde mi kalıyorsun?", "multi": false},
    {"id": "mood", "question": "Peki tatil senin için daha çok hangisi? (Birden fazla seçebilirsin)", "multi": true},
    {"id": "company", "question": "Bu yolculukta yalnız değilsin, kimler eşlik ediyor? (Birden fazla seçebilirsin)", "multi": true},
    {"id": "budget", "question": "Cüzdanın bu tatilde ne kadar açılıyor? (Birden fazla seçebilirsin)", "multi": true},
    {"id": "duration", "question": "Kaç günlüğüne hayatı askıya alıyorsun?", "multi": false}
  ];

  const answersMap = {
    "destination": {
      "Yurt dışı olsun, yeni ülkeler keşfedeyim! 🌍✈️": ["yurt-disi-tatil"],
      "Yurt içi yeter, memleketin tadını çıkarmak lazım 🇹🇷": ["yurt-ici-tatil"]
    },
    "mood": {
      "Deniz, kum, güneş: Benim vitaminim D! ☀️🏖️": ["yaz2025", "deniz", "plaj"],
      "Tarih ve kültür: Biraz müze, biraz antik kent, bolca bilgi. 🏛️📚": ["kultur-turlari", "müze", "tarih"],
      "Doğa ve keşif: Çadırımı alırım, dağ yollarına vururum. 🌲🏕️": ["doğa", "kamp", "trekking"],
      "Şehir hayatı: Alışveriş, gece hayatı, sokak keşifleri! 🏙️🍸": ["şehir-otelleri", "şehir", "alışveriş"],
      "Lüks ve huzur: Spa, şampanya ve infinity pool'da ben… 🛁🍾": ["spa-molalari", "lüks", "wellness"]
    },
    "company": {
      "Tek tabanca! Kendi başımın çaresine bakarım. 💪": ["solo", "tek"],
      "Romantizm peşinde: Sevgilimle tatil 🥰": ["romantik", "çift"],
      "Çocuklar ve eşimle: Ailecek eğlence 👨‍👩‍👧‍👦": ["aile", "çocuk"],
      "Kalabalık ekip: Arkadaşlarla festival tadında 🕺": ["grup-tatil", "arkadaş"]
    },
    "budget": {
      "Az para, bol macera! 💸": ["ekonomik-tatil"],
      "Orta seviye: Ne çok ucuz, ne çok lüks ⚖️": ["orta-butceli-"],
      "Bütçe önemli değil, kral gibi takılacağım 👑": ["luks-tatil"]
    },
    "duration": {
      "3–4 gün: Hızlı kaçış yeter 🏃": ["Kisa-3-4gun"],
      "5–7 gün: Tam kıvamında bir tatil ⏳": ["Orta-5-7-gun"],
      "7+ gün: Bavulu topla, dünya turuna çıkıyorum! 🌎": ["Uzun-10plus"]
    }
  };

  // Örnek destinasyonlar
  const destinations = [
    {
      "id": "dubai",
      "title": "Dubai",
      "tags": ["city","nightlife","shopping","desert","premium","ultra","mid-haul","events"],
      "why": "Çöl safarisi, lüks alışveriş, gece hayatı",
      "best_months": ["Kasım","Aralık","Ocak"],
      "media": {"cover": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    },
    {
      "id": "sharm",
      "title": "Sharm El Sheikh",
      "tags": ["beach","dive","resort","sun","short-haul","mid","premium","visa-free"],
      "why": "Sıcak deniz, dalış ve resort konforu",
      "best_months": ["Ekim","Kasım","Nisan","Mayıs"],
      "media": {"cover": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    },
    {
      "id": "santorini",
      "title": "Santorini",
      "tags": ["romance","boutique","mediterranean","premium","mid-haul"],
      "why": "Romantik manzaralar, beyaz evler ve gün batımı",
      "best_months": ["Mayıs","Haziran","Eylül"],
      "media": {"cover": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    },
    {
      "id": "bali",
      "title": "Bali",
      "tags": ["tropical","wellness","nature","surf","mid","long-haul"],
      "why": "Tapınaklar, yoga, plajlar ve tropikal atmosfer",
      "best_months": ["Haziran","Temmuz","Ağustos"],
      "media": {"cover": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    },
    {
      "id": "paris",
      "title": "Paris",
      "tags": ["culture","history","museums","city","premium","mid-haul","romance"],
      "why": "Sanat, tarih, gastronomi ve romantik atmosfer",
      "best_months": ["Nisan","Mayıs","Eylül","Ekim"],
      "media": {"cover": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    },
    {
      "id": "tokyo",
      "title": "Tokyo",
      "tags": ["culture","city","food","shopping","premium","long-haul","trendy"],
      "why": "Modern kültür, geleneksel tapınaklar ve eşsiz mutfak",
      "best_months": ["Mart","Nisan","Ekim","Kasım"],
      "media": {"cover": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
    }
  ];

  // Cevap seçme fonksiyonu
  const handleAnswer = (questionId, answerKey) => {
    const question = questions.find(q => q.id === questionId);
    const selectedTags = answersMap[questionId][answerKey];
    
    if (question.multi) {
      // Çoklu seçim
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [answerKey]: !prev[questionId]?.[answerKey]
        }
      }));
    } else {
      // Tekli seçim
      setAnswers(prev => ({
        ...prev,
        [questionId]: { [answerKey]: true }
      }));
    }
  };

  // Sonraki soruya geç
  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  // Önceki soruya dön
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Gerçek destinasyon yazılarını getir
  const fetchRealDestinations = async () => {
    try {
      // Destinasyon kategorisini bul
      const { data: categories } = await blogCategories.getAll();
      const destinationCategory = categories?.find(cat => cat.slug === 'destinasyon');
      
      if (!destinationCategory) {
        console.error('Destinasyon kategorisi bulunamadı');
        return [];
      }

      // Destinasyon kategorisindeki yazıları getir
      const { data: posts } = await blogPosts.getByCategory(destinationCategory.slug, { limit: 50 });
      return posts || [];
    } catch (error) {
      console.error('Destinasyon yazıları yüklenirken hata:', error);
      return [];
    }
  };

  const DOMESTIC_TAG_SLUGS = [
    'turkiye', 'türkiye', 'yurtici', 'yurt-ici', 'yurtiçi', 'yurtiçi-tatil', 'yurtici-tatil', 'yurtici-rotalar',
    'turkiye-tatilleri', 'turkiye-rotalari', 'memleket', 'turkiye-otelleri', 'turkiye-gezileri'
  ];

  const FOREIGN_TAG_SLUGS = [
    'yurtdisi', 'yurt-disi', 'yurtdışı', 'yurtdışı-tatil', 'international', 'global',
    'yurtdisi-rotalar', 'yabanci', 'avrupa', 'amerika', 'asya', 'afrika', 'oceania'
  ];

  const turkeyKeywords = [
    'türkiye', 'turkey', 'istanbul', 'ankara', 'izmir', 'antalya', 'bodrum', 'kapadokya',
    'pamukkale', 'trabzon', 'rize', 'artvin', 'kars', 'van', 'gaziantep', 'urfa',
    'mardin', 'diyarbakır', 'adana', 'mersin', 'tarsus', 'çanakkale', 'bursa',
    'çeşme', 'alaçatı', 'datça', 'marmaris', 'fethiye', 'kaş', 'demre', 'kemer',
    'side', 'alanya', 'belek', 'kuşadası', 'selçuk', 'efes', 'safranbolu', 'amasra',
    'sinop', 'samsun', 'ordu', 'giresun', 'nevşehir', 'kapadokya', 'konya', 'antalya', 'bodrum', 'kıbrıs'
  ];

  const foreignKeywords = [
    'italya', 'italy', 'roma', 'rome', 'milan', 'venedik', 'venice', 'floransa', 'florence',
    'fransa', 'france', 'paris', 'ispanya', 'spain', 'madrid', 'barcelona', 'yunanistan', 'greece',
    'almanya', 'germany', 'berlin', 'ingiltere', 'england', 'londra', 'london',
    'amerika', 'usa', 'united states', 'kanada', 'canada', 'bali', 'dubai', 'abu dhabi',
    'meksika', 'mexico', 'thailand', 'tayland', 'japan', 'japonya', 'çin', 'china', 'hindistan', 'india',
    'afrika', 'avrupa', 'asya', 'amerika', 'oceania', 'australia', 'australya', 'reykjavik', 'dublin', 'lisbon', 'porto', 'budapest'
  ];

  const normalizeText = (text = '') =>
    text
      .toString()
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  const normalizeText = (text = '') =>
    text
      .toString()
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  const getArticleTagSlugs = (article) => {
    if (!article) return [];

    const extractSlugs = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map(tag => {
          if (!tag) return null;
          if (typeof tag === 'string') return normalizeText(tag);
          if (typeof tag.slug === 'string') return normalizeText(tag.slug);
          if (typeof tag.name === 'string') return normalizeText(tag.name);
          return null;
        })
        .filter(Boolean);
    };

    if (Array.isArray(article.tag_objects)) {
      return extractSlugs(article.tag_objects);
    }

    if (Array.isArray(article.tags)) {
      return extractSlugs(article.tags);
    }

    if (typeof article.tags === 'string' && article.tags.trim().length > 0) {
      try {
        const parsed = JSON.parse(article.tags);
        return extractSlugs(parsed);
      } catch (error) {
        return [normalizeText(article.tags)];
      }
    }

    if (Array.isArray(article.tag_slugs)) {
      return extractSlugs(article.tag_slugs);
    }

    return [];
  };

  const getArticleTextBlob = (article) =>
    normalizeText(`${article.title || ''} ${article.excerpt || ''} ${article.content || ''} ${article.slug || ''}`);

  const hasKeyword = (text, keywords) => keywords.some(keyword => text.includes(keyword));

  const isDomesticArticle = (article) => {
    const tagSlugs = getArticleTagSlugs(article);
    if (tagSlugs.some(slug => DOMESTIC_TAG_SLUGS.includes(slug))) return true;
    if (tagSlugs.some(slug => FOREIGN_TAG_SLUGS.includes(slug))) return false;

    const blob = getArticleTextBlob(article);
    if (hasKeyword(blob, turkeyKeywords)) return true;

    return false;
  };

  const isForeignArticle = (article) => {
    const tagSlugs = getArticleTagSlugs(article);
    if (tagSlugs.some(slug => FOREIGN_TAG_SLUGS.includes(slug))) return true;
    if (tagSlugs.some(slug => DOMESTIC_TAG_SLUGS.includes(slug))) return false;

    const blob = getArticleTextBlob(article);
    const hasDomestic = hasKeyword(blob, turkeyKeywords);
    const hasForeign = hasKeyword(blob, foreignKeywords);

    if (hasForeign && !hasDomestic) return true;
    if (hasDomestic && !hasForeign) return false;

    const slug = normalizeText(article.slug || '');
    if (hasKeyword(slug, turkeyKeywords)) return false;
    if (hasKeyword(slug, foreignKeywords)) return true;

    return hasForeign;
  };

  // Sonuçları hesapla
  const calculateResults = async () => {
    const userTags = [];
    let isDomestic = false;
    
    // Kullanıcı cevaplarını tag'lere çevir ve yurt içi/dışı kontrolü yap
    Object.keys(answers).forEach(questionId => {
      const questionAnswers = answers[questionId];
      Object.keys(questionAnswers).forEach(answerKey => {
        if (questionAnswers[answerKey]) {
          if (questionId === 'destination') {
            if (answerKey.includes('Yurt içi')) {
              isDomestic = true;
            }
          }
          const mappedTags = answersMap[questionId][answerKey] || [];
          const normalized = mappedTags.map(tag => normalizeText(tag));
          userTags.push(...normalized);
        }
      });
    });

    // Gerçek destinasyon yazılarını getir
    const realDestinations = await fetchRealDestinations();
    
    if (realDestinations.length === 0) {
      // Fallback: Örnek destinasyonları kullan
      const scoredDestinations = destinations.map(dest => {
        let score = 0;
        userTags.forEach(tag => {
          if (dest.tags.includes(tag)) {
            score++;
          }
        });
        return { ...dest, score };
      });

      const sorted = scoredDestinations
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      setMatchedDestinations(sorted);
      setShowResults(true);
      return;
    }

    // Yurt içi/dışı filtreleme
    let filteredDestinations = realDestinations;
    if (isDomestic) {
      filteredDestinations = realDestinations.filter(article => isDomesticArticle(article));
    } else {
      filteredDestinations = realDestinations.filter(article => isForeignArticle(article));
    }

    if (filteredDestinations.length === 0) {
      filteredDestinations = isDomestic
        ? realDestinations.filter(article => !isForeignArticle(article))
        : realDestinations.filter(article => !isDomesticArticle(article));

      if (filteredDestinations.length === 0) {
        filteredDestinations = realDestinations;
      }
    }

    // Gerçek yazıları skorla - ETİKET SİSTEMİ KULLANARAK
    const scoredDestinations = filteredDestinations.map(article => {
      let score = 0;
      
      // Yazının etiketlerini al (JSON array olarak gelir)
      const articleTags = getArticleTagSlugs(article);
      const contentBlob = getArticleTextBlob(article);
      
      // Kullanıcı seçimlerini yazı etiketleriyle karşılaştır
      userTags.forEach(userTag => {
        // Direkt etiket eşleşmesi
        if (articleTags.includes(userTag)) {
          score += 2; // Etiket eşleşmesi daha yüksek puan
        }
        
        // Alternatif eşleşmeler için içerik kontrolü
        if (contentBlob.includes(userTag)) {
          score += 1; // İçerik eşleşmesi daha düşük puan
        }
      });
      
      // Debug için console.log
      console.log('🎯 Article:', article.title);
      console.log('🏷️ Article Tags:', articleTags);
      console.log('👤 User Tags:', userTags);
      console.log('📊 Score:', score);
      
      return { ...article, score };
    });

    // Skora göre sırala ve en iyi 4'ü al
    const sorted = scoredDestinations
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    setMatchedDestinations(sorted);
    setShowResults(true);
  };

  // Anketi sıfırla
  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setMatchedDestinations([]);
  };

  // İlerleme yüzdesi
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Mevcut soru
  const currentQuestion = questions[currentStep];
  const currentAnswers = answersMap[currentQuestion.id];

  // Soru bazlı görseller - Her soruya özel görseller
  const questionImages = {
    "destination": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Pasaport - uçak ve dünya
    "mood": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Tatil ruhu - gün batımı
    "company": "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Seyahat arkadaşı - grup
    "budget": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Bütçe - para ve seyahat
    "duration": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Süre - takvim ve zaman
  };


  if (showResults) {
    return (
      <section className="py-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Size Özel Seyahat Önerileri
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Cevaplarınıza göre en uygun destinasyonları seçtik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {matchedDestinations.map((destination, index) => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
                index={index}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Tekrar Dene
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Tatil Bulucu
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            5 soruda size en uygun destinasyonu bulalım
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${
            Object.keys(currentAnswers).length <= 2 ? 'h-[350px] sm:h-[350px]' : 
            Object.keys(currentAnswers).length <= 3 ? 'h-[400px] sm:h-[350px]' : 
            Object.keys(currentAnswers).length <= 4 ? 'h-[450px] sm:h-[350px]' : 
            'h-[500px] sm:h-[350px]'
          }`}>
            {/* Sol taraf - Görsel */}
            <div className="relative overflow-hidden">
              <img 
                src={questionImages[currentQuestion.id]} 
                alt={currentQuestion.question}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-3">
                <div className="text-center bg-black/20 backdrop-blur-lg rounded-xl px-4 py-3 border border-white/20 shadow-lg">
                  <h3 className="text-sm font-semibold mb-2 text-white drop-shadow-lg">
                    {currentQuestion.question}
                  </h3>
                  <div className="w-full max-w-xs bg-white/20 rounded-full h-1.5 mb-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-white text-xs drop-shadow-md font-medium">
                    {currentStep + 1}/{questions.length} • %{Math.round(progress)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sağ taraf - Sorular */}
            <div className="p-3 flex flex-col h-full">
              <div className={`flex flex-col gap-2 max-w-lg mx-auto items-start flex-1 ${
                currentStep === 0 ? 'justify-center' : ''
              }`}>
                {Object.keys(currentAnswers).map(answerKey => {
                  const isSelected = answers[currentQuestion.id]?.[answerKey];
                  const isMulti = currentQuestion.multi;
                  
                  return (
                    <button
                      key={answerKey}
                      onClick={() => handleAnswer(currentQuestion.id, answerKey)}
                      className={`p-2 sm:p-3 rounded-lg border text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-sm w-full ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-start">
                        {isMulti ? (
                          <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                          </div>
                        ) : (
                          <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                        )}
                        <span className="font-medium text-xs sm:text-sm text-gray-900 leading-tight text-left">{answerKey}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigasyon butonları */}
              <div className="flex justify-between pt-3 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-xs shadow-sm"
                >
                  <ChevronLeft className="mr-1 h-3 w-3" />
                  Önceki
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-xs shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {currentStep === questions.length - 1 ? 'Sonuçları Gör' : 'Sonraki'}
                  <ChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelFinder;
