import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, GraduationCap, User, Play, Lock, Check, Shield, Plus, Trash2, Target, ListChecks, MessageSquare, BarChart3, LogOut, Eye, EyeOff, TrendingUp, Clock, CheckCircle2, Menu, X, Edit, ChevronLeft, ChevronRight, CalendarDays, UserPlus, Bell, Search, Book, Film, Bookmark, FileText, Mail, Send, Download, Activity, Award, MapPin, Share2, Star } from 'lucide-react';

// Rol sabitleri
const ROLE_CONFIG = {
  admin:   { label: 'Admin',            color: 'bg-purple-100 text-purple-700', level: 3 },
  manager: { label: 'Yönetici',         color: 'bg-amber-100 text-amber-700',   level: 2 },
  user:    { label: 'Normal Kullanıcı',  color: 'bg-gray-100 text-gray-600',     level: 1 },
};
const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG['user'];
const isAdminOrManager = (user) => {
  if (typeof user === 'string') return user === 'admin' || user === 'manager'; // fallback if role string is passed
  return user?.role === 'admin' || (user?.permissions && user.permissions.includes('users_manage'));
};
import { authAPI, userAPI, adminAPI, videoCategoryAPI, videoAPI, progressAPI, meetingAPI, taskAPI, goalAPI, reasonAPI, prospectCategoryAPI, prospectAPI, partnerAPI, habitAPI, eventAPI, eventRegistrationAPI, notificationAPI, recommendationAPI, blogAPI, searchAPI, fileAPI, messageAPI, statisticsAPI, activityLogAPI, learningPathAPI, badgeAPI, characterAnalysisAPI, futureCharacterAPI, fullLifeProfileAPI, dreamPriorityAPI } from './services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import BadgeCollection from './components/BadgeCollection';
import FullLifeProfileForm from './components/FullLifeProfileForm';
import ProspectsPage from './components/ProspectsPage';
import HabitsPage from './components/HabitsPage';
import DreamsPage from './components/DreamsPage';
import VideoLibraryPage from './components/VideoLibraryPage';
import StatisticsPage from './components/StatisticsPage';
import BlogPage from './components/BlogPage';
import AdminVideoManagement from './components/AdminVideoManagement';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './App.css';

moment.locale('tr');
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(BigCalendar);

const FocusProApp = () => {
  // Helper function to format user number to 2 digits (01, 02, 03...)
  const formatUserNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toString().padStart(2, '0');
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ userId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [setPasswordForm, setSetPasswordForm] = useState({ userId: '', password: '', confirmPassword: '' });
  const [setPasswordSuccess, setSetPasswordSuccess] = useState('');
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agendaTab, setAgendaTab] = useState('tasks'); // tasks, prospects, goals, dreams
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [showWeekends, setShowWeekends] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [categoryFilters, setCategoryFilters] = useState({
    work: true,
    personal: true,
    important: true
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showCalendarCreateMenu, setShowCalendarCreateMenu] = useState(false);
  const [calendarCreateMenuPos, setCalendarCreateMenuPos] = useState({ x: 0, y: 0 });
  const [calendarSlotInfo, setCalendarSlotInfo] = useState(null);

  const [videoCategories, setVideoCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoStatistics, setVideoStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comment, setComment] = useState('');
  const [videoWatched, setVideoWatched] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', order: 0 });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', youtube_id: '', description: '', duration: '', category: '', category_id: '' });
  
  // New features states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Admin panel advanced features
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({
    role: 'all', // all, admin, user
    dateFrom: '',
    dateTo: '',
    activityStatus: 'all' // all, active, inactive
  });
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userActivities, setUserActivities] = useState(null);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkEmailData, setBulkEmailData] = useState({ subject: '', message: '' });
  const [statsPreselectedUser, setStatsPreselectedUser] = useState(null); // admin kullanıcıya bastığında istatistik sayfasına aktar
  
  // Message/Inbox states
  const [messages, setMessages] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '', recipient_ids: [] });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetailModal, setShowMessageDetailModal] = useState(false);
  const [autoOpenMessageId, setAutoOpenMessageId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null); // Thread (kişi) seçimi
  const [replyContent, setReplyContent] = useState(''); // Reply içeriği
  
  // Statistics states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [userRegistrationData, setUserRegistrationData] = useState([]);
  const [activeUsersData, setActiveUsersData] = useState([]);
  const [eventParticipationData, setEventParticipationData] = useState([]);
  
  // Admin Panel tab state
  const [adminTab, setAdminTab] = useState('users'); // users, trainings, logs, badges
  const [badges, setBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', icon: '', criteria: '' });
  
  // Activity Log states
  const [activityLogs, setActivityLogs] = useState([]);
  const [logStatistics, setLogStatistics] = useState(null);
  const [logFilters, setLogFilters] = useState({
    action: '',
    resource_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
    limit: 100
  });
  
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null); // partner kartına tıklandığında detay modalı
  const [expandedUserPartners, setExpandedUserPartners] = useState({}); // admin panelinde açık olan kullanıcı partner satırları
  const [showUserModal, setShowUserModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({ title: '', target: 1 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Forgot Password States
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordData, setForgotPasswordData] = useState({ emailOrId: '', code: '', newPassword: '' });
  
  // Dream Priority States
  const [dreamStep, setDreamStep] = useState(1);
  const [dreamData, setDreamData] = useState({
    initial_dreams: Array(10).fill(''),
    final_priorities: [],
    target_income: '',
    target_months: '',
    daily_hours: ''
  });
  const [eliminationList, setEliminationList] = useState([]);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  
  // Character Analysis States
  const [characterStep, setCharacterStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    recent_events: {
      happy: '',
      sad: '',
      angry: '',
      patience_heavy: '',
      proud: ''
    },
    ideal_day: {
      morning: '',
      afternoon: '',
      evening: '',
      before_sleep: '',
      peoples_say: '',
      feelings: '',
      values: ''
    },
    ninety_day_plan: {
      main_identity: '',
      weekly_action: '',
      obstacles: '',
      plan_b: '',
      weekly_check_in: '',
      first_week: ''
    },
    ai_insights: ''
  });
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Future Character States
  const [characterTab, setCharacterTab] = useState('current'); // 'current' or 'future' or 'gap'
  const [futureCharacterStep, setFutureCharacterStep] = useState(1);
  const [futureCharacterData, setFutureCharacterData] = useState({
    character_traits: {
      keywords: ['', '', '', '', ''],
      personality_traits: '',
      strengths: '',
      emotional_state: '',
      mental_abilities: ''
    },
    life_vision: {
      life_overview: '',
      relationships: '',
      career: '',
      mastery_areas: '',
      core_values: '',
      social_perception: ''
    },
    transformation_plan: {
      changes_needed: '',
      habits_to_gain: '',
      habits_to_remove: '',
      skills_to_learn: '',
      mentors: '',
      first_year_actions: ''
    },
    ai_insights: ''
  });
  const [futureAiAnalysisResult, setFutureAiAnalysisResult] = useState(null);
  const [gapAnalysisResult, setGapAnalysisResult] = useState(null);
  const [isAnalyzingFuture, setIsAnalyzingFuture] = useState(false);
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  
  // Full Life Profile States (Detaylı Yaşam Tablosu)
  const [lifeProfileStep, setLifeProfileStep] = useState(0); // 0: current, 1: future, 2: action, 3: gap
  const [lifeProfileCategory, setLifeProfileCategory] = useState(0);
  
  const [currentLifeState, setCurrentLifeState] = useState({
    physical: '', energy: '', style: '',
    skills: '', hobbies: '',
    home: '', car: '', possessions: '', financial: '',
    places: '', socialCircle: '', dailyRoutine: '',
    positiveTraits: '', negativeTraits: ''
  });
  
  const [futureLifeState, setFutureLifeState] = useState({
    physical: '', energy: '', style: '',
    skills: '', hobbies: '', achievements: '',
    home: '', car: '', possessions: '', financial: '',
    places: '', socialCircle: '', dailyRoutine: '', lifestyle: '',
    transformedTraits: ''
  });
  
  const [actionPlan90, setActionPlan90] = useState({
    identity90: '', skillsToLearn: '', financialSteps: '',
    healthSteps: '', socialSteps: '', firstMonth: ''
  });
  
  const [currentAiAnalysis, setCurrentAiAnalysis] = useState(null);
  const [futureAiAnalysis, setFutureAiAnalysis] = useState(null);
  const [fullGapAnalysis, setFullGapAnalysis] = useState(null);
  const [isAnalyzingCurrentLife, setIsAnalyzingCurrentLife] = useState(false);
  const [isAnalyzingFutureLife, setIsAnalyzingFutureLife] = useState(false);
  const [isAnalyzingFullGap, setIsAnalyzingFullGap] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingReason, setEditingReason] = useState(null);
  const [editingProspect, setEditingProspect] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  
  // Dark mode state - localStorage'dan initial değeri al
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerDetailModal, setShowPartnerDetailModal] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState({ goals: [], reasons: [], meetings: [] });
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Profile states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    career_title: '',
    phone: '',
    city: '',
    country: '',
    language: 'tr',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    facebook_url: '',
    profile_photo: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled', category: 'work', color: '#3b82f6', all_day: false, recurrence: 'none', recurrence_end_date: '' });
  const [newTask, setNewTask] = useState({ title: '', date: '', priority: 'medium', status: 'todo', description: '', assignee: '' });
  const [newGoal, setNewGoal] = useState({ title: '', type: 'daily', target: '', deadline: '', current: 0 });
  const [newReason, setNewReason] = useState({ title: '', description: '', image: '' });
  const [newProspect, setNewProspect] = useState({ name: '', phone: '', email: '', status: 'new', notes: '', source: '' });
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', email: '', rank: '', join_date: '', performance: '', status: 'active' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', max_participants: '', recurrence: 'none', recurrence_end_date: '' });
  const [newRecommendation, setNewRecommendation] = useState({ title: '', type: 'book', description: '', cover_image: '', link: '', author: '', duration: '', category: '' });
  const [newBlog, setNewBlog] = useState({ title: '', content: '', cover_image: '', excerpt: '', category: '', tags: [], published: false });

  useEffect(() => {
    checkAutoLogin();
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadAllData();
    }
  }, [isLoggedIn, currentUser]);

  // Auto-open message from notification
  useEffect(() => {
    if (currentPage === 'inbox' && autoOpenMessageId && messages.length > 0) {
      const message = messages.find(m => m.id === autoOpenMessageId);
      if (message) {
        setSelectedMessage(message);
        setShowMessageDetailModal(true);
        if (!message.read) {
          markMessageAsRead(message.id);
        }
        setAutoOpenMessageId(null); // Reset
      }
    }
  }, [currentPage, autoOpenMessageId, messages]);

  // Mesajları gönderene göre grupla (Thread sistemi)
  const groupMessagesBySender = () => {
    const grouped = {};
    
    messages.forEach(msg => {
      const senderId = msg.sender_id;
      if (!grouped[senderId]) {
        grouped[senderId] = {
          sender_id: senderId,
          sender_name: msg.sender_name,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
          lastMessageDate: null
        };
      }
      
      grouped[senderId].messages.push(msg);
      if (!msg.read) grouped[senderId].unreadCount++;
      
      // En son mesajı bul
      if (!grouped[senderId].lastMessage || new Date(msg.created_at) > new Date(grouped[senderId].lastMessage.created_at)) {
        grouped[senderId].lastMessage = msg;
        grouped[senderId].lastMessageDate = new Date(msg.created_at);
      }
    });
    
    // Array'e çevir ve tarihe göre sırala (en yeni üstte)
    return Object.values(grouped).sort((a, b) => b.lastMessageDate - a.lastMessageDate);
  };

  // Dark mode initialization - sayfa yüklendiğinde
  useEffect(() => {
    // Önce localStorage'dan oku
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Eğer state ile localStorage arasında fark varsa, localStorage'ı öncelikli al
    if (savedDarkMode !== darkMode) {
      setDarkMode(savedDarkMode);
    }
    
    // Body class'ını hemen ayarla - state'e bakılmaksızın localStorage değeri kullan
    if (savedDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Console log debug için
    console.log('Dark mode initialized:', savedDarkMode);
  }, []);

  // Dark mode değiştiğinde localStorage ve body class güncelle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);


  const checkAutoLogin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        setCurrentUser(response.data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Auto login failed:', error.message);
      // Sadece yetkilendirme hatası (401) alırsak veya token geçersizse sil, 
      // Sunucu hatası veya internet gitmesinde silme!
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogin = async () => {
    try {
      const response = await authAPI.login({
        email_or_id: loginForm.userId,
        password: loginForm.password
      });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginForm({ userId: '', password: '' });
    } catch (error) {
      alert('ID numerası veya şifre hatalı!');
    }
  };

  const handleInitSetPassword = async () => {
    if (!loginForm.userId || String(loginForm.userId).trim().length !== 8) {
      alert('Lütfen önce Atomy ID numaranızı eksiksiz (8 haneli) girin.');
      return;
    }
    
    try {
      await authAPI.checkId(loginForm.userId);
      setSetPasswordForm({ ...setPasswordForm, userId: String(loginForm.userId).trim() });
      setIdVerified(true);
      setShowSetPassword(true);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Kayıtlı ID bulunamadı. Lütfen sponsorunuzla iletişime geçiniz.');
      } else {
        alert(error.response?.data?.detail || 'Bir hata oluştu.');
      }
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotPasswordData.emailOrId) {
      alert('Lütfen kayıtlı E-posta adresinizi veya 8 haneli Atomy ID numaranızı girin.');
      return;
    }
    try {
      const response = await authAPI.forgotPassword(forgotPasswordData.emailOrId);
      alert(response.data.message + '\n\n(Güvenliğiniz için onay kodu şu e-posta adresinize gönderildi:\n' + response.data.masked_email + ')');
      setForgotPasswordStep(2);
    } catch (error) {
      alert(error.response?.data?.detail || 'Bir hata oluştu.');
    }
  };

  const handleVerifyResetCode = async () => {
    if (!forgotPasswordData.code || forgotPasswordData.code.length !== 6) {
      alert('Lütfen e-postanıza gelen 6 haneli doğrulama kodunu girin.');
      return;
    }
    try {
      const response = await authAPI.verifyResetCode(forgotPasswordData.emailOrId, forgotPasswordData.code);
      if (response.data.token_valid) {
        setForgotPasswordStep(3);
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Hatalı veya süresi dolmuş kod.');
    }
  };

  const handleResetPassword = async () => {
    if (!forgotPasswordData.newPassword || forgotPasswordData.newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    try {
      const response = await authAPI.resetPassword(
        forgotPasswordData.emailOrId,
        forgotPasswordData.code,
        forgotPasswordData.newPassword
      );
      alert(response.data.message);
      setShowForgotPasswordModal(false);
      setForgotPasswordStep(1);
      setForgotPasswordData({ emailOrId: '', code: '', newPassword: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Bir hata oluştu.');
    }
  };


  const handleSetPassword = async () => {
    if (!setPasswordForm.userId || !setPasswordForm.password || !setPasswordForm.confirmPassword) {
      alert('Tüm alanları doldurun!');
      return;
    }
    if (setPasswordForm.password !== setPasswordForm.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    if (setPasswordForm.password.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    try {
      const response = await authAPI.setPassword(
        setPasswordForm.userId,
        setPasswordForm.password
      );
      const name = response.data.name;
      setSetPasswordSuccess(`Merhaba ${name}! Şifreniz başarıyla belirlendi.`);
      setSetPasswordForm({ userId: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        setShowSetPassword(false);
        setIdVerified(false);
        setSetPasswordSuccess('');
      }, 3000);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Kayıtlı ID bulunamadı. Lütfen sponsorunuzla iletişime geçiniz.');
      } else {
        alert(error.response?.data?.detail || 'Şifre belirlenemedi. ID numarasını kontrol edin.');
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    setCurrentPage('dashboard');
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadVideoCategories(),
        loadVideos(),
        loadUserProgress(),
        loadMeetings(),
        loadTasks(),
        loadGoals(),
        loadReasons(),
        loadProspects(),
        loadDailyHabits(),
        loadPartners(),
        loadEvents(),
        loadEventRegistrations(),
        loadNotifications(),
        loadRecommendations(),
        loadBlogs(),
        loadMessages(),
        loadUsers(),
        isAdminOrManager(currentUser) ? loadStatistics() : Promise.resolve(),
        isAdminOrManager(currentUser) ? loadVideoStatistics() : Promise.resolve(),
        currentUser?.role === 'admin' ? loadActivityLogs() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    }
  };

  const loadVideoCategories = async () => {
    try {
      const response = await videoCategoryAPI.getAll();
      setVideoCategories(response.data);
    } catch (error) {
      console.error('Video kategorileri yüklenemedi:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setVideos(response.data);
    } catch (error) {
      console.error('Videolar yüklenemedi:', error);
    }
  };

  const loadVideoStatistics = async () => {
    if (!isAdminOrManager(currentUser)) return;
    
    try {
      const response = await videoAPI.getStatistics();
      setVideoStatistics(response.data);
    } catch (error) {
      console.error('Video istatistikleri yüklenemedi:', error);
    }
  };

  const addOrUpdateCategory = async () => {
    if (!newCategory.name) {
      alert('Kategori adı gerekli!');
      return;
    }
    
    try {
      if (editingCategory) {
        await videoCategoryAPI.update(editingCategory.id, newCategory);
      } else {
        await videoCategoryAPI.create(newCategory);
      }
      await loadVideoCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', order: 0 });
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await videoCategoryAPI.delete(categoryId);
      await loadVideoCategories();
    } catch (error) {
      alert('Kategori silinemedi!');
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url) => {
    if (!url) return '';
    
    // If it's already just an ID (no URL), return it
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    
    // Different YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return url; // Return as is if no pattern matches
  };

  const addOrUpdateVideo = async () => {
    // Extract ID from URL if needed
    const videoId = extractYouTubeId(newVideo.youtube_id);
    
    if (!newVideo.title || !videoId) {
      alert('Video başlığı ve YouTube linki gerekli!');
      return;
    }
    
    // Update the video object with extracted ID
    const videoToSave = { ...newVideo, youtube_id: videoId };
    
    try {
      if (editingVideo) {
        await videoAPI.update(editingVideo.id, videoToSave);
      } else {
        await videoAPI.create(videoToSave);
      }
      await loadVideos();
      await loadVideoStatistics();
      setShowVideoModal(false);
      setEditingVideo(null);
      setNewVideo({ title: '', youtube_id: '', description: '', duration: '', category: '', category_id: '', level: 'Başlangıç', order: 0 });
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await videoAPI.delete(videoId);
      await loadVideos();
      await loadVideoStatistics();
    } catch (error) {
      alert('Video silinemedi!');
    }
  };

  const trackVideoView = async (videoId) => {
    try {
      await videoAPI.trackView(videoId);
    } catch (error) {
      console.error('Video izlenme kaydedilemedi:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const response = await progressAPI.get();
      setUserProgress(response.data);
    } catch (error) {
      console.error('Progress yüklenemedi:', error);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await meetingAPI.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('Meetings yüklenemedi:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Tasks yüklenemedi:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Goals yüklenemedi:', error);
    }
  };

  const loadReasons = async () => {
    try {
      const response = await reasonAPI.getAll();
      setReasons(response.data);
    } catch (error) {
      console.error('Reasons yüklenemedi:', error);
    }
  };

  const loadDreamPriority = async () => {
    try {
      const response = await dreamPriorityAPI.get();
      if (response.data.initial_dreams.length > 0) {
        setDreamData(response.data);
        setDreamStep(4); // Show results if already completed
      }
    } catch (error) {
      console.error('Dream priority yüklenemedi:', error);
    }
  };

  const saveDreamPriority = async () => {
    try {
      await dreamPriorityAPI.createOrUpdate(dreamData);
      alert('Hayalleriniz kaydedildi!');
    } catch (error) {
      alert('Kaydetme hatası!');
    }
  };

  // Character Analysis Functions
  const analyzeCharacter = async () => {
    try {
      setIsAnalyzing(true);
      const response = await characterAnalysisAPI.aiAnalyze(characterData);
      setAiAnalysisResult(response.data.analysis);
      setCharacterStep(4); // Move to results step
    } catch (error) {
      console.error('AI analizi hatası:', error);
      alert('Analiz yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveCharacterAnalysis = async () => {
    try {
      const dataToSave = {
        ...characterData,
        ai_insights: aiAnalysisResult || ''
      };
      await characterAnalysisAPI.create(dataToSave);
      alert('Karakter analiziniz kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir hata oluştu.');
    }
  };

  // Future Character Functions
  const analyzeFutureCharacter = async () => {
    try {
      setIsAnalyzingFuture(true);
      const response = await futureCharacterAPI.aiAnalyze(futureCharacterData);
      setFutureAiAnalysisResult(response.data.analysis);
      setFutureCharacterStep(4); // Move to results step
    } catch (error) {
      console.error('AI analizi hatası:', error);
      alert('Analiz yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAnalyzingFuture(false);
    }
  };

  const saveFutureCharacter = async () => {
    try {
      const dataToSave = {
        ...futureCharacterData,
        ai_insights: futureAiAnalysisResult || ''
      };
      await futureCharacterAPI.create(dataToSave);
      alert('Gelecek karakter profiliniz kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir hata oluştu.');
    }
  };

  const analyzeGap = async () => {
    try {
      setIsAnalyzingGap(true);
      const response = await futureCharacterAPI.gapAnalysis({
        current: characterData,
        future: futureCharacterData,
        current_summary: aiAnalysisResult || '',
        future_summary: futureAiAnalysisResult || ''
      });
      setGapAnalysisResult(response.data.gap_analysis);
    } catch (error) {
      console.error('Gap analizi hatası:', error);
      alert('Gap analizi yapılırken bir hata oluştu.');
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  // Full Life Profile Functions
  const analyzeCurrentLife = async () => {
    try {
      setIsAnalyzingCurrentLife(true);
      const response = await fullLifeProfileAPI.analyzeCurrent(currentLifeState);
      setCurrentAiAnalysis(response.data.analysis);
      alert('✅ Mevcut durum analizi tamamlandı!');
    } catch (error) {
      console.error('Mevcut durum analizi hatası:', error);
      alert('Analiz yapılırken bir hata oluştu.');
    } finally {
      setIsAnalyzingCurrentLife(false);
    }
  };

  const analyzeFutureLife = async () => {
    try {
      setIsAnalyzingFutureLife(true);
      const response = await fullLifeProfileAPI.analyzeFuture(futureLifeState);
      setFutureAiAnalysis(response.data.analysis);
      alert('✅ Gelecek hedef analizi tamamlandı!');
    } catch (error) {
      console.error('Gelecek analizi hatası:', error);
      alert('Analiz yapılırken bir hata oluştu.');
    } finally {
      setIsAnalyzingFutureLife(false);
    }
  };

  const analyzeFullGap = async () => {
    try {
      setIsAnalyzingFullGap(true);
      const response = await fullLifeProfileAPI.gapAnalysis({
        current: currentLifeState,
        future: futureLifeState
      });
      setFullGapAnalysis(response.data.gap_analysis);
    } catch (error) {
      console.error('Gap analizi hatası:', error);
      alert('Gap analizi yapılırken bir hata oluştu.');
    } finally {
      setIsAnalyzingFullGap(false);
    }
  };

  const saveFullLifeProfile = async () => {
    try {
      const profileData = {
        current_state: currentLifeState,
        future_state: futureLifeState,
        action_plan: actionPlan90,
        current_ai_analysis: currentAiAnalysis || '',
        future_ai_analysis: futureAiAnalysis || '',
        gap_analysis: fullGapAnalysis || ''
      };
      await fullLifeProfileAPI.create(profileData);
      alert('✅ Tam yaşam profiliniz kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir hata oluştu.');
    }
  };

  const loadProspects = async () => {
    try {
      const response = await prospectAPI.getAll();
      setProspects(response.data);
    } catch (error) {
      console.error('Prospects yüklenemedi:', error);
    }
  };

  const loadDailyHabits = async () => {
    try {
      const response = await habitAPI.getAll();
      setDailyHabits(response.data);
    } catch (error) {
      console.error('Habits yüklenemedi:', error);
    }
  };

  const loadPartners = async () => {
    try {
      const response = await partnerAPI.getAll();
      setPartners(response.data);
    } catch (error) {
      console.error('Partners yüklenemedi:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Events yüklenemedi:', error);
    }
  };

  const loadEventRegistrations = async () => {
    try {
      const response = await eventRegistrationAPI.getAll();
      setEventRegistrations(response.data);
    } catch (error) {
      console.error('Event registrations yüklenemedi:', error);
    }
  };


  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      const countResponse = await notificationAPI.getUnreadCount();
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Notifications yüklenemedi:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getAll();
      setMessages(response.data);
      const countResponse = await messageAPI.getUnreadCount();
      setUnreadMessageCount(countResponse.data.count);
    } catch (error) {
      console.error('Messages yüklenemedi:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.subject || !newMessage.content || newMessage.recipient_ids.length === 0) {
      alert('Tüm alanları doldurun ve en az bir alıcı seçin!');
      return;
    }
    
    try {
      await messageAPI.send(newMessage);
      setShowSendMessageModal(false);
      setNewMessage({ subject: '', content: '', recipient_ids: [] });
      alert('Mesaj başarıyla gönderildi!');
    } catch (error) {
      alert('Mesaj gönderilemedi!');
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await messageAPI.markRead(messageId);
      await loadMessages();
    } catch (error) {
      console.error('Mesaj işaretlenemedi:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await messageAPI.delete(messageId);
      await loadMessages();
      setShowMessageDetailModal(false);
      setSelectedMessage(null);
    } catch (error) {
      alert('Mesaj silinemedi!');
    }
  };

  // Statistics functions
  const loadStatistics = async () => {
    if (currentUser?.role !== 'admin') return;
    
    try {
      const [dashboardRes, registrationsRes, activeUsersRes, eventsRes] = await Promise.all([
        statisticsAPI.getDashboard(),
        statisticsAPI.getUserRegistrations(),
        statisticsAPI.getActiveUsers(),
        statisticsAPI.getEventParticipation()
      ]);
      
      setDashboardStats(dashboardRes.data);
      setUserRegistrationData(registrationsRes.data.data);
      setActiveUsersData(activeUsersRes.data.data);
      setEventParticipationData(eventsRes.data.data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await statisticsAPI.exportUsers();
      const users = response.data.data;
      
      // Prepare data for Excel
      const excelData = users.map(user => ({
        'ID': formatUserNumber(user.user_number),
        'İsim': user.name,
        'Email': user.email,
        'Rol': getRoleConfig(user.role).label,
        'Kayıt Tarihi': new Date(user.created_at).toLocaleDateString('tr-TR'),
        'Hedef Sayısı': user.goals_count || 0,
        'Partner Sayısı': user.partners_count || 0,
        'Prospect Sayısı': user.prospects_count || 0,
        'Toplam Aktivite': user.total_activity || 0
      }));
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcılar');
      
      // Download
      XLSX.writeFile(wb, `FocusPro_Kullanicilar_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
      
      alert('Excel dosyası indirildi!');
    } catch (error) {
      alert('Excel dosyası oluşturulamadı!');
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await statisticsAPI.exportUsers();
      const users = response.data.data;
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('FocusPro Kullanıcı Raporu', 14, 20);
      
      doc.setFontSize(11);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);
      
      // Table
      const tableData = users.map(user => [
        formatUserNumber(user.user_number),
        user.name,
        user.email,
        getRoleConfig(user.role).label,
        new Date(user.created_at).toLocaleDateString('tr-TR'),
        user.total_activity || 0
      ]);
      
      doc.autoTable({
        startY: 35,
        head: [['ID', 'İsim', 'Email', 'Rol', 'Kayıt Tarihi', 'Aktivite']],
        body: tableData,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] }
      });
      
      doc.save(`FocusPro_Rapor_${new Date().toLocaleDateString('tr-TR')}.pdf`);
      
      alert('PDF dosyası indirildi!');
    } catch (error) {
      alert('PDF dosyası oluşturulamadı!');
    }
  };

  // Badge functions
  const loadBadges = async () => {
    try {
      const res = await badgeAPI.getAll();
      setBadges(res.data || []);
    } catch (error) {
      console.error('Rozetler yüklenemedi:', error);
    }
  };

  const saveBadge = async () => {
    if (!badgeForm.name || !badgeForm.icon) {
      alert('İsim ve ikon zorunludur!');
      return;
    }
    try {
      await badgeAPI.update(editingBadge.id, {
        name: badgeForm.name,
        description: badgeForm.description,
        icon: badgeForm.icon,
        criteria: badgeForm.criteria,
        type: editingBadge.type,
        reward_type: editingBadge.reward_type
      });
      await loadBadges();
      setShowBadgeModal(false);
      setEditingBadge(null);
    } catch (error) {
      console.error('Rozet güncellenemedi:', error);
      alert('Rozet güncellenirken bir hata oluştu!');
    }
  };

  // Activity Log functions
  const loadActivityLogs = async () => {
    if (currentUser?.role !== 'admin') return;
    
    try {
      const [logsRes, statsRes] = await Promise.all([
        activityLogAPI.getAll(logFilters),
        activityLogAPI.getStatistics()
      ]);
      
      setActivityLogs(logsRes.data.logs);
      setLogStatistics(statsRes.data);
    } catch (error) {
      console.error('Aktivite logları yüklenemedi:', error);
    }
  };

  const clearOldLogs = async () => {
    if (!window.confirm('90 günden eski logları silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await activityLogAPI.clearOld(90);
      alert(`${response.data.deleted_count} log silindi!`);
      await loadActivityLogs();
    } catch (error) {
      alert('Log silme başarısız!');
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await recommendationAPI.getAll();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Recommendations yüklenemedi:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogs(response.data);
    } catch (error) {
      console.error('Blogs yüklenemedi:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await searchAPI.search(query);
      setSearchResults(response.data.results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Arama hatası:', error);
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      await notificationAPI.markRead(notifId);
      await loadNotifications();
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      await loadNotifications();
    } catch (error) {
      console.error('Bildirimler işaretlenemedi:', error);
    }
  };


  // CRUD Functions
  const addOrUpdateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date) return;
    
    try {
      if (editingMeeting) {
        await meetingAPI.update(editingMeeting.id, newMeeting);
      } else {
        await meetingAPI.create(newMeeting);
      }
      
      await loadMeetings();
      setNewMeeting({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled', recurrence: 'none', recurrence_end_date: '' });
      setEditingMeeting(null);
      setShowMeetingModal(false);
      setSelectedDate(null);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await meetingAPI.delete(id);
      await loadMeetings();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdateTask = async () => {
    if (!newTask.title) return;
    
    try {
      if (editingTask) {
        await taskAPI.update(editingTask.id, newTask);
      } else {
        await taskAPI.create(newTask);
      }
      
      await loadTasks();
      setNewTask({ title: '', date: '', priority: 'medium', status: 'todo', description: '', assignee: '' });
      setEditingTask(null);
      setShowTaskModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.delete(id);
      await loadTasks();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await taskAPI.updateStatus(id, status);
      await loadTasks();
    } catch (error) {
      alert('Güncelleme başarısız!');
    }
  };

  const addOrUpdateGoal = async () => {
    if (!newGoal.title || !newGoal.target) return;
    
    try {
      if (editingGoal) {
        await goalAPI.update(editingGoal.id, newGoal);
      } else {
        await goalAPI.create(newGoal);
      }
      await loadGoals();
      setNewGoal({ title: '', type: 'daily', target: '', deadline: '', current: 0 });
      setEditingGoal(null);
      setShowGoalModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };
  
  const addGoal = addOrUpdateGoal; // Backward compatibility

  const deleteGoal = async (id) => {
    try {
      await goalAPI.delete(id);
      await loadGoals();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdateReason = async () => {
    if (!newReason.title) return;
    
    try {
      if (editingReason) {
        await reasonAPI.update(editingReason.id, newReason);
      } else {
        await reasonAPI.create(newReason);
      }
      await loadReasons();
      setNewReason({ title: '', description: '', image: '' });
      setEditingReason(null);
      setShowReasonModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };
  
  const addReason = addOrUpdateReason; // Backward compatibility

  const deleteReason = async (id) => {
    try {
      await reasonAPI.delete(id);
      await loadReasons();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdateHabit = async () => {
    if (!newHabit.title || newHabit.target < 1) return;
    
    try {
      if (editingHabit) {
        await habitAPI.updateFull(editingHabit.id, newHabit);
      } else {
        await habitAPI.create(newHabit);
      }
      await loadDailyHabits();
      setNewHabit({ title: '', target: 1 });
      setEditingHabit(null);
      setShowHabitModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteHabit = async (id) => {
    if (!confirm('Bu alışkanlığı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await habitAPI.delete(id);
      await loadDailyHabits();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const updateHabitProgress = async (habitId, newCompleted) => {
    try {
      await habitAPI.update(habitId, newCompleted);
      await loadDailyHabits();
    } catch (error) {
      alert('Güncelleme başarısız!');
    }
  };
  
  const handleImageUpload = async (event, setter) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (500KB max)
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > 500) {
      alert(`Dosya boyutu çok büyük! Maksimum 500KB. Sizinki: ${fileSizeKB.toFixed(2)}KB`);
      return;
    }
    
    setUploadingImage(true);
    try {
      const response = await fileAPI.uploadImage(file);
      setter(response.data.data); // Pass the base64 data directly
      alert(`Görsel yüklendi! (${response.data.size_kb}KB)`);
    } catch (error) {
      alert(error.response?.data?.detail || 'Görsel yüklenirken hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const addOrUpdateProspect = async () => {
    if (!newProspect.name) return;
    
    try {
      if (editingProspect) {
        await prospectAPI.update(editingProspect.id, newProspect);
      } else {
        await prospectAPI.create(newProspect);
      }
      
      await loadProspects();
      setNewProspect({ name: '', phone: '', email: '', status: 'new', notes: '', source: '' });
      setEditingProspect(null);
      setShowProspectModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const viewPartnerDetails = async (partner) => {
    setSelectedPartner(partner);
    setShowPartnerDetailModal(true);
    
    // Load partner's goals, reasons, and meetings
    try {
      const [goalsRes, reasonsRes, meetingsRes] = await Promise.all([
        goalAPI.getAll(),
        reasonAPI.getAll(), 
        meetingAPI.getAll()
      ]);
      
      // Filter by partner's user_id (assuming partner has user_id field)
      const partnerGoals = goalsRes.data.filter(g => g.user_id === partner.user_id);
      const partnerReasons = reasonsRes.data.filter(r => r.user_id === partner.user_id);
      const partnerMeetings = meetingsRes.data.filter(m => m.user_id === partner.user_id);
      
      setPartnerDetails({
        goals: partnerGoals,
        reasons: partnerReasons,
        meetings: partnerMeetings
      });
    } catch (error) {
      console.error('Partner detayları yüklenemedi:', error);
    }
  };
  // Profile functions
  const loadProfile = () => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        career_title: currentUser.career_title || '',
        phone: currentUser.phone || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
        language: currentUser.language || 'tr',
        linkedin_url: currentUser.linkedin_url || '',
        twitter_url: currentUser.twitter_url || '',
        instagram_url: currentUser.instagram_url || '',
        facebook_url: currentUser.facebook_url || '',
        profile_photo: currentUser.profile_photo || ''
      });
    }
  };

  const updateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setCurrentUser(response.data);
      alert('Profil başarıyla güncellendi!');
    } catch (error) {
      alert('Profil güncellenirken hata oluştu!');
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      alert('Şifre başarıyla değiştirildi!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Şifre değiştirilirken hata oluştu!');
    }
  };

  const updateProfilePhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_SIZE_KB = 700;
    if (file.size > MAX_SIZE_KB * 1024) {
      alert(`Fotoğraf boyutu en fazla ${MAX_SIZE_KB} KB olabilir. Seçilen dosya: ${Math.round(file.size / 1024)} KB`);
      event.target.value = '';
      return;
    }
    
    setUploadingImage(true);
    try {
      // Upload image first
      const response = await fileAPI.uploadImage(file);
      const imageUrl = response.data.data;
      
      // Update profile with new photo
      await authAPI.updateProfile({ profile_photo: imageUrl });
      
      // Update local state
      setProfileData(prev => ({ ...prev, profile_photo: imageUrl }));
      setCurrentUser(prev => ({ ...prev, profile_photo: imageUrl }));
      
      alert('Profil fotoğrafı başarıyla kaydedildi!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Profil fotoğrafı yüklenirken hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  // Load profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadProfile();
      if (agendaTab === 'dreams') {
        loadDreamPriority();
      }
    }
  }, [currentUser, agendaTab]);

  // YouTube Player useEffect
  useEffect(() => {
    if (!selectedVideo) return;

    const videoId = selectedVideo.id;
    const durationStr = selectedVideo.duration;
    let player = null;
    let progressInterval = null;
    let lastSavedPercentage = 0;

    // Parse duration string to seconds
    const parseDuration = (durationStr) => {
      const parts = durationStr.split(':').map(p => parseInt(p));
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return 0;
    };

    const videoDuration = parseDuration(durationStr);

    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else {
        if (!window.onYouTubeIframeAPIReady) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          window.onYouTubeIframeAPIReady = () => {
            initializePlayer();
          };
        } else {
          setTimeout(loadYouTubeAPI, 100);
        }
      }
    };

    const initializePlayer = () => {
      player = new window.YT.Player(`youtube-player-${videoId}`, {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    const onPlayerReady = (event) => {
      console.log('Player ready');
      // Load saved progress and seek to that position
      const savedProgress = getVideoProgress(videoId);
      if (savedProgress && savedProgress.watch_percentage > 0 && savedProgress.watch_percentage < 100) {
        const seekTime = (savedProgress.watch_percentage / 100) * videoDuration;
        player.seekTo(seekTime, true);
        console.log(`Resuming from ${savedProgress.watch_percentage}% (${seekTime}s)`);
      }
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        startProgressTracking();
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        stopProgressTracking();
      } else if (event.data === window.YT.PlayerState.ENDED) {
        stopProgressTracking();
        const percentageDisplay = document.getElementById(`video-percentage-${videoId}`);
        if (percentageDisplay) percentageDisplay.textContent = '%100';
        updateProgress(100);
      }
    };

    const startProgressTracking = () => {
      if (progressInterval) clearInterval(progressInterval);

      progressInterval = setInterval(() => {
        if (!player || !player.getCurrentTime) return;
        if (videoDuration <= 0) return; // Prevent division by zero

        const currentTime = player.getCurrentTime();
        const percentage = Math.min((currentTime / videoDuration) * 100, 100);

        // Update progress bar overlay
        const progressBar = document.getElementById(`video-progress-bar-${videoId}`);
        if (progressBar) progressBar.style.width = percentage + '%';

        // Update percentage display overlay
        const percentageDisplay = document.getElementById(`video-percentage-${videoId}`);
        if (percentageDisplay) percentageDisplay.textContent = '%' + Math.floor(percentage);

        // Save to backend every 5% progress
        const roundedPercentage = Math.floor(percentage / 5) * 5;
        if (roundedPercentage > lastSavedPercentage && roundedPercentage <= 100) {
          lastSavedPercentage = roundedPercentage;
          updateProgress(roundedPercentage);
        }
      }, 1000);
    };

    const stopProgressTracking = () => {
      if (progressInterval) clearInterval(progressInterval);
    };

    const updateProgress = (percentage) => {
      // Only reload when video is actually completed (100%)
      // Don't reload for progress updates
      const shouldReload = percentage === 100;
      
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/videos/${videoId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ watch_percentage: percentage })
      }).then(async (response) => {
        if (shouldReload) {
          // Reload to refresh progress and unlock next video
          await loadUserProgress();
        }
      }).catch(err => {
        console.error('Progress update failed:', err);
      });
    };

    loadYouTubeAPI();

    // Cleanup
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (player && player.destroy) player.destroy();
    };
  }, [selectedVideo]);

  const deleteProspect = async (id) => {
    try {
      await prospectAPI.delete(id);
      await loadProspects();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdatePartner = async () => {
    if (!newPartner.name) return;
    
    try {
      if (editingPartner) {
        await partnerAPI.update(editingPartner.id, newPartner);
      } else {
        await partnerAPI.create(newPartner);
      }
      
      await loadPartners();
      setNewPartner({ name: '', phone: '', email: '', rank: '', join_date: '', performance: '', status: 'active' });
      setEditingPartner(null);
      setShowPartnerModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deletePartner = async (id) => {
    try {
      await partnerAPI.delete(id);
      await loadPartners();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdateUser = async () => {
    if (!newUser.name) {
      alert('İsim alanı zorunludur!');
      return;
    }
    
    if (!newUser.user_number) {
      alert('ID numarası zorunludur!');
      return;
    }
    
    const idNum = parseInt(newUser.user_number, 10);
    if (isNaN(idNum) || String(newUser.user_number).length !== 8) {
      alert('ID numarası tam olarak 8 haneli olmalıdır!');
      return;
    }
    
    // Auto generate email
    const autoEmail = newUser.email || `${newUser.user_number}@focuspro.local`;
    
    try {
      if (editingUser) {
        const updateData = {
          name: newUser.name,
          email: autoEmail,
          role: newUser.role,
          user_number: idNum,
          permissions: newUser.role === 'manager' ? (newUser.permissions || []) : []
        };
        await userAPI.update(editingUser.id, updateData);
        alert('Kullanıcı başarıyla güncellendi!');
      } else {
        await userAPI.create({
          name: newUser.name,
          email: autoEmail,
          user_number: idNum,
          role: newUser.role,
          permissions: newUser.role === 'manager' ? (newUser.permissions || []) : []
        });
        alert(`Kullanıcı başarıyla eklendi!\nKullanıcı ID ${newUser.user_number} ile 'Şifre Belirle' adımından şifresini oluşturabilir.`);
      }
      
      await loadUsers();
      setNewUser({ name: '', email: '', user_number: '', role: 'user', permissions: [] });
      setEditingUser(null);
      setShowUserModal(false);
    } catch (error) {
      console.error('Kullanıcı işlemi hatası:', error);
      const errorMessage = error.response?.data?.detail || 'İşlem başarısız!';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const deleteUser = async (id) => {
    if (id === currentUser.id) {
      alert('Kendi hesabınızı silemezsiniz!');
      return;
    }
    
    try {
      await userAPI.delete(id);
      await loadUsers();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  // Admin Panel - Advanced User Management Functions
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === getFilteredUsers().length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(getFilteredUsers().map(u => u.id));
    }
  };

  const bulkDeleteUsers = async () => {
    if (selectedUsers.includes(currentUser.id)) {
      alert('Kendi hesabınızı toplu silme işlemine dahil edemezsiniz!');
      return;
    }
    
    if (!window.confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedUsers.map(id => userAPI.delete(id)));
      await loadUsers();
      setSelectedUsers([]);
      alert('Kullanıcılar başarıyla silindi!');
    } catch (error) {
      alert('Toplu silme işlemi başarısız!');
    }
  };

  const bulkChangeRole = async (newRole) => {
    if (selectedUsers.includes(currentUser.id)) {
      alert('Kendi rolünüzü değiştiremezsiniz!');
      return;
    }
    
    if (!window.confirm(`${selectedUsers.length} kullanıcının rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      await Promise.all(
        selectedUsers.map(userId => {
          const user = users.find(u => u.id === userId);
          return userAPI.update(userId, { ...user, role: newRole });
        })
      );
      await loadUsers();
      setSelectedUsers([]);
      alert('Roller başarıyla güncellendi!');
    } catch (error) {
      alert('Toplu rol değiştirme başarısız!');
    }
  };

  const sendBulkEmail = async () => {
    if (!bulkEmailData.subject || !bulkEmailData.message) {
      alert('Konu ve mesaj alanlarını doldurun!');
      return;
    }
    
    // Mock email sending - in real app, call email API
    alert(`${selectedUsers.length} kullanıcıya email gönderildi!`);
    setShowBulkEmailModal(false);
    setBulkEmailData({ subject: '', message: '' });
    setSelectedUsers([]);
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      // Role filter
      if (userFilters.role !== 'all' && user.role !== userFilters.role) {
        return false;
      }
      
      // Date filter
      if (userFilters.dateFrom) {
        const userDate = new Date(user.created_at);
        const fromDate = new Date(userFilters.dateFrom);
        if (userDate < fromDate) return false;
      }
      
      if (userFilters.dateTo) {
        const userDate = new Date(user.created_at);
        const toDate = new Date(userFilters.dateTo);
        if (userDate > toDate) return false;
      }
      
      // Activity filter (mock - in real app, check last login)
      // For now, we'll consider users active if created in last 30 days
      if (userFilters.activityStatus !== 'all') {
        const daysSinceCreation = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
        if (userFilters.activityStatus === 'active' && daysSinceCreation > 30) return false;
        if (userFilters.activityStatus === 'inactive' && daysSinceCreation <= 30) return false;
      }
      
      return true;
    });
  };

  const viewUserDetails = async (user_param) => {
    setSelectedUserDetail(user_param);
    setUserActivities(null); // Reset while loading
    setAdminTab('user_analysis'); // Switch to inline analysis page
    
    // Load full user activities using the new admin endpoint
    try {
      const response = await adminAPI.getUserDetails(user_param.id);
      setUserActivities({
        goals: response.data.goals || [],
        partners: response.data.team || [],
        prospects: response.data.prospects || [],
        reasons: response.data.reasons || [],
        habits: response.data.habits || [],
        tasks: response.data.tasks || [],
        meetings: response.data.meetings || [],
        badges: response.data.badges || []
      });
    } catch (error) {
      console.error('Kullanıcı aktiviteleri yüklenemedi:', error);
      setUserActivities({ goals: [], partners: [], prospects: [], reasons: [], habits: [], tasks: [], meetings: [], badges: [] });
    }
  };

  const addOrUpdateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    
    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, newEvent);
      } else {
        await eventAPI.create(newEvent);
      }
      
      await loadEvents();
      setNewEvent({ title: '', date: '', time: '', location: '', description: '', max_participants: '', recurrence: 'none', recurrence_end_date: '' });
      setEditingEvent(null);
      setShowEventModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventAPI.delete(id);
      await loadEvents();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };


  const addOrUpdateRecommendation = async () => {
    if (!newRecommendation.title || !newRecommendation.type) return;
    
    try {
      if (editingRecommendation) {
        await recommendationAPI.update(editingRecommendation.id, newRecommendation);
      } else {
        await recommendationAPI.create(newRecommendation);
      }
      
      await loadRecommendations();
      setNewRecommendation({ title: '', type: 'book', description: '', cover_image: '', link: '', author: '', duration: '', category: '' });
      setEditingRecommendation(null);
      setShowRecommendationModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteRecommendation = async (id) => {
    try {
      await recommendationAPI.delete(id);
      await loadRecommendations();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };

  const addOrUpdateBlog = async () => {
    if (!newBlog.title || !newBlog.content) return;
    
    try {
      if (editingBlog) {
        await blogAPI.update(editingBlog.id, newBlog);
      } else {
        await blogAPI.create(newBlog);
      }
      
      await loadBlogs();
      setNewBlog({ title: '', content: '', cover_image: '', excerpt: '', category: '', tags: [], published: false });
      setEditingBlog(null);
      setShowBlogModal(false);
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const deleteBlog = async (id) => {
    try {
      await blogAPI.delete(id);
      await loadBlogs();
    } catch (error) {
      alert('Silme işlemi başarısız!');
    }
  };


  const registerForEvent = async (eventId) => {
    try {
      await eventRegistrationAPI.register(eventId);
      await loadEventRegistrations();
      alert('Etkinliğe katılım talebiniz gönderildi!');
    } catch (error) {
      alert(error.response?.data?.detail || 'İşlem başarısız!');
    }
  };

  const updateRegistrationStatus = async (id, status) => {
    try {
      await eventRegistrationAPI.updateStatus(id, status);
      await loadEventRegistrations();
    } catch (error) {
      alert('Güncelleme başarısız!');
    }
  };

  const updateHabit = async (id, completed) => {
    try {
      await habitAPI.update(id, completed);
      await loadDailyHabits();
    } catch (error) {
      alert('Güncelleme başarısız!');
    }
  };

  const getVideoProgress = (videoId) => {
    return userProgress.find(p => p.video_id === videoId);
  };

  const isVideoUnlocked = (videoId) => {
    const progress = getVideoProgress(videoId);
    return progress?.unlocked || false;
  };

  const handleVideoComplete = async () => {
    if (!selectedVideo || !comment.trim() || !videoWatched) {
      alert('Lütfen videoyu izleyip yorum yazınız!');
      return;
    }

    try {
      await progressAPI.complete(selectedVideo.id, comment);
      await loadUserProgress();
      
      setComment('');
      setVideoWatched(false);
      setSelectedVideo(null);
      alert('Tebrikler! Video tamamlandı.');
    } catch (error) {
      alert('İşlem başarısız!');
    }
  };

  const openVideo = (video) => {
    // Admin can access all videos, others need unlock
    if (currentUser?.role === 'admin' || isVideoUnlocked(video.id)) {
      setSelectedVideo(video);
      setVideoWatched(false);
      const progress = getVideoProgress(video.id);
      setComment(progress?.comment || '');
    }
  };

  const getDaysInWeek = (date) => {
    const days = [];
    const current = new Date(date);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(current.setDate(diff + i));
      days.push(new Date(day));
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getMeetingsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };

  const calculateStats = () => {
    const totalTasks = meetings.length + tasks.length + prospects.length;
    const completedTasks = meetings.filter(m => m.status === 'completed').length + 
                           tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const todayMeetings = meetings.filter(m => m.date === new Date().toISOString().split('T')[0]).length;
    const activePartners = partners.filter(p => p.status === 'active').length;

    return { totalTasks, completedTasks, completionRate, todayMeetings, activePartners };
  };

  // LOGIN/REGISTER UI
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

        {/* Left Side - Branding Hero */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-violet-900"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" style={{animation: 'pulse 4s ease-in-out infinite'}}></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-yellow-400/60 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-cyan-400/50 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-400/60 rounded-full animate-ping" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-2 ring-2 ring-white/20 shadow-xl">
                <img src="/focuspro-logo.png" alt="FocusPro" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Focus<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Pro</span>
                </h1>
                <p className="text-purple-200/70 text-xs font-medium">Kişisel Gelişim Platformu</p>
              </div>
            </div>

            <div className="max-w-lg">
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                Hedeflerinize
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300">Odaklanın</span>
              </h2>
              <p className="text-purple-100/70 text-lg leading-relaxed mb-10">
                Profesyonel gelişiminizi takip edin, eğitim videoları ile becerilerinizi geliştirin,
                görevlerinizi yönetin ve hedeflerinize adım adım ulaşın.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[{icon: <GraduationCap size={18} className="text-emerald-300" />, bg: 'bg-emerald-400/20', title: 'Eğitim Videoları', sub: 'Sıralı izleme'},
                  {icon: <Target size={18} className="text-blue-300" />, bg: 'bg-blue-400/20', title: 'Hedef Takibi', sub: 'Görev ve ajanda'},
                  {icon: <Calendar size={18} className="text-amber-300" />, bg: 'bg-amber-400/20', title: 'Takvim', sub: 'Görüşme planlama'},
                  {icon: <Users size={18} className="text-pink-300" />, bg: 'bg-pink-400/20', title: 'Partner Ağı', sub: 'Ekip yönetimi'}
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                    <div className={`w-9 h-9 ${f.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                    <div>
                      <p className="text-white text-sm font-semibold">{f.title}</p>
                      <p className="text-purple-200/50 text-xs">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-purple-400 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-purple-100/60 italic text-sm leading-relaxed">
                    &quot;Başarı, her gün tekrarlanan küçük çabaların toplamıdır.&quot;
                  </p>
                  <p className="text-purple-200/40 text-xs mt-1.5 font-medium">— Robert Collier</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 p-2 shadow-lg">
                  <img src="/focuspro-logo.png" alt="FocusPro" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800">Focus<span className="text-purple-600">Pro</span></h1>
              </div>
              <p className="text-gray-500 text-sm">Kişisel Gelişim Platformu</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">

              {!showSetPassword ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Hoş Geldiniz 👋</h2>
                    <p className="text-gray-500 text-sm mt-1">ID numaranızla giriş yapın</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Numaranız</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">#</span>
                        <input
                          type="text"
                          value={loginForm.userId}
                          onChange={(e) => setLoginForm({...loginForm, userId: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white transition-all text-sm"
                          placeholder="Örn: 1, 2, 15"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Şifre</label>
                        <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
                          Şifremi / ID'mi Unuttum
                        </button>
                      </div>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                          className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white transition-all text-sm"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleLogin} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 text-sm">
                      Giriş Yap
                    </button>
                  </div>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-medium">veya</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <button onClick={handleInitSetPassword} className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all text-sm">
                    Şifre Belirle
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">Admin tarafından eklendiyseniz ilk girişte şifrenizi belirleyin</p>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <button onClick={() => { setShowSetPassword(false); setIdVerified(false); setSetPasswordSuccess(''); }} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-4">
                      <ChevronLeft size={16} /> Geri
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Şifre Belirle 🔒</h2>
                    <p className="text-gray-500 text-sm mt-1">ID numaranızı girin ve şifrenizi oluşturun</p>
                  </div>
                  {setPasswordSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={24} className="text-emerald-600" />
                      </div>
                      <p className="text-emerald-700 font-semibold text-sm">{setPasswordSuccess}</p>
                      <p className="text-emerald-500 text-xs mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Yeni Şifre</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type={showPassword ? 'text' : 'password'} value={setPasswordForm.password} onChange={(e) => setSetPasswordForm({...setPasswordForm, password: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm" placeholder="En az 6 karakter" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={setPasswordForm.confirmPassword}
                            onChange={(e) => setSetPasswordForm({...setPasswordForm, confirmPassword: e.target.value})}
                            onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm ${
                              setPasswordForm.confirmPassword && setPasswordForm.password !== setPasswordForm.confirmPassword ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Şifrenizi tekrar girin"
                          />
                        </div>
                        {setPasswordForm.confirmPassword && setPasswordForm.password !== setPasswordForm.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">Şifreler eşleşmiyor</p>
                        )}
                      </div>
                      <button onClick={handleSetPassword} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm">
                        Şifreyi Kaydet
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} FocusPro · Tüm hakları saklıdır</p>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] pointer-events-none"></div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Lock size={22} className="text-purple-200" /> Şifremi / ID'mi Unuttum
                </h3>
                <button onClick={() => {setShowForgotPasswordModal(false); setForgotPasswordStep(1); setForgotPasswordData({emailOrId: '', code: '', newPassword: ''});}} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors relative z-10">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                
                {forgotPasswordStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-6">Lütfen sisteme kayıtlı olan e-posta adresinizi veya 8 haneli Atomy ID numaranızı girin. Size bir sıfırlama kodu göndereceğiz.</p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta veya Atomy ID</label>
                      <input
                        type="text"
                        value={forgotPasswordData.emailOrId}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, emailOrId: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                        placeholder="Örn: ornek@mail.com veya 12345678"
                      />
                    </div>
                    <button onClick={handleForgotPasswordRequest} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
                      Doğrulama Kodu Gönder
                    </button>
                  </div>
                )}

                {forgotPasswordStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-6">Lütfen e-posta adresinize gönderdiğimiz <strong className="text-purple-600">6 haneli</strong> doğrulama kodunu girin.</p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Doğrulama Kodu</label>
                      <input
                        type="text"
                        value={forgotPasswordData.code}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, code: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-center tracking-widest text-xl font-bold transition-all"
                        placeholder="••••••"
                        maxLength={6}
                      />
                    </div>
                    <button onClick={handleVerifyResetCode} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
                      Kodu Doğrula
                    </button>
                    <button onClick={() => setForgotPasswordStep(1)} className="w-full text-center text-xs text-gray-500 hover:text-purple-600 font-medium">
                      Geri Dön
                    </button>
                  </div>
                )}

                {forgotPasswordStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-6">Kod doğrulandı! Lütfen hesabınız için yeni bir şifre belirleyin.</p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Yeni Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={forgotPasswordData.newPassword}
                          onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm pr-12"
                          placeholder="En az 6 karakter"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleResetPassword} className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm">
                      Yeni Şifreyi Kaydet
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const stats = calculateStats();

  // MAIN APP UI
  return (
    <>
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      {/* Sidebar - Only visible on desktop */}
      <div className={`hidden md:flex ${sidebarOpen ? 'w-56' : 'w-20'} ${darkMode ? 'bg-[#2a2a2a]' : 'bg-gradient-to-b from-purple-700 to-indigo-800'} text-white transition-all duration-300 flex-col flex-shrink-0 relative h-full z-50`}>
        <div className="p-4 flex items-center justify-center">
          {sidebarOpen ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Target size={32} />
                <h1 className="text-xl font-bold">Focus Pro</h1>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* User Mini Profile */}
        <div className={`px-4 pb-4 mb-2 border-b ${darkMode ? 'border-gray-700' : 'border-white/10'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-2 rounded-xl bg-white/5`}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {profileData?.profile_photo ? (
                <img src={profileData.profile_photo} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={16} />
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-white/50 truncate">ID: {formatUserNumber(currentUser?.user_number)}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentPage('calendar')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'calendar' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Calendar size={20} />
            {sidebarOpen && <span>Takvim</span>}
          </button>

          <button
            onClick={() => setCurrentPage('agenda')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'agenda' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Bookmark size={20} />
            {sidebarOpen && <span>Ajanda</span>}
          </button>

          <button
            onClick={() => setCurrentPage('videos')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'videos' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <GraduationCap size={20} />
            {sidebarOpen && <span>Eğitimler</span>}
          </button>



          <button
            onClick={() => setCurrentPage('events')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'events' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <CalendarDays size={20} />
            {sidebarOpen && <span>Etkinlikler</span>}
          </button>

          <button
            onClick={() => setCurrentPage('blogs')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'blogs' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <FileText size={20} />
            {sidebarOpen && <span>Blog & Tavsiyeler</span>}
          </button>

          <button
            onClick={() => setCurrentPage('inbox')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all relative ${
              currentPage === 'inbox' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Mail size={20} />
            {sidebarOpen && <span>Gelen Kutusu</span>}
            {unreadMessageCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessageCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <User size={20} />
            {sidebarOpen && <span>Profilim</span>}
          </button>

          <button
            onClick={() => setCurrentPage('badges')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'badges' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Award size={20} />
            {sidebarOpen && <span>Rozetlerim</span>}
          </button>

          <button
            onClick={() => setCurrentPage('statistics')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'statistics' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>İstatistikler</span>}
          </button>

          {isAdminOrManager(currentUser) && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
                currentPage === 'admin' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Shield size={20} />
              {sidebarOpen && <span>Admin Panel</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg hover:bg-white/10 transition-all`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-4 text-sm text-white/60">
              <p className="font-semibold text-white">{currentUser?.name}</p>
              <p>{currentUser?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col w-full md:ml-0 transition-all duration-300">
        {/* Top Navbar - Arama ve Bildirimler */}
        <div className="bg-white border-b border-gray-200 px-2 md:px-8 py-2 md:py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (result.type === 'video') setCurrentPage('videos');
                        else if (result.type === 'prospect') setCurrentPage('prospects');
                        else if (result.type === 'partner') setCurrentPage('partners');
                        else if (result.type === 'recommendation') setCurrentPage('blogs');
                        else if (result.type === 'blog') setCurrentPage('blogs');
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {result.type === 'video' ? 'Video' :
                           result.type === 'prospect' ? 'Potansiyel' :
                           result.type === 'partner' ? 'Partner' :
                           result.type === 'recommendation' ? 'Tavsiye' :
                           result.type === 'blog' ? 'Blog' : result.type}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{result.data.title || result.data.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications & Dark Mode */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={24} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Henüz bildirim yok
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(notif => {
                        // Determine page based on notification type
                        const getNotificationRouting = (notif) => {
                          const type = notif.type;
                          const text = (notif.title + ' ' + notif.message).toLowerCase();
                          
                          let targetPage = 'dashboard';
                          let targetTab = null;

                          // 1. Backend type kontrolü
                          const typeMap = {
                            'user': 'admin', 'partner': 'partners', 'goal': 'agenda', 'video': 'videos', 'badge': 'badges', 'message': 'inbox', 'task': 'agenda', 'prospect': 'agenda'
                          };
                          if (typeMap[type]) targetPage = typeMap[type];

                          // 2. Metin İçeriği Kontrolü (Eski bildirimler ve type="info"/"success" olanlar için)
                          if (text.includes('rozet')) {
                            targetPage = 'badges';
                          } else if (text.includes('video') || text.includes('eğitim')) {
                            targetPage = 'videos';
                          } else if (text.includes('mesaj') || text.includes('message')) {
                            targetPage = 'inbox';
                          } else if (text.includes('görev') || text.includes('task')) {
                            targetPage = 'agenda';
                            targetTab = 'tasks';
                          } else if (text.includes('hedef') || text.includes('goal')) {
                            targetPage = 'agenda';
                            targetTab = 'goals';
                          } else if (text.includes('aday') || text.includes('prospect')) {
                            targetPage = 'agenda';
                            targetTab = 'prospects';
                          } else if (text.includes('partner') || text.includes('ekip')) {
                            targetPage = 'partners';
                          } else if (text.includes('hoş geldiniz') || text.includes('welcome')) {
                            targetPage = 'dashboard';
                          }

                          // 3. Tipik Agenda Tab düzeltmesi (backend type gelmişse eziyoruz)
                          if (targetPage === 'agenda' && !targetTab) {
                            if (type === 'task') targetTab = 'tasks';
                            else if (type === 'goal') targetTab = 'goals';
                            else if (type === 'prospect') targetTab = 'prospects';
                          }

                          return { targetPage, targetTab };
                        };

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.read) markNotificationRead(notif.id);
                              
                              const { targetPage, targetTab } = getNotificationRouting(notif);
                              
                              setCurrentPage(targetPage);
                              if (targetTab) {
                                setAgendaTab(targetTab);
                              }
                              // Eğer message notification ise, mesaj ID'sini al
                              if (targetPage === 'inbox' && notif.link) {
                                const urlParams = new URLSearchParams(notif.link.split('?')[1]);
                                const messageId = urlParams.get('id');
                                if (messageId) {
                                  setAutoOpenMessageId(messageId);
                                }
                              }
                              setShowNotifications(false);
                            }}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-purple-50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-purple-600' : 'bg-gray-300'}`} />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 text-sm">{notif.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notif.created_at).toLocaleDateString('tr-TR', { 
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-1 py-2 md:p-8 pb-20 md:pb-8 w-full">
          {/* DASHBOARD PAGE */}
          {currentPage === 'dashboard' && (
            <DashboardPage 
              stats={stats}
              dailyHabits={dailyHabits}
              tasks={tasks}
              meetings={meetings}
              currentUser={currentUser}
              onUpdateHabit={updateHabit}
              onNavigate={setCurrentPage}
            />
          )}
          
          {/* VIDEOS PAGE */}
          {/* TRAINING PAGE - YouTube Tarzı Yeni Tasarım */}
          {currentPage === 'videos' && (
            <div className="min-h-screen bg-white dark:bg-gray-900">
              <VideoLibraryPage user={currentUser} />
            </div>
          )}


          {/* TASKS PAGE */}
          {currentPage === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Görevler</h2>
                <button
                  onClick={() => {
                    setShowTaskModal(true);
                    setEditingTask(null);
                    setNewTask({ title: '', date: '', priority: 'medium', status: 'todo', description: '', assignee: '' });
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus size={20} />
                  Yeni Görev
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in_progress', 'done'].map(status => (
                  <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">
                      {status === 'todo' ? 'Yapılacak' : status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                      <span className="ml-2 text-sm text-gray-500">
                        ({tasks.filter(t => t.status === status).length})
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {tasks.filter(t => t.status === status).map(task => (
                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{task.title}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setNewTask(task);
                                  setShowTaskModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{task.date}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                          </div>
                          {status !== 'done' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, status === 'todo' ? 'in_progress' : 'done')}
                              className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700"
                            >
                              {status === 'todo' ? 'Başla' : 'Tamamla'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* EVENTS PAGE - NEW DESIGN */}
          {currentPage === 'events' && (
            <div className="space-y-6">
              {/* Header with Calendar Date Slider */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Etkinlikler</h2>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowEventModal(true);
                        setEditingEvent(null);
                        setNewEvent({ title: '', date: '', time: '', location: '', description: '', max_participants: '', image: '', recurrence: 'none', recurrence_end_date: '' });
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                    >
                      <Plus size={20} />
                      Yeni Etkinlik
                    </button>
                  )}
                </div>

                {/* Date Slider */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <Calendar size={20} className="text-purple-600" />
                    <span className="text-xl font-semibold text-gray-800">
                      {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    Bugün
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter(event => {
                    const eventDate = new Date(event.date);
                    const selected = new Date(selectedDate);
                    return eventDate.toDateString() === selected.toDateString();
                  })
                  .map(event => {
                    const userRegistration = eventRegistrations.find(r => r.event_id === event.id && r.user_id === currentUser.id);
                    const allRegistrations = eventRegistrations.filter(r => r.event_id === event.id);
                    const eventDate = new Date(event.date);
                    const isPast = eventDate < new Date();

                    return (
                      <div 
                        key={event.id} 
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* Event Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-600">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CalendarDays size={64} className="text-white opacity-50" />
                            </div>
                          )}
                          {isPast && (
                            <div className="absolute top-3 right-3 bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm">
                              Geçmiş
                            </div>
                          )}
                        </div>

                        {/* Event Info */}
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-purple-600" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-purple-600" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            {event.max_participants && (
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-purple-600" />
                                <span>{allRegistrations.length}/{event.max_participants} Katılımcı</span>
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          {currentUser?.role !== 'admin' && (
                            userRegistration ? (
                              <div className={`py-2 rounded-lg text-center font-medium text-sm ${
                                userRegistration.status === 'approved' ? 'bg-green-100 text-green-700' :
                                userRegistration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {userRegistration.status === 'approved' ? '✓ Katılıyorsunuz' :
                                 userRegistration.status === 'rejected' ? '✗ Reddedildi' : '⏳ Beklemede'}
                              </div>
                            ) : !isPast && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  registerForEvent(event.id);
                                }}
                                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                              >
                                Katıl
                              </button>
                            )
                          )}

                          {/* Admin: Registration Requests for this Event */}
                          {currentUser?.role === 'admin' && allRegistrations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users size={16} />
                                Katılım Talepleri ({allRegistrations.length})
                              </h4>
                              <div className="space-y-2">
                                {allRegistrations.map(reg => (
                                  <div key={reg.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{reg.user_name}</p>
                                        <p className="text-xs text-gray-500">{reg.user_email}</p>
                                      </div>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {reg.status === 'approved' ? 'Onaylandı' :
                                         reg.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                                      </span>
                                    </div>
                                    {reg.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateRegistrationStatus(reg.id, 'approved');
                                          }}
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded-lg font-medium"
                                        >
                                          Onayla
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateRegistrationStatus(reg.id, 'rejected');
                                          }}
                                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded-lg font-medium"
                                        >
                                          Reddet
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* No Events Message */}
              {events.filter(event => {
                const eventDate = new Date(event.date);
                const selected = new Date(selectedDate);
                return eventDate.toDateString() === selected.toDateString();
              }).length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <CalendarDays size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg">Bu tarihte etkinlik bulunmuyor</p>
                  <p className="text-gray-500 text-sm mt-2">Farklı bir tarih seçmek için yukarıdaki ok butonlarını kullanın</p>
                </div>
              )}
            </div>
          )}

          {/* GOALS PAGE */}
          {currentPage === 'goals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Hedeflerim</h2>
                <button
                  onClick={() => {
                    setShowGoalModal(true);
                    setNewGoal({ title: '', type: 'daily', target: '', deadline: '', current: 0 });
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus size={20} />
                  Yeni Hedef
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                  const progress = (parseInt(goal.current) / parseInt(goal.target)) * 100;
                  return (
                    <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{goal.title}</h3>
                          <span className="text-xs text-gray-500">{goal.type === 'daily' ? 'Günlük' : goal.type === 'weekly' ? 'Haftalık' : 'Aylık'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingGoal(goal);
                              setNewGoal(goal);
                              setShowGoalModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{goal.current} / {goal.target}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {goal.deadline && (
                        <p className="text-sm text-gray-600">📅 Hedef Tarih: {goal.deadline}</p>
                      )}
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    Henüz hedef eklenmemiş
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REASONS PAGE - Vision Board Style */}
          {currentPage === 'reasons' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Nedenlerim - Hayal Panom</h2>
                <button
                  onClick={() => {
                    setEditingReason(null);
                    setShowReasonModal(true);
                    setNewReason({ title: '', description: '', image: '' });
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus size={20} />
                  Yeni Neden
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reasons.map(reason => (
                  <div key={reason.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Image Section */}
                    {reason.image && (
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100">
                        <img 
                          src={reason.image} 
                          alt={reason.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!reason.image && (
                      <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <div className="text-6xl">🎯</div>
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{reason.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingReason(reason);
                              setNewReason(reason);
                              setShowReasonModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteReason(reason.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{reason.description}</p>
                    </div>
                  </div>
                ))}
                {reasons.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">💭</div>
                    <p>Neden bu işi yapıyorsunuz? Hayallerinizi ve nedenlerinizi ekleyin!</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* RECOMMENDATIONS PAGE - Merged with Blogs */}

              {/* Activity Logs Tab - Moved to Admin Panel */}
          {/* INBOX PAGE */}
          {currentPage === 'inbox' && (
            <div>
              {/* Thread List (Ana Görünüm) */}
              {!selectedThread && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Gelen Kutusu</h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => messageAPI.markAllRead().then(() => loadMessages())}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Tümünü Okundu İşaretle
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => setShowSendMessageModal(true)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                        >
                          <Send size={20} />
                          Mesaj Gönder
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thread List (Kişilere Göre Gruplandırılmış) */}
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Henüz mesajınız yok</p>
                      </div>
                    ) : (
                      groupMessagesBySender().map(thread => (
                        <div
                          key={thread.sender_id}
                          onClick={() => setSelectedThread(thread)}
                          className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                            thread.unreadCount > 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {thread.sender_name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-semibold text-lg ${thread.unreadCount > 0 ? 'text-purple-900' : 'text-gray-800'}`}>
                                    {thread.sender_name}
                                  </h3>
                                  {thread.unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-bold">
                                      {thread.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {thread.messages.length} mesaj
                                </p>
                                {/* Son mesaj önizleme */}
                                <p className="text-sm text-gray-700 line-clamp-1 mt-2">
                                  <span className="font-medium">{thread.lastMessage.subject}:</span> {thread.lastMessage.content}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {new Date(thread.lastMessage.created_at).toLocaleDateString('tr-TR', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Thread Detayı (Kişinin Tüm Mesajları) */}
              {selectedThread && (
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedThread.sender_name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedThread.sender_name}</h2>
                        <p className="text-sm text-gray-600">{selectedThread.messages.length} mesaj</p>
                      </div>
                    </div>
                  </div>

                  {/* Mesajlar (WhatsApp Tarzı - Thread Gruplandırılmış) */}
                  <div className="space-y-4">
                    {(() => {
                      // Parent mesajları bul (parent_id olmayan veya kendi parent'ı olan)
                      const parentMessages = selectedThread.messages
                        .filter(msg => !msg.parent_id || msg.parent_id === msg.id)
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                      
                      // Her parent için reply'leri bul
                      return parentMessages.map(parentMsg => {
                        const replies = selectedThread.messages
                          .filter(msg => msg.parent_id === parentMsg.id && msg.id !== parentMsg.id)
                          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                        
                        return (
                          <div
                            key={parentMsg.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                          >
                            {/* Video Yorumu Etiketi */}
                            {parentMsg.subject.includes('Video Yorumu') && (
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-5 py-3 border-b">
                                <div className="flex items-center gap-2">
                                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                    </svg>
                                    Video Yorumu
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{parentMsg.subject}</span>
                                </div>
                              </div>
                            )}

                            {/* Konuşma Alanı (WhatsApp gibi) */}
                            <div className="p-5 space-y-3 bg-gray-50">
                              {/* İlk Mesaj (Kullanıcıdan) */}
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {parentMsg.sender_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-white rounded-lg rounded-tl-none shadow-sm p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold text-sm text-gray-900">
                                        {parentMsg.sender_name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(parentMsg.created_at).toLocaleString('tr-TR', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                      {parentMsg.content}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Cevaplar (Reply'ler) */}
                              {replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-3 pl-8">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                                    {reply.sender_name.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg rounded-tl-none shadow-sm p-4 border border-purple-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm text-purple-900">
                                          {reply.sender_name}
                                        </span>
                                        <span className="text-xs text-purple-600">
                                          {new Date(reply.created_at).toLocaleString('tr-TR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                        {reply.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Alt Bar - Cevapla Butonu */}
                            {currentUser?.role === 'admin' && (
                              <div className="bg-white px-5 py-3 border-t flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {replies.length > 0 ? `${replies.length} cevap` : 'Henüz cevap verilmedi'}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedMessage(parentMsg);
                                    setShowMessageDetailModal(true);
                                    if (!parentMsg.read) markMessageAsRead(parentMsg.id);
                                  }}
                                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                  </svg>
                                  Cevapla
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AGENDA PAGE */}
          {currentPage === 'agenda' && (
            <div className="w-full overflow-x-hidden">
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 px-1">Ajanda</h1>
              
              {/* Tabs - Horizontal Scrollable - ONLY THIS SCROLLS */}
              <div className="mb-4 md:mb-6 relative">
                <div className="overflow-x-auto hide-scrollbar touch-pan-x" style={{WebkitOverflowScrolling: 'touch'}}>
                  <div className="flex gap-1 min-w-max pb-2 px-1 border-b border-gray-200">
                    <button
                      onClick={() => setAgendaTab('tasks')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'tasks' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ListChecks size={16} />
                      Görevler
                    </button>
                    <button
                      onClick={() => setAgendaTab('prospects')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'prospects' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <UserPlus size={16} />
                      İsim Listesi
                    </button>
                    <button
                      onClick={() => setAgendaTab('goals')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'goals' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Target size={16} />
                      Hedefler
                    </button>
                    <button
                      onClick={() => setAgendaTab('habits')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'habits' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      Alışkanlıklar
                    </button>
                    <button
                      onClick={() => setAgendaTab('dreams')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'dreams' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Star size={16} />
                      Hayaller
                    </button>
                    <button
                      onClick={() => setAgendaTab('character')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'character' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <User size={16} />
                      Karakter
                    </button>
                    <button
                      onClick={() => setAgendaTab('lifeprofile')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        agendaTab === 'lifeprofile' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Activity size={16} />
                      Yaşam Tablosu
                    </button>
                  </div>
                </div>
                {/* Scroll indicator gradient */}
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden"></div>
              </div>

              {/* Tab Content - FIXED, NO HORIZONTAL SCROLL */}
              <div className="px-1 overflow-x-hidden">
                {agendaTab === 'tasks' && (
                  <div>
                    {/* TASKS CONTENT - Will be moved here */}
                    <div className="mb-4 md:mb-6 flex items-center justify-between">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-800">Görevler</h2>
                      <button
                        onClick={() => {
                          setShowTaskModal(true);
                          setEditingTask(null);
                          setNewTask({ title: '', description: '', date: '', status: 'todo' });
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                      >
                        <Plus size={20} />
                        Yeni Görev
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['todo', 'doing', 'done'].map(status => (
                        <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                          <h3 className="font-bold text-gray-700 mb-4 text-center">
                            {status === 'todo' ? '📝 Yapılacak' : status === 'doing' ? '⚡ Devam Eden' : '✅ Tamamlandı'}
                          </h3>
                          <div className="space-y-3">
                            {tasks.filter(t => t.status === status).map(task => (
                              <div key={task.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                {task.date && (
                                  <p className="text-xs text-gray-500 mt-2">📅 {task.date}</p>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => {
                                      setEditingTask(task);
                                      setNewTask(task);
                                      setShowTaskModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agendaTab === 'prospects' && (
                  <ProspectsPage user={currentUser} />
                )}

                {agendaTab === 'goals' && (
                  <div>
                    {/* GOALS CONTENT */}
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">Hedeflerim</h2>
                      <button
                        onClick={() => {
                          setShowGoalModal(true);
                          setEditingGoal(null);
                          setNewGoal({ title: '', type: 'daily', target: '', deadline: '', current: 0, done: false });
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                      >
                        <Plus size={20} />
                        Yeni Hedef
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {goals.map(goal => (
                        <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-800">{goal.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              goal.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                              goal.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {goal.type === 'daily' ? 'Günlük' : goal.type === 'weekly' ? 'Haftalık' : 'Aylık'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">🎯 {goal.target}</p>
                          {goal.deadline && (
                            <p className="text-sm text-gray-500 mb-3">📅 {goal.deadline}</p>
                          )}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>İlerleme</span>
                              <span>{goal.current || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${goal.current || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          {goal.done && (
                            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                              <span className="text-sm text-green-700 font-semibold">✅ Tamamlandı!</span>
                            </div>
                          )}
                          <div className="flex gap-2 pt-3 border-t">
                            <button
                              onClick={() => {
                                setEditingGoal(goal);
                                setNewGoal(goal);
                                setShowGoalModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agendaTab === 'dreams' && (
                  <DreamsPage user={currentUser} />
                )}

                {agendaTab === 'dreams_old_wizard' && (
                  <div>
                    {/* DREAM PRIORITY WIZARD */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">💭 Değer Önceliklendirme</h2>
                      <p className="text-gray-600">Hayallerinizi keşfedin ve önceliklerinizi belirleyin</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            dreamStep === step ? 'bg-gray-800 text-white' :
                            dreamStep > step ? 'bg-gray-600 text-white' :
                            'bg-gray-200 text-gray-500'
                          }`}>
                            {dreamStep > step ? '✓' : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-24 h-1 ${dreamStep > step ? 'bg-gray-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Initial Dreams Input */}
                    {dreamStep === 1 && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Adım 1: Hayallerinizi Belirleyin
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Hayatta en çok değer verdiğiniz, sizi heyecanlandıran 10 şeyi yazın
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {dreamData.initial_dreams.map((dream, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {index + 1}. Hayaliniz
                              </label>
                              <input
                                type="text"
                                value={dream}
                                onChange={(e) => {
                                  const newDreams = [...dreamData.initial_dreams];
                                  newDreams[index] = e.target.value;
                                  setDreamData({...dreamData, initial_dreams: newDreams});
                                }}
                                placeholder={`Örn: ${['Finansal özgürlük', 'Aile ile zaman', 'Dünya turu', 'Kendi işim', 'Lüks araç', 'Ev sahibi olmak', 'Erken emeklilik', 'Çocukların eğitimi', 'Sağlıklı yaşam', 'Yardım etmek'][index]}`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const filledDreams = dreamData.initial_dreams.filter(d => d.trim());
                            if (filledDreams.length < 5) {
                              alert('Lütfen en az 5 hayal girin!');
                              return;
                            }
                            setEliminationList(dreamData.initial_dreams.filter(d => d.trim()));
                            setDreamStep(2);
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          Devam Et →
                        </button>
                      </div>
                    )}

                    {/* Step 2: Elimination (10→1) */}
                    {dreamStep === 2 && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Adım 2: Önceliklendirme ({eliminationList.length} → 1)
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {eliminationList.length > 3 
                            ? `Aşağıdaki listeden sizin için EN AZ ÖNEMLİ olanı seçip çıkarın. Kalan ${eliminationList.length} maddeden ${eliminationList.length - 1} tanesini seçmeye devam edin.`
                            : 'Son ${eliminationList.length} madde kaldı! En az önemlisini çıkarın.'}
                        </p>
                        <div className="space-y-3 mb-6">
                          {eliminationList.map((dream, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-colors"
                            >
                              <span className="font-medium text-gray-800">{dream}</span>
                              <button
                                onClick={() => {
                                  const newList = eliminationList.filter((_, i) => i !== index);
                                  setEliminationList(newList);
                                  if (newList.length === 1) {
                                    setDreamData({...dreamData, final_priorities: newList});
                                    setDreamStep(3);
                                  }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                Çıkar
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setDreamStep(1)}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          ← Geri Dön
                        </button>
                      </div>
                    )}

                    {/* Step 3: Goal Setting */}
                    {dreamStep === 3 && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Adım 3: Hedef Belirleme
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Atomy ticaretinden hedeflerinizi belirleyin
                        </p>
                        <div className="space-y-6 mb-6">
                          <div>
                            <label className="block text-lg font-medium text-gray-700 mb-3">
                              1. Minimum ne kadar kazanç sizi heyecanlandırır?
                            </label>
                            <input
                              type="text"
                              value={dreamData.target_income}
                              onChange={(e) => setDreamData({...dreamData, target_income: e.target.value})}
                              placeholder="Örn: 10,000 TL veya 1,000 USD"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-lg font-medium text-gray-700 mb-3">
                              2. Bu gelire en geç kaç ayda ulaşmak istersiniz?
                            </label>
                            <input
                              type="text"
                              value={dreamData.target_months}
                              onChange={(e) => setDreamData({...dreamData, target_months: e.target.value})}
                              placeholder="Örn: 6 ay, 12 ay"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-lg font-medium text-gray-700 mb-3">
                              3. Mevcut düzeninizi bozmadan günde kaç saat ayırabilirsiniz?
                            </label>
                            <input
                              type="text"
                              value={dreamData.daily_hours}
                              onChange={(e) => setDreamData({...dreamData, daily_hours: e.target.value})}
                              placeholder="Örn: 2-3 saat"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setDreamStep(2)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                          >
                            ← Geri
                          </button>
                          <button
                            onClick={async () => {
                              if (!dreamData.target_income || !dreamData.target_months || !dreamData.daily_hours) {
                                alert('Lütfen tüm alanları doldurun!');
                                return;
                              }
                              await saveDreamPriority();
                              setDreamStep(4);
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                          >
                            Kaydet ve Bitir →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Results */}
                    {dreamStep === 4 && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
                          <h3 className="text-3xl font-bold mb-4">🎯 Tebrikler!</h3>
                          <p className="text-lg">Öncelikleriniz ve hedefleriniz belirlendi</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h4 className="text-2xl font-bold text-gray-800 mb-4">En Önemli Önceliğiniz</h4>
                          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400 rounded-xl p-6">
                            <p className="text-3xl font-bold text-gray-800 text-center">
                              {dreamData.final_priorities[0]}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h4 className="text-2xl font-bold text-gray-800 mb-4">Hedefleriniz</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                              <p className="text-sm text-gray-600 mb-2">Hedef Gelir</p>
                              <p className="text-2xl font-bold text-blue-600">{dreamData.target_income}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                              <p className="text-sm text-gray-600 mb-2">Hedef Süre</p>
                              <p className="text-2xl font-bold text-green-600">{dreamData.target_months}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                              <p className="text-sm text-gray-600 mb-2">Günlük Zaman</p>
                              <p className="text-2xl font-bold text-purple-600">{dreamData.daily_hours}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDreamStep(1);
                            setDreamData({
                              initial_dreams: Array(10).fill(''),
                              final_priorities: [],
                              target_income: '',
                              target_months: '',
                              daily_hours: ''
                            });
                            setEliminationList([]);
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                        >
                          Yeniden Başla
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {agendaTab === 'habits' && (
                  <HabitsPage user={currentUser} />
                )}

                {agendaTab === 'character' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">🧠 Karakter Analizi</h2>
                      <p className="text-gray-600">Mevcut durumunuzu analiz edin ve geleceğinizi planlayın</p>
                    </div>

                    {/* Character Analysis Sub-Tabs */}
                    <div className="mb-6 flex gap-2 border-b border-gray-200">
                      <button
                        onClick={() => setCharacterTab('current')}
                        className={`px-6 py-3 font-semibold transition-all ${
                          characterTab === 'current' 
                            ? 'text-purple-600 border-b-2 border-purple-600' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        📍 Mevcut Durum Analizi
                      </button>
                      <button
                        onClick={() => setCharacterTab('future')}
                        className={`px-6 py-3 font-semibold transition-all ${
                          characterTab === 'future' 
                            ? 'text-green-600 border-b-2 border-green-600' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        🎯 İstenilen Karakter
                      </button>
                      <button
                        onClick={() => {
                          setCharacterTab('gap');
                          if (aiAnalysisResult && futureAiAnalysisResult) {
                            analyzeGap();
                          }
                        }}
                        disabled={!aiAnalysisResult || !futureAiAnalysisResult}
                        className={`px-6 py-3 font-semibold transition-all ${
                          characterTab === 'gap' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : aiAnalysisResult && futureAiAnalysisResult
                              ? 'text-gray-600 hover:text-gray-800'
                              : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        📊 Karşılaştırma & Plan
                      </button>
                    </div>

                    {/* CURRENT CHARACTER TAB */}
                    {characterTab === 'current' && (
                      <div>
                        <div className="mb-4 bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                          <p className="text-sm text-purple-800">
                            <strong>Mevcut Durum Analizi:</strong> Bugünkü karakterinizi ve kişiliğinizi tanıyın
                          </p>
                        </div>

                        {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              characterStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {step}
                            </div>
                            {step < 4 && <div className={`w-32 h-1 mx-2 ${
                              characterStep > step ? 'bg-purple-600' : 'bg-gray-200'
                            }`} />}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Son Olaylar</span>
                        <span>İdeal Gün</span>
                        <span>90 Gün Planı</span>
                        <span>Analiz</span>
                      </div>
                    </div>

                    {/* Step 1: Recent Events */}
                    {characterStep === 1 && (
                      <div className="bg-white rounded-xl p-8 shadow-md">
                        <h3 className="text-2xl font-bold text-purple-700 mb-6">📝 Son Zamanlarda Yaşadığınız Olaylar</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">😊 Sizi mutlu eden bir olay</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="3"
                              value={characterData.recent_events.happy}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                recent_events: { ...characterData.recent_events, happy: e.target.value }
                              })}
                              placeholder="Sizi mutlu eden bir olayı anlatın..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">😢 Sizi üzen bir olay</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="3"
                              value={characterData.recent_events.sad}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                recent_events: { ...characterData.recent_events, sad: e.target.value }
                              })}
                              placeholder="Sizi üzen bir olayı anlatın..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">😠 Sizi kızdıran bir olay</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="3"
                              value={characterData.recent_events.angry}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                recent_events: { ...characterData.recent_events, angry: e.target.value }
                              })}
                              placeholder="Sizi kızdıran bir olayı anlatın..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">⏳ Sabrınızı zorlayan bir olay</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="3"
                              value={characterData.recent_events.patience_heavy}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                recent_events: { ...characterData.recent_events, patience_heavy: e.target.value }
                              })}
                              placeholder="Sabrınızı zorlayan bir olayı anlatın..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🏆 Sizi gururlandıran bir olay</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="3"
                              value={characterData.recent_events.proud}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                recent_events: { ...characterData.recent_events, proud: e.target.value }
                              })}
                              placeholder="Sizi gururlandıran bir olayı anlatın..."
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setCharacterStep(2)}
                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                          >
                            Sonraki Adım →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Ideal Day */}
                    {characterStep === 2 && (
                      <div className="bg-white rounded-xl p-8 shadow-md">
                        <h3 className="text-2xl font-bold text-purple-700 mb-6">🌟 İdeal Gününüz</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🌅 Sabah nasıl başlar?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.morning}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, morning: e.target.value }
                              })}
                              placeholder="İdeal gününüzde sabah nasıl başlar?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">☀️ Öğlen ne yaparsınız?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.afternoon}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, afternoon: e.target.value }
                              })}
                              placeholder="Öğlen saatlerinde ne yaparsınız?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🌆 Akşam nasıl geçer?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.evening}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, evening: e.target.value }
                              })}
                              placeholder="Akşam saatleriniz nasıl geçer?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🌙 Uyumadan önce ne yaparsınız?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.before_sleep}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, before_sleep: e.target.value }
                              })}
                              placeholder="Uyku öncesi rutininiz..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">💬 İnsanlar sizin için ne der?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.peoples_say}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, peoples_say: e.target.value }
                              })}
                              placeholder="İdeal gününüzde insanlar sizin için ne der?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">❤️ Nasıl hissedersiniz?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.feelings}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, feelings: e.target.value }
                              })}
                              placeholder="Bu günün sonunda nasıl hissedersiniz?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">⭐ Hangi değerler öne çıkar?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ideal_day.values}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ideal_day: { ...characterData.ideal_day, values: e.target.value }
                              })}
                              placeholder="İdeal gününüzde hangi değerler önemli?"
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                          <button
                            onClick={() => setCharacterStep(1)}
                            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                          >
                            ← Geri
                          </button>
                          <button
                            onClick={() => setCharacterStep(3)}
                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                          >
                            Sonraki Adım →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: 90 Day Plan */}
                    {characterStep === 3 && (
                      <div className="bg-white rounded-xl p-8 shadow-md">
                        <h3 className="text-2xl font-bold text-purple-700 mb-6">🎯 90 Gün Planınız</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">👤 Ana kimliğiniz ne olacak?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.main_identity}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, main_identity: e.target.value }
                              })}
                              placeholder="90 gün sonra nasıl biri olmak istiyorsunuz?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">📅 Haftalık aksiyonunuz nedir?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.weekly_action}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, weekly_action: e.target.value }
                              })}
                              placeholder="Her hafta yapacağınız ana aksiyon..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🚧 Karşılaşabileceğiniz engeller</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.obstacles}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, obstacles: e.target.value }
                              })}
                              placeholder="Hangi zorluklar çıkabilir?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🔄 Plan B nedir?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.plan_b}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, plan_b: e.target.value }
                              })}
                              placeholder="İşler ters giderse ne yaparsınız?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">✅ Haftalık kontrol nasıl?</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.weekly_check_in}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, weekly_check_in: e.target.value }
                              })}
                              placeholder="Kendinizi haftalık nasıl kontrol edeceksiniz?"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">🚀 İlk hafta hedefleriniz</label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              rows="2"
                              value={characterData.ninety_day_plan.first_week}
                              onChange={(e) => setCharacterData({
                                ...characterData,
                                ninety_day_plan: { ...characterData.ninety_day_plan, first_week: e.target.value }
                              })}
                              placeholder="İlk haftada ne yapacaksınız?"
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                          <button
                            onClick={() => setCharacterStep(2)}
                            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                          >
                            ← Geri
                          </button>
                          <button
                            onClick={analyzeCharacter}
                            disabled={isAnalyzing}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                          >
                            {isAnalyzing ? '🔄 Analiz Ediliyor...' : '🧠 AI ile Analiz Et'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Results */}
                    {characterStep === 4 && aiAnalysisResult && (
                      <div className="bg-white rounded-xl p-8 shadow-md">
                        <h3 className="text-2xl font-bold text-purple-700 mb-6">🎉 Karakter Analizi Sonuçlarınız</h3>
                        <div className="prose max-w-none mb-6">
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg whitespace-pre-wrap">
                            {aiAnalysisResult}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={saveCharacterAnalysis}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                          >
                            💾 Analizi Kaydet
                          </button>
                          <button
                            onClick={() => {
                              setCharacterStep(1);
                              setAiAnalysisResult(null);
                              setCharacterData({
                                recent_events: { happy: '', sad: '', angry: '', patience_heavy: '', proud: '' },
                                ideal_day: { morning: '', afternoon: '', evening: '', before_sleep: '', peoples_say: '', feelings: '', values: '' },
                                ninety_day_plan: { main_identity: '', weekly_action: '', obstacles: '', plan_b: '', weekly_check_in: '', first_week: '' },
                                ai_insights: ''
                              });
                            }}
                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                          >
                            🔄 Yeni Analiz Yap
                          </button>
                        </div>
                      </div>
                    )}
                      </div>
                    )}

                    {/* FUTURE CHARACTER TAB */}
                    {characterTab === 'future' && (
                      <div>
                        <div className="mb-4 bg-green-50 border-l-4 border-green-600 p-4 rounded">
                          <p className="text-sm text-green-800">
                            <strong>İstenilen Karakter:</strong> 5+ yıl sonra nasıl bir insan olmak istiyorsunuz?
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-2">
                            {[1, 2, 3, 4].map((step) => (
                              <div key={step} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  futureCharacterStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {step}
                                </div>
                                {step < 4 && <div className={`w-32 h-1 mx-2 ${
                                  futureCharacterStep > step ? 'bg-green-600' : 'bg-gray-200'
                                }`} />}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Geleceğin Karakteri</span>
                            <span>Yaşam Vizyonu</span>
                            <span>Dönüşüm Planı</span>
                            <span>Analiz</span>
                          </div>
                        </div>

                        {/* Future Step 1: Character Traits */}
                        {futureCharacterStep === 1 && (
                          <div className="bg-white rounded-xl p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-green-700 mb-6">🎯 Geleceğin Karakteri</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  ✨ 5 yıl sonra kendinizi tanımlarken kullanmak istediğiniz 5 kelime
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                  {futureCharacterData.character_traits.keywords.map((keyword, index) => (
                                    <input
                                      key={index}
                                      type="text"
                                      className="w-full p-3 border border-gray-300 rounded-lg text-center"
                                      placeholder={`Kelime ${index + 1}`}
                                      value={keyword}
                                      onChange={(e) => {
                                        const newKeywords = [...futureCharacterData.character_traits.keywords];
                                        newKeywords[index] = e.target.value;
                                        setFutureCharacterData({
                                          ...futureCharacterData,
                                          character_traits: { ...futureCharacterData.character_traits, keywords: newKeywords }
                                        });
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🎭 Hangi kişilik özelliklerine sahip olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.character_traits.personality_traits}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    character_traits: { ...futureCharacterData.character_traits, personality_traits: e.target.value }
                                  })}
                                  placeholder="Örn: Sakin, özgüvenli, lider, yaratıcı, disiplinli..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  💪 Hangi güçlü yönlere sahip olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.character_traits.strengths}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    character_traits: { ...futureCharacterData.character_traits, strengths: e.target.value }
                                  })}
                                  placeholder="Güçlü yönlerinizi tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  ❤️ Duygusal olarak nasıl biri olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.character_traits.emotional_state}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    character_traits: { ...futureCharacterData.character_traits, emotional_state: e.target.value }
                                  })}
                                  placeholder="Duygusal durumunuzu tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🧠 Zihinsel olarak hangi yeteneklere sahip olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.character_traits.mental_abilities}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    character_traits: { ...futureCharacterData.character_traits, mental_abilities: e.target.value }
                                  })}
                                  placeholder="Zihinsel yeteneklerinizi tanımlayın..."
                                />
                              </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => setFutureCharacterStep(2)}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                              >
                                Sonraki Adım →
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Future Step 2: Life Vision - WILL ADD IN NEXT PART */}
                        {futureCharacterStep === 2 && (
                          <div className="bg-white rounded-xl p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-green-700 mb-6">🌟 Gelecekteki Yaşam Vizyonu</h3>
                            <p className="text-gray-600 mb-6">5 yıl sonraki hayatınızı detaylı olarak tanımlayın</p>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🏡 5 yıl sonra hayatınız nasıl görünüyor?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.life_overview}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, life_overview: e.target.value }
                                  })}
                                  placeholder="Genel yaşam görünümünüzü tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  👥 İnsanlarla ilişkileriniz nasıl olmalı?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.relationships}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, relationships: e.target.value }
                                  })}
                                  placeholder="İlişkilerinizi tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  💼 Kariyerinizde nerede olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.career}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, career: e.target.value }
                                  })}
                                  placeholder="Kariyer hedeflerinizi tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🎨 Hangi alanlarda ustalaşmış olmak istersiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.mastery_areas}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, mastery_areas: e.target.value }
                                  })}
                                  placeholder="Uzmanlık alanlarınızı tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  ⚖️ Hangi değerleri benimsemiş olmalısınız?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.core_values}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, core_values: e.target.value }
                                  })}
                                  placeholder="Değerlerinizi tanımlayın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🌟 Çevreniz sizi nasıl tanımlasın?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.life_vision.social_perception}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    life_vision: { ...futureCharacterData.life_vision, social_perception: e.target.value }
                                  })}
                                  placeholder="Sosyal algınızı tanımlayın..."
                                />
                              </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                              <button
                                onClick={() => setFutureCharacterStep(1)}
                                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                              >
                                ← Geri
                              </button>
                              <button
                                onClick={() => setFutureCharacterStep(3)}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                              >
                                Sonraki Adım →
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Future Step 3: Transformation Plan - WILL ADD IN NEXT PART */}
                        {futureCharacterStep === 3 && (
                          <div className="bg-white rounded-xl p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-green-700 mb-6">🔄 Dönüşüm Planı</h3>
                            <p className="text-gray-600 mb-6">Mevcut halinizden ideal halinize geçmek için plan yapın</p>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🔄 Mevcut halinizden ideal halinize geçmek için neleri değiştirmelisiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.changes_needed}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, changes_needed: e.target.value }
                                  })}
                                  placeholder="Değişmesi gerekenleri yazın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  📚 Hangi alışkanlıkları edinmelisiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.habits_to_gain}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, habits_to_gain: e.target.value }
                                  })}
                                  placeholder="Kazanılacak alışkanlıkları yazın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🚫 Hangi alışkanlıklardan kurtulmalısınız?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.habits_to_remove}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, habits_to_remove: e.target.value }
                                  })}
                                  placeholder="Bırakılacak alışkanlıkları yazın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🎓 Hangi becerileri öğrenmelisiniz?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.skills_to_learn}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, skills_to_learn: e.target.value }
                                  })}
                                  placeholder="Öğrenilecek becerileri yazın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  👨‍🏫 Kimlerden mentorluk almalısınız?
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.mentors}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, mentors: e.target.value }
                                  })}
                                  placeholder="Mentorları yazın..."
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                  🚀 İlk yıl hedefleriniz
                                </label>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  rows="3"
                                  value={futureCharacterData.transformation_plan.first_year_actions}
                                  onChange={(e) => setFutureCharacterData({
                                    ...futureCharacterData,
                                    transformation_plan: { ...futureCharacterData.transformation_plan, first_year_actions: e.target.value }
                                  })}
                                  placeholder="İlk yıl aksiyonlarınızı yazın..."
                                />
                              </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                              <button
                                onClick={() => setFutureCharacterStep(2)}
                                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                              >
                                ← Geri
                              </button>
                              <button
                                onClick={analyzeFutureCharacter}
                                disabled={isAnalyzingFuture}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
                              >
                                {isAnalyzingFuture ? '🔄 Analiz Ediliyor...' : '🧠 AI ile Analiz Et'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Future Step 4: Results */}
                        {futureCharacterStep === 4 && futureAiAnalysisResult && (
                          <div className="bg-white rounded-xl p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-green-700 mb-6">🎉 Gelecek Karakter Analizi Sonuçlarınız</h3>
                            <div className="prose max-w-none mb-6">
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg whitespace-pre-wrap">
                                {futureAiAnalysisResult}
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={saveFutureCharacter}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                              >
                                💾 Profili Kaydet
                              </button>
                              <button
                                onClick={() => {
                                  setFutureCharacterStep(1);
                                  setFutureAiAnalysisResult(null);
                                }}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                              >
                                🔄 Yeni Profil Oluştur
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GAP ANALYSIS TAB */}
                    {characterTab === 'gap' && (
                      <div>
                        <div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Karşılaştırma & Plan:</strong> Mevcut durumunuz ile hedefleriniz arasındaki farkları görün
                          </p>
                        </div>

                        {isAnalyzingGap && (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔄</div>
                            <p className="text-xl text-gray-600">Gap Analizi yapılıyor...</p>
                          </div>
                        )}

                        {gapAnalysisResult && !isAnalyzingGap && (
                          <div className="bg-white rounded-xl p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-blue-700 mb-6">📊 Gap Analizi ve Roadmap</h3>
                            <div className="prose max-w-none mb-6">
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg whitespace-pre-wrap">
                                {gapAnalysisResult}
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => window.print()}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                              >
                                🖨️ Yazdır
                              </button>
                              <button
                                onClick={analyzeGap}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                              >
                                🔄 Yeniden Analiz Et
                              </button>
                            </div>
                          </div>
                        )}

                        {!gapAnalysisResult && !isAnalyzingGap && (
                          <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Gap Analizi İçin Hazır Değilsiniz</h3>
                            <p className="text-gray-600 mb-4">
                              Önce &quot;Mevcut Durum Analizi&quot; ve &quot;İstenilen Karakter&quot; sekmelerini tamamlayın
                            </p>
                            <div className="flex justify-center gap-4">
                              <button
                                onClick={() => setCharacterTab('current')}
                                disabled={aiAnalysisResult}
                                className={`px-6 py-3 font-semibold rounded-lg ${
                                  aiAnalysisResult
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                              >
                                {aiAnalysisResult ? '✅ Mevcut Durum Tamamlandı' : '📍 Mevcut Durum Analizi Yap'}
                              </button>
                              <button
                                onClick={() => setCharacterTab('future')}
                                disabled={futureAiAnalysisResult}
                                className={`px-6 py-3 font-semibold rounded-lg ${
                                  futureAiAnalysisResult
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {futureAiAnalysisResult ? '✅ İstenilen Karakter Tamamlandı' : '🎯 İstenilen Karakter Tanımla'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {agendaTab === 'lifeprofile' && (
                  <FullLifeProfileForm
                    currentUser={currentUser}
                    currentState={currentLifeState}
                    setCurrentState={setCurrentLifeState}
                    futureState={futureLifeState}
                    setFutureState={setFutureLifeState}
                    actionPlan={actionPlan90}
                    setActionPlan={setActionPlan90}
                    onAnalyzeCurrent={analyzeCurrentLife}
                    onAnalyzeFuture={analyzeFutureLife}
                    onAnalyzeGap={analyzeFullGap}
                    onSave={saveFullLifeProfile}
                    currentAiAnalysis={currentAiAnalysis}
                    futureAiAnalysis={futureAiAnalysis}
                    gapAnalysis={fullGapAnalysis}
                    isAnalyzingCurrent={isAnalyzingCurrentLife}
                    isAnalyzingFuture={isAnalyzingFutureLife}
                    isAnalyzingGap={isAnalyzingFullGap}
                  />
                )}
              </div>
            </div>
          )}

          {/* HAYALLER PAGE */}
          {/* BADGES PAGE */}
          {currentPage === 'badges' && (
            <BadgeCollection currentUser={currentUser} />
          )}

          {/* STATISTICS PAGE */}
          {currentPage === 'statistics' && (
            <StatisticsPage user={currentUser} preSelectUserId={statsPreselectedUser} onClearPreselect={() => setStatsPreselectedUser(null)} />
          )}

          {/* BLOGS PAGE */}
          {currentPage === 'blogs' && (
            <BlogPage user={currentUser} />
          )}


          {/* BLOG DETAIL VIEW */}
          {currentPage === 'blogs' && selectedBlog && (
            <div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="mb-6 flex items-center gap-2 text-purple-600 hover:underline"
              >
                <ChevronLeft size={20} />
                Geri Dön
              </button>

              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
                {selectedBlog.cover_image && (
                  <img 
                    src={selectedBlog.cover_image} 
                    alt={selectedBlog.title}
                    className="w-full h-96 object-cover"
                  />
                )}
                <div className="p-12">
                  {selectedBlog.category && (
                    <span className="inline-block text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-4">
                      {selectedBlog.category}
                    </span>
                  )}
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedBlog.title}</h1>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedBlog.content}
                  </div>
                </div>
              </article>
            </div>
          )}


          {/* CALENDAR PAGE */}
          {currentPage === 'calendar' && (
            <div>
              {/* Mobile Overlay for outside click */}
              {showMobileCalendar && (
                <div 
                  className="fixed inset-0 z-40 sm:hidden bg-black bg-opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileCalendar(false);
                  }}
                />
              )}

              {/* Page Title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Takvim</h2>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setCalendarCreateMenuPos({ x: rect.left, y: rect.bottom + 8 });
                      setCalendarSlotInfo(null);
                      setShowCalendarCreateMenu(v => !v);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md transition-all"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Yeni Oluştur</span>
                  </button>
                </div>
              </div>

              {/* Google Calendar-style Quick Create Menu */}
              {showCalendarCreateMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCalendarCreateMenu(false)} />
                  <div
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    style={{ top: calendarCreateMenuPos.y, left: calendarCreateMenuPos.x, minWidth: 220 }}
                  >
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ne oluşturmak istersiniz?</p>
                    </div>
                    {[
                      {
                        key: 'event',
                        icon: '🗓',
                        label: 'Etkinlik',
                        sub: 'Duyuru ve toplantı etkinliği',
                        color: 'bg-purple-50 hover:bg-purple-100',
                        iconBg: 'bg-purple-100',
                        action: () => {
                          setShowCalendarCreateMenu(false);
                          setEditingEvent(null);
                          const dateStr = calendarSlotInfo ? moment(calendarSlotInfo.start).format('YYYY-MM-DD') : '';
                          const timeStr = calendarSlotInfo ? moment(calendarSlotInfo.start).format('HH:mm') : '';
                          setNewEvent({ title: '', date: dateStr, time: timeStr, location: '', description: '', max_participants: '', recurrence: 'none', recurrence_end_date: '' });
                          setShowEventModal(true);
                        }
                      },
                      {
                        key: 'meeting',
                        icon: '👤',
                        label: 'Randevu',
                        sub: 'Kişisel veya iş görüşmesi',
                        color: 'bg-blue-50 hover:bg-blue-100',
                        iconBg: 'bg-blue-100',
                        action: () => {
                          setShowCalendarCreateMenu(false);
                          setEditingMeeting(null);
                          const dateStr = calendarSlotInfo ? moment(calendarSlotInfo.start).format('YYYY-MM-DD') : '';
                          const startTime = calendarSlotInfo ? moment(calendarSlotInfo.start).format('HH:mm') : '';
                          const endTime = calendarSlotInfo ? moment(calendarSlotInfo.end).format('HH:mm') : '';
                          setNewMeeting({ title: '', date: dateStr, start_time: startTime, end_time: endTime, person: '', notes: '', status: 'scheduled', category: 'work', color: '#3b82f6', all_day: false, recurrence: 'none', recurrence_end_date: '' });
                          setShowMeetingModal(true);
                        }
                      },
                      {
                        key: 'task',
                        icon: '✅',
                        label: 'Görev',
                        sub: 'Yapılacaklar listesi görevi',
                        color: 'bg-green-50 hover:bg-green-100',
                        iconBg: 'bg-green-100',
                        action: () => {
                          setShowCalendarCreateMenu(false);
                          const dateStr = calendarSlotInfo ? moment(calendarSlotInfo.start).format('YYYY-MM-DD') : '';
                          setNewTask({ title: '', date: dateStr, priority: 'medium', status: 'todo', description: '', assignee: '' });
                          setShowTaskModal(true);
                        }
                      }
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${item.color}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${item.iconBg} flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                      </button>
                    ))}
                    <div className="h-2" />
                  </div>
                </>
              )}


              {/* Calendar Navigation Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          let newDate;
                          if (calendarView === 'month') {
                            newDate = moment(currentDate).subtract(1, 'month').toDate();
                          } else if (calendarView === 'week' || calendarView === 'work_week') {
                            newDate = moment(currentDate).subtract(1, 'week').toDate();
                          } else if (calendarView === 'day') {
                            newDate = moment(currentDate).subtract(1, 'day').toDate();
                          } else {
                            newDate = moment(currentDate).subtract(1, 'month').toDate();
                          }
                          setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Önceki"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          let newDate;
                          if (calendarView === 'month') {
                            newDate = moment(currentDate).add(1, 'month').toDate();
                          } else if (calendarView === 'week' || calendarView === 'work_week') {
                            newDate = moment(currentDate).add(1, 'week').toDate();
                          } else if (calendarView === 'day') {
                            newDate = moment(currentDate).add(1, 'day').toDate();
                          } else {
                            newDate = moment(currentDate).add(1, 'month').toDate();
                          }
                          setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Sonraki"
                      >
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                    
                    {/* Date Display - Dynamic based on view */}
                    <div className="flex items-center gap-2 relative">
                      {/* Desktop: Normal display */}
                      <h3 className="hidden sm:block text-lg sm:text-2xl font-semibold text-gray-800">
                        {calendarView === 'month' && moment(currentDate).format('MMMM YYYY')}
                        {calendarView === 'week' && `${moment(currentDate).startOf('week').format('DD MMM')} - ${moment(currentDate).endOf('week').format('DD MMM YYYY')}`}
                        {calendarView === 'work_week' && `${moment(currentDate).startOf('isoWeek').format('DD MMM')} - ${moment(currentDate).endOf('isoWeek').subtract(2, 'days').format('DD MMM YYYY')}`}
                        {calendarView === 'day' && moment(currentDate).format('DD MMMM YYYY')}
                        {calendarView === 'agenda' && moment(currentDate).format('MMMM YYYY')}
                      </h3>

                      {/* Mobile: Clickable dropdown */}
                      <button
                        onClick={() => setShowMobileCalendar(!showMobileCalendar)}
                        className="sm:hidden flex items-center gap-1 text-lg font-semibold text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <span>
                          {calendarView === 'month' && moment(currentDate).format('MMMM YYYY')}
                          {calendarView === 'week' && moment(currentDate).format('MMM YYYY')}
                          {calendarView === 'work_week' && moment(currentDate).format('MMM YYYY')}
                          {calendarView === 'day' && moment(currentDate).format('DD MMMM')}
                          {calendarView === 'agenda' && moment(currentDate).format('MMMM YYYY')}
                        </span>
                        <ChevronRight className={`transform transition-transform ${showMobileCalendar ? 'rotate-90' : ''}`} size={16} />
                      </button>

                      {/* Mobile Calendar Dropdown */}
                      {showMobileCalendar && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-[60] min-w-[280px]">
                          {/* Mini Calendar */}
                          <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {/* Days header */}
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                              <div key={day} className="p-2 font-semibold text-gray-600">
                                {day}
                              </div>
                            ))}
                            
                            {/* Calendar days */}
                            {Array.from({ length: 42 }, (_, i) => {
                              const startOfMonth = moment(currentDate).startOf('month');
                              const startOfCalendar = startOfMonth.clone().startOf('week');
                              const day = startOfCalendar.clone().add(i, 'days');
                              const isCurrentMonth = day.month() === moment(currentDate).month();
                              const isToday = day.isSame(moment(), 'day');
                              const isSelected = day.isSame(moment(currentDate), 'day');
                              
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setCurrentDate(day.toDate());
                                    setShowMobileCalendar(false);
                                  }}
                                  className={`p-2 rounded-lg text-sm transition-colors ${
                                    isSelected ? 'bg-purple-600 text-white' :
                                    isToday ? 'bg-purple-100 text-purple-700' :
                                    isCurrentMonth ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'
                                  }`}
                                >
                                  {day.date()}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Quick actions */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setCurrentDate(new Date());
                                setShowMobileCalendar(false);
                              }}
                              className="w-full text-center py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              Bugüne Git
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="hidden sm:block px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Bugün
                      </button>
                    </div>
                  </div>
                  
                  {/* View Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={calendarView}
                      onChange={(e) => setCalendarView(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:border-purple-500"
                    >
                      <option value="day">Gün</option>
                      <option value="week">Hafta</option>
                      <option value="work_week">4 gün</option>
                      <option value="month">Ay</option>
                      <option value="agenda">Planlama</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                {/* Desktop Filters */}
                <div className="hidden md:flex flex-wrap gap-4 items-center">
                  <span className="font-semibold text-gray-700">Filtreler:</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWeekends}
                      onChange={(e) => setShowWeekends(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Hafta sonlarını göster</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRejected}
                      onChange={(e) => setShowRejected(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Reddedilen etkinlikleri göster</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Tamamlanan görevleri göster</span>
                  </label>

                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-700">Kategoriler:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryFilters.work}
                        onChange={(e) => setCategoryFilters({...categoryFilters, work: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700 bg-blue-100 px-2 py-1 rounded">İş</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryFilters.personal}
                        onChange={(e) => setCategoryFilters({...categoryFilters, personal: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700 bg-green-100 px-2 py-1 rounded">Kişisel</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryFilters.important}
                        onChange={(e) => setCategoryFilters({...categoryFilters, important: e.target.checked})}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-xs text-gray-700 bg-red-100 px-2 py-1 rounded">Önemli</span>
                    </label>
                  </div>
                </div>

                {/* Mobile Filters Dropdown */}
                <div className="md:hidden">
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-between p-2 text-gray-700 border rounded-lg"
                  >
                    <span className="font-semibold">Filtreler</span>
                    <ChevronRight className={`transform transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} size={20} />
                  </button>
                  
                  {showMobileFilters && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showWeekends}
                          onChange={(e) => setShowWeekends(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Hafta sonlarını göster</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showRejected}
                          onChange={(e) => setShowRejected(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Reddedilen etkinlikleri göster</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCompleted}
                          onChange={(e) => setShowCompleted(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Tamamlanan görevleri göster</span>
                      </label>

                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-700">Kategoriler:</span>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryFilters.work}
                              onChange={(e) => setCategoryFilters({...categoryFilters, work: e.target.checked})}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700 bg-blue-100 px-2 py-1 rounded">İş</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryFilters.personal}
                              onChange={(e) => setCategoryFilters({...categoryFilters, personal: e.target.checked})}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                            <span className="text-xs text-gray-700 bg-green-100 px-2 py-1 rounded">Kişisel</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryFilters.important}
                              onChange={(e) => setCategoryFilters({...categoryFilters, important: e.target.checked})}
                              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-700 bg-red-100 px-2 py-1 rounded">Önemli</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4" style={{ height: '700px' }}>
                <DnDCalendar
                  localizer={localizer}
                  events={[
                    // Görüşmeler
                    ...meetings
                      .filter(m => {
                        if (!showCompleted && m.status === 'completed') return false;
                        if (!showRejected && m.status === 'cancelled') return false;
                        if (!categoryFilters[m.category || 'work']) return false;
                        return true;
                      })
                      .map(meeting => ({
                        id: meeting.id,
                        title: meeting.title,
                        start: new Date(`${meeting.date}T${meeting.start_time || '09:00'}`),
                        end: new Date(`${meeting.date}T${meeting.end_time || '10:00'}`),
                        allDay: meeting.all_day || false,
                        resource: meeting,
                        eventType: 'meeting',
                        color: meeting.color || (
                          meeting.category === 'work' ? '#3b82f6' :
                          meeting.category === 'personal' ? '#10b981' :
                          meeting.category === 'important' ? '#ef4444' : '#3b82f6'
                        )
                      })),
                    // Etkinlikler (salt okunur)
                    ...events
                      .map(ev => ({
                        id: `event-${ev.id}`,
                        title: `🗓 ${ev.title}`,
                        start: new Date(`${ev.date}T${ev.time || '10:00'}`),
                        end: new Date(`${ev.date}T${ev.time || '10:00'}`),
                        allDay: !ev.time,
                        resource: ev,
                        eventType: 'event',
                        color: '#8b5cf6'
                      })),
                    // Görevler (salt okunur)
                    ...tasks
                      .filter(t => t.date)
                      .map(t => ({
                        id: `task-${t.id}`,
                        title: `✅ ${t.title}`,
                        start: new Date(`${t.date}T08:00`),
                        end: new Date(`${t.date}T08:30`),
                        allDay: true,
                        resource: t,
                        eventType: 'task',
                        color: t.status === 'done' ? '#6b7280' : t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981'
                      }))
                  ]}
                  view={calendarView}
                  views={['day', 'week', 'work_week', 'month', 'agenda']}
                  onView={(view) => setCalendarView(view)}
                  date={currentDate}
                  onNavigate={(date) => setCurrentDate(date)}
                  toolbar={false}
                  onSelectSlot={(slotInfo, e) => {
                    // Store slot info and open the Quick Create menu at click position
                    setCalendarSlotInfo(slotInfo);
                    // Position menu near click – use a center-screen fallback
                    const clickX = e?.clientX || window.innerWidth / 2;
                    const clickY = e?.clientY || window.innerHeight / 2;
                    setCalendarCreateMenuPos({ x: Math.min(clickX, window.innerWidth - 240), y: Math.min(clickY, window.innerHeight - 260) });
                    setShowCalendarCreateMenu(true);
                  }}
                  onSelectEvent={(event) => {
                    if (event.eventType === 'event') {
                      setCurrentPage('events');
                    } else if (event.eventType === 'task') {
                      setCurrentPage('agenda');
                      setAgendaTab('tasks');
                    } else {
                      setEditingMeeting(event.resource);
                      setNewMeeting(event.resource);
                      setShowMeetingModal(true);
                    }
                  }}
                  onEventDrop={(args) => {
                    const { event, start, end } = args;
                    const updatedMeeting = {
                      ...event.resource,
                      date: moment(start).format('YYYY-MM-DD'),
                      start_time: moment(start).format('HH:mm'),
                      end_time: moment(end).format('HH:mm')
                    };
                    meetingAPI.update(event.id, updatedMeeting).then(() => loadMeetings());
                  }}
                  onEventResize={(args) => {
                    const { event, start, end } = args;
                    const updatedMeeting = {
                      ...event.resource,
                      start_time: moment(start).format('HH:mm'),
                      end_time: moment(end).format('HH:mm')
                    };
                    meetingAPI.update(event.id, updatedMeeting).then(() => loadMeetings());
                  }}
                  selectable
                  resizable
                  draggableAccessor={(event) => event.eventType === 'meeting'}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.color,
                      borderColor: event.color,
                      color: 'white',
                      opacity: event.eventType === 'event' ? 0.9 : 1,
                      borderLeft: event.eventType === 'event' ? '4px solid #6d28d9' : undefined,
                      cursor: event.eventType === 'event' ? 'pointer' : 'grab'
                    }
                  })}
                  messages={{
                    today: 'Bugün',
                    previous: 'Geri',
                    next: 'İleri',
                    month: 'Ay',
                    week: 'Hafta',
                    day: 'Gün',
                    agenda: 'Planlama',
                    work_week: '4 Gün',
                    date: 'Tarih',
                    time: 'Saat',
                    event: 'Etkinlik',
                    noEventsInRange: 'Bu tarih aralığında etkinlik yok',
                    showMore: (total) => `+${total} daha`
                  }}
                  step={30}
                  timeslots={2}
                  min={new Date(2000, 1, 1, 7, 0, 0)}
                  max={new Date(2000, 1, 1, 22, 0, 0)}
                />
              </div>
            </div>
          )}

          {/* PROFILE PAGE */}
          {currentPage === 'profile' && (
            <ProfilePage 
              currentUser={currentUser}
              profileData={profileData}
              setProfileData={setProfileData}
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              onUpdateProfile={updateProfile}
              onUpdateProfilePhoto={updateProfilePhoto}
              onChangePassword={changePassword}
              uploadingImage={uploadingImage}
              formatUserNumber={formatUserNumber}
            />
          )}

          {/* ADMIN PAGE */}
          {currentPage === 'admin' && currentUser?.role === 'admin' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <button
                    onClick={() => { setAdminTab('users'); loadPartners(); }}
                    className={`px-4 py-2 font-medium transition-all ${
                      adminTab === 'users'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Kullanıcı & Partnerler
                  </button>
                  <button
                    onClick={() => setAdminTab('logs')}
                    className={`px-4 py-2 font-medium transition-all ${
                      adminTab === 'logs'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Aktivite Logları
                  </button>
                  <button
                    onClick={() => setAdminTab('videos')}
                    className={`px-4 py-2 font-medium transition-all ${
                      adminTab === 'videos'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Video Yönetimi
                  </button>
                  <button
                    onClick={() => { setAdminTab('badges'); loadBadges(); }}
                    className={`px-4 py-2 font-medium transition-all ${
                      adminTab === 'badges'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🏅 Rozet Yönetimi
                  </button>
                </div>
              </div>

              {/* Users Management Tab */}
              {adminTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Kullanıcı Yönetimi ({getFilteredUsers().length})</h3>
                  <button
                    onClick={() => {
                      setShowUserModal(true);
                      setEditingUser(null);
                      setNewUser({ name: '', email: '', user_number: '', role: 'user', permissions: [] });
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                  >
                    <Plus size={20} />
                    Yeni Kullanıcı
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                    <select
                      value={userFilters.role}
                      onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Tümü</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Yönetici</option>
                      <option value="user">Normal Kullanıcı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={userFilters.dateFrom}
                      onChange={(e) => setUserFilters({...userFilters, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={userFilters.dateTo}
                      onChange={(e) => setUserFilters({...userFilters, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aktivite</label>
                    <select
                      value={userFilters.activityStatus}
                      onChange={(e) => setUserFilters({...userFilters, activityStatus: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Tümü</option>
                      <option value="active">Aktif (30 gün)</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedUsers.length} kullanıcı seçildi
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBulkEmailModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Email Gönder
                      </button>
                      <button
                        onClick={() => bulkChangeRole('admin')}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        Admin Yap
                      </button>
                      <button
                        onClick={() => bulkChangeRole('user')}
                        className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                      >
                        Kullanıcı Yap
                      </button>
                      <button
                        onClick={bulkDeleteUsers}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Toplu Sil
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === getFilteredUsers().length && getFilteredUsers().length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID No</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">İletişim & Durum</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rol</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ekleyen</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tarih</th>
                        <th className="px-4 py-2 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFilteredUsers().map(user => {
                        const creator = users.find(u => u.id === user.created_by);
                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                            onClick={() => viewUserDetails(user)}
                          >
                            <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-[13px] font-bold text-purple-600">#{formatUserNumber(user.user_number)}</span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[13px] font-semibold text-gray-800">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-gray-600">{user.email}</span>
                                {user.status === 'beklemede' ? (
                                  <div title="Şifre Bekliyor (Beklemede)" className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-50"></div>
                                ) : (
                                  <div title="Aktif Kullanıcı" className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${getRoleConfig(user.role).color}`}>
                                  {getRoleConfig(user.role).label}
                                </span>
                                {user.permissions && user.permissions.includes('users_manage') && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold" title="Yetkili">Y</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-[13px] text-gray-500">{creator ? creator.name : '-'}</span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-[13px] text-gray-400">
                              {new Date(user.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => viewUserDetails(user)}
                                className="p-1 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                                title="Analiz Sayfasını Aç"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewUser({
                                    ...user,
                                    user_number: user.user_number !== undefined ? String(user.user_number) : '',
                                    permissions: user.permissions || []
                                  });
                                  setShowUserModal(true);
                                }}
                                className="p-1 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Düzenle"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Sil"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* User Analysis Tab — Inline full-page view */}
              {adminTab === 'user_analysis' && selectedUserDetail && (
                <div className="space-y-6">
                  {/* Header: Back button + User info */}
                  <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <button
                      onClick={() => {
                        setAdminTab('users');
                        setSelectedUserDetail(null);
                        setUserActivities(null);
                      }}
                      className="flex items-center gap-2 text-white/80 hover:text-white mb-5 text-sm font-medium transition-colors group"
                    >
                      <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      Kullanıcı Listesine Geri Dön
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-2xl font-bold shadow-inner">
                        {selectedUserDetail.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold tracking-tight">{selectedUserDetail.name}</h2>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm bg-white/20 px-3 py-0.5 rounded-full font-mono font-semibold">
                            ID: {formatUserNumber(selectedUserDetail.user_number)}
                          </span>
                          <span className="text-sm text-white/70">{selectedUserDetail.email}</span>
                          {selectedUserDetail.status === 'beklemede' ? (
                            <span className="text-[11px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-sm">
                              <Clock size={12} strokeWidth={2.5} />
                              Şifre Bekliyor
                            </span>
                          ) : (
                            <span className="text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-sm">
                              <CheckCircle2 size={12} strokeWidth={2.5} />
                              Aktif Kullanıcı
                            </span>
                          )}
                        </div>
                        {/* Creator info */}
                        {selectedUserDetail.created_by && (() => {
                          const creator = users.find(u => u.id === selectedUserDetail.created_by);
                          return creator ? (
                            <p className="mt-2 text-sm text-white/80 flex items-center gap-1.5">
                              <Users size={14} className="opacity-70" />
                              <span className="font-medium">{creator.name}</span> tarafından sisteme eklendi
                              <span className="text-white/50 ml-1">(#{formatUserNumber(creator.user_number)})</span>
                            </p>
                          ) : null;
                        })()}
                      </div>
                      <div className="text-right hidden md:block">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUserDetail.role === 'admin' ? 'bg-red-400/30 text-red-100' : 'bg-white/20 text-white/90'}`}>
                          {getRoleConfig(selectedUserDetail.role).label}
                        </span>
                        {selectedUserDetail.permissions && selectedUserDetail.permissions.includes('users_manage') && (
                          <span className="ml-2 px-3 py-1 bg-amber-400/30 text-amber-100 rounded-full text-xs font-bold">Yetkili Kullanıcı</span>
                        )}
                        <p className="text-xs text-white/50 mt-2">
                          Kayıt: {new Date(selectedUserDetail.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kişisel Bilgiler Kartı */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><User size={15} className="text-purple-600" /></span>
                      Kişisel Bilgiler
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Editable email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">E-posta</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            defaultValue={selectedUserDetail.email || ''}
                            onBlur={async (e) => {
                              const newEmail = e.target.value.trim();
                              if (newEmail && newEmail !== selectedUserDetail.email) {
                                try {
                                  await userAPI.update(selectedUserDetail.id, { email: newEmail });
                                  setSelectedUserDetail({ ...selectedUserDetail, email: newEmail });
                                  setUsers(prev => prev.map(u => u.id === selectedUserDetail.id ? { ...u, email: newEmail } : u));
                                } catch(err) {
                                  alert('E-posta güncellenemedi: ' + (err.response?.data?.detail || 'Hata'));
                                }
                              }
                            }}
                            className="flex-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                            placeholder="mail@domain.com"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Alanı değiştirip dışarı tıkla → otomatik kayıt</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Telefon</label>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5">{selectedUserDetail.phone || <span className="text-gray-400 italic">Girilmemiş</span>}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Şehir / Ülke</label>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5">
                          {[selectedUserDetail.city, selectedUserDetail.country].filter(Boolean).join(', ') || <span className="text-gray-400 italic">Girilmemiş</span>}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kariyer / Unvan</label>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5">{selectedUserDetail.career_title || <span className="text-gray-400 italic">Girilmemiş</span>}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kayıt Tarihi</label>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5">{new Date(selectedUserDetail.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hesap Durumu</label>
                        <p className="text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                          {selectedUserDetail.status === 'beklemede'
                            ? <span className="text-amber-600 font-semibold">⏳ Şifre Bekleniyor</span>
                            : <span className="text-emerald-600 font-semibold">✓ Aktif</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  {userActivities ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* Sol Sütun */}
                      <div className="space-y-5">
                        {/* Goals */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Target size={16} className="text-purple-600" /></span>
                            Hedefler
                            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.goals.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.goals.length > 0 ? (
                              userActivities.goals.map(goal => (
                                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg border-l-2 border-purple-300">
                                  <p className="text-sm font-medium text-gray-800">{goal.description}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${goal.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {goal.done ? '✓ Tamamlandı' : '⏳ Devam Ediyor'}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(goal.created_at).toLocaleDateString('tr-TR')}</span>
                                  </div>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı hedef yok</p>}
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><ListChecks size={16} className="text-blue-600" /></span>
                            Görevler
                            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.tasks.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.tasks.length > 0 ? (
                              userActivities.tasks.map(task => (
                                <div key={task.id} className="p-3 bg-gray-50 rounded-lg border-l-2 border-blue-300">
                                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs font-medium text-gray-500 capitalize">{task.status}</span>
                                    {task.due_date && <span className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString('tr-TR')}</span>}
                                  </div>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı görev yok</p>}
                          </div>
                        </div>

                        {/* Habits */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><CheckCircle2 size={16} className="text-emerald-600" /></span>
                            Alışkanlıklar
                            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.habits.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.habits.length > 0 ? (
                              userActivities.habits.map(habit => (
                                <div key={habit.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border-l-2 border-emerald-300">
                                  <p className="text-sm font-medium text-gray-800">{habit.title}</p>
                                  <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap ml-2">🔥 {habit.streak || 0} gün</span>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı alışkanlık yok</p>}
                          </div>
                        </div>

                        {/* Reasons */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><MessageSquare size={16} className="text-orange-600" /></span>
                            Nedenlerim
                            <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.reasons.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.reasons.length > 0 ? (
                              userActivities.reasons.map(reason => (
                                <div key={reason.id} className="p-3 bg-orange-50 rounded-lg border-l-2 border-orange-300">
                                  <p className="text-sm italic text-gray-700">"{reason.description}"</p>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı neden yok</p>}
                          </div>
                        </div>
                      </div>

                      {/* Sağ Sütun */}
                      <div className="space-y-5">
                        {/* Team / Partners added by this user */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Users size={16} className="text-indigo-600" /></span>
                            Eklediği Kişiler
                            <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.partners.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.partners.length > 0 ? (
                              userActivities.partners.map(partner => (
                                <div key={partner.id} className="p-3 bg-indigo-50/60 rounded-lg flex justify-between items-center border-l-2 border-indigo-300">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-800">
                                      {partner.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-indigo-900">{partner.name}</p>
                                      <p className="text-xs text-indigo-500">#{formatUserNumber(partner.user_number)}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400">{new Date(partner.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Alt ekip üyesi yok</p>}
                          </div>
                        </div>

                        {/* Prospects */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><UserPlus size={16} className="text-green-600" /></span>
                            İsim Listesi – Adaylar
                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.prospects.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.prospects.length > 0 ? (
                              userActivities.prospects.map(prospect => (
                                <div key={prospect.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border-l-2 border-green-300">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{prospect.name}</p>
                                    {prospect.phone && <p className="text-xs text-gray-400">{prospect.phone}</p>}
                                  </div>
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{prospect.category || 'Aday'}</span>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı aday yok</p>}
                          </div>
                        </div>

                        {/* Meetings */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><CalendarDays size={16} className="text-amber-600" /></span>
                            Görüşmeler
                            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.meetings.length}</span>
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {userActivities.meetings.length > 0 ? (
                              userActivities.meetings.map(meeting => (
                                <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg border-l-2 border-amber-300">
                                  <p className="text-sm font-medium text-gray-800">{meeting.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">{meeting.date ? new Date(meeting.date).toLocaleDateString('tr-TR') : '—'}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {meeting.status === 'completed' ? 'Tamamlandı' : 'Planlandı'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 text-center py-4">Kayıtlı görüşme yok</p>}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"><Award size={16} className="text-yellow-600" /></span>
                            Rozetler
                            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">{userActivities.badges.length}</span>
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {userActivities.badges.length > 0 ? (
                              userActivities.badges.map(badge => (
                                <div key={badge.id} className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-300 shadow-sm" title={badge.badge_id}>
                                  <span className="text-xl">🏅</span>
                                </div>
                              ))
                            ) : <p className="text-sm text-gray-400 py-2">Kazanılmış rozet yok</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-200 border-t-purple-600"></div>
                      <p className="text-gray-500 text-sm font-medium">Veriler yükleniyor...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Trainings Tab */}
              {adminTab === 'trainings' && (
                <div className="space-y-6">
                  {/* Video Statistics Cards */}
                  {videoStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Film size={32} className="opacity-80" />
                          <span className="text-3xl font-bold">{videoStatistics.total_videos}</span>
                        </div>
                        <h3 className="text-lg font-semibold">Toplam Video</h3>
                        <p className="text-sm opacity-80">Sistemdeki tüm videolar</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Eye size={32} className="opacity-80" />
                          <span className="text-3xl font-bold">{videoStatistics.total_views}</span>
                        </div>
                        <h3 className="text-lg font-semibold">Toplam İzlenme</h3>
                        <p className="text-sm opacity-80">Tüm videoların izlenme sayısı</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Award size={32} className="opacity-80" />
                          <span className="text-3xl font-bold">{videoCategories.length}</span>
                        </div>
                        <h3 className="text-lg font-semibold">Kategoriler</h3>
                        <p className="text-sm opacity-80">Video kategorisi</p>
                      </div>
                    </div>
                  )}

                  {/* Most Watched Videos */}
                  {videoStatistics && videoStatistics.most_watched && videoStatistics.most_watched.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">En Çok İzlenen Videolar (Top 10)</h3>
                      <div className="space-y-3">
                        {videoStatistics.most_watched.map((video, index) => (
                          <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center gap-4">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-800">{video.title}</h4>
                                <p className="text-sm text-gray-600">{video.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Eye size={16} />
                                <span className="font-bold">{video.view_count || 0}</span>
                                <span className="text-sm text-gray-500">izlenme</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Categories Management */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Video Kategorileri</h3>
                      <button
                        onClick={() => {
                          setShowCategoryModal(true);
                          setEditingCategory(null);
                          setNewCategory({ name: '', description: '', order: videoCategories.length });
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                      >
                        <Plus size={20} />
                        Yeni Kategori
                      </button>
                    </div>

                    {videoCategories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bookmark size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>Henüz kategori eklenmemiş</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videoCategories.map((category) => (
                          <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{category.description || 'Açıklama yok'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setNewCategory(category);
                                    setShowCategoryModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Düzenle"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => deleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Sil"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-xs text-gray-500">
                                {videos.filter(v => v.category_id === category.id).length} video
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos Management */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Video Yönetimi</h3>
                      <button
                        onClick={() => {
                          setShowVideoModal(true);
                          setEditingVideo(null);
                          setNewVideo({ title: '', youtube_id: '', description: '', duration: '', category: '', category_id: '', level: 'Başlangıç', order: videos.length });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                      >
                        <Plus size={20} />
                        Yeni Video
                      </button>
                    </div>

                    {videos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Film size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>Henüz video eklenmemiş</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {videos.map((video, index) => (
                          <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center gap-4 flex-1">
                              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-800">{video.title}</h4>
                                  {video.level && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      video.level === 'Başlangıç' ? 'bg-green-100 text-green-700' :
                                      video.level === 'Orta' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {video.level}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600">{video.category}</span>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-600">{video.duration}</span>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Eye size={14} />
                                    {video.view_count || 0} izlenme
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-700"
                                title="YouTube'da Aç"
                              >
                                <Play size={16} />
                              </a>
                              <button
                                onClick={() => {
                                  setEditingVideo(video);
                                  setNewVideo(video);
                                  setShowVideoModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title="Düzenle"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteVideo(video.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Management Tab */}
              {adminTab === 'videos' && (
                <AdminVideoManagement user={currentUser} />
              )}

              {/* Badges Management Tab */}
              {adminTab === 'badges' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">🏅</span>
                    <h3 className="text-xl font-bold text-gray-800">Rozet Yönetimi</h3>
                    <span className="ml-auto text-sm text-gray-400">{badges.length} rozet</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map(badge => (
                      <div
                        key={badge.id}
                        className="relative border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-purple-200 transition-all group"
                      >
                        {/* Badge type pill */}
                        <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${
                          badge.type === 'auto'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          {badge.type === 'auto' ? 'Otomatik' : 'Manuel'}
                        </span>

                        {/* Icon + Name */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">{badge.icon}</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{badge.name}</p>
                            <p className="text-xs text-gray-400">{badge.reward_type}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-1">{badge.description}</p>
                        {badge.criteria && (
                          <p className="text-xs text-gray-400 italic">📍 {badge.criteria}</p>
                        )}

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setEditingBadge(badge);
                            setBadgeForm({
                              name: badge.name,
                              description: badge.description,
                              icon: badge.icon,
                              criteria: badge.criteria || ''
                            });
                            setShowBadgeModal(true);
                          }}
                          className="mt-3 w-full text-sm py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          ✏️ Düzenle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}

      {/* Badge Edit Modal */}
      {showBadgeModal && editingBadge && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBadgeModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{badgeForm.icon || editingBadge.icon}</span>
                <h3 className="text-lg font-bold text-gray-800">Rozet Düzenle</h3>
              </div>
              <button onClick={() => setShowBadgeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İkon (Emoji)</label>
                <input
                  type="text"
                  value={badgeForm.icon}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-2xl"
                  placeholder="🏆"
                  maxLength={4}
                />
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                <input
                  type="text"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Rozet ismi"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Rozet nasıl kazanılır?"
                />
              </div>
              {/* Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kriter (isteğe bağlı)</label>
                <input
                  type="text"
                  value={badgeForm.criteria}
                  onChange={(e) => setBadgeForm({ ...badgeForm, criteria: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Hangi koşul sağlandığında verilir?"
                />
              </div>
              {/* Read-only info */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p><span className="font-medium">Tür:</span> {editingBadge.type === 'auto' ? 'Otomatik' : 'Manuel'}</p>
                <p><span className="font-medium">Ödül Tipi:</span> {editingBadge.reward_type}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveBadge}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-medium"
              >
                Kaydet
              </button>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowMeetingModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingMeeting ? 'Görüşme Düzenle' : 'Yeni Görüşme'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                placeholder="Başlık"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              
              {/* Recurrence Selection */}
              <select
                value={newMeeting.recurrence || 'none'}
                onChange={(e) => setNewMeeting({...newMeeting, recurrence: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="none">Tekrarlanmaz</option>
                <option value="daily">Her gün</option>
                <option value="weekdays">Hafta içi her gün (Pazartesi-Cuma)</option>
                <option value="weekly">Her hafta</option>
                <option value="monthly">Her ay</option>
                <option value="yearly">Her yıl</option>
              </select>
              
              {newMeeting.recurrence && newMeeting.recurrence !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tekrar Bitiş Tarihi (Maks 1 Yıl)</label>
                  <input
                    type="date"
                    value={newMeeting.recurrence_end_date || ''}
                    onChange={(e) => setNewMeeting({...newMeeting, recurrence_end_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-purple-50 focus:bg-white"
                    min={newMeeting.date}
                  />
                </div>
              )}
              
              {/* All Day Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newMeeting.all_day || false}
                  onChange={(e) => setNewMeeting({...newMeeting, all_day: e.target.checked})}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Tüm gün</span>
              </label>

              {!newMeeting.all_day && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    value={newMeeting.start_time}
                    onChange={(e) => setNewMeeting({...newMeeting, start_time: e.target.value})}
                    placeholder="Başlangıç"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="time"
                    value={newMeeting.end_time}
                    onChange={(e) => setNewMeeting({...newMeeting, end_time: e.target.value})}
                    placeholder="Bitiş"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
              
              <input
                type="text"
                value={newMeeting.person}
                onChange={(e) => setNewMeeting({...newMeeting, person: e.target.value})}
                placeholder="Kişi"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newMeeting.notes}
                onChange={(e) => setNewMeeting({...newMeeting, notes: e.target.value})}
                placeholder="Notlar"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={newMeeting.category || 'work'}
                  onChange={(e) => {
                    const category = e.target.value;
                    const color = category === 'work' ? '#3b82f6' : 
                                  category === 'personal' ? '#10b981' : 
                                  '#ef4444';
                    setNewMeeting({...newMeeting, category, color});
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="work">İş</option>
                  <option value="personal">Kişisel</option>
                  <option value="important">Önemli</option>
                </select>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
                <div className="flex gap-2 flex-wrap">
                  {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewMeeting({...newMeeting, color})}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        newMeeting.color === color 
                          ? 'border-white shadow-lg ring-2 ring-purple-300' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        borderColor: newMeeting.color === color ? '#ffffff' : '#d1d5db'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <select
                value={newMeeting.status}
                onChange={(e) => setNewMeeting({...newMeeting, status: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="scheduled">Planlandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateMeeting}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingMeeting ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowMeetingModal(false);
                    setEditingMeeting(null);
                    setSelectedDate(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTaskModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingTask ? 'Görev Düzenle' : 'Yeni Görev'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Görev Başlığı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Açıklama"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="low">Düşük Öncelik</option>
                <option value="medium">Orta Öncelik</option>
                <option value="high">Yüksek Öncelik</option>
              </select>
              <input
                type="text"
                value={newTask.assignee}
                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                placeholder="Atanan Kişi"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateTask}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingTask ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowGoalModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingGoal ? 'Hedefi Düzenle' : 'Yeni Hedef'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="Hedef Başlığı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
              <input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                placeholder="Hedef Sayı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                placeholder="Son Tarih"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateGoal}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingGoal ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowReasonModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingReason ? 'Nedeni Düzenle' : 'Yeni Neden'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newReason.title}
                onChange={(e) => setNewReason({...newReason, title: e.target.value})}
                placeholder="Başlık"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newReason.description}
                onChange={(e) => setNewReason({...newReason, description: e.target.value})}
                placeholder="Açıklama"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
              />
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görsel Yükle (Maks. 500KB)
                </label>
                {newReason.image && (
                  <div className="mb-3 relative">
                    <img 
                      src={newReason.image} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setNewReason({...newReason, image: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageUpload(e, setNewReason)}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {uploadingImage && (
                  <p className="text-sm text-gray-500 mt-1">Görsel yükleniyor...</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateReason}
                  disabled={uploadingImage}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {editingReason ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setEditingReason(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habit Modal */}
      {showHabitModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowHabitModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingHabit ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık'}
              </h3>
              <button
                onClick={() => {
                  setShowHabitModal(false);
                  setEditingHabit(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alışkanlık Başlığı
                </label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                  placeholder="Örn: Yeni kişilerle konuş"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Günlük Hedef
                </label>
                <input
                  type="number"
                  min="1"
                  value={newHabit.target}
                  onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Bu alışkanlığı günde kaç kez yapmak istiyorsunuz?</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addOrUpdateHabit}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {editingHabit ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowHabitModal(false);
                    setEditingHabit(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prospect Modal */}
      {showProspectModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowProspectModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingProspect ? 'Potansiyel Düzenle' : 'Yeni Potansiyel'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newProspect.name}
                onChange={(e) => setNewProspect({...newProspect, name: e.target.value})}
                placeholder="İsim"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                value={newProspect.phone}
                onChange={(e) => setNewProspect({...newProspect, phone: e.target.value})}
                placeholder="Telefon"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                value={newProspect.email}
                onChange={(e) => setNewProspect({...newProspect, email: e.target.value})}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newProspect.status}
                onChange={(e) => setNewProspect({...newProspect, status: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="new">Yeni</option>
                <option value="contacted">İletişimde</option>
                <option value="interested">İlgili</option>
                <option value="converted">Dönüştü</option>
                <option value="lost">Kayıp</option>
              </select>
              <input
                type="text"
                value={newProspect.source}
                onChange={(e) => setNewProspect({...newProspect, source: e.target.value})}
                placeholder="Kaynak"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newProspect.notes}
                onChange={(e) => setNewProspect({...newProspect, notes: e.target.value})}
                placeholder="Notlar"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateProspect}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingProspect ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowProspectModal(false);
                    setEditingProspect(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Modal */}
      {/* ===== PARTNER DETAIL MODAL ===== */}
      {showPartnerDetailModal && selectedPartner && (() => {
        const p = selectedPartner;
        // Bu partner tarafindan referans gösterilen prospects (partner_id eşleşiyor)
        const linkedProspects = prospects.filter(pr => pr.partner_id === p.id);

        return (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setShowPartnerDetailModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{p.name}</h2>
                      <p className="text-purple-200 mt-0.5">{p.rank || 'Partner'}</p>
                      <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'active' ? 'bg-green-400/30 text-green-100' : 'bg-gray-400/30 text-gray-100'
                      }`}>
                        {p.status === 'active' ? '🟢 Aktif' : '⚫ Pasif'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPartnerDetailModal(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* İletişim Bilgileri */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">İletişim Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {p.phone && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">📞</span>
                        <div>
                          <p className="text-xs text-gray-500">Telefon</p>
                          <p className="text-sm font-medium text-gray-800">{p.phone}</p>
                        </div>
                      </div>
                    )}
                    {p.email && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">📧</span>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{p.email}</p>
                        </div>
                      </div>
                    )}
                    {p.join_date && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">📅</span>
                        <div>
                          <p className="text-xs text-gray-500">Katılım Tarihi</p>
                          <p className="text-sm font-medium text-gray-800">{p.join_date}</p>
                        </div>
                      </div>
                    )}
                    {p.performance && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">📊</span>
                        <div>
                          <p className="text-xs text-gray-500">Performans</p>
                          <p className="text-sm font-medium text-gray-800">{p.performance}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Eklediği Kişiler */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Eklediği Kişiler
                    <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {linkedProspects.length}
                    </span>
                  </h3>
                  {linkedProspects.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-400 text-sm">Bu partner henüz kimse eklenmemiş</p>
                      <p className="text-gray-300 text-xs mt-1">Kişi eklerken bu partner'ı seçebilirsiniz</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedProspects.map(pr => (
                        <div key={pr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                          <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                            {pr.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{pr.name}</p>
                            <p className="text-xs text-gray-500 truncate">{pr.phone || pr.email || '—'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-xs ${s <= (pr.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            pr.status === 'converted' ? 'bg-green-100 text-green-700' :
                            pr.status === 'interested' ? 'bg-blue-100 text-blue-700' :
                            pr.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {pr.status === 'converted' ? 'Dönüştü' :
                             pr.status === 'interested' ? 'İlgili' :
                             pr.status === 'contacted' ? 'İletişim' : 'Yeni'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowPartnerDetailModal(false);
                      setEditingPartner(p);
                      setNewPartner(p);
                      setShowPartnerModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => setShowPartnerDetailModal(false)}
                    className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showPartnerModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPartnerModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingPartner ? 'Partner Düzenle' : 'Yeni Partner'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newPartner.name}
                onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                placeholder="İsim"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                value={newPartner.phone}
                onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                placeholder="Telefon"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                value={newPartner.email}
                onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newPartner.rank}
                onChange={(e) => setNewPartner({...newPartner, rank: e.target.value})}
                placeholder="Rütbe"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newPartner.join_date}
                onChange={(e) => setNewPartner({...newPartner, join_date: e.target.value})}
                placeholder="Katılım Tarihi"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newPartner.performance}
                onChange={(e) => setNewPartner({...newPartner, performance: e.target.value})}
                placeholder="Performans"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newPartner.status}
                onChange={(e) => setNewPartner({...newPartner, status: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdatePartner}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingPartner ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowPartnerModal(false);
                    setEditingPartner(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal (Admin) */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCategoryModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Kategori Adı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Açıklama"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={newCategory.order}
                onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value) || 0})}
                placeholder="Sıra"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateCategory}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingCategory ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal (Admin) */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingVideo ? 'Video Düzenle' : 'Yeni Video'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                placeholder="Video Başlığı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div>
                <input
                  type="text"
                  value={newVideo.youtube_id}
                  onChange={(e) => setNewVideo({...newVideo, youtube_id: e.target.value})}
                  placeholder={'YouTube Video Linki (örn: https://youtube.com/watch?v=...)'}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 YouTube video linkini yapıştırın veya sadece video ID&apos;sini girin
                </p>
              </div>
              <textarea
                value={newVideo.description}
                onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                placeholder="Açıklama"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Süresi (dakika:saniye)
                </label>
                <input
                  type="text"
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                  placeholder="Örnek: 15:30 (15 dakika 30 saniye)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⏱️ Video süresini dakika:saniye formatında girin (örn: 5:45, 12:30, 1:05:30)
                </p>
              </div>
              <select
                value={newVideo.category_id || ''}
                onChange={(e) => {
                  const selectedCat = videoCategories.find(c => c.id === e.target.value);
                  setNewVideo({
                    ...newVideo, 
                    category_id: e.target.value,
                    category: selectedCat ? selectedCat.name : ''
                  });
                }}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Kategori Seçin</option>
                {videoCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={newVideo.level || 'Başlangıç'}
                onChange={(e) => setNewVideo({...newVideo, level: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Başlangıç">🟢 Başlangıç</option>
                <option value="Orta">🟡 Orta</option>
                <option value="İleri">🔴 İleri</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateVideo}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingVideo ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setEditingVideo(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal (Admin) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">İsim Soyisim</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  E-posta Adresi
                  <span className="ml-1.5 text-[11px] font-normal text-gray-400">(isteğe bağlı – Şifre yenileme ve bildirim için gerekli)</span>
                </label>
                <input
                  type="email"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="ornek@mail.com"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Atomy ID Numarası (8 Haneli)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-sm">#</span>
                  <input
                    type="text"
                    maxLength={8}
                    value={newUser.user_number || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewUser({...newUser, user_number: val});
                    }}
                    placeholder="8 haneli numara"
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 font-mono tracking-widest ${
                      newUser.user_number && newUser.user_number.length > 0 && newUser.user_number.length !== 8
                        ? 'border-red-300 bg-red-50'
                        : newUser.user_number && newUser.user_number.length === 8
                        ? 'border-emerald-300'
                        : ''
                    }`}
                  />
                </div>
                {newUser.user_number && newUser.user_number.length > 0 && newUser.user_number.length !== 8 && (
                  <p className="text-xs text-red-500 mt-1">{String(newUser.user_number).length}/8 hane girildi</p>
                )}
                {newUser.user_number && String(newUser.user_number).length === 8 && (
                  <p className="text-xs text-emerald-600 mt-1">✓ ID: {newUser.user_number}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Kullanıcı bu ID ile Şifre Belirle ekranından giriş yapacak</p>
              </div>

              {/* Sadece Admin yetkisi olanlar rol seçebilir */}
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">🟢 Normal Kullanıcı</option>
                    <option value="admin">🔴 Admin</option>
                  </select>
                </div>
              )}

              {/* YETKİNLİK ATAMA - Sadece Adminler, Normal Kullanıcılar için atayabilir */}
              {currentUser?.role === 'admin' && newUser.role === 'user' && (() => {
                const ALL_PERMS = [
                  { key: 'users_view',         label: 'Kullanıcıları Görüntüle',    icon: '👥', group: 'Kullanıcı Yönetimi' },
                  { key: 'users_manage',       label: 'Kullanıcı Ekle/Düzenle',   icon: '⚙️', group: 'Kullanıcı Yönetimi' },
                  { key: 'badges_manage',      label: 'Rozet Yönetimi',            icon: '🏅', group: 'Kullanıcı Yönetimi' },
                  { key: 'notifications_send', label: 'Bildirim Gönder',           icon: '🔔', group: 'Kullanıcı Yönetimi' },
                  { key: 'statistics_view',    label: 'İstatistikleri Görüntüle',  icon: '📊', group: 'Raporlama' },
                  { key: 'reports_download',   label: 'Rapor İndir',               icon: '📥', group: 'Raporlama' },
                  { key: 'videos_manage',      label: 'Video Yönetimi',            icon: '🎥', group: 'İçerik' },
                  { key: 'blogs_manage',       label: 'Blog Yönetimi',             icon: '📝', group: 'İçerik' },
                  { key: 'habits_manage',      label: 'Alışkanlık Yönetimi',       icon: '📦', group: 'İçerik' },
                  { key: 'events_manage',      label: 'Etkinlik Yönetimi',         icon: '📅', group: 'İçerik' },
                ];
                const groups = [...new Set(ALL_PERMS.map(p => p.group))];
                const currentPerms = newUser.permissions || [];
                const togglePerm = (key) => {
                  const updated = currentPerms.includes(key)
                    ? currentPerms.filter(k => k !== key)
                    : [...currentPerms, key];
                  setNewUser({ ...newUser, permissions: updated });
                };
                const toggleAll = () => {
                  setNewUser({
                    ...newUser,
                    permissions: currentPerms.length === ALL_PERMS.length ? [] : ALL_PERMS.map(p => p.key)
                  });
                };
                return (
                  <div className="border border-amber-200 rounded-xl bg-amber-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700 font-bold text-sm">🛡️ Yönetici Yetkinlikleri</span>
                        <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {currentPerms.length}/{ALL_PERMS.length} aktif
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleAll}
                        className="text-xs text-amber-600 hover:text-amber-900 font-semibold underline"
                      >
                        {currentPerms.length === ALL_PERMS.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                      </button>
                    </div>
                    {groups.map(group => (
                      <div key={group} className="mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{group}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ALL_PERMS.filter(p => p.group === group).map(perm => (
                            <label
                              key={perm.key}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all select-none ${
                                currentPerms.includes(perm.key)
                                  ? 'bg-amber-200 border border-amber-400 shadow-sm'
                                  : 'bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={currentPerms.includes(perm.key)}
                                onChange={() => togglePerm(perm.key)}
                                className="w-4 h-4 accent-amber-500 rounded"
                              />
                              <span className="text-base leading-none">{perm.icon}</span>
                              <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                              {currentPerms.includes(perm.key) && (
                                <span className="ml-auto text-amber-600 text-xs font-bold">✓</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
              );
            })()}

              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateUser}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingUser ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Toplu Email Gönder ({selectedUsers.length} kullanıcı)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                <input
                  type="text"
                  value={bulkEmailData.subject}
                  onChange={(e) => setBulkEmailData({...bulkEmailData, subject: e.target.value})}
                  placeholder="Email konusu"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
                <textarea
                  value={bulkEmailData.message}
                  onChange={(e) => setBulkEmailData({...bulkEmailData, message: e.target.value})}
                  placeholder="Email mesajı"
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={sendBulkEmail}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Gönder
                </button>
                <button
                  onClick={() => {
                    setShowBulkEmailModal(false);
                    setBulkEmailData({ subject: '', message: '' });
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal (Admin) */}
      {showSendMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Mesaj Gönder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alıcılar</label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {users.filter(u => u.role !== 'admin').map(user => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={newMessage.recipient_ids.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMessage({...newMessage, recipient_ids: [...newMessage.recipient_ids, user.id]});
                          } else {
                            setNewMessage({...newMessage, recipient_ids: newMessage.recipient_ids.filter(id => id !== user.id)});
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">{user.name} ({user.email})</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{newMessage.recipient_ids.length} kullanıcı seçildi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder="Mesaj konusu"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  placeholder="Mesaj içeriği"
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={sendMessage}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Gönder
                </button>
                <button
                  onClick={() => {
                    setShowSendMessageModal(false);
                    setNewMessage({ subject: '', content: '', recipient_ids: [] });
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedMessage.subject}</h3>
              <button
                onClick={() => {
                  setShowMessageDetailModal(false);
                  setSelectedMessage(null);
                  setReplyContent('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Gönderen Bilgisi */}
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedMessage.sender_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedMessage.sender_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedMessage.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mesaj İçeriği */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>

            {/* Önceki Cevaplar */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="font-semibold text-gray-800 mb-3">Cevaplar</h4>
                {selectedMessage.replies.map((reply, idx) => (
                  <div key={idx} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {reply.sender_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-purple-900">{reply.sender_name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(reply.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-10">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Alanı (Admin için) */}
            {currentUser?.role === 'admin' && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Cevap Yaz</h4>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Cevabınızı yazın..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Mesajı Sil
                  </button>
                  <button
                    onClick={async () => {
                      if (!replyContent.trim()) {
                        alert('Lütfen bir cevap yazın');
                        return;
                      }
                      try {
                        await messageAPI.reply(selectedMessage.id, replyContent);
                        setReplyContent('');
                        setShowMessageDetailModal(false);
                        setSelectedMessage(null);
                        setSelectedThread(null); // Thread'i resetle, yeniden yüklensin
                        await loadMessages();
                        alert('Cevap gönderildi!');
                      } catch (error) {
                        console.error('Reply error:', error);
                        console.error('Error details:', error.response?.data);
                        alert('Cevap gönderilirken hata oluştu: ' + (error.response?.data?.detail || error.message));
                      }
                    }}
                    disabled={!replyContent.trim()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      replyContent.trim()
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Cevap Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Modal (Admin) */}
      {showEventModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEventModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Etkinlik Başlığı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                placeholder="Saat"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                placeholder="Konum"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Açıklama"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={newEvent.max_participants}
                onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value})}
                placeholder="Maksimum Katılımcı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              
              {/* Recurrence Selection */}
              <select
                value={newEvent.recurrence || 'none'}
                onChange={(e) => setNewEvent({...newEvent, recurrence: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="none">Tekrarlanmaz</option>
                <option value="daily">Her gün</option>
                <option value="weekdays">Hafta içi her gün (Pazartesi-Cuma)</option>
                <option value="weekly">Her hafta</option>
                <option value="monthly">Her ay</option>
                <option value="yearly">Her yıl</option>
              </select>
              
              {newEvent.recurrence && newEvent.recurrence !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tekrar Bitiş Tarihi (Maks 1 Yıl)</label>
                  <input
                    type="date"
                    value={newEvent.recurrence_end_date || ''}
                    onChange={(e) => setNewEvent({...newEvent, recurrence_end_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-purple-50 focus:bg-white"
                    min={newEvent.date}
                  />
                </div>
              )}
              
              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Görseli
                </label>
                
                {/* Preview */}
                {newEvent.image && (
                  <div className="mb-3 relative">
                    <img 
                      src={newEvent.image} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setNewEvent({...newEvent, image: ''})}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="sr-only">Dosyadan Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (imageData) => setNewEvent({...newEvent, image: imageData}))}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100 cursor-pointer"
                    />
                  </label>
                  
                  {/* URL Input */}
                  <div className="relative">
                    <span className="text-xs text-gray-500 block mb-1">veya URL ile:</span>
                    <input
                      type="text"
                      value={newEvent.image && typeof newEvent.image === 'string' && !newEvent.image.startsWith('data:') ? newEvent.image : ''}
                      onChange={(e) => setNewEvent({...newEvent, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateEvent}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingEvent ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Event Image Header */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-t-2xl overflow-hidden">
              {selectedEvent.image ? (
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CalendarDays size={96} className="text-white opacity-50" />
                </div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Event Details */}
            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
              
              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <Calendar size={24} className="text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">Tarih</p>
                    <p className="text-lg text-gray-900 font-medium">
                      {new Date(selectedEvent.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <Clock size={24} className="text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">Saat</p>
                    <p className="text-lg text-gray-900 font-medium">{selectedEvent.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 md:col-span-2">
                  <MapPin size={24} className="text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-purple-600 font-semibold">Konum</p>
                    <p className="text-lg text-gray-900 font-medium">{selectedEvent.location}</p>
                  </div>
                </div>
                
                {selectedEvent.max_participants && (
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 md:col-span-2">
                    <Users size={24} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">Katılımcılar</p>
                      <p className="text-lg text-gray-900 font-medium">
                        {eventRegistrations.filter(r => r.event_id === selectedEvent.id).length} / {selectedEvent.max_participants}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Açıklama</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Join/Status Button (for users) */}
                {currentUser?.role !== 'admin' && (() => {
                  const userRegistration = eventRegistrations.find(r => r.event_id === selectedEvent.id && r.user_id === currentUser.id);
                  const isPast = new Date(selectedEvent.date) < new Date();
                  
                  if (userRegistration) {
                    return (
                      <div className={`flex-1 py-3 rounded-lg text-center font-semibold ${
                        userRegistration.status === 'approved' ? 'bg-green-100 text-green-700' :
                        userRegistration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {userRegistration.status === 'approved' ? '✓ Katılıyorsunuz' :
                         userRegistration.status === 'rejected' ? '✗ Reddedildi' : '⏳ Beklemede'}
                      </div>
                    );
                  } else if (!isPast) {
                    return (
                      <button
                        onClick={() => {
                          registerForEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        Katıl
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* Calendar Save Button */}
                <button
                  onClick={() => {
                    const eventDate = new Date(selectedEvent.date + 'T' + selectedEvent.time);
                    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${selectedEvent.title}
LOCATION:${selectedEvent.location}
DESCRIPTION:${selectedEvent.description}
END:VEVENT
END:VCALENDAR`;
                    const blob = new Blob([icsContent], { type: 'text/calendar' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedEvent.title}.ics`;
                    a.click();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Download size={20} />
                  Takvime Kaydet
                </button>

                {/* Location Button */}
                <button
                  onClick={() => {
                    const query = encodeURIComponent(selectedEvent.location);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <MapPin size={20} />
                  Yer Bilgisi
                </button>

                {/* Share Button */}
                <button
                  onClick={async () => {
                    const shareText = `${selectedEvent.title}\n📅 ${selectedEvent.date}\n🕐 ${selectedEvent.time}\n📍 ${selectedEvent.location}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: selectedEvent.title,
                          text: shareText,
                          url: window.location.href
                        });
                      } catch (err) {
                        // User canceled share, do nothing
                        if (err.name !== 'AbortError') {
                          console.error('Share failed:', err);
                        }
                      }
                    } else {
                      try {
                        await navigator.clipboard.writeText(shareText);
                        alert('Etkinlik bilgileri panoya kopyalandı!');
                      } catch (err) {
                        console.error('Clipboard write failed:', err);
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Share2 size={20} />
                  Paylaş
                </button>

                {/* Admin Edit/Delete Buttons */}
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setEditingEvent(selectedEvent);
                        setNewEvent(selectedEvent);
                        setShowEventModal(true);
                        setSelectedEvent(null);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Edit size={20} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
                          deleteEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Trash2 size={20} />
                      Sil
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Recommendation Modal (Admin) */}
      {showRecommendationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingRecommendation ? 'Tavsiye Düzenle' : 'Yeni Tavsiye'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newRecommendation.title}
                onChange={(e) => setNewRecommendation({...newRecommendation, title: e.target.value})}
                placeholder="Başlık"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newRecommendation.type}
                onChange={(e) => setNewRecommendation({...newRecommendation, type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="book">Kitap</option>
                <option value="video">Video</option>
                <option value="movie">Film</option>
              </select>
              <input
                type="text"
                value={newRecommendation.cover_image}
                onChange={(e) => setNewRecommendation({...newRecommendation, cover_image: e.target.value})}
                placeholder="Kapak Resmi URL"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newRecommendation.category}
                onChange={(e) => setNewRecommendation({...newRecommendation, category: e.target.value})}
                placeholder="Kategori"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newRecommendation.author}
                onChange={(e) => setNewRecommendation({...newRecommendation, author: e.target.value})}
                placeholder="Yazar/Yönetmen"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newRecommendation.description}
                onChange={(e) => setNewRecommendation({...newRecommendation, description: e.target.value})}
                placeholder="Açıklama"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="url"
                value={newRecommendation.link}
                onChange={(e) => setNewRecommendation({...newRecommendation, link: e.target.value})}
                placeholder="Link"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateRecommendation}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingRecommendation ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowRecommendationModal(false);
                    setEditingRecommendation(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Modal (Admin) */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingBlog ? 'Blog Düzenle' : 'Yeni Blog'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newBlog.title}
                onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                placeholder="Blog Başlığı"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newBlog.cover_image}
                onChange={(e) => setNewBlog({...newBlog, cover_image: e.target.value})}
                placeholder="Kapak Resmi URL"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={newBlog.category}
                onChange={(e) => setNewBlog({...newBlog, category: e.target.value})}
                placeholder="Kategori"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                placeholder="Kısa Özet"
                rows={2}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={newBlog.content}
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                placeholder="Blog İçeriği"
                rows={10}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newBlog.published}
                  onChange={(e) => setNewBlog({...newBlog, published: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Yayınla</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={addOrUpdateBlog}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingBlog ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowBlogModal(false);
                    setEditingBlog(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    
    {/* Mobile Bottom Navigation - Scrollable */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center h-16 overflow-x-auto hide-scrollbar px-2 gap-1">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'dashboard' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] mt-1">Ana Sayfa</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('calendar')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'calendar' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <Calendar size={20} />
          <span className="text-[10px] mt-1">Takvim</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('agenda')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'agenda' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <ListChecks size={20} />
          <span className="text-[10px] mt-1">Ajanda</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('videos')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'videos' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <GraduationCap size={20} />
          <span className="text-[10px] mt-1">Eğitim</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('prospects')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'prospects' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <UserPlus size={20} />
          <span className="text-[10px] mt-1">Adaylar</span>
        </button>
        

        
        <button
          onClick={() => setCurrentPage('events')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'events' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <CalendarDays size={20} />
          <span className="text-[10px] mt-1">Etkinlikler</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('blogs')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'blogs' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <Book size={20} />
          <span className="text-[10px] mt-1">Blog</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('statistics')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'statistics' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] mt-1">İstatistik</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('inbox')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'inbox' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] mt-1">Mesajlar</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('profile')}
          className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
            currentPage === 'profile' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          }`}
        >
          <User size={20} />
          <span className="text-[10px] mt-1">Profil</span>
        </button>
        
        {isAdminOrManager(currentUser) && (
          <button
            onClick={() => setCurrentPage('admin')}
            className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg ${
              currentPage === 'admin' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
            }`}
          >
            <Shield size={20} />
            <span className="text-[10px] mt-1">Admin</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center min-w-[70px] h-14 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[10px] mt-1">Çıkış</span>
        </button>
      </div>
    </div>
    
    {/* PWA Install Prompt */}
    <PWAInstallPrompt />
    </>
  );
};

export default FocusProApp;
