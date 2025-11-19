import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  TrendingUp,
} from 'lucide-react';
import { habitAPI } from '../services/api';

const HabitsPage = ({ user }) => {
  // State
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [stats, setStats] = useState({
    daily_rate: 0,
    monthly_rate: 0,
    total_habits: 0,
    today_completed: 0,
  });
  const [calendar, setCalendar] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modal states
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitForm, setHabitForm] = useState({
    title: '',
    description: '',
    frequency: 'daily',
  });

  const isAdmin = user?.role === 'admin';

  // Load data
  useEffect(() => {
    loadHabits();
    loadTodayCompletions();
    loadStats();
    loadCalendar();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await habitAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadTodayCompletions = async () => {
    try {
      const response = await habitAPI.getTodayCompletions();
      setCompletedToday(response.data.completed_habit_ids || []);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await habitAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCalendar = async (month = currentMonth) => {
    try {
      const response = await habitAPI.getCalendar(month.getFullYear(), month.getMonth() + 1);
      setCalendar(response.data.days || []);
      // Load details for selected date if in this month
      loadDateDetails(selectedDate);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const loadDateDetails = async (date) => {
    try {
      // Get completions for specific date
      const response = await habitAPI.getCalendar(
        new Date(date).getFullYear(),
        new Date(date).getMonth() + 1
      );
      const dayData = response.data.days.find(d => d.date === date);
      
      if (dayData) {
        // Get habits completed on this date
        const allHabits = habits;
        const completionsResponse = await habitAPI.getTodayCompletions();
        
        // For selected date, we need to check which habits were completed
        // This is a simplified version - you might want to add a specific endpoint
        setSelectedDateDetails({
          date: date,
          total: dayData.total,
          completed: dayData.completed,
          rate: dayData.rate,
        });
      }
    } catch (error) {
      console.error('Error loading date details:', error);
    }
  };

  // Habit CRUD (Admin only)
  const handleAddHabit = async () => {
    try {
      await habitAPI.create(habitForm);
      loadHabits();
      loadStats();
      setShowHabitModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Alışkanlık eklenirken hata oluştu');
    }
  };

  const handleUpdateHabit = async () => {
    try {
      await habitAPI.update(editingHabit.id, habitForm);
      loadHabits();
      setShowHabitModal(false);
      setEditingHabit(null);
      resetForm();
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Alışkanlık güncellenirken hata oluştu');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Bu alışkanlığı silmek istediğinize emin misiniz?')) return;
    try {
      await habitAPI.delete(id);
      loadHabits();
      loadStats();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Alışkanlık silinirken hata oluştu');
    }
  };

  const handleEditClick = (habit) => {
    setEditingHabit(habit);
    setHabitForm({
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
    });
    setShowHabitModal(true);
  };

  const resetForm = () => {
    setHabitForm({
      title: '',
      description: '',
      frequency: 'daily',
    });
  };

  // Completion toggle
  const handleToggleCompletion = async (habitId) => {
    const isCompleted = completedToday.includes(habitId);
    
    try {
      if (isCompleted) {
        await habitAPI.uncomplete(habitId);
      } else {
        await habitAPI.complete(habitId);
      }
      loadTodayCompletions();
      loadStats();
      loadCalendar();
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  // Get color for calendar day
  const getColorForRate = (rate) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (rate < 25) return 'bg-green-100 dark:bg-green-900/30';
    if (rate < 50) return 'bg-green-200 dark:bg-green-800/50';
    if (rate < 75) return 'bg-green-300 dark:bg-green-700/70';
    return 'bg-green-500 dark:bg-green-600';
  };

  return (
    <div className="mt-4">
      {/* Header with Add Button (Admin only) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Günlük Alışkanlıklar
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Her gün tamamladığın alışkanlıkları işaretle
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingHabit(null);
              resetForm();
              setShowHabitModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Yeni Alışkanlık
          </button>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Habits List (40%) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Bugünkü Alışkanlıklar
            </h3>
            
            {habits.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {isAdmin ? 'Henüz alışkanlık eklenmemiş' : 'Admin henüz alışkanlık eklememiş'}
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const isCompleted = completedToday.includes(habit.id);
                  
                  return (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleCompletion(habit.id)}
                          className="flex-shrink-0 mt-1"
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              size={24}
                              className="text-green-600 dark:text-green-400"
                            />
                          ) : (
                            <Circle
                              size={24}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                            />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold ${
                              isCompleted
                                ? 'text-green-800 dark:text-green-300 line-through'
                                : 'text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            {habit.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {habit.description}
                          </p>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEditClick(habit)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Calendar (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} />
              <h3 className="text-xl font-bold">Başarı İstatistikleri</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.daily_rate}%</div>
                <div className="text-sm opacity-90">Günlük Başarı Oranı</div>
                <div className="text-xs opacity-75 mt-1">
                  {stats.today_completed}/{stats.total_habits} tamamlandı
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.monthly_rate}%</div>
                <div className="text-sm opacity-90">Aylık Başarı Oranı</div>
                <div className="text-xs opacity-75 mt-1">
                  {stats.month_completed}/{stats.month_total} tamamlandı
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Aylık Takvim
            </h3>
            
            {calendar.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Takvim yükleniyor...
              </div>
            ) : (
              <div>
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                    <div
                      key={day}
                      className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendar.map((day) => {
                    const date = new Date(day.date);
                    const dayOfWeek = date.getDay();
                    const dayOfMonth = date.getDate();
                    const isToday =
                      day.date === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-110 cursor-pointer ${getColorForRate(
                          day.rate
                        )} ${
                          isToday
                            ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                            : ''
                        }`}
                        title={`${day.date}: ${day.completed}/${day.total} (${day.rate}%)`}
                      >
                        <span
                          className={`${
                            day.rate > 0
                              ? 'text-gray-800 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {dayOfMonth}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Az</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
                    <div className="w-4 h-4 bg-green-200 dark:bg-green-800/50 rounded"></div>
                    <div className="w-4 h-4 bg-green-300 dark:bg-green-700/70 rounded"></div>
                    <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded"></div>
                  </div>
                  <span>Çok</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Habit Modal (Admin Only) */}
      {showHabitModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingHabit ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowHabitModal(false);
                    setEditingHabit(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alışkanlık Adı *
                  </label>
                  <input
                    type="text"
                    value={habitForm.title}
                    onChange={(e) =>
                      setHabitForm({ ...habitForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Örn: Sabah Sporu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={habitForm.description}
                    onChange={(e) =>
                      setHabitForm({ ...habitForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Örn: Her sabah 30dk koşu veya yürüyüş"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sıklık
                  </label>
                  <select
                    value={habitForm.frequency}
                    onChange={(e) =>
                      setHabitForm({ ...habitForm, frequency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowHabitModal(false);
                    setEditingHabit(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
                <button
                  onClick={editingHabit ? handleUpdateHabit : handleAddHabit}
                  disabled={!habitForm.title || !habitForm.description}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingHabit ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
