import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Users, CheckCircle, Calendar, GraduationCap,
  DollarSign, Target, Download, RefreshCw, Award, BarChart3
} from 'lucide-react';
import { statsAPI, partnerAPI } from '../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const StatisticsPage = ({ user, preSelectUserId, onClearPreselect }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(preSelectUserId || null);
  const [users, setUsers] = useState([]);
  const [myPartners, setMyPartners] = useState([]); // normal user'in partnerleri
  const [viewMode, setViewMode] = useState('self'); // 'self' | user_id | partner:<partner_id>

  // Dışarıdan preselect gelirse uygula
  useEffect(() => {
    if (preSelectUserId) {
      setSelectedUserId(preSelectUserId);
      if (onClearPreselect) onClearPreselect();
    }
  }, [preSelectUserId]);
  const [statsData, setStatsData] = useState({
    overview: null,
    tasks: null,
    meetings: null,
    partners: null,
    education: null,
    performance: null,
    habits: null
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canSeeOtherUsers = isAdmin || isManager;

  useEffect(() => {
    if (canSeeOtherUsers) {
      loadUsers();
    } else {
      // Normal kullanıcı - kendi partnerlerini yükle
      loadMyPartners();
    }
    loadAllStats();
  }, [timePeriod, selectedUserId]);

  const loadMyPartners = async () => {
    try {
      const res = await partnerAPI.getAll();
      setMyPartners(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Partnerler yüklenemedi:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const loadAllStats = async () => {
    try {
      setLoading(true);
      // selectedUserId bir partnerden geliyorsa istatistikleri o partner sahibinin gözünden yükle
      const effectiveUserId = selectedUserId && selectedUserId.startsWith('partner:')
        ? null  // partner'in kendi istatistikleri yok - placeholder gösterilecek
        : selectedUserId;

      const [overview, tasks, meetings, partners, education, performance, habits] = await Promise.all([
        statsAPI.getOverview(effectiveUserId),
        statsAPI.getTasks(timePeriod, effectiveUserId),
        statsAPI.getMeetings(timePeriod, effectiveUserId),
        statsAPI.getPartners('month', effectiveUserId),
        statsAPI.getEducation('month', effectiveUserId),
        statsAPI.getPerformance(effectiveUserId),
        statsAPI.getHabits()
      ]);

      setStatsData({
        overview: overview.data,
        tasks: tasks.data,
        meetings: meetings.data,
        partners: partners.data,
        education: education.data,
        performance: performance.data,
        habits: habits.data
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('PDF export özelliği yakında eklenecek!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            İstatistikler & Analitik
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {selectedUserId
              ? (() => {
                  const foundUser = users.find(u => u.id === selectedUserId);
                  const foundPartner = myPartners.find(p => p.id === selectedUserId);
                  const name = foundUser?.name || foundPartner?.name || 'Kullanıcı';
                  return `${name} - Kişisel performans verileri`;
                })()
              : isAdmin
                ? 'Sistem geneli performans ve analiz verileri'
                : isManager
                  ? 'Ekibinizdeki kullanıcıların performans verileri'
                  : myPartners.length > 0
                    ? 'Kendi verileriniz veya partnerinizi seçin'
                    : 'Kişisel performans ve analiz verileri'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAllStats}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Yenile
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <Download size={20} />
            PDF İndir
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        {/* Admin & Manager: tüm kullanıcıları göster */}
        {canSeeOtherUsers && users.length > 0 && (
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
          >
            {isAdmin && <option value="">🌐 Sistem Geneli</option>}
            {isManager && <option value="">👤 Kendi Verilerim</option>}
            {users.map(u => (
              <option key={u.id} value={u.id}>
                👤 {u.name} ({u.user_number ? String(u.user_number) : u.id.slice(0,6)})
              </option>
            ))}
          </select>
        )}

        {/* Normal kullanıcı: partnerleri göster */}
        {!canSeeOtherUsers && myPartners.length > 0 && (
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="px-4 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
          >
            <option value="">👤 Kendi Verilerim</option>
            {myPartners.map(p => (
              <option key={p.id} value={p.id}>
                🤝 {p.name} ({p.rank || 'Partner'})
              </option>
            ))}
          </select>
        )}
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
        >
          <option value="today">Bugün</option>
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
          <option value="year">Bu Yıl</option>
        </select>
      </div>

      {/* Grid Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.performance && (
          <>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Award size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.performance.performance_score}%</span>
              </div>
              <h3 className="text-lg font-semibold">Performans Skoru</h3>
              <p className="text-sm opacity-80">{statsData.performance.level || 'Genel Performans'}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.tasks?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Toplam Görev</h3>
              <p className="text-sm opacity-80">Tamamlanma: {statsData.tasks?.completion_rate || 0}%</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.meetings?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Görüşmeler</h3>
              <p className="text-sm opacity-80">Başarı: {statsData.meetings?.success_rate || 0}%</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Users size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.partners?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Partnerler</h3>
              <p className="text-sm opacity-80">Aktif: {statsData.partners?.active || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.education?.watched_videos || 0}/{statsData.education?.total_videos || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Eğitim</h3>
              <p className="text-sm opacity-80">Tamamlanma: {statsData.education?.completion_rate || 0}%</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.tasks?.by_status?.completed || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Tamamlanan</h3>
              <p className="text-sm opacity-80">Bu dönem</p>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Target size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.partners?.new_partners || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Yeni Partner</h3>
              <p className="text-sm opacity-80">Bu dönem</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.education?.total_views || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Toplam İzlenme</h3>
              <p className="text-sm opacity-80">Video izlenmeleri</p>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Chart */}
        {statsData.performance && !statsData.performance.is_admin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Performans Dağılımı</h3>
            {statsData.performance.breakdown && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Görevler', value: statsData.performance.breakdown.tasks, color: COLORS[0] },
                      { name: 'Eğitim', value: statsData.performance.breakdown.education, color: COLORS[1] },
                      { name: 'Görüşmeler', value: statsData.performance.breakdown.meetings, color: COLORS[2] },
                      { name: 'Alışkanlıklar', value: statsData.performance.breakdown.habits, color: COLORS[3] },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Task Trend Chart */}
        {statsData.tasks && statsData.tasks.daily_trend && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Görev Trendi (7 Gün)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.tasks.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke={COLORS[4]} strokeWidth={2} name="Toplam" />
                <Line type="monotone" dataKey="completed" stroke={COLORS[3]} strokeWidth={2} name="Tamamlanan" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Partner Growth Chart */}
        {statsData.partners && statsData.partners.monthly_trend && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Partner Büyüme Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={statsData.partners.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="count" stroke={COLORS[0]} fill={COLORS[0]} name="Yeni Partnerler" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Task Status Distribution */}
        {statsData.tasks && statsData.tasks.by_status && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Görev Durum Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Tamamlanan', value: statsData.tasks.by_status.completed, color: COLORS[3] },
                { name: 'Devam Eden', value: statsData.tasks.by_status.in_progress, color: COLORS[4] },
                { name: 'Bekleyen', value: statsData.tasks.by_status.pending, color: COLORS[5] },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]}>
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Education Progress */}
      {statsData.education && statsData.education.category_progress && statsData.education.category_progress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Kategori Bazlı Eğitim İlerlemesi</h3>
          <div className="space-y-4">
            {statsData.education.category_progress.map((cat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{cat.category}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {cat.watched}/{cat.total} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit Statistics */}
      {statsData.habits && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Alışkanlık İstatistikleri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Günlük oran */}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bugün Tamamlama Oranı</span>
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statsData.habits.daily_rate || 0}%
              </div>
            </div>

            {/* Aylık oran */}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay Ortalama</span>
                <TrendingUp size={18} className="text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statsData.habits.monthly_rate || 0}%
              </div>
            </div>

            {/* Bugün tamamlanan */}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bugün Tamamlanan</span>
                <Calendar size={18} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statsData.habits.today_completed || 0}/{statsData.habits.total_habits || 0}
              </div>
            </div>

            {/* Bu ay toplam */}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay Toplam</span>
                <BarChart3 size={18} className="text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statsData.habits.month_completed || 0}/{statsData.habits.month_total || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Takip edilen gün sayısı: {statsData.habits.days_tracked || 0}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StatisticsPage;
