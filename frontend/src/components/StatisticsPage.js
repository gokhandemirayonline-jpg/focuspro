import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Users, CheckCircle, Calendar, GraduationCap,
  DollarSign, Target, Download, RefreshCw, Award
} from 'lucide-react';
import { statsAPI } from '../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const StatisticsPage = ({ user }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [statsData, setStatsData] = useState({
    overview: null,
    tasks: null,
    meetings: null,
    partners: null,
    education: null,
    performance: null
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    loadAllStats();
  }, [timePeriod, selectedUserId]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [overview, tasks, meetings, partners, education, performance] = await Promise.all([
        statsAPI.getOverview(selectedUserId),
        statsAPI.getTasks(timePeriod, selectedUserId),
        statsAPI.getMeetings(timePeriod, selectedUserId),
        statsAPI.getPartners('month', selectedUserId),
        statsAPI.getEducation('month', selectedUserId),
        statsAPI.getPerformance(selectedUserId)
      ]);

      setStatsData({
        overview: overview.data,
        tasks: tasks.data,
        meetings: meetings.data,
        partners: partners.data,
        education: education.data,
        performance: performance.data
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
              ? `${users.find(u => u.id === selectedUserId)?.name || 'Kullanıcı'} - Kişisel performans verileri`
              : isAdmin 
                ? 'Sistem geneli performans ve analiz verileri' 
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
      <div className="mb-6 flex gap-3 flex-wrap">
        {isAdmin && (
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
          >
            <option value="">🌐 Sistem Geneli</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                👤 {u.name} ({u.user_number ? String(u.user_number).padStart(2, '0') : u.id})
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
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('performance')}>
              <div className="flex items-center justify-between mb-2">
                <Award size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.performance.performance_score}%</span>
              </div>
              <h3 className="text-lg font-semibold">Performans Skoru</h3>
              <p className="text-sm opacity-80">{statsData.performance.level || 'Genel Performans'}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('tasks')}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.tasks?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Toplam Görev</h3>
              <p className="text-sm opacity-80">Tamamlanma: {statsData.tasks?.completion_rate || 0}%</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('meetings')}>
              <div className="flex items-center justify-between mb-2">
                <Calendar size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.meetings?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Görüşmeler</h3>
              <p className="text-sm opacity-80">Başarı: {statsData.meetings?.success_rate || 0}%</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('partners')}>
              <div className="flex items-center justify-between mb-2">
                <Users size={32} className="opacity-80" />
                <span className="text-3xl font-bold">{statsData.partners?.total || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Partnerler</h3>
              <p className="text-sm opacity-80">Aktif: {statsData.partners?.active || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('education')}>
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
    </div>
  );
};

// Unused Tab Components (kept for potential future use)
/*
// Performance Tab
const PerformanceTab = ({ data, isAdmin }) => {
  if (!data) return null;

  if (isAdmin) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Sistem Performansı"
          value={`${data.performance_score}%`}
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Toplam Kullanıcı"
          value={data.total_users}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={data.active_users}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Görev Tamamlanma"
          value={`${data.task_completion_rate}%`}
          icon={CheckCircle}
          color="pink"
        />
      </div>
    );
  }

  const breakdownData = data.breakdown ? [
    { name: 'Görevler', value: data.breakdown.tasks, color: COLORS[0] },
    { name: 'Eğitim', value: data.breakdown.education, color: COLORS[1] },
    { name: 'Görüşmeler', value: data.breakdown.meetings, color: COLORS[2] },
    { name: 'Alışkanlıklar', value: data.breakdown.habits, color: COLORS[3] },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Performans Skoru Kartı */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-lg mb-2">Genel Performans Skoru</p>
            <h2 className="text-5xl font-bold">{data.performance_score}</h2>
            <p className="text-white/90 text-xl mt-2">{data.emoji} {data.level}</p>
          </div>
          <Award size={80} className="text-white/30" />
        </div>
      </div>

      {/* Performans Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pasta Grafik */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performans Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Tamamlanan Görev"
            value={`${data.stats?.completed_tasks || 0}/${data.stats?.total_tasks || 0}`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="İzlenen Video"
            value={`${data.stats?.watched_videos || 0}/${data.stats?.total_videos || 0}`}
            icon={GraduationCap}
            color="blue"
          />
          <StatCard
            title="Tamamlanan Görüşme"
            value={`${data.stats?.completed_meetings || 0}/${data.stats?.total_meetings || 0}`}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Başarı Oranı"
            value={`${data.breakdown?.tasks.toFixed(1) || 0}%`}
            icon={Target}
            color="pink"
          />
        </div>
      </div>
    </div>
  );
};

// Tasks Tab
const TasksTab = ({ data, period }) => {
  if (!data) return null;

  const statusData = [
    { name: 'Tamamlanan', value: data.by_status.completed, color: COLORS[3] },
    { name: 'Devam Eden', value: data.by_status.in_progress, color: COLORS[4] },
    { name: 'Bekleyen', value: data.by_status.pending, color: COLORS[5] },
  ];

  const priorityData = [
    { name: 'Yüksek', value: data.by_priority.high, color: COLORS[5] },
    { name: 'Orta', value: data.by_priority.medium, color: COLORS[2] },
    { name: 'Düşük', value: data.by_priority.low, color: COLORS[3] },
  ];

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Görev"
          value={data.total}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Tamamlanan"
          value={data.by_status.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Devam Eden"
          value={data.by_status.in_progress}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Tamamlanma Oranı"
          value={`${data.completion_rate}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Son 7 Gün Trendi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke={COLORS[4]}
                fill={COLORS[4]}
                name="Toplam"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke={COLORS[3]}
                fill={COLORS[3]}
                name="Tamamlanan"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Dağılımı */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Durum Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Öncelik Dağılımı */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Öncelik Dağılımı
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[0]}>
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Meetings Tab
const MeetingsTab = ({ data, period }) => {
  if (!data) return null;

  const typeData = Object.entries(data.by_type || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Görüşme"
          value={data.total}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Tamamlanan"
          value={data.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Başarı Oranı"
          value={`${data.success_rate}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Tür Dağılımı */}
      {typeData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Görüşme Türleri
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// Partners Tab
const PartnersTab = ({ data, isAdmin }) => {
  if (!data) return null;

  const levelData = Object.entries(data.by_level || {}).map(([key, value]) => ({
    name: `Level ${key}`,
    value: value
  }));

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Partner"
          value={data.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Aktif Partner"
          value={data.active}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Yeni Partner"
          value={data.new_partners}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Büyüme Oranı"
          value={`${data.growth_rate}%`}
          icon={Target}
          color="pink"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aylık Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            6 Aylık Büyüme Trendi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke={COLORS[0]}
                strokeWidth={2}
                name="Yeni Partnerler"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Level Dağılımı */}
        {levelData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Level Dağılımı
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {levelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Education Tab
const EducationTab = ({ data, isAdmin }) => {
  if (!data) return null;

  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Admin Özet */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Video"
            value={data.total_videos}
            icon={GraduationCap}
            color="blue"
          />
          <StatCard
            title="Toplam İzlenme"
            value={data.total_views}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Tamamlanma"
            value={data.total_completed}
            icon={CheckCircle}
            color="purple"
          />
          <StatCard
            title="Tamamlanma Oranı"
            value={`${data.completion_rate}%`}
            icon={Target}
            color="pink"
          />
        </div>

        {/* En Çok İzlenen Videolar */}
        {data.top_videos && data.top_videos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              En Çok İzlenen Videolar (Top 10)
            </h3>
            <div className="space-y-3">
              {data.top_videos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-purple-600">#{index + 1}</span>
                    <span className="text-gray-900 dark:text-gray-100">{video.title}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{video.views} izlenme</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kullanıcı Özet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Video"
          value={data.total_videos}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="İzlenen Video"
          value={data.watched_videos}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Toplam İzlenme"
          value={data.total_views}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Tamamlanma Oranı"
          value={`${data.completion_rate}%`}
          icon={Target}
          color="pink"
        />
      </div>

      {/* Kategori İlerlemesi */}
      {data.category_progress && data.category_progress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Kategori Bazlı İlerleme
          </h3>
          <div className="space-y-4">
            {data.category_progress.map((cat, index) => (
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
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
};

export default StatisticsPage;
