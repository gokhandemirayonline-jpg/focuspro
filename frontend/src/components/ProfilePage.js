import React, { useState } from 'react';
import { User } from 'lucide-react';

const ProfilePage = ({ 
  currentUser, 
  profileData, 
  setProfileData,
  passwordData,
  setPasswordData,
  onUpdateProfile,
  onUpdateProfilePhoto,
  onChangePassword,
  uploadingImage,
  formatUserNumber
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState('personal');

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Profilim</h2>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
              {profileData.profile_photo ? (
                <img 
                  src={profileData.profile_photo} 
                  alt="Profil Fotoğrafı" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-purple-600" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onUpdateProfilePhoto}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{currentUser?.name}</h3>
            <p className="text-purple-600 font-medium">ID: {formatUserNumber(currentUser?.user_number)}</p>
            {profileData.career_title && (
              <p className="text-gray-600 mt-1">{profileData.career_title}</p>
            )}
            
            <div className="mt-4 space-y-1">
              <p className="text-sm text-gray-600">📧 {currentUser?.email}</p>
              {profileData.phone && (
                <p className="text-sm text-gray-600">📱 {profileData.phone}</p>
              )}
              {(profileData.city || profileData.country) && (
                <p className="text-sm text-gray-600">📍 {[profileData.city, profileData.country].filter(Boolean).join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {[
            { key: 'personal', label: 'Kişisel Bilgiler', icon: '👤' },
            { key: 'contact', label: 'İletişim', icon: '📞' },
            { key: 'social', label: 'Sosyal Medya', icon: '🔗' },
            { key: 'security', label: 'Güvenlik', icon: '🔒' },
            { key: 'preferences', label: 'Tercihler', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveProfileTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeProfileTab === tab.key 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeProfileTab === 'personal' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kariyer/Unvan</label>
                <input
                  type="text"
                  value={profileData.career_title}
                  onChange={(e) => setProfileData({...profileData, career_title: e.target.value})}
                  placeholder="ör: Network Marketing Uzmanı"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              onClick={onUpdateProfile}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Kaydet
            </button>
          </div>
        )}

        {activeProfileTab === 'contact' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">İletişim Bilgileri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="0555 123 45 67"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  placeholder="İstanbul"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ülke</label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  placeholder="Türkiye"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              onClick={onUpdateProfile}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Kaydet
            </button>
          </div>
        )}

        {activeProfileTab === 'social' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Sosyal Medya Bağlantıları</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={profileData.linkedin_url}
                  onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  value={profileData.twitter_url}
                  onChange={(e) => setProfileData({...profileData, twitter_url: e.target.value})}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  value={profileData.instagram_url}
                  onChange={(e) => setProfileData({...profileData, instagram_url: e.target.value})}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  value={profileData.facebook_url}
                  onChange={(e) => setProfileData({...profileData, facebook_url: e.target.value})}
                  placeholder="https://facebook.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              onClick={onUpdateProfile}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Kaydet
            </button>
          </div>
        )}

        {activeProfileTab === 'security' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Şifre Değiştir</h4>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              onClick={onChangePassword}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Şifreyi Değiştir
            </button>
          </div>
        )}

        {activeProfileTab === 'preferences' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tercihler</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
              <select
                value={profileData.language}
                onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <button
              onClick={onUpdateProfile}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
