import React from 'react';
import { Calendar, Users, ListChecks, CheckCircle2 } from 'lucide-react';

const DashboardPage = ({ 
  stats, 
  dailyHabits, 
  tasks, 
  meetings, 
  onUpdateHabit,
  onNavigate 
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Toplam Görev</p>
              <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">{stats.totalTasks}</p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ListChecks className="text-purple-600" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Bugünkü Görüşmeler</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.todayMeetings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Aktif Partnerler</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activePartners}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Habits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Günlük Alışkanlıklar</h3>
        <div className="space-y-4">
          {dailyHabits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{habit.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(habit.completed / habit.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{habit.completed}/{habit.target}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onUpdateHabit(habit.id, Math.max(0, habit.completed - 1))}
                  className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateHabit(habit.id, habit.completed + 1)}
                  className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {dailyHabits.length === 0 && (
            <p className="text-gray-500 text-center py-8">Henüz alışkanlık eklenmemiş</p>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Son Görevler</h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-purple-600 text-sm hover:underline"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'done' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status === 'done' ? 'Tamamlandı' :
                   task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">Henüz görev yok</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Yaklaşan Görüşmeler</h3>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-purple-600 text-sm hover:underline"
            >
              Takvim
            </button>
          </div>
          <div className="space-y-3">
            {meetings.slice(0, 5).map(meeting => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{meeting.title}</p>
                  <p className="text-sm text-gray-500">{meeting.date} {meeting.start_time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                  meeting.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {meeting.status === 'completed' ? 'Tamamlandı' :
                   meeting.status === 'cancelled' ? 'İptal' : 'Planlandı'}
                </span>
              </div>
            ))}
            {meetings.length === 0 && (
              <p className="text-gray-500 text-center py-8">Henüz görüşme yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
