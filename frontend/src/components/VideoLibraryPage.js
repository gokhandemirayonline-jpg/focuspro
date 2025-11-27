import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle, Clock, Eye } from 'lucide-react';
import { videoCategoryAPI, videoAPI, progressAPI } from '../services/api';

const VideoLibraryPage = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videoProgress, setVideoProgress] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [player, setPlayer] = useState(null);
  const [lastValidTime, setLastValidTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, videosRes, progressRes] = await Promise.all([
        videoCategoryAPI.getAll(),
        videoAPI.getAll(),
        progressAPI.get()
      ]);

      setCategories(categoriesRes.data);
      
      // Videoları kategoriye ve order'a göre sırala
      const sortedVideos = videosRes.data.sort((a, b) => {
        if (a.category_id !== b.category_id) {
          return (a.category_id || '').localeCompare(b.category_id || '');
        }
        return a.order - b.order;
      });
      setVideos(sortedVideos);

      // Progress verilerini objeye çevir
      const progressMap = {};
      progressRes.data.forEach(p => {
        progressMap[p.video_id] = p;
      });
      setVideoProgress(progressMap);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategoriye göre filtrelenmiş videolar
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category_id === selectedCategory);

  // Video kilit kontrolü - kategori içinde sıralı izleme
  const isVideoUnlocked = (video) => {
    // İlk video her zaman açık
    const categoryVideos = videos.filter(v => v.category_id === video.category_id)
      .sort((a, b) => a.order - b.order);
    
    const videoIndex = categoryVideos.findIndex(v => v.id === video.id);
    if (videoIndex === 0) return true;

    // Önceki video izlendi mi kontrol et
    const previousVideo = categoryVideos[videoIndex - 1];
    const previousProgress = videoProgress[previousVideo.id];
    
    return previousProgress?.watched === true;
  };

  const handleVideoClick = async (video) => {
    if (!isVideoUnlocked(video)) {
      alert('Bu videoyu izlemek için önceki videoları tamamlamalısınız!');
      return;
    }
    setSelectedVideo(video);
    setVideoCompleted(false);
    setComment('');
    setShowCommentSection(false);
    setPlaybackSpeed(1);
  };

  const handleVideoComplete = async () => {
    if (!selectedVideo || !comment.trim()) {
      alert('Lütfen video hakkında yorumunuzu yazın!');
      return;
    }

    try {
      await progressAPI.updateProgress(selectedVideo.id, {
        watch_percentage: 100,
        watched: true
      });
      
      // Yorumu kaydet
      await progressAPI.complete(selectedVideo.id, comment);
      
      // Progress'i güncelle
      setVideoProgress(prev => ({
        ...prev,
        [selectedVideo.id]: {
          ...prev[selectedVideo.id],
          watched: true,
          watch_percentage: 100,
          comment: comment
        }
      }));

      alert('✅ Video başarıyla tamamlandı! Sonraki video açıldı.');
      setSelectedVideo(null);
      loadData(); // Kilit durumlarını güncelle
    } catch (error) {
      console.error('Video tamamlama hatası:', error);
      alert('Video tamamlanırken bir hata oluştu.');
    }
  };

  // YouTube Player API callback
  useEffect(() => {
    if (!selectedVideo) {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
      return;
    }

    // YouTube IFrame API'yi yükle (zaten yüklüyse tekrar yükleme)
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Player'ı oluştur
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player(`youtube-player-${selectedVideo.id}`, {
          videoId: selectedVideo.youtube_id,
          playerVars: {
            autoplay: 1,
            controls: 0, // YouTube kontrollerini tamamen kapat
            disablekb: 1, // Klavye kontrollerini kapat
            modestbranding: 1, // YouTube logosunu minimize et
            rel: 0, // İlgili videoları gösterme
            fs: 0, // Tam ekran kapat (custom buton kullanacağız)
            playsinline: 1,
            iv_load_policy: 3, // Annotations kapat
            cc_load_policy: 0, // Altyazıları otomatik açma
            color: 'white', // Progress bar rengi (gizli olsa da)
            origin: window.location.origin, // Güvenlik için
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              setLastValidTime(0);
              setDuration(event.target.getDuration());
              
              // Her saniye kontrol et - ileri sarma engelle + progress güncelle
              let previousTime = 0;
              const interval = setInterval(() => {
                if (event.target && event.target.getCurrentTime && event.target.getPlayerState) {
                  const currentTime = event.target.getCurrentTime();
                  const playerState = event.target.getPlayerState();
                  
                  // Progress bar'ı güncelle
                  setCurrentTime(currentTime);
                  setIsPlaying(playerState === 1);
                  
                  // Video oynatılıyorsa (1 = playing)
                  if (playerState === 1) {
                    // Manuel ileri sarma kontrolü - 3 saniyeden fazla atlama
                    if (currentTime > previousTime + 3) {
                      console.log('İleri sarma algılandı! Geri alınıyor...');
                      event.target.seekTo(previousTime, true);
                      
                      // Uyarı göster
                      const warning = document.getElementById('seek-warning');
                      if (warning) {
                        warning.style.opacity = '1';
                        setTimeout(() => {
                          warning.style.opacity = '0';
                        }, 2000);
                      }
                    } else {
                      // Normal akış - süreyi güncelle
                      previousTime = currentTime;
                    }
                  }
                }
              }, 1000);

              // Temizleme
              event.target._seekCheckInterval = interval;
            },
            onStateChange: (event) => {
              // Video bittiğinde (0 = YT.PlayerState.ENDED)
              if (event.data === 0) {
                setVideoCompleted(true);
                setShowCommentSection(true);
                
                // Interval'i temizle
                if (event.target._seekCheckInterval) {
                  clearInterval(event.target._seekCheckInterval);
                }
              }
            }
          }
        });
      }
    };

    // API hazırsa hemen başlat, değilse bekle
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (player && player._seekCheckInterval) {
        clearInterval(player._seekCheckInterval);
      }
    };
  }, [selectedVideo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Eğitim Videoları
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kategorilere göre eğitim videolarını izleyin ve gelişiminizi takip edin
        </p>
      </div>

      {/* Kategori Tabları - YouTube Tarzı */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tümü
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid - YouTube Tarzı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video, index) => {
          const progress = videoProgress[video.id];
          const isWatched = progress?.watched === true;
          const isUnlocked = isVideoUnlocked(video);
          const watchPercentage = progress?.watch_percentage || 0;

          return (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className={`group cursor-pointer ${!isUnlocked ? 'opacity-60' : ''}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>

                {/* Lock/Play/Complete Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!isUnlocked ? (
                    <div className="bg-black/80 p-4 rounded-full">
                      <Lock className="text-white" size={32} />
                    </div>
                  ) : isWatched ? (
                    <div className="bg-green-600/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="text-white" size={28} />
                    </div>
                  ) : (
                    <div className="bg-red-600/90 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="text-white" size={32} />
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {watchPercentage > 0 && watchPercentage < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                    <div 
                      className="h-full bg-red-600"
                      style={{ width: `${watchPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm">
                  {video.title}
                </h3>
                
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {video.view_count || 0}
                  </span>
                  <span>{video.level}</span>
                  {isWatched && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle size={14} />
                      İzlendi
                    </span>
                  )}
                </div>

                {video.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Bu kategoride henüz video bulunmuyor
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Video */}
            <div className="aspect-video bg-black relative">
              <style>{`
                /* Tüm YouTube kontrollerini gizle - sadece video göster */
                #youtube-player-${selectedVideo.id} .ytp-chrome-bottom {
                  display: none !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-chrome-top {
                  display: none !important;
                }
                
                /* Seekbar'ı gizle */
                #youtube-player-${selectedVideo.id} .ytp-progress-bar-container {
                  display: none !important;
                }
                
                /* Time display'i gizle */
                #youtube-player-${selectedVideo.id} .ytp-time-display {
                  display: none !important;
                }
                
                /* YouTube logosunu tamamen gizle - tüm versiyonlar */
                #youtube-player-${selectedVideo.id} .ytp-youtube-button {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-watermark {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-chrome-top-buttons {
                  display: none !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-show-cards-title {
                  display: none !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-title {
                  display: none !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-title-channel {
                  display: none !important;
                }
                
                /* Tüm YouTube branding elementlerini gizle */
                #youtube-player-${selectedVideo.id} .branding-img {
                  display: none !important;
                  opacity: 0 !important;
                }
                
                #youtube-player-${selectedVideo.id} .ytp-watermark img {
                  display: none !important;
                  opacity: 0 !important;
                }
                
                #youtube-player-${selectedVideo.id} .annotation {
                  display: none !important;
                }
                
                /* Sağ alt köşedeki YouTube branding'i gizle */
                #youtube-player-${selectedVideo.id} iframe {
                  pointer-events: none !important;
                }
                
                #youtube-player-${selectedVideo.id} .html5-video-player {
                  pointer-events: auto !important;
                }
                
                /* Video başlığındaki linkleri engelle */
                #youtube-player-${selectedVideo.id} .ytp-title-link {
                  pointer-events: none !important;
                  cursor: default !important;
                }
                
                /* Video üzerine tıklamayı engelle (pause hariç) */
                #youtube-player-${selectedVideo.id} .ytp-cued-thumbnail-overlay {
                  pointer-events: none !important;
                }
                
                /* Tüm dış linkleri engelle */
                #youtube-player-${selectedVideo.id} a[href*="youtube.com"] {
                  pointer-events: none !important;
                  cursor: default !important;
                  display: none !important;
                }
                
                /* Video tıklamasını izin ver (pause/play için) */
                #youtube-player-${selectedVideo.id} .html5-video-player {
                  cursor: pointer !important;
                }
              `}</style>
              
              <div id={`youtube-player-${selectedVideo.id}`} className="w-full h-full"></div>
              
              {/* İleri Sarma Uyarısı */}
              <div className="absolute top-4 left-4 bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm opacity-0" id="seek-warning">
                ⚠️ İleri sarılamaz!
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* Kontrol Butonları ve Süre Bilgisi */}
              <div className="flex items-center gap-4 mb-2">
                {/* Custom Controls - Sol taraf */}
                <div className="flex gap-2">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => {
                      if (player) {
                        if (isPlaying) {
                          player.pauseVideo();
                        } else {
                          player.playVideo();
                        }
                      }
                    }}
                    className="bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                    title={isPlaying ? 'Duraklat' : 'Oynat'}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* Speed Control */}
                  <button
                    onClick={() => {
                      if (player && player.setPlaybackRate) {
                        let newSpeed;
                        if (playbackSpeed === 1) {
                          newSpeed = 1.5;
                        } else if (playbackSpeed === 1.5) {
                          newSpeed = 2;
                        } else {
                          newSpeed = 1;
                        }
                        player.setPlaybackRate(newSpeed);
                        setPlaybackSpeed(newSpeed);
                      }
                    }}
                    className="bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    {playbackSpeed === 1 ? '▶ 1x' : playbackSpeed === 1.5 ? '⚡ 1.5x' : '⚡⚡ 2x'}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => {
                      if (player && player.getIframe) {
                        const iframe = player.getIframe();
                        if (iframe.requestFullscreen) {
                          iframe.requestFullscreen();
                        } else if (iframe.webkitRequestFullscreen) {
                          iframe.webkitRequestFullscreen();
                        }
                      }
                    }}
                    className="bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                    title="Tam Ekran"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>

                {/* Süre Bilgisi */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </span>
                  
                  {/* İzleme Yüzdesi */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      İzleme İlerlemesi:
                    </div>
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {duration > 0 ? Math.floor((currentTime / duration) * 100) : 0}%
                    </div>
                  </div>
                  
                  {/* Oynatma Durumu */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isPlaying 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {isPlaying ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Oynatılıyor
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Duraklatıldı
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                {/* Arka plan - Tamamlanmamış */}
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* İlerleme - Tamamlanan */}
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-full transition-all duration-300 relative"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    {/* Parlayan efekt */}
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress indicator (nokta) */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-lg transition-all duration-300"
                  style={{ 
                    left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)`,
                  }}
                >
                  {/* Glow efekti */}
                  <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              
              {/* Bilgi Notları */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  İzlenen bölüm
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  İzlenmemiş bölüm
                </div>
                <span>•</span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  ⚠️ İleri sarılamaz - videoyu sonuna kadar izlemelisiniz
                </span>
              </div>
            </div>

            {/* Video Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedVideo.description}
              </p>

              {/* Video Tamamlanma Uyarısı */}
              {!showCommentSection && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-semibold mb-1">Video izleniyor...</p>
                      <p>Videoyu sonuna kadar izledikten sonra yorum yazabilir ve tamamlayabilirsiniz.</p>
                      <p className="mt-1 text-xs">💡 İpucu: 2x hızlandırma yapabilirsiniz (video ayarlarından)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Yorum/Not Alanı - Video bittiğinde göster */}
              {showCommentSection && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800 dark:text-green-300">
                      <p className="font-semibold">✅ Video tamamlandı!</p>
                      <p>Öğrendikleriniz hakkında notlarınızı ve yorumlarınızı paylaşın.</p>
                    </div>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bu videodan ne öğrendiniz? Notlarınızı yazın..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {comment.length} karakter {comment.trim().length < 10 && '(En az 10 karakter yazmalısınız)'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleVideoComplete}
                  disabled={!videoCompleted || comment.trim().length < 10}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    videoCompleted && comment.trim().length >= 10
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={20} />
                  {videoCompleted 
                    ? (comment.trim().length >= 10 ? 'Gönder ve Tamamla' : 'Yorumunuzu Yazın') 
                    : 'Videoyu Sonuna Kadar İzleyin'}
                </button>
                <button
                  onClick={() => {
                    if (videoCompleted && comment.trim().length > 0) {
                      if (!window.confirm('Video tamamlanmadı. Çıkmak istediğinizden emin misiniz?')) {
                        return;
                      }
                    }
                    setSelectedVideo(null);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibraryPage;
