import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { habitAPI } from '../services/api';

const HabitsPage = ({ user }) => {
  // State
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [completedSelectedDate, setCompletedSelectedDate] = useState([]); // Seçilen günün tamamlanmaları
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
  const [monthlyStats, setMonthlyStats] = useState({
    monthly_rate: 0,
    month_completed: 0,
    month_total: 0,
  });
  
  // Refs for date tracking (to avoid closure issues)
  const initialLoadDateRef = useRef(new Date().toISOString().split('T')[0]);
  
  // Modal states
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitForm, setHabitForm] = useState({
    title: '',
    description: '',
    frequency: 'daily',
  });

  const isAdmin = user?.role === 'admin';

  // Get local date (not UTC)
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get yesterday's date
  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load data
  useEffect(() => {
    const initializeData = async () => {
      const today = getLocalDateString();
      setSelectedDate(today);
      
      await loadHabits();
      await loadTodayCompletions();
      await loadStats();
      await loadCalendar();
      
      // Load today's details after calendar is loaded
      setTimeout(() => {
        loadDateDetails(today);
      }, 500);
    };
    
    initializeData();

    // Check for date change every minute  
    const dateCheckInterval = setInterval(() => {
      const currentDate = getLocalDateString();
      const initialDate = initialLoadDateRef.current;
      
      // Sadece gerçek tarih değişikliğinde (gece yarısı geçti) güncelle
      if (currentDate !== initialDate) {
        console.log('Date changed! Updating to new day:', currentDate);
        initialLoadDateRef.current = currentDate;
        setSelectedDate(currentDate);
        setCurrentMonth(new Date());
        loadCalendar(new Date());
        loadDateDetails(currentDate);
        loadTodayCompletions();
        loadStats();
      }
    }, 60000); // Check every minute

    // Also check when window gets focus (user comes back to tab)
    const handleFocus = () => {
      const currentDate = getLocalDateString();
      const initialDate = initialLoadDateRef.current;
      
      // Sadece gerçek tarih değişikliğinde (gece yarısı geçti) güncelle
      if (currentDate !== initialDate) {
        console.log('Window focused - actual date changed! Updating to:', currentDate);
        initialLoadDateRef.current = currentDate;
        setSelectedDate(currentDate);
        setCurrentMonth(new Date());
        loadCalendar(new Date());
        loadDateDetails(currentDate);
        loadTodayCompletions();
        loadStats();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(dateCheckInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Boş array - sadece component mount'ta çalışsın

  // Seçilen güne göre tamamlanmaları yükle
  useEffect(() => {
    const loadSelectedDateCompletions = async () => {
      if (selectedDate && habits.length > 0) {
        try {
          const response = await habitAPI.getDateCompletions(selectedDate);
          const completedIds = response.data.completed_habit_ids || [];
          setCompletedSelectedDate(completedIds);
        } catch (error) {
          console.error('Error loading selected date completions:', error);
        }
      }
    };
    
    loadSelectedDateCompletions();
  }, [selectedDate, habits]);

  async function loadHabits() {
    try {
      const response = await habitAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }

  async function loadTodayCompletions() {
    try {
      const today = getLocalDateString();
      const response = await habitAPI.getDateCompletions(today);
      setCompletedToday(response.data.completed_habit_ids || []);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  }

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
      const calendarDays = response.data.days || [];
      setCalendar(calendarDays);
      
      // Calculate monthly stats from calendar data
      const totalPossible = calendarDays.reduce((sum, day) => sum + day.total, 0);
      const totalCompleted = calendarDays.reduce((sum, day) => sum + day.completed, 0);
      const monthRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      
      setMonthlyStats({
        monthly_rate: monthRate,
        month_completed: totalCompleted,
        month_total: totalPossible,
      });
      
      // Load details for selected date if in this month
      const selectedDateInMonth = calendarDays.find(d => d.date === selectedDate);
      if (selectedDateInMonth) {
        loadDateDetails(selectedDate);
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const loadDateDetails = async (date) => {
    try {
      // Get calendar data for the day
      const calendarResponse = await habitAPI.getCalendar(
        new Date(date).getFullYear(),
        new Date(date).getMonth() + 1
      );
      const dayData = calendarResponse.data.days.find(d => d.date === date);
      
      if (dayData) {
        // Get which habits were completed on this specific date
        const completionsResponse = await habitAPI.getDateCompletions(date);
        const completedHabitIds = completionsResponse.data.completed_habit_ids || [];
        
        // Seçilen günün tamamlanmalarını state'e kaydet
        setCompletedSelectedDate(completedHabitIds);
        
        // Build detailed view with habit names
        const completedHabits = habits.filter(h => completedHabitIds.includes(h.id));
        const notCompletedHabits = habits.filter(h => !completedHabitIds.includes(h.id));
        
        setSelectedDateDetails({
          date: date,
          total: dayData.total,
          completed: dayData.completed,
          rate: dayData.rate,
          completedHabits: completedHabits,
          notCompletedHabits: notCompletedHabits,
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
    const todayStr = getLocalDateString();
    const isToday = selectedDate === todayStr;
    
    // Bugün için completedToday, dün için completedSelectedDate kullan
    const isCompleted = isToday 
      ? completedToday.includes(habitId)
      : completedSelectedDate.includes(habitId);
    
    try {
      if (isCompleted) {
        // Tamamlanmayı iptal et (belirli bir tarih için)
        await habitAPI.uncompleteForDate(habitId, selectedDate);
      } else {
        // Tamamla (belirli bir tarih için)
        await habitAPI.completeForDate(habitId, selectedDate);
      }
      
      // Reload all data for real-time updates
      await Promise.all([
        loadTodayCompletions(),
        loadStats(),
        loadCalendar(),
        loadDateDetails(selectedDate), // Seçilen günü yeniden yükle
      ]);
      
      // Seçilen günün tamamlanmalarını tekrar yükle
      const response = await habitAPI.getDateCompletions(selectedDate);
      const completedIds = response.data.completed_habit_ids || [];
      setCompletedSelectedDate(completedIds);
      
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Alışkanlık güncellenirken hata oluştu');
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

  // Month navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    loadCalendar(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    loadCalendar(newMonth);
  };

  const handleDayClick = async (date) => {
    // State'i senkron olarak güncelle
    flushSync(() => {
      setSelectedDate(date);
    });
    
    // Seçilen günün tamamlanmalarını hemen yükle
    try {
      const response = await habitAPI.getDateCompletions(date);
      const completedIds = response.data.completed_habit_ids || [];
      
      flushSync(() => {
        setCompletedSelectedDate(completedIds);
      });
    } catch (error) {
      console.error('Error loading completions in handleDayClick:', error);
    }
    
    loadDateDetails(date);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    const today = getLocalDateString();
    setSelectedDate(today);
    loadCalendar(now);
    loadDateDetails(today);
  };

  const formatMonthYear = (date) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateDetail = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${days[date.getDay()]}`;
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                📋 {selectedDate === getLocalDateString() ? 'Bugünkü Alışkanlıklar' : `${formatDateDetail(selectedDate)} - Alışkanlıklar`}
              </h3>
              {new Date(selectedDate) < new Date(getLocalDateString()) && (
                <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  Geçmiş Gün
                </span>
              )}
            </div>
            
            {habits.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {isAdmin ? 'Henüz alışkanlık eklenmemiş' : 'Admin henüz alışkanlık eklememiş'}
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const todayStr = getLocalDateString();
                  const yesterdayStr = getYesterdayString();
                  const isToday = selectedDate === todayStr;
                  const isYesterday = selectedDate === yesterdayStr;
                  
                  // Seçilen gün bugünse completedToday, değilse completedSelectedDate kullan
                  const isCompleted = isToday 
                    ? completedToday.includes(habit.id)
                    : completedSelectedDate.includes(habit.id);
                    
                  const isPastDay = new Date(selectedDate) < new Date(todayStr);
                  // Bugün veya dün düzenlenebilir, diğer günler sadece görüntüleme
                  const isDisabled = !(isToday || isYesterday);
                  
                  return (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      } ${isDisabled ? 'opacity-75' : 'hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md'}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => !isDisabled && handleToggleCompletion(habit.id)}
                          disabled={isDisabled}
                          className={`flex-shrink-0 mt-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              size={24}
                              className={`text-green-600 dark:text-green-400 ${isDisabled ? 'opacity-60' : ''}`}
                            />
                          ) : (
                            <Circle
                              size={24}
                              className={`text-gray-400 dark:text-gray-500 ${
                                !isDisabled && 'hover:text-gray-600 dark:hover:text-gray-400'
                              }`}
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

                        {/* Admin Actions - Only show for today */}
                        {isAdmin && isToday && (
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

        {/* Right Column - Unified Stats & Calendar (60%) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            {/* Stats Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Başarı İstatistikleri
                  </h3>
                </div>
                <button
                  onClick={goToToday}
                  className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Bugüne Git
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {selectedDateDetails?.rate || 0}%
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-300 mt-1">
                    Seçili Gün Başarısı
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {selectedDateDetails ? 
                      `${selectedDateDetails.completed}/${selectedDateDetails.total} tamamlandı` :
                      'Bir gün seçin'
                    }
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {monthlyStats.monthly_rate}%
                  </div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-300 mt-1">
                    {formatMonthYear(currentMonth)} Başarısı
                  </div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    {monthlyStats.month_completed}/{monthlyStats.month_total} tamamlandı
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-xl">◀</span>
              </button>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {formatMonthYear(currentMonth)}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-xl">▶</span>
              </button>
            </div>
            
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
                    const dayOfMonth = date.getDate();
                    const todayStr = getLocalDateString();
                    const isToday = day.date === todayStr;
                    const isSelected = day.date === selectedDate;
                    const isFuture = new Date(day.date) > new Date(todayStr);
                    const isPastDay = new Date(day.date) < new Date(todayStr);

                    return (
                      <button
                        type="button"
                        key={day.date}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day.date);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-110 cursor-pointer relative group ${getColorForRate(
                          day.rate
                        )} ${
                          isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                        } ${
                          isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400 ring-offset-2' : ''
                        } ${
                          isFuture ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span
                            className={`text-base font-semibold ${
                              day.rate > 0
                                ? 'text-gray-800 dark:text-gray-100'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {dayOfMonth}
                          </span>
                          
                          {/* Yüzde Badge - Sadece geçmiş günler için */}
                          {!isFuture && isPastDay && (
                            <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                              day.rate === 100 
                                ? 'bg-green-600 text-white' 
                                : day.rate > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {day.rate}%
                            </span>
                          )}
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          <div className="font-semibold">{day.date}</div>
                          <div className="mt-1">
                            {day.completed}/{day.total} tamamlandı
                          </div>
                          <div className="font-bold text-green-400">
                            {day.rate}%
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        </div>
                      </button>
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

            {/* Selected Date Details - Below Calendar */}
            {selectedDateDetails && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    📅 {formatDateDetail(selectedDate)}
                  </h4>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedDateDetails.rate}%
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tamamlanan Alışkanlıklar:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {selectedDateDetails.completed}/{selectedDateDetails.total}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${selectedDateDetails.rate}%` }}
                    ></div>
                  </div>

                  {selectedDateDetails.rate === 100 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm mt-2">
                      <CheckCircle2 size={16} />
                      <span>Tüm alışkanlıklar tamamlandı! 🎉</span>
                    </div>
                  )}

                  {/* Completed Habits List */}
                  {selectedDateDetails.completedHabits && selectedDateDetails.completedHabits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                        ✅ Tamamlanan ({selectedDateDetails.completedHabits.length}):
                      </div>
                      <div className="space-y-1">
                        {selectedDateDetails.completedHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                            <span>{habit.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Not Completed Habits List */}
                  {selectedDateDetails.notCompletedHabits && selectedDateDetails.notCompletedHabits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        ⭕ Tamamlanmayan ({selectedDateDetails.notCompletedHabits.length}):
                      </div>
                      <div className="space-y-1">
                        {selectedDateDetails.notCompletedHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
                          >
                            <Circle size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{habit.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
