import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, ListChecks, CheckCircle2, Target, GraduationCap, 
  TrendingUp, Bookmark, Star, ArrowRight, Play, Clock, Award,
  Zap, BarChart3, Shield, Heart, Sparkles, ChevronRight
} from 'lucide-react';

const DashboardPage = ({ 
  stats, 
  dailyHabits, 
  tasks, 
  meetings, 
  currentUser,
  onUpdateHabit,
  onNavigate 
}) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const currentHour = new Date().getHours();
  
  const greeting = currentHour < 12 ? 'Günaydın' : currentHour < 18 ? 'İyi Günler' : 'İyi Akşamlar';
  const userName = currentUser?.name?.split(' ')[0] || 'Kullanıcı';

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const features = [
    {
      icon: <GraduationCap size={28} />,
      title: 'Eğitim Videoları',
      description: 'Kişisel gelişim ve profesyonel beceri eğitimleriyle kendinizi geliştirin.',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      page: 'videos',
      stat: 'Sıralı izleme sistemi'
    },
    {
      icon: <Calendar size={28} />,
      title: 'Takvim & Planlama',
      description: 'Görüşmelerinizi planlayın, takvimden takip edin.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      page: 'calendar',
      stat: `${stats.todayMeetings} görüşme bugün`
    },
    {
      icon: <ListChecks size={28} />,
      title: 'Görev Yönetimi',
      description: 'Hedeflerinizi görevlere bölün, ilerlemenizi kaydedin.',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      page: 'tasks',
      stat: `${stats.completedTasks}/${stats.totalTasks} tamamlandı`
    },
    {
      icon: <Bookmark size={28} />,
      title: 'Ajanda',
      description: 'Günlük ajandanızda görevlerinizi, hedeflerinizi ve hayallerinizi yönetin.',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      page: 'agenda',
      stat: 'Görevler, hedefler, hayaller'
    },

    {
      icon: <Award size={28} />,
      title: 'Rozetler & Başarılar',
      description: 'Başarılarınızı kutlayın, rozetler kazanın.',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      page: 'badges',
      stat: 'İlerlemenizi takip edin'
    }
  ];

  const platformValues = [
    {
      icon: <Target size={24} />,
      title: 'Hedef Odaklı',
      description: 'Net hedefler belirleyin, adım adım ilerleyin'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Sürekli Gelişim',
      description: 'Eğitim videoları ve alışkanlık takibi'
    },
    {
      icon: <Shield size={24} />,
      title: 'Disiplinli Çalışma',
      description: 'Günlük rutinler ve görev yönetimi'
    },
    {
      icon: <Heart size={24} />,
      title: 'Yaşam Dengesi',
      description: 'İş ve özel yaşam dengesini koruyun'
    }
  ];

  return (
    <div className={`w-full transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 md:mb-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-violet-800"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400/50 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}></div>

        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            {/* Logo + Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-2 ring-2 ring-white/20 shadow-xl">
                  <img src="/focuspro-logo.png" alt="FocusPro" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                    Focus<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Pro</span>
                  </h1>
                  <p className="text-purple-200 text-sm md:text-base font-medium mt-0.5">Kişisel Gelişim Platformu</p>
                </div>
              </div>
              
              <h2 className="text-xl md:text-3xl font-bold text-white/95 mb-3">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">{userName}</span> 👋
              </h2>
              
              <p className="text-purple-100/80 md:text-lg max-w-xl leading-relaxed">
                Hedeflerinize odaklanın, becerilerinizi geliştirin ve profesyonel yolculuğunuzda 
                her gün bir adım daha ileriye gidin. FocusPro sizin yanınızda.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                <button
                  onClick={() => onNavigate('videos')}
                  className="group flex items-center gap-2 bg-white text-purple-700 px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Play size={18} className="group-hover:scale-110 transition-transform" />
                  Eğitimlere Başla
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('agenda')}
                  className="group flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white border border-white/25 px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-white/25 transition-all duration-300"
                >
                  <Bookmark size={18} />
                  Ajandamı Aç
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[280px]">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all cursor-pointer" onClick={() => onNavigate('tasks')}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.completedTasks}</p>
                <p className="text-purple-200/70 text-xs mt-0.5">Tamamlanan Görev</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all cursor-pointer" onClick={() => onNavigate('tasks')}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                    <ListChecks size={16} className="text-blue-300" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalTasks}</p>
                <p className="text-purple-200/70 text-xs mt-0.5">Toplam Görev</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all cursor-pointer" onClick={() => onNavigate('calendar')}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-amber-300" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.todayMeetings}</p>
                <p className="text-purple-200/70 text-xs mt-0.5">Bugünkü Görüşme</p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Platform Purpose Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">FocusPro ile Neler Yapabilirsiniz?</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {platformValues.map((value, idx) => (
            <div key={idx} className="group bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base">{value.title}</h4>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards - Main Modules */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <Zap size={20} className="text-purple-600" />
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">Hızlı Erişim</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(feature.page)}
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`group relative text-left bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${(idx + 2) * 100}ms` }}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base md:text-lg mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{feature.description}</p>
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{feature.stat}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Habits + Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Daily Habits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Star size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">Günlük Alışkanlıklar</h3>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="space-y-3">
            {dailyHabits.map(habit => {
              const progress = habit.target > 0 ? (habit.completed / habit.target) * 100 : 0;
              const isComplete = progress >= 100;
              return (
                <div key={habit.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isComplete ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isComplete && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                      <p className={`font-medium text-sm truncate ${isComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-200'}`}>{habit.title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-purple-500'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{habit.completed}/{habit.target}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <button
                      onClick={() => onUpdateHabit(habit.id, Math.max(0, habit.completed - 1))}
                      className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <button
                      onClick={() => onUpdateHabit(habit.id, habit.completed + 1)}
                      className="w-7 h-7 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            {dailyHabits.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={20} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz alışkanlık eklenmemiş</p>
                <button onClick={() => onNavigate('agenda')} className="mt-2 text-purple-600 text-sm font-medium hover:underline">
                  İlk alışkanlığını ekle →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks + Meetings Combined */}
        <div className="space-y-4 md:space-y-6">
          {/* Recent Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <ListChecks size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">Son Görevler</h3>
              </div>
              <button
                onClick={() => onNavigate('agenda')}
                className="text-purple-600 dark:text-purple-400 text-xs font-medium hover:underline flex items-center gap-1"
              >
                Tümü <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {[...tasks].reverse().slice(0, 5).map(task => {
                const stageConfig = {
                  'done':        { border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '✓', label: 'Tamamlandı' },
                  'in_progress': { border: 'border-l-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',       badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       icon: '▶', label: 'Devam Ediyor' },
                  'todo':        { border: 'border-l-gray-300',     bg: 'bg-gray-50 dark:bg-gray-700/50',       badge: 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300',           icon: '◦', label: 'Yapılacak' },
                };
                const s = stageConfig[task.status] || stageConfig['todo'];
                return (
                  <div key={task.id} className={`flex items-center justify-between p-3 ${s.bg} rounded-lg border-l-4 ${s.border}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                      {task.date && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📅 {task.date}</p>}
                    </div>
                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${s.badge}`}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Henüz görev yok</p>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">Yaklaşan Görüşmeler</h3>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-purple-600 dark:text-purple-400 text-xs font-medium hover:underline flex items-center gap-1"
              >
                Takvim <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {meetings.slice(0, 3).map(meeting => (
                <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{meeting.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-gray-400" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">{meeting.date} {meeting.start_time}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    meeting.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {meeting.status === 'completed' ? '✓ Tamam' :
                     meeting.status === 'cancelled' ? '✕ İptal' : '◉ Planlandı'}
                  </span>
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Henüz görüşme yok</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer motivation */}
      <div className="text-center py-6 md:py-8 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/focuspro-logo.png" alt="FocusPro" className="w-6 h-6 opacity-60" />
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">FocusPro</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 italic max-w-md mx-auto">
          "Başarı, her gün tekrarlanan küçük çabaların toplamıdır." — Robert Collier
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
