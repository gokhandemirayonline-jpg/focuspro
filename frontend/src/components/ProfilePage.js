import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Lock, Globe, Link, Camera, Eye, EyeOff } from 'lucide-react';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

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
  const [tab, setTab] = useState('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const tabs = [
    { key: 'profile',   label: 'Profil',       icon: <User size={14} /> },
    { key: 'social',    label: 'Sosyal Medya',  icon: <Link size={14} /> },
    { key: 'security',  label: 'Güvenlik',      icon: <Lock size={14} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Minimal Header Banner ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Thin gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        <div className="p-6 flex items-center gap-5">
          {/* Avatar + upload */}
          <div className="relative flex-shrink-0 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-purple-100">
              {profileData.profile_photo ? (
                <img src={profileData.profile_photo} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-purple-400" />
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onUpdateProfilePhoto}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{currentUser?.name}</h2>
            {profileData.career_title && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">{profileData.career_title}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-lg">
                ID: {formatUserNumber(currentUser?.user_number)}
              </span>
              {(profileData.email || currentUser?.email) && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Mail size={11} /> {profileData.email || currentUser?.email}
                </span>
              )}
              {(profileData.city || profileData.country) && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} /> {[profileData.city, profileData.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Panel ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors relative ${
                tab === t.key ? 'text-purple-700' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── Profil Sekmesi ── */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Ad Soyad">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className={inputCls + " pl-9"} placeholder="Ad Soyad" />
                  </div>
                </Field>
                <Field label="Kariyer / Unvan">
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={profileData.career_title} onChange={e => setProfileData({...profileData, career_title: e.target.value})} className={inputCls + " pl-9"} placeholder="ör: Network Marketing Uzmanı" />
                  </div>
                </Field>
                <Field label="E-posta">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={profileData.email || currentUser?.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} className={inputCls + " pl-9"} placeholder="ornek@mail.com" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Şifre sıfırlama kodları bu adrese gönderilecek</p>
                </Field>
                <Field label="Telefon">
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className={inputCls + " pl-9"} placeholder="0555 123 45 67" />
                  </div>
                </Field>
                <Field label="Şehir">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} className={inputCls + " pl-9"} placeholder="İstanbul" />
                  </div>
                </Field>
                <Field label="Ülke">
                  <div className="relative">
                    <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} className={inputCls + " pl-9"} placeholder="Türkiye" />
                  </div>
                </Field>
                <Field label="Dil">
                  <select value={profileData.language} onChange={e => setProfileData({...profileData, language: e.target.value})} className={inputCls}>
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="fr">🇫🇷 Français</option>
                  </select>
                </Field>
              </div>
              <div className="pt-2">
                <button onClick={onUpdateProfile} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* ── Sosyal Medya Sekmesi ── */}
          {tab === 'social' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { key: 'linkedin_url',  label: 'LinkedIn',   placeholder: 'linkedin.com/in/kullanici' },
                  { key: 'twitter_url',   label: 'X / Twitter', placeholder: 'x.com/kullanici' },
                  { key: 'instagram_url', label: 'Instagram',   placeholder: 'instagram.com/kullanici' },
                  { key: 'facebook_url',  label: 'Facebook',   placeholder: 'facebook.com/kullanici' },
                ].map(s => (
                  <Field key={s.key} label={s.label}>
                    <div className="relative">
                      <Link size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={profileData[s.key]}
                        onChange={e => setProfileData({...profileData, [s.key]: e.target.value})}
                        className={inputCls + " pl-9"}
                        placeholder={s.placeholder}
                      />
                    </div>
                  </Field>
                ))}
              </div>
              <div className="pt-2">
                <button onClick={onUpdateProfile} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* ── Güvenlik Sekmesi ── */}
          {tab === 'security' && (
            <div className="space-y-5 max-w-sm">
              <Field label="Mevcut Şifre">
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                    className={inputCls + " pl-9 pr-10"}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <Field label="Yeni Şifre">
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                    className={inputCls + " pl-9 pr-10"}
                    placeholder="En az 6 karakter"
                  />
                  <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <Field label="Yeni Şifre Tekrar">
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className={`${inputCls} pl-9 ${
                      passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password
                        ? 'border-red-300 focus:ring-red-400'
                        : ''
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                )}
              </Field>
              <div className="pt-2">
                <button
                  onClick={onChangePassword}
                  disabled={!passwordData.current_password || !passwordData.new_password || passwordData.new_password !== passwordData.confirm_password}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Şifreyi Güncelle
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
