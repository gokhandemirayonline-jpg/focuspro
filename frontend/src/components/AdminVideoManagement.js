import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, Edit, Trash2, Play, Lock, CheckCircle, Eye, GripVertical, FolderOpen } from 'lucide-react';
import { videoCategoryAPI, videoAPI, progressAPI } from '../services/api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const VideoLibraryPage = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [progress, setProgress] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCategories();
    loadAllVideos();
    if (user) {
      loadProgress();
    }
    loadStatistics();
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await videoCategoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setAllVideos(response.data);
    } catch (error) {
      console.error('Video yükleme hatası:', error);
    }
  };

  const loadVideos = async (categoryId) => {
    try {
      const response = await videoAPI.getAll();
      const categoryVideos = response.data
        .filter(v => v.category_id === categoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setVideos(categoryVideos);
    } catch (error) {
      console.error('Video yükleme hatası:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/video-statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await progressAPI.getAll();
      const progressMap = {};
      response.data.forEach(p => {
        progressMap[p.video_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('İlerleme yükleme hatası:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await videoCategoryAPI.delete(categoryId);
      await loadCategories();
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      alert('Kategori silinemedi');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Bu videoyu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await videoAPI.delete(videoId);
      await loadVideos(selectedCategory.id);
    } catch (error) {
      console.error('Video silme hatası:', error);
      alert('Video silinemedi');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex(v => v.id === active.id);
      const newIndex = videos.findIndex(v => v.id === over.id);
      
      const newVideos = arrayMove(videos, oldIndex, newIndex);
      setVideos(newVideos);
      
      // Backend'e yeni sırayı kaydet
      try {
        const videoIds = newVideos.map(v => v.id);
        await videoAPI.reorder(videoIds);
      } catch (error) {
        console.error('Sıralama kaydetme hatası:', error);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kategori Detay Görünümü (Videolar)
  if (selectedCategory) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-purple-600 hover:underline mb-4"
          >
            <ChevronLeft size={20} />
            Kategorilere Geri Dön
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {selectedCategory.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {videos.length} video
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setShowVideoModal(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <Plus size={20} />
                Video Ekle
              </button>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={videos.map(v => v.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => {
                const videoProgress = progress[video.id];
                const isWatched = videoProgress?.watched === true;
                const isUnlocked = video.order === 0 || (video.order > 0 && progress[videos[video.order - 1]?.id]?.watched);
                
                return (
                  <SortableVideoCard
                    key={video.id}
                    video={video}
                    isUnlocked={isUnlocked}
                    progress={videoProgress}
                    isAdmin={isAdmin}
                    onEdit={() => {
                      setEditingVideo(video);
                      setShowVideoModal(true);
                    }}
                    onDelete={() => deleteVideo(video.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Bu kategoride henüz video yok
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                İlk Videoyu Ekle
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Ana Görünüm (Kategori Kartları)
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Video Kütüphanesi
        </h2>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus size={20} />
            Yeni Kategori
          </button>
        )}
      </div>

      {/* Kategori Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map(category => {
          const categoryVideos = videos.filter(v => v.category_id === category.id);
          const videoCount = categoryVideos.length;
          
          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Kategori Icon/Thumbnail */}
              <div
                onClick={() => {
                  setSelectedCategory(category);
                  loadVideos(category.id);
                }}
                className="cursor-pointer bg-gradient-to-br from-purple-500 to-pink-500 h-40 flex items-center justify-center relative overflow-hidden"
              >
                <div className="text-6xl">{category.icon || '📚'}</div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Kategori Bilgileri */}
              <div className="p-4">
                <h3 
                  onClick={() => {
                    setSelectedCategory(category);
                    loadVideos(category.id);
                  }}
                  className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {category.name}
                </h3>
                
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Play size={16} />
                    {videoCount} video
                  </span>
                </div>

                {/* Admin Butonları */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
                      Sil
                    </button>
                  </div>
                )}

                {/* Kullanıcı için Görüntüle Butonu */}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      loadVideos(category.id);
                    }}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-1"
                  >
                    <Play size={16} />
                    Videoları Görüntüle
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Boş Durum */}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Henüz kategori eklenmemiş
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                İlk Kategoriyi Oluştur
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals - Placeholder */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Kategori Modal (Yapım aşamasında)</h3>
            <button
              onClick={() => setShowCategoryModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Video Modal (Yapım aşamasında)</h3>
            <button
              onClick={() => setShowVideoModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sortable Video Card
const SortableVideoCard = ({ video, isUnlocked, progress, isAdmin, onEdit, onDelete }) => {
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
      {/* Drag Handle */}
      {isAdmin && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg cursor-grab active:cursor-grabbing shadow-md"
        >
          <GripVertical size={20} />
        </div>
      )}

      {/* Video Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          <img 
            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock size={32} className="text-white" />
            </div>
          )}

          {isWatched && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircle size={20} />
            </div>
          )}

          {!isWatched && watchPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div 
                className="h-full bg-purple-600"
                style={{ width: `${watchPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
            {video.title}
          </h3>
          
          {video.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {video.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            {progress?.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {progress.view_count}
              </span>
            )}
          </div>

          {/* Butonlar */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Edit size={14} className="inline mr-1" />
                Düzenle
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm"
              >
                <Trash2 size={14} className="inline mr-1" />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLibraryPage;
