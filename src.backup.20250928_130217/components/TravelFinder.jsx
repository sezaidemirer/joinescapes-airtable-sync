import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Star, ArrowRight, RotateCcw } from 'lucide-react';

const TravelFinder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [matchedDestinations, setMatchedDestinations] = useState([]);

  // Sorular ve cevaplar
  const questions = [
    {"id": "mood", "question": "Tatil ruhun hangisi?", "multi": false},
    {"id": "climate", "question": "Hangi iklimi tercih edersin?", "multi": false},
    {"id": "pace", "question": "Seyahat tempon nasıl olsun?", "multi": false},
    {"id": "budget", "question": "Bütçen hangi seviyede?", "multi": false},
    {"id": "flight", "question": "Uçuş süresi toleransın?", "multi": false},
    {"id": "company", "question": "Kiminle seyahat ediyorsun?", "multi": false},
    {"id": "stay", "question": "Konaklama tarzın?", "multi": false},
    {"id": "activities", "question": "Olmazsa olmaz aktiviteler?", "multi": true},
    {"id": "crowds", "question": "Kalabalık hassasiyetin?", "multi": false},
    {"id": "visa", "question": "Vize önceliğin?", "multi": false}
  ];

  const answersMap = {
    "mood": {
      "Rahatla / Deniz": ["beach","relax","sun"],
      "Kültür & Tarih": ["culture","history","museums"],
      "Macera / Doğa": ["adventure","nature","outdoor"],
      "Gece Hayatı / Şehir": ["nightlife","city","trendy"],
      "Spa & Wellness": ["wellness","spa","calm"],
      "Lüks & Ayrıcalık": ["luxury","fine-dining","private"]
    },
    "climate": {
      "Sıcak / Tropik": ["tropical","hot"],
      "Ilıman / Akdeniz": ["mediterranean","mild"],
      "Serin / Dağ": ["mountain","cool"],
      "Çöl / Kuru": ["desert","dry"],
      "Kar / Kış": ["snow","winter"]
    },
    "pace": {
      "Yavaş & Dinlenme": ["slowtravel","low-pace"],
      "Dengeli": ["balanced-pace"],
      "Yoğun & Keşif": ["fast-pace","checklist"]
    },
    "budget": {
      "Ekonomik": ["budget"],
      "Orta": ["mid"],
      "Premium": ["premium"],
      "Ultra": ["ultra","private"]
    },
    "flight": {
      "≤3 saat": ["short-haul"],
      "3–6 saat": ["mid-haul"],
      "6–9 saat": ["long-haul"],
      "9+ saat": ["ultra-haul"]
    },
    "company": {
      "Tek başıma": ["solo"],
      "Çift / Romantik": ["couple","romance"],
      "Aile / Çocuklu": ["family","kids"],
      "Arkadaş Grubu": ["friends","group"],
      "İş + Tatil": ["bleisure"]
    },
    "stay": {
      "Butik / Design": ["boutique","design"],
      "Resort / Her şey dahil": ["resort","all-inclusive"],
      "Şehir Oteli": ["city-hotel"],
      "Villa / Daire": ["villa","apartment"],
      "Eko / Doğa Lodge": ["eco","lodge"],
      "Cruise": ["cruise"]
    },
    "activities": {
      "Gastronomi & Kahve": ["food","coffee"],
      "Müzeler & Sanat": ["museums","art"],
      "Trek / Dalış / Safari": ["hike","dive","safari"],
      "Alışveriş": ["shopping"],
      "Gece Hayatı & Etkinlik": ["nightlife","events"],
      "Spa / Hamam / Ritüeller": ["spa","rituals"]
    },
    "crowds": {
      "Kalabalıktan Kaç": ["avoid-crowds","shoulder-season"],
      "Farketmez": ["ok-crowds"],
      "Festival / Etkinlik olsun": ["seek-events","peak-ok"]
    },
    "visa": {
      "Vizesiz / Kolay vize": ["visa-free","easy-visa"],
      "Farketmez": ["visa-flex"],
      "Sadece Pasaport Yeter": ["domestic-near","passport-only"]
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

  // Sonuçları hesapla
  const calculateResults = () => {
    const userTags = [];
    
    // Kullanıcı cevaplarını tag'lere çevir
    Object.keys(answers).forEach(questionId => {
      const questionAnswers = answers[questionId];
      Object.keys(questionAnswers).forEach(answerKey => {
        if (questionAnswers[answerKey]) {
          userTags.push(...answersMap[questionId][answerKey]);
        }
      });
    });

    // Destinasyonları skorla
    const scoredDestinations = destinations.map(dest => {
      let score = 0;
      userTags.forEach(tag => {
        if (dest.tags.includes(tag)) {
          score++;
        }
      });
      return { ...dest, score };
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
    "mood": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Tatil ruhu - gün batımı
    "climate": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // İklim - orman manzarası
    "pace": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Seyahat temposu - doğa yürüyüşü
    "budget": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Bütçe - para ve seyahat
    "flight": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Uçuş süresi - uçak
    "company": "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Seyahat arkadaşı - grup
    "stay": "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Konaklama - otel
    "activities": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Aktiviteler - macera
    "crowds": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Kalabalık - şehir
    "visa": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Vize - pasaport
  };

  // Soru bazlı ikonlar
  const questionIcons = {
    "mood": "🌅",
    "climate": "🌡️",
    "pace": "⏰",
    "budget": "💰",
    "flight": "✈️",
    "company": "👥",
    "stay": "🏨",
    "activities": "🎯",
    "crowds": "👨‍👩‍👧‍👦",
    "visa": "📋"
  };

  if (showResults) {
    return (
      <section className="py-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-2">
              <span className="text-lg">🎯</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Size Özel Seyahat Önerileri
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Cevaplarınıza göre en uygun destinasyonları seçtik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {matchedDestinations.map((destination, index) => (
              <div key={destination.id} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.media.cover} 
                    alt={destination.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                    #{index + 1} Öneri
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {destination.score} eşleşme
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{destination.title}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{destination.why}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>En iyi: {destination.best_months.slice(0, 2).join(', ')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {destination.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center font-medium text-sm shadow-md hover:shadow-lg">
                    Detayları Gör
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
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
            Seyahat Bulucu
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            10 soruda size en uygun destinasyonu bulalım
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[200px]">
            {/* Sol taraf - Görsel */}
            <div className="relative overflow-hidden">
              <img 
                src={questionImages[currentQuestion.id]} 
                alt={currentQuestion.question}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
              
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-3">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto backdrop-blur-sm border border-white/30">
                    <span className="text-lg">{questionIcons[currentQuestion.id]}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-2">
                    {currentQuestion.question}
                  </h3>
                  <div className="w-full max-w-xs bg-white/20 rounded-full h-1.5 mb-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-white/90 text-xs">
                    {currentStep + 1}/{questions.length} • %{Math.round(progress)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sağ taraf - Sorular */}
            <div className="p-3 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(currentAnswers).map(answerKey => {
                  const isSelected = answers[currentQuestion.id]?.[answerKey];
                  const isMulti = currentQuestion.multi;
                  
                  return (
                    <button
                      key={answerKey}
                      onClick={() => handleAnswer(currentQuestion.id, answerKey)}
                      className={`p-2 rounded-lg border text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-sm ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        {isMulti ? (
                          <div className={`w-3 h-3 rounded border mr-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-1 h-1 bg-white rounded-full"></div>}
                          </div>
                        ) : (
                          <div className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-1 h-1 bg-white rounded-full"></div>}
                          </div>
                        )}
                        <span className="font-medium text-xs text-gray-900 leading-tight">{answerKey}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigasyon butonları */}
              <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
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
