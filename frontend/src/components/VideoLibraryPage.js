import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle, Clock, Eye, GripVertical } from 'lucide-react';
import { videoCategoryAPI, videoAPI, progressAPI } from '../services/api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Video Card Component
const SortableVideoCard = ({ video, isUnlocked, progress, onVideoClick, isAdmin }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: video.id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isWatched = progress?.watched === true;
  const watchPercentage = progress?.watch_percentage || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${!isUnlocked ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle - Sadece Admin için */}
      {isAdmin && (
        <div
          {...attributes}
          {...listeners}
          data-drag-handle="true"
          className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={20} className="text-gray-600 dark:text-gray-400" />
        </div>
      )}

      {/* Video Card */}
      <div 
        onClick={(e) => {
          // Drag handle'a tıklandıysa video açma
          if (e.target.closest('[data-drag-handle]')) {
            return;
          }
          onVideoClick(video);
        }} 
        className="cursor-pointer"
      >
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3">
          <img
            src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
            }}
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>

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

          {watchPercentage > 0 && watchPercentage < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div 
                className="h-full bg-red-600"
                style={{ width: `${watchPercentage}%` }}
              />
            </div>
          )}
        </div>

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
    </div>
  );
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [lastValidTime, setLastValidTime] = useState(0);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px hareket ettikten sonra drag başlasın
      },
    })
  );

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

  // Drag & Drop Handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active?.id, over: over?.id });

    if (over && active.id !== over.id) {
      const oldIndex = filteredVideos.findIndex(v => v.id === active.id);
      const newIndex = filteredVideos.findIndex(v => v.id === over.id);
      
      console.log('Moving from', oldIndex, 'to', newIndex);

      // Tüm videoları güncelle (filter edilmiş değil, hepsi)
      const categoryVideos = videos.filter(v => 
        selectedCategory === 'all' ? true : v.category_id === selectedCategory
      );
      
      const otherVideos = videos.filter(v => 
        selectedCategory === 'all' ? false : v.category_id !== selectedCategory
      );
      
      // Sadece bu kategorideki videoları yeniden sırala
      const reorderedCategory = arrayMove(categoryVideos, oldIndex, newIndex).map((v, idx) => ({
        ...v,
        order: idx
      }));
      
      // Tüm videoları birleştir
      const allVideos = [...reorderedCategory, ...otherVideos].sort((a, b) => {
        if (a.category_id !== b.category_id) {
          return (a.category_id || '').localeCompare(b.category_id || '');
        }
        return a.order - b.order;
      });

      // UI'ı güncelle
      setVideos(allVideos);
      
      console.log('Videos updated in UI');

      // Backend'e gönder
      try {
        const orderUpdates = reorderedCategory.map(v => ({
          id: v.id,
          order: v.order
        }));
        
        await videoAPI.reorder(orderUpdates);
        console.log('✅ Backend güncellendi:', orderUpdates.length, 'video');
      } catch (error) {
        console.error('❌ Sıralama hatası:', error);
        alert('Sıralama kaydedilemedi: ' + error.message);
        // Hata durumunda yeniden yükle
        loadData();
      }
    }
  };

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
    
    // İzlenme sayısını artır
    try {
      await progressAPI.incrementView(video.id);
    } catch (error) {
      console.error('View count artırma hatası:', error);
    }
    
    setSelectedVideo(video);
    setVideoCompleted(false);
    setComment('');
    setShowCommentSection(false);
    setPlaybackSpeed(1);
    
    // Progress'i yeniden yükle (view_count güncellenmiş olacak)
    loadData();
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
    if (!selectedVideo) return;

    // YouTube IFrame API'yi yükle (zaten yüklüyse tekrar yükleme)
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Player'ı oluştur
    const initPlayer = () => {
      // Create element forcefully and safely attached to our container Ref independently of React tree lifecycle
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ''; // Temizle
        const targetDiv = document.createElement('div');
        targetDiv.id = `youtube-player-${selectedVideo.id}`;
        targetDiv.style.width = '100%';
        targetDiv.style.height = '100%';
        playerContainerRef.current.appendChild(targetDiv);
      }

      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(`youtube-player-${selectedVideo.id}`, {
          videoId: selectedVideo.youtube_id,
          playerVars: {
            autoplay: 1,  // 1 yapalım ki otomatik başlasın
            controls: 0, // YouTube kontrollerini tamamen kapat
            disablekb: videoProgress[selectedVideo.id]?.watched ? 0 : 1,  // Tamamlanmış videoda klavye aktif
            modestbranding: 1, // YouTube logosunu minimize et
            rel: 0, // İlgili videoları gösterme
            fs: 0, // Tam ekran kapat (custom buton kullanacağız)
            playsinline: 1,
            iv_load_policy: 3, // Annotations kapat
            cc_load_policy: 0, // Altyazıları otomatik açma
            color: 'white',
            origin: window.location.origin,
            // Ekstra gizleme parametreleri
            showinfo: 0, // Video bilgilerini gösterme (deprecated ama ekleyelim)
            enablejsapi: 1, // JS API kontrolü için
            widget_referrer: window.location.origin,
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              const videoDuration = event.target.getDuration();
              setDuration(videoDuration);
              
              // Kaldığı yerden devam et
              const progress = videoProgress[selectedVideo.id];
              let startTime = 0;
              
              if (progress && progress.watch_percentage > 0 && progress.watch_percentage < 100) {
                startTime = (progress.watch_percentage / 100) * videoDuration;
                event.target.seekTo(startTime, true);
                console.log(`Video kaldığı yerden başlatıldı: ${Math.floor(startTime)}s`);
              }
              
              setLastValidTime(startTime);
              
              // Güçlendirilmiş otomatik oynatma
              setTimeout(() => {
                if (event.target && typeof event.target.playVideo === 'function') {
                  event.target.playVideo();
                }
              }, 100);
              
              // Her saniye kontrol et - ileri sarma engelle + progress güncelle
              let previousTime = startTime;
              const interval = setInterval(() => {
                if (event.target && event.target.getCurrentTime && event.target.getPlayerState) {
                  const currentTime = event.target.getCurrentTime();
                  const playerState = event.target.getPlayerState();
                  
                  // Progress bar'ı güncelle
                  setCurrentTime(currentTime);
                  setIsPlaying(playerState === 1);
                  
                  // Video oynatılıyorsa (1 = playing)
                  if (playerState === 1) {
                    // Video tamamlanmış mı dinamik kontrol et (her saniye güncellenir)
                    const currentProgress = videoProgress[selectedVideo.id];
                    const isVideoCompleted = currentProgress?.watched === true;
                    
                    // İLERİ SARMA KONTROLÜ - Sadece tamamlanmamış videolar için
                    if (!isVideoCompleted && currentTime > previousTime + 3) {
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
                      
                      // Her 10 saniyede bir progress'i kaydet (sadece tamamlanmamışlar için)
                      if (!isVideoCompleted && Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
                        const watchPercentage = Math.floor((currentTime / videoDuration) * 100);
                        progressAPI.updateProgress(selectedVideo.id, {
                          watch_percentage: watchPercentage,
                          watched: false
                        }).catch(err => console.error('Progress kayıt hatası:', err));

                        // Anlık durumu React state'ine de ekleyelim ki kapat/aç yapınca sayfayı yenilemeden kaldığı yeri bilsin
                        setVideoProgress(prev => ({
                          ...prev,
                          [selectedVideo.id]: {
                            ...(prev[selectedVideo.id] || {}),
                            watch_percentage: watchPercentage,
                            watched: false
                          }
                        }));
                      }
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
      if (playerRef.current) {
        if (playerRef.current._seekCheckInterval) {
          clearInterval(playerRef.current._seekCheckInterval);
        }
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log("Cleanup hatası atlandı");
        }
        playerRef.current = null;
      }
      setPlayer(null);
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
    <div className="w-full md:max-w-7xl md:mx-auto px-0 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6 px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2">
          Eğitim Videoları
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Kategorilere göre eğitim videolarını izleyin ve gelişiminizi takip edin
        </p>
      </div>

      {/* Kategori Tabları - YouTube Tarzı */}
      <div className="mb-4 md:mb-8 overflow-x-auto px-2 md:px-0">
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

      {/* Video Grid - Drag & Drop Destekli */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredVideos.map(v => v.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 px-1 md:px-0">
            {filteredVideos.map((video) => (
              <SortableVideoCard
                key={video.id}
                video={video}
                isUnlocked={isVideoUnlocked(video)}
                progress={videoProgress[video.id]}
                onVideoClick={handleVideoClick}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
                /* ALL YOUTUBE UI ELEMENTS HIDE */
                #youtube-player-${selectedVideo.id} .ytp-chrome-bottom,
                #youtube-player-${selectedVideo.id} .ytp-chrome-top,
                #youtube-player-${selectedVideo.id} .ytp-chrome-controls,
                #youtube-player-${selectedVideo.id} .ytp-progress-bar-container,
                #youtube-player-${selectedVideo.id} .ytp-time-display,
                #youtube-player-${selectedVideo.id} .ytp-left-controls,
                #youtube-player-${selectedVideo.id} .ytp-right-controls {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                  pointer-events: none !important;
                }
                
                /* Logo and watermarks hide */
                #youtube-player-${selectedVideo.id} .ytp-youtube-button,
                #youtube-player-${selectedVideo.id} .ytp-watermark,
                #youtube-player-${selectedVideo.id} .ytp-chrome-top-buttons,
                #youtube-player-${selectedVideo.id} .ytp-show-cards-title,
                #youtube-player-${selectedVideo.id} .ytp-title,
                #youtube-player-${selectedVideo.id} .ytp-title-text,
                #youtube-player-${selectedVideo.id} .ytp-title-channel,
                #youtube-player-${selectedVideo.id} .ytp-title-link,
                #youtube-player-${selectedVideo.id} .branding-img,
                #youtube-player-${selectedVideo.id} .ytp-watermark img {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                  pointer-events: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                
                /* Share and extra action buttons hide */
                #youtube-player-${selectedVideo.id} .ytp-button[aria-label*="Share"],
                #youtube-player-${selectedVideo.id} .ytp-button[aria-label*="Paylaş"],
                #youtube-player-${selectedVideo.id} .ytp-share-button,
                #youtube-player-${selectedVideo.id} .ytp-cards-button,
                #youtube-player-${selectedVideo.id} .ytp-watch-later-button,
                #youtube-player-${selectedVideo.id} .ytp-size-button,
                #youtube-player-${selectedVideo.id} .ytp-overflow-button {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
                
                /* Adverts and hover overlays hide */
                #youtube-player-${selectedVideo.id} .annotation,
                #youtube-player-${selectedVideo.id} .ytp-pause-overlay,
                #youtube-player-${selectedVideo.id} .ytp-ce-element,
                #youtube-player-${selectedVideo.id} .ytp-cards-teaser,
                #youtube-player-${selectedVideo.id} .ytp-endscreen-content,
                #youtube-player-${selectedVideo.id} .ytp-ce-covering-overlay,
                #youtube-player-${selectedVideo.id} .ytp-ce-expanding-overlay {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
                
                /* Clickable YouTube links intercept */
                #youtube-player-${selectedVideo.id} a[class*="ytp"],
                #youtube-player-${selectedVideo.id} button[class*="ytp"]:not(.ytp-large-play-button),
                #youtube-player-${selectedVideo.id} a[href*="youtube.com"],
                #youtube-player-${selectedVideo.id} [class*="ytp-button"] {
                  display: none !important;
                  pointer-events: none !important;
                }
                
                /* Video gradient overlays - YouTube'un kendi UI'ı */
                #youtube-player-${selectedVideo.id} .ytp-gradient-top,
                #youtube-player-${selectedVideo.id} .ytp-gradient-bottom {
                  display: none !important;
                  opacity: 0 !important;
                }
                
                /* IFrame pointer events - sadece videoya izin ver */
                #youtube-player-${selectedVideo.id} iframe {
                  pointer-events: none !important;
                  width: 100% !important;
                  height: 100% !important;
                }
                
                #youtube-player-${selectedVideo.id} .html5-video-player {
                  pointer-events: auto !important;
                  cursor: pointer !important;
                }
                
                /* Video frame'i temiz tut */
                #youtube-player-${selectedVideo.id} {
                  position: relative;
                  overflow: hidden;
                  width: 100%;
                  height: 100%;
                }
              `}</style>
              
              <div ref={playerContainerRef} className="w-full h-full relative overflow-hidden bg-black flex justify-center items-center">
                 {/* YouTube Player dynamically mounts here */}
              </div>
              
              {/* İleri Sarma Uyarısı - Overlay'ler kaldırıldı */}
              <div className="absolute top-4 left-4 bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm opacity-0 z-30" id="seek-warning">
                ⚠️ İleri sarılamaz!
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* Kontrol Butonları ve Süre Bilgisi */}
              <div className="flex items-center justify-between mb-2">
                {/* Sol Taraf - Kontroller ve Bilgiler */}
                <div className="flex items-center gap-4 border-r border-transparent overflow-x-auto pb-1">
                  {/* Custom Controls - Sol taraf */}
                  <div className="flex gap-2 shrink-0">
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

                  {/* Süre Bilgisi ve Meta Data */}
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">/</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                    </span>
                    
                    {/* İzleme Yüzdesi */}
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
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
                          <span className="hidden sm:inline">Oynatılıyor</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="hidden sm:inline">Duraklatıldı</span>
                        </>
                      )}
                    </div>
                    
                    {/* İzlenme Sayısı - Oynatma durumundan sonra */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:flex">
                      <Eye size={14} />
                      <span>İzlenme:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {selectedVideo.view_count || 0} kez
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf - Kapat Butonu */}
                <div className="flex items-center pl-4 ml-auto border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      if (videoCompleted && comment.trim().length > 0) {
                        if (!window.confirm('Video tamamlanmadı. Çıkmak istediğinizden emin misiniz?')) {
                          return;
                        }
                      }
                      setSelectedVideo(null);
                    }}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-red-200 hover:border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-600 dark:hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Kapat
                  </button>
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
                {videoProgress[selectedVideo.id]?.watched ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ✅ Tamamlandı - İleri/geri sarabilirsiniz
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    ⚠️ İleri sarılamaz - videoyu sonuna kadar izlemelisiniz
                  </span>
                )}
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

              {/* Video İzleme Bilgisi */}
              {!showCommentSection && (
                <div className={`rounded-lg p-4 mb-4 border ${
                  videoProgress[selectedVideo.id]?.watched 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {videoProgress[selectedVideo.id]?.watched ? (
                      <>
                        <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-green-800 dark:text-green-300">
                          <p className="font-semibold mb-1">✅ Bu videoyu tamamladınız!</p>
                          <p>Tekrar izleyebilir, dilediğiniz gibi ileri/geri sarabilirsiniz.</p>
                          <p className="mt-1 text-xs">💬 İsterseniz tekrar yorum bırakabilirsiniz.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <p className="font-semibold mb-1">Video izleniyor...</p>
                          <p>Videoyu sonuna kadar izledikten sonra yorum yazabilir ve tamamlayabilirsiniz.</p>
                          <p className="mt-1 text-xs">💡 İpucu: 2x hızlandırma yapabilirsiniz (video ayarlarından)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Yorum/Not Alanı - Video bittiğinde göster (Admin hariç) */}
              {showCommentSection && user?.role !== 'admin' && (
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
              
              {/* Admin için video tamamlandı mesajı */}
              {showCommentSection && user?.role === 'admin' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      ✅ Video tamamlandı!
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {/* Kullanıcı için Tamamla Butonu */}
                {user?.role !== 'admin' && (
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
                )}
                
                {/* Admin için basit Kapat butonu (video bittiğinde otomatik progress kaydedilir) */}
                {user?.role === 'admin' && videoCompleted && (
                  <button
                    onClick={() => {
                      // Admin için progress otomatik kaydedildi, sadece kapat
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    Tamamlandı (Kapat)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibraryPage;
