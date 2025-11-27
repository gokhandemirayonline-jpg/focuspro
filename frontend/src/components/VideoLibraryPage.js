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
  };

  const handleVideoComplete = async () => {
    if (!selectedVideo) return;

    try {
      await progressAPI.updateProgress(selectedVideo.id, {
        watch_percentage: 100,
        watched: true
      });
      
      // Progress'i güncelle
      setVideoProgress(prev => ({
        ...prev,
        [selectedVideo.id]: {
          ...prev[selectedVideo.id],
          watched: true,
          watch_percentage: 100
        }
      }));

      setSelectedVideo(null);
      loadData(); // Kilit durumlarını güncelle
    } catch (error) {
      console.error('Video tamamlama hatası:', error);
    }
  };

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
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-5xl w-full overflow-hidden">
            {/* Video */}
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedVideo.description}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleVideoComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="inline mr-2" size={20} />
                  Videoyu Tamamla
                </button>
                <button
                  onClick={() => setSelectedVideo(null)}
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
