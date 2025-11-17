import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Download, User, Star, Brain, Home, Car, Coffee, Dumbbell, Heart, TrendingUp, Sparkles, Target } from 'lucide-react';

const FullLifeProfileForm = ({ 
  currentUser,
  currentState,
  setCurrentState,
  futureState,
  setFutureState,
  actionPlan,
  setActionPlan,
  onAnalyzeCurrent,
  onAnalyzeFuture,
  onAnalyzeGap,
  onSave,
  currentAiAnalysis,
  futureAiAnalysis,
  gapAnalysis,
  isAnalyzingCurrent,
  isAnalyzingFuture,
  isAnalyzingGap
}) => {
  const [step, setStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  const sections = [
    {
      id: 'current',
      title: 'ŞİMDİKİ BEN',
      subtitle: 'Bugünkü durumum - olduğum gibi',
      icon: User,
      color: 'from-slate-600 to-slate-700',
      categories: [
        {
          name: 'Fiziksel Durum',
          icon: Dumbbell,
          questions: [
            {
              key: 'physical',
              label: '💪 Fiziksel Özelliklerin',
              placeholder: 'Örnek: 1.75m, 78kg, hafif kilolu, bel ağrıları var',
              rows: 3
            },
            {
              key: 'energy',
              label: '⚡ Enerji Seviyem',
              placeholder: 'Örnek: Sabahları yorgun, gece 1de yatıyorum',
              rows: 3
            },
            {
              key: 'style',
              label: '👔 Giyim Tarzım',
              placeholder: 'Örnek: Rahat kıyafetler, kot-tişört',
              rows: 2
            }
          ]
        },
        {
          name: 'Yetenekler',
          icon: Brain,
          questions: [
            {
              key: 'skills',
              label: '🎯 Yeteneklerim',
              placeholder: '• İngilizce orta seviye\n• Excel biliyorum\n• Araba kullanabiliyorum',
              rows: 5
            },
            {
              key: 'hobbies',
              label: '🎨 Hobilerim',
              placeholder: '• Haftada 1-2 film\n• Bazen kitap okuyorum',
              rows: 4
            }
          ]
        },
        {
          name: 'Maddi Durum',
          icon: Home,
          questions: [
            {
              key: 'home',
              label: '🏠 Yaşadığım Yer',
              placeholder: 'Örnek: Ailemle 3+1 daire, merkeze 20dk',
              rows: 2
            },
            {
              key: 'car',
              label: '🚗 Arabam',
              placeholder: 'Örnek: Arabam yok / 2015 Renault Clio',
              rows: 2
            },
            {
              key: 'possessions',
              label: '💎 Değerli Eşyalarım',
              placeholder: '• Laptop (5 yıllık)\n• iPhone 11\n• Birkaç kitap',
              rows: 4
            },
            {
              key: 'financial',
              label: '💰 Finansal Durumum',
              placeholder: 'Örnek: Aylık 25.000₺, 10.000₺ birikim',
              rows: 3
            }
          ]
        },
        {
          name: 'Yaşam Tarzı',
          icon: Coffee,
          questions: [
            {
              key: 'places',
              label: '📍 Gittiğim Mekanlar',
              placeholder: '• Haftada 2-3 aynı kafe\n• Ayda bir sinema',
              rows: 4
            },
            {
              key: 'socialCircle',
              label: '👥 Sosyal Çevrem',
              placeholder: 'Örnek: 5-6 yakın arkadaş, üniversiteden',
              rows: 3
            },
            {
              key: 'dailyRoutine',
              label: '📅 Tipik Bir Günüm',
              placeholder: 'Örnek: 8:00 kalkış, 9-18 iş, Netflix, 01:00 uyku',
              rows: 4
            }
          ]
        },
        {
          name: 'Karakter',
          icon: Heart,
          questions: [
            {
              key: 'positiveTraits',
              label: '✅ Olumlu Özelliklerim',
              placeholder: '• İyi dinleyiciyim\n• Yardımseverim\n• Sorumluluk sahibiyim',
              rows: 5
            },
            {
              key: 'negativeTraits',
              label: '❌ Olumsuz Özelliklerim',
              placeholder: '• Erteleme yaparım\n• Hayır diyemem\n• Düzensizim',
              rows: 5
            }
          ]
        }
      ]
    },
    {
      id: 'future',
      title: '5 YIL SONRA BEN',
      subtitle: 'Hayallerimi gerçekleştirmiş versiyonum',
      icon: Star,
      color: 'from-amber-500 to-orange-600',
      categories: [
        {
          name: 'Fiziksel',
          icon: Dumbbell,
          questions: [
            {
              key: 'physical',
              label: '💪 Fiziksel Durumum',
              placeholder: 'Örnek: 72kg, fit, enerji dolu, ağrılarım yok',
              rows: 3
            },
            {
              key: 'energy',
              label: '⚡ Enerji & Rutinlerim',
              placeholder: 'Örnek: 6:00 zinde kalkış, gün boyu enerjik',
              rows: 3
            },
            {
              key: 'style',
              label: '👔 Giyim Tarzım',
              placeholder: 'Örnek: Şık-casual, kaliteli kıyafetler',
              rows: 3
            }
          ]
        },
        {
          name: 'Yetenekler',
          icon: Brain,
          questions: [
            {
              key: 'skills',
              label: '🎯 Yeni Yeteneklerim',
              placeholder: '• İngilizce akıcı\n• Python biliyorum\n• Public speaking',
              rows: 6
            },
            {
              key: 'hobbies',
              label: '🎨 Yeni Hobiler',
              placeholder: '• Haftada 3 spor\n• Ayda 2 kitap\n• Fotoğrafçılık',
              rows: 5
            },
            {
              key: 'achievements',
              label: '🏆 Başarılarım',
              placeholder: '• Terfi aldım\n• Yurtdışı deneyimi\n• Proje tamamladım',
              rows: 4
            }
          ]
        },
        {
          name: 'Maddi',
          icon: Home,
          questions: [
            {
              key: 'home',
              label: '🏠 Yaşadığım Yer',
              placeholder: 'Örnek: Merkezde 2+1 modern daire, kendi evim',
              rows: 3
            },
            {
              key: 'car',
              label: '🚗 Arabam',
              placeholder: 'Örnek: 2024 elektrikli SUV',
              rows: 2
            },
            {
              key: 'possessions',
              label: '💎 Değerli Eşyalarım',
              placeholder: '• Son model MacBook\n• Profesyonel kamera\n• Kaliteli saat',
              rows: 5
            },
            {
              key: 'financial',
              label: '💰 Finansal Durumum',
              placeholder: 'Örnek: 100.000₺ gelir, 500.000₺ birikim',
              rows: 3
            }
          ]
        },
        {
          name: 'Yaşam Tarzı',
          icon: Coffee,
          questions: [
            {
              key: 'places',
              label: '📍 Gittiğim Mekanlar',
              placeholder: '• Kaliteli restoranlar\n• Sanat galerileri\n• Yurtdışı (yılda 3-4)',
              rows: 5
            },
            {
              key: 'socialCircle',
              label: '👥 Sosyal Çevrem',
              placeholder: 'Örnek: İlham veren, başarılı insanlar',
              rows: 3
            },
            {
              key: 'dailyRoutine',
              label: '📅 İdeal Bir Günüm',
              placeholder: 'Örnek: 6:00 kalkış, spor, verimli iş, hobi, 22:30 uyku',
              rows: 4
            },
            {
              key: 'lifestyle',
              label: '✨ Yaşam Tarzım',
              placeholder: 'Örnek: Remote çalışıyorum, finansal özgürlük',
              rows: 4
            }
          ]
        },
        {
          name: 'Karakter',
          icon: Sparkles,
          questions: [
            {
              key: 'transformedTraits',
              label: '🦋 Dönüşmüş Özelliklerim',
              placeholder: '• Erteleme → Disiplinli\n• Hayır diyememe → Sınır koyabilen',
              rows: 6
            }
          ]
        }
      ]
    },
    {
      id: 'action',
      title: '90 GÜNLÜK PLAN',
      subtitle: 'İlk somut adımlar',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      categories: [
        {
          name: 'Strateji',
          icon: Target,
          questions: [
            {
              key: 'identity90',
              label: '🎯 90 Günde Kim Olacağım',
              placeholder: '✅ "Haftada 3 gün sabah yürüyüşü yapan biri"',
              rows: 4
            },
            {
              key: 'skillsToLearn',
              label: '📚 Öğreneceğim Beceriler',
              placeholder: '• İngilizce: Günde 30dk Duolingo\n• Excel: Haftada 2 video',
              rows: 4
            }
          ]
        },
        {
          name: 'Eylemler',
          icon: Sparkles,
          questions: [
            {
              key: 'financialSteps',
              label: '💰 Finansal Hedeflerim',
              placeholder: '• Aylık 5.000₺ tasarruf\n• Gereksiz abonelikleri iptal',
              rows: 4
            },
            {
              key: 'healthSteps',
              label: '💪 Sağlık Hedeflerim',
              placeholder: '• Haftada 3 gün 30dk yürüyüş\n• 23:00 yatış, 7 saat uyku',
              rows: 5
            },
            {
              key: 'socialSteps',
              label: '🌍 Sosyal Hedeflerim',
              placeholder: '• Ayda 1 yeni etkinlik\n• Ayda 1 yeni insan tanı',
              rows: 5
            },
            {
              key: 'firstMonth',
              label: '🚀 İlk 30 Gün Planım',
              placeholder: 'HAFTA 1:\n• Pazartesi: ...\n• Çarşamba: ...\n\nHAFTA 2:\n...',
              rows: 8
            }
          ]
        }
      ]
    },
    {
      id: 'gap',
      title: 'KARŞILAŞTIRMA & PLAN',
      subtitle: 'AI ile fark analizi ve 5 yıllık roadmap',
      icon: TrendingUp,
      color: 'from-blue-500 to-purple-600',
      categories: [
        {
          name: 'Gap Analizi',
          icon: Target,
          questions: []
        }
      ]
    }
  ];

  const currentSection = sections[step];
  const currentCategory = currentSection.categories[activeCategory];
  const Icon = currentSection.icon;
  const CategoryIcon = currentCategory?.icon;

  const getData = (sectionId) => {
    if (sectionId === 'current') return currentState;
    if (sectionId === 'future') return futureState;
    if (sectionId === 'action') return actionPlan;
    return {};
  };

  const setData = (sectionId, data) => {
    if (sectionId === 'current') setCurrentState(data);
    else if (sectionId === 'future') setFutureState(data);
    else if (sectionId === 'action') setActionPlan(data);
  };

  const handleInputChange = (key, value) => {
    const data = getData(currentSection.id);
    setData(currentSection.id, { ...data, [key]: value });
  };

  const downloadAnalysis = () => {
    const content = `
╔═══════════════════════════════════════════════════════════════╗
║              KARAKTER ANALİZİ - TAM YAŞAM TABLOSU            ║
║                 Tarih: ${new Date().toLocaleDateString('tr-TR')}                        ║
╚═══════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ŞİMDİKİ BEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💪 FİZİKSEL:
${currentState.physical || 'Girilmedi'}
⚡ Enerji: ${currentState.energy || 'Girilmedi'}
👔 Giyim: ${currentState.style || 'Girilmedi'}

🎯 YETENEKLER:
${currentState.skills || 'Girilmedi'}

🎨 HOBİLER:
${currentState.hobbies || 'Girilmedi'}

🏠 MADDİ DURUM:
Ev: ${currentState.home || 'Girilmedi'}
Araba: ${currentState.car || 'Girilmedi'}
Eşyalar: ${currentState.possessions || 'Girilmedi'}
Finans: ${currentState.financial || 'Girilmedi'}

📍 YAŞAM TARZI:
Mekanlar: ${currentState.places || 'Girilmedi'}
Sosyal: ${currentState.socialCircle || 'Girilmedi'}
Rutin: ${currentState.dailyRoutine || 'Girilmedi'}

❤️ KARAKTER:
Olumlu: ${currentState.positiveTraits || 'Girilmedi'}
Olumsuz: ${currentState.negativeTraits || 'Girilmedi'}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ 5 YIL SONRA BEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💪 FİZİKSEL:
${futureState.physical || 'Girilmedi'}
⚡ Enerji: ${futureState.energy || 'Girilmedi'}
👔 Giyim: ${futureState.style || 'Girilmedi'}

🎯 YETENEKLER:
${futureState.skills || 'Girilmedi'}

🎨 HOBİLER:
${futureState.hobbies || 'Girilmedi'}

🏆 BAŞARILAR:
${futureState.achievements || 'Girilmedi'}

🏠 MADDİ:
Ev: ${futureState.home || 'Girilmedi'}
Araba: ${futureState.car || 'Girilmedi'}
Eşyalar: ${futureState.possessions || 'Girilmedi'}
Finans: ${futureState.financial || 'Girilmedi'}

✨ YAŞAM:
Mekanlar: ${futureState.places || 'Girilmedi'}
Sosyal: ${futureState.socialCircle || 'Girilmedi'}
İdeal Gün: ${futureState.dailyRoutine || 'Girilmedi'}
Yaşam Tarzı: ${futureState.lifestyle || 'Girilmedi'}

🦋 KARAKTER:
${futureState.transformedTraits || 'Girilmedi'}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 90 GÜNLÜK PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Kimlik: ${actionPlan.identity90 || 'Girilmedi'}
📚 Beceriler: ${actionPlan.skillsToLearn || 'Girilmedi'}
💰 Finans: ${actionPlan.financialSteps || 'Girilmedi'}
💪 Sağlık: ${actionPlan.healthSteps || 'Girilmedi'}
🌍 Sosyal: ${actionPlan.socialSteps || 'Girilmedi'}
🚀 İlk Ay: ${actionPlan.firstMonth || 'Girilmedi'}

${currentAiAnalysis ? '\n━━━━ MEVCUT DURUM AI ANALİZİ ━━━━\n' + currentAiAnalysis : ''}
${futureAiAnalysis ? '\n━━━━ GELECEK HEDEFLERİ AI ANALİZİ ━━━━\n' + futureAiAnalysis : ''}
${gapAnalysis ? '\n━━━━ GAP ANALİZİ & ROADMAP ━━━━\n' + gapAnalysis : ''}


╔═══════════════════════════════════════════════════════════════╗
║         Şimdiki benden hayallerimi gerçekleştirmiş           ║
║              benime giden yolun ilk adımı!                    ║
╚═══════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tam-yasam-tablosu-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = ((step + 1) / sections.length) * 100;

  // Handle section completion for AI analysis
  const handleSectionComplete = () => {
    if (currentSection.id === 'current' && !currentAiAnalysis) {
      if (window.confirm('Mevcut durumunuzu AI ile analiz etmek ister misiniz?')) {
        onAnalyzeCurrent();
      }
    } else if (currentSection.id === 'future' && !futureAiAnalysis) {
      if (window.confirm('Gelecek hedeflerinizi AI ile analiz etmek ister misiniz?')) {
        onAnalyzeFuture();
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-8 rounded-xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-gray-100 mb-2">Tam Yaşam Tablosu</h1>
          <p className="text-slate-600 dark:text-gray-300">Şimdiki Ben → 5 Yıl Sonra Hayallerimi Gerçekleştirmiş Ben</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {sections.map((section, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div 
                  onClick={() => setStep(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                    idx === step ? 'bg-gradient-to-r ' + section.color + ' text-white scale-110 shadow-lg' : 
                    idx < step ? 'bg-green-400 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-400 dark:text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < sections.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${idx < step ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-slate-600 via-amber-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${currentSection.color} p-6 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <Icon size={36} />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{currentSection.title}</h2>
                <p className="text-white/90">{currentSection.subtitle}</p>
              </div>
            </div>
          </div>

          {currentSection.id !== 'gap' && (
            <>
              <div className="flex border-b border-slate-200 dark:border-gray-700 overflow-x-auto">
                {currentSection.categories.map((cat, idx) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCategory(idx)}
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                        activeCategory === idx
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <CatIcon size={18} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-gray-200">
                  <CategoryIcon size={24} />
                  <h3 className="text-xl font-bold">{currentCategory.name}</h3>
                </div>
                
                <div className="space-y-5">
                  {currentCategory.questions.map((question, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2">
                        {question.label}
                      </label>
                      <textarea
                        value={getData(currentSection.id)[question.key] || ''}
                        onChange={(e) => handleInputChange(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        rows={question.rows}
                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-gray-600 rounded-lg focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none resize-none text-slate-700 dark:text-gray-200 dark:bg-gray-700 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* GAP ANALYSIS SECTION */}
          {currentSection.id === 'gap' && (
            <div className="p-6">
              {!gapAnalysis && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-4">Gap Analizi ve 5 Yıllık Roadmap</h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-6">
                    Mevcut durumunuz ile 5 yıl sonraki hedefleriniz arasındaki farkları AI ile analiz edin
                  </p>
                  <button
                    onClick={onAnalyzeGap}
                    disabled={isAnalyzingGap || !currentState.physical || !futureState.physical}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingGap ? '🔄 Analiz Ediliyor...' : '🚀 Gap Analizi Yap'}
                  </button>
                  {(!currentState.physical || !futureState.physical) && (
                    <p className="text-sm text-red-500 mt-4">
                      ⚠️ Önce "Şimdiki Ben" ve "5 Yıl Sonra Ben" bölümlerini doldurun
                    </p>
                  )}
                </div>
              )}

              {gapAnalysis && (
                <div>
                  <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">📊 Gap Analizi Sonuçları</h3>
                  <div className="prose max-w-none">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-6 rounded-lg whitespace-pre-wrap text-slate-700 dark:text-gray-200">
                      {gapAnalysis}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => {
                if (activeCategory > 0) {
                  setActiveCategory(activeCategory - 1);
                } else if (step > 0) {
                  setStep(step - 1);
                  setActiveCategory(sections[step - 1].categories.length - 1);
                }
              }}
              disabled={step === 0 && activeCategory === 0}
              className="flex items-center gap-2 px-5 py-2 bg-white text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <ChevronLeft size={18} />
              Geri
            </button>

            <div className="flex gap-2">
              <button
                onClick={downloadAnalysis}
                className="flex items-center gap-2 px-5 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-sm"
              >
                <Download size={18} />
                İndir
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all text-sm"
              >
                💾 Kaydet
              </button>
            </div>

            <button
              onClick={() => {
                if (activeCategory < currentSection.categories.length - 1) {
                  setActiveCategory(activeCategory + 1);
                } else if (step < sections.length - 1) {
                  handleSectionComplete();
                  setStep(step + 1);
                  setActiveCategory(0);
                }
              }}
              disabled={step === sections.length - 1 && activeCategory === currentSection.categories.length - 1}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              İleri
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-slate-700">
            <span className="font-bold text-blue-900">💡 Sistem:</span> Her kategoriyi doldur. Madde madde yaz. 
            Ne kadar detaylı olursan, karşılaştırma o kadar güçlü olur!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullLifeProfileForm;
