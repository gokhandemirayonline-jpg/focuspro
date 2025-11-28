import React, { useState, useEffect, useRef } from 'react';
import { Play, Lock, CheckCircle, Clock, Eye } from 'lucide-react';
import { videoCategoryAPI, videoAPI, progressAPI } from '../services/api';
import ReactPlayer from 'react-player';

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
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [lastValidTime, setLastValidTime] = useState(0);
  
  const playerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // İleri sarma kontrolü
  useEffect(() => {
    if (!selectedVideo || !playing) return;
    
    const interval = setInterval(() => {
      // getCurrentTime ve seekTo kullanmak yerine onProgress'ten gelen currentTime kullanıyoruz
      if (currentTime > lastValidTime + 3 && currentTime > 0) {
        console.log('İleri sarma algılandı!');
        if (playerRef.current) {
          playerRef.current.seekTo(lastValidTime, 'seconds');
        }
        showSeekWarning();
      } else if (currentTime > 0) {
        setLastValidTime(currentTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [selectedVideo, playing, currentTime, lastValidTime]);

  const showSeekWarning = () => {
    const warning = document.getElementById('seek-warning-reactplayer');
    if (warning) {
      warning.style.opacity = '1';
      setTimeout(() => {
        warning.style.opacity = '0';
      }, 2000);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, videosRes, progressRes] = await Promise.all([
        videoCategoryAPI.getAll(),
        videoAPI.getAll(),
        progressAPI.get()
      ]);

      setCategories(categoriesRes.data);
      
      const sortedVideos = videosRes.data.sort((a, b) => {
        if (a.category_id !== b.category_id) {
          return (a.category_id || '').localeCompare(b.category_id || '');
        }
        return a.order - b.order;
      });
      setVideos(sortedVideos);

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

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category_id === selectedCategory);

  const isVideoUnlocked = (video) => {
    const categoryVideos = videos.filter(v => v.category_id === video.category_id)
      .sort((a, b) => a.order - b.order);
    
    const videoIndex = categoryVideos.findIndex(v => v.id === video.id);
    if (videoIndex === 0) return true;

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
    setPlaying(false); // Önce false, sonra player hazır olunca true
    setCurrentTime(0);
    setLastValidTime(0);
    setPlaybackRate(1);
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
      
      await progressAPI.complete(selectedVideo.id, comment);
      
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
      loadData();
    } catch (error) {
      console.error('Video tamamlama hatası:', error);
      alert('Video tamamlanırken bir hata oluştu.');
    }
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
    // Duration'ı progress'ten al
    if (duration === 0 && playerRef.current) {
      const dur = playerRef.current.getDuration();
      if (dur) setDuration(dur);
    }
  };

  const handleEnded = () => {
    setVideoCompleted(true);
    setShowCommentSection(true);
    setPlaying(false);
  };

  const handleReady = (player) => {
    // Player hazır olduğunda duration al ve otomatik başlat
    if (player && player.getDuration) {
      const dur = player.getDuration();
      if (dur) setDuration(dur);
    }
    setTimeout(() => {
      setPlaying(true);
    }, 500);
  };

  // Cleanup - modal kapanırken player'ı düzgün temizle
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        setPlaying(false);
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

      {/* Kategori Tabları */}
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => {
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

      {/* Video Player Modal with React Player */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              {/* İleri Sarma Uyarısı - Sadece bu kalacak, overlay'ler yok */}
              <div 
                className="absolute top-4 left-4 bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm opacity-0 z-50 transition-opacity duration-300" 
                id="seek-warning-reactplayer"
              >
                ⚠️ İleri sarılamaz!
              </div>
              
              {/* React Player - Temiz, Overlay Yok */}
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${selectedVideo.youtube_id}`}
                playing={playing}
                controls={true}
                light={false}
                width="100%"
                height="100%"
                playbackRate={playbackRate}
                onReady={handleReady}
                onProgress={handleProgress}
                onEnded={handleEnded}
                onPlay={() => {
                  console.log('Video playing!');
                  setPlaying(true);
                }}
                onPause={() => {
                  console.log('Video paused!');
                  setPlaying(false);
                }}
                onError={(e) => {
                  console.error('Player error:', e);
                  console.error('Video ID:', selectedVideo.youtube_id);
                  console.error('URL:', `https://www.youtube.com/watch?v=${selectedVideo.youtube_id}`);
                }}
                progressInterval={1000}
                style={{ backgroundColor: '#000' }}
                pip={false}
                stopOnUnmount={true}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      iv_load_policy: 3,
                      fs: 1,
                      controls: 1,
                      disablekb: 0
                    }
                  }
                }}
              />
            </div>

            {/* Progress Info & Custom Controls */}
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  {/* Playback Speed Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hız:</span>
                    <div className="flex gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            playbackRate === rate
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">İzleme İlerlemesi:</span>
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {duration > 0 ? Math.floor((currentTime / duration) * 100) : 0}%
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    playing 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {playing ? (
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
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">⚠️ Önemli:</span> İleri sarılamaz - videoyu sonuna kadar izlemelisiniz
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

              {!showCommentSection && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-semibold mb-1">Video izleniyor...</p>
                      <p>Videoyu sonuna kadar izledikten sonra yorum yazabilir ve tamamlayabilirsiniz.</p>
                    </div>
                  </div>
                </div>
              )}

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
                    // Önce playing'i durdur, sonra modal'ı kapat
                    setPlaying(false);
                    setTimeout(() => {
                      setSelectedVideo(null);
                    }, 100);
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
