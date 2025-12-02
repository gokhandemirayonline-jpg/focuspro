import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, Edit, Trash2, Eye, Calendar, Upload, X } from 'lucide-react';
import { blogAPI, uploadAPI } from '../services/api';

const BlogPage = ({ user }) => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'education', name: 'Eğitim' },
    { id: 'success', name: 'Başarı Hikayeleri' },
    { id: 'tips', name: 'İpuçları' },
    { id: 'motivation', name: 'Motivasyon' },
    { id: 'leadership', name: 'Liderlik' },
    { id: 'sales', name: 'Satış' },
  ];

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      setBlogs(response.data);
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId) => {
    if (!window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;
    
    try {
      await blogAPI.delete(blogId);
      await loadBlogs();
    } catch (error) {
      console.error('Blog silme hatası:', error);
      alert('Blog silinemedi');
    }
  };

  // Filtreleme
  const filteredBlogs = blogs
    .filter(blog => isAdmin || blog.published)
    .filter(blog => selectedCategory === 'all' || blog.category === selectedCategory)
    .filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Bloglar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Blog Detay Görünümü
  if (selectedBlog) {
    return (
      <div>
        <button
          onClick={() => setSelectedBlog(null)}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:underline"
        >
          <ChevronLeft size={20} />
          Geri Dön
        </button>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
          {selectedBlog.cover_image && (
            <img 
              src={selectedBlog.cover_image} 
              alt={selectedBlog.title}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="p-8 md:p-12">
            {/* Kategori & Durum */}
            <div className="flex items-center gap-2 mb-4">
              {selectedBlog.category && (
                <span className="inline-block text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                  {categories.find(c => c.id === selectedBlog.category)?.name || selectedBlog.category}
                </span>
              )}
              {!selectedBlog.published && isAdmin && (
                <span className="inline-block text-sm px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  Taslak
                </span>
              )}
            </div>

            {/* Başlık */}
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {selectedBlog.title}
            </h1>

            {/* Tarih */}
            {selectedBlog.created_at && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-8">
                <Calendar size={16} />
                <span className="text-sm">
                  {new Date(selectedBlog.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* İçerik */}
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selectedBlog.content}
            </div>

            {/* Admin Düzenle/Sil Butonları */}
            {isAdmin && (
              <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setEditingBlog(selectedBlog);
                    setShowBlogModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit size={18} />
                  Düzenle
                </button>
                <button
                  onClick={() => deleteBlog(selectedBlog.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={18} />
                  Sil
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  // Blog Liste Görünümü
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Blog</h2>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingBlog(null);
              setShowBlogModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 self-start md:self-auto"
          >
            <Plus size={20} />
            Yeni Blog
          </button>
        )}
      </div>

      {/* Arama & Filtreleme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Arama */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Blog ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Kategori Filtresi */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map(blog => (
          <div 
            key={blog.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Kapak Görseli */}
            {blog.cover_image && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={blog.cover_image} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!blog.published && isAdmin && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Taslak
                  </div>
                )}
              </div>
            )}

            {/* İçerik */}
            <div className="p-6">
              {/* Kategori */}
              {blog.category && (
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full mb-3 inline-block">
                  {categories.find(c => c.id === blog.category)?.name || blog.category}
                </span>
              )}

              {/* Başlık */}
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                {blog.title}
              </h3>

              {/* Özet */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {blog.excerpt || blog.content.substring(0, 150) + '...'}
              </p>

              {/* Tarih */}
              {blog.created_at && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(blog.created_at).toLocaleDateString('tr-TR')}
                </p>
              )}

              {/* Butonlar */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const response = await blogAPI.getOne(blog.id);
                    setSelectedBlog(response.data);
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Oku
                </button>
                
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setShowBlogModal(true);
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteBlog(blog.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Boş Durum */}
        {filteredBlogs.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Arama kriterlerine uygun blog bulunamadı' 
                : 'Henüz blog yazısı yok'}
            </p>
            {isAdmin && !searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowBlogModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                İlk Blog Yazısını Oluştur
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blog Modal */}
      {showBlogModal && (
        <BlogModal
          blog={editingBlog}
          categories={categories.filter(c => c.id !== 'all')}
          onClose={() => {
            setShowBlogModal(false);
            setEditingBlog(null);
          }}
          onSave={async () => {
            await loadBlogs();
            setShowBlogModal(false);
            setEditingBlog(null);
          }}
        />
      )}
    </div>
  );
};

// Blog Modal Component
const BlogModal = ({ blog, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    cover_image: blog?.cover_image || '',
    category: blog?.category || '',
    published: blog?.published || false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Dosya boyutunu kontrol et (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setUploading(true);
      setSelectedFile(file);
      
      const response = await uploadAPI.uploadFile(file);
      // Backend zaten /uploads/filename.jpg döndürüyor, REACT_APP_BACKEND_URL eklemeye gerek yok
      // Çünkü resimler API proxy üzerinden erişilebilir
      const imageUrl = response.data.url;
      
      setFormData({ ...formData, cover_image: imageUrl });
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, cover_image: '' });
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('Başlık ve içerik zorunludur');
      return;
    }

    try {
      setSaving(true);
      if (blog) {
        await blogAPI.update(blog.id, formData);
      } else {
        await blogAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Blog kaydetme hatası:', error);
      alert('Blog kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {blog ? 'Blog Düzenle' : 'Yeni Blog Oluştur'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                placeholder="Blog başlığı..."
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kapak Görseli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kapak Görseli
              </label>
              
              {/* Dosya Yükleme veya URL */}
              <div className="space-y-3">
                {/* Dosya Yükleme Butonu */}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors bg-gray-50 dark:bg-gray-700">
                      <Upload size={20} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploading ? 'Yükleniyor...' : 'Dosya Seç'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  
                  <span className="flex items-center text-gray-500 dark:text-gray-400">veya</span>
                  
                  {/* URL Input */}
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                    placeholder="URL girin..."
                    disabled={uploading}
                  />
                </div>
                
                {/* Önizleme */}
                {formData.cover_image && (
                  <div className="relative">
                    <img 
                      src={formData.cover_image} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Resim+Yüklenemedi';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Maksimum 5MB, JPG/PNG/GIF/WEBP formatları desteklenir
                </p>
              </div>
            </div>

            {/* Özet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Özet (Kısa Açıklama)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                placeholder="Blog özeti..."
              />
            </div>

            {/* İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İçerik *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Blog içeriğini yazın..."
                required
              />
            </div>

            {/* Yayın Durumu */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Yayınla (İşaretlenmezse taslak olarak kaydedilir)
              </label>
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Kaydediliyor...' : (blog ? 'Güncelle' : 'Oluştur')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
