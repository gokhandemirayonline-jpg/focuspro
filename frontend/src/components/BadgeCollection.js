import React, { useState, useEffect } from 'react';
import { Award, Lock, Calendar } from 'lucide-react';
import { userAPI } from '../services/api';

const BadgeCollection = ({ currentUser }) => {
  const [badgeCollection, setBadgeCollection] = useState({
    earned_badges: [],
    not_earned_badges: [],
    total_earned: 0,
    total_badges: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadgeCollection();
  }, []);

  const loadBadgeCollection = async () => {
    try {
      const response = await userAPI.getBadgeCollection();
      setBadgeCollection(response.data);
    } catch (error) {
      console.error('Rozetler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Rozet Koleksiyonum</h1>
        <p className="text-gray-600">
          {badgeCollection.total_earned} / {badgeCollection.total_badges} rozet kazandınız
        </p>
        <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-500"
            style={{ 
              width: `${(badgeCollection.total_earned / badgeCollection.total_badges) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Kazanılan Rozetler */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Kazandığım Rozetler ({badgeCollection.total_earned})
        </h2>
        {badgeCollection.earned_badges.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Award className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Henüz hiç rozet kazanmadınız.</p>
            <p className="text-gray-400 text-sm mt-2">İlk rozetinizi kazanmak için video izleyin veya hedef tamamlayın!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badgeCollection.earned_badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">{badge.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(badge.earned_at)}</span>
                  </div>
                  
                  {badge.note && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="text-xs text-gray-600 italic">{badge.note}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                    ✓ Kazanıldı
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kazanılmamış Rozetler */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Lock className="text-gray-400" />
          Henüz Kazanılmamış Rozetler ({badgeCollection.not_earned_badges.length})
        </h2>
        {badgeCollection.not_earned_badges.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
            <Award className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <p className="text-xl font-bold text-gray-800 mb-2">🎉 Tebrikler!</p>
            <p className="text-gray-600">Tüm rozetleri topladınız!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badgeCollection.not_earned_badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 opacity-75 hover:opacity-100 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="relative">
                    <div className="text-6xl mb-4 grayscale">{badge.icon}</div>
                    <Lock className="absolute top-0 right-1/4 h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">{badge.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{badge.description}</p>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 font-medium mb-1">Nasıl Kazanılır?</p>
                    <p className="text-xs text-blue-600">{badge.criteria}</p>
                  </div>
                  
                  <div className="mt-4 px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                    🔒 Kilitli
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCollection;
