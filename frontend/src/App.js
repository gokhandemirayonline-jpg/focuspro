import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, GraduationCap, User, Play, Lock, Check, Shield, Plus, Trash2, Target, ListChecks, MessageSquare, BarChart3, LogOut, Eye, EyeOff, TrendingUp, Clock, CheckCircle2, Menu, X, Edit, ChevronLeft, ChevronRight, CalendarDays, UserPlus, Bell, Search, Book, Film, Bookmark, FileText, Mail, Send, Download, Activity, Award, MapPin, Share2, Star } from 'lucide-react';
import { authAPI, userAPI, videoCategoryAPI, videoAPI, progressAPI, meetingAPI, taskAPI, goalAPI, reasonAPI, prospectCategoryAPI, prospectAPI, partnerAPI, habitAPI, eventAPI, eventRegistrationAPI, notificationAPI, recommendationAPI, blogAPI, searchAPI, fileAPI, messageAPI, statisticsAPI, activityLogAPI, learningPathAPI, badgeAPI, characterAnalysisAPI, futureCharacterAPI, fullLifeProfileAPI, dreamPriorityAPI } from './services/api';
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
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
  const [adminTab, setAdminTab] = useState('users'); // users, trainings, logs
  
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({ title: '', target: 1 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
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

  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled', category: 'work', color: '#3b82f6', all_day: false });
  const [newTask, setNewTask] = useState({ title: '', date: '', priority: 'medium', status: 'todo', description: '', assignee: '' });
  const [newGoal, setNewGoal] = useState({ title: '', type: 'daily', target: '', deadline: '', current: 0 });
  const [newReason, setNewReason] = useState({ title: '', description: '', image: '' });
  const [newProspect, setNewProspect] = useState({ name: '', phone: '', email: '', status: 'new', notes: '', source: '' });
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', email: '', rank: '', join_date: '', performance: '', status: 'active' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', max_participants: '' });
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
      console.log('No auto login');
      localStorage.removeItem('token');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await authAPI.login({
        email_or_id: loginForm.email,
        password: loginForm.password
      });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert('Email/ID veya şifre hatalı!');
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert('Tüm alanları doldurun!');
      return;
    }
    
    try {
      await authAPI.register(registerForm.name, registerForm.email, registerForm.password, registerForm.role);
      setRegisterForm({ name: '', email: '', password: '', role: 'user' });
      setShowRegister(false);
      alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    } catch (error) {
      alert(error.response?.data?.detail || 'Kayıt başarısız!');
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
        currentUser?.role === 'admin' ? loadUsers() : Promise.resolve(),
        currentUser?.role === 'admin' ? loadStatistics() : Promise.resolve(),
        currentUser?.role === 'admin' ? loadVideoStatistics() : Promise.resolve(),
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
    if (currentUser?.role !== 'admin') return;
    
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
        'Rol': user.role === 'admin' ? 'Admin' : 'Kullanıcı',
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
        user.role === 'admin' ? 'Admin' : 'Kullanıcı',
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
      setNewMeeting({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled' });
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
    if (!newUser.name || !newUser.email) {
      alert('İsim ve email alanları zorunludur!');
      return;
    }
    
    // Yeni kullanıcı oluştururken şifre zorunlu
    if (!editingUser && !newUser.password) {
      alert('Yeni kullanıcı için şifre zorunludur!');
      return;
    }
    
    try {
      if (editingUser) {
        // Düzenleme: sadece dolu alanları gönder
        const updateData = {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        };
        
        // Şifre doldurulduysa ekle
        if (newUser.password && newUser.password.trim() !== '') {
          updateData.password = newUser.password;
        }
        
        await userAPI.update(editingUser.id, updateData);
        alert('Kullanıcı başarıyla güncellendi!');
      } else {
        // Yeni kullanıcı: tüm bilgileri gönder
        await userAPI.create(newUser);
        alert('Kullanıcı başarıyla oluşturuldu!');
      }
      
      await loadUsers();
      setNewUser({ name: '', email: '', password: '', role: 'user' });
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

  const viewUserDetails = async (user) => {
    setSelectedUserDetail(user);
    setShowUserDetailModal(true);
    
    // Load user activities
    try {
      const [goalsRes, partnersRes, prospectsRes, reasonsRes] = await Promise.all([
        goalAPI.getAll(),
        partnerAPI.getAll(),
        prospectAPI.getAll(),
        reasonAPI.getAll()
      ]);
      
      setUserActivities({
        goals: goalsRes.data.filter(g => g.user_id === user.id),
        partners: partnersRes.data.filter(p => p.user_id === user.id),
        prospects: prospectsRes.data.filter(p => p.user_id === user.id),
        reasons: reasonsRes.data.filter(r => r.user_id === user.id)
      });
    } catch (error) {
      console.error('Kullanıcı aktiviteleri yüklenemedi:', error);
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
      setNewEvent({ title: '', date: '', time: '', location: '', description: '', max_participants: '' });
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Focus Pro</h1>
            <p className="text-gray-600 mt-2">Network Marketing Yönetim Platformu</p>
          </div>

          {!showRegister ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email veya ID Numarası</label>
                <input
                  type="text"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@example.com veya ID numarası (örn: 01)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Kayıt Ol
              </button>
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Test Hesabı:</p>
                <p>Email: admin@focuspro.com veya ID: 00</p>
                <p>Şifre: admin123</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Kayıt Ol
              </button>
              <button
                onClick={() => setShowRegister(false)}
                className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Geri Dön
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  // MAIN APP UI
  return (
    <>
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16 md:w-20'} ${darkMode ? 'bg-[#2a2a2a]' : 'bg-gradient-to-b from-purple-700 to-indigo-800'} text-white transition-all duration-300 flex flex-col fixed md:relative h-full z-50`}>
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
            onClick={() => setCurrentPage('partners')}
            className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all ${
              currentPage === 'partners' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Users size={20} />
            {sidebarOpen && <span>Partnerler</span>}
          </button>

          <button
            onClick={() => setCurrentPage('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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

          {currentUser?.role === 'admin' && (
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
      <div className={`flex-1 overflow-auto flex flex-col w-full ${sidebarOpen ? 'ml-64 md:ml-0' : 'ml-16 md:ml-20'} transition-all duration-300`}>
        {/* Top Navbar - Arama ve Bildirimler */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ara... (isim, video, kitap, blog)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        const getNotificationPage = (type) => {
                          const typeMap = {
                            'user': 'admin',
                            'partner': 'partners',
                            'goal': 'agenda',
                            'video': 'videos',
                            'badge': 'badges',
                            'message': 'inbox',
                            'task': 'agenda',
                            'prospect': 'agenda'
                          };
                          return typeMap[type] || 'dashboard';
                        };

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.read) markNotificationRead(notif.id);
                              const targetPage = getNotificationPage(notif.type);
                              setCurrentPage(targetPage);
                              if (targetPage === 'agenda') {
                                if (notif.type === 'task') setAgendaTab('tasks');
                                else if (notif.type === 'goal') setAgendaTab('goals');
                                else if (notif.type === 'prospect') setAgendaTab('prospects');
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

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* DASHBOARD PAGE */}
          {currentPage === 'dashboard' && (
            <DashboardPage 
              stats={stats}
              dailyHabits={dailyHabits}
              tasks={tasks}
              meetings={meetings}
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

          {/* PARTNERS PAGE */}
          {currentPage === 'partners' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Partnerler</h2>
                <button
                  onClick={() => {
                    setShowPartnerModal(true);
                    setEditingPartner(null);
                    setNewPartner({ name: '', phone: '', email: '', rank: '', join_date: '', performance: '', status: 'active' });
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus size={20} />
                  Yeni Partner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map(partner => (
                  <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.rank}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {partner.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>📞 {partner.phone}</p>
                      <p>📧 {partner.email}</p>
                      <p>📅 Katılım: {partner.join_date}</p>
                      <p>📊 Performans: {partner.performance}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPartner(partner);
                          setNewPartner(partner);
                          setShowPartnerModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deletePartner(partner.id)}
                        className="px-4 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {partners.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    Henüz partner eklenmemiş
                  </div>
                )}
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
                        setNewEvent({ title: '', date: '', time: '', location: '', description: '', max_participants: '', image: '' });
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
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Ajanda</h1>
              
              {/* Tabs */}
              <div className="mb-6 flex gap-1 border-b border-gray-200">
                <button
                  onClick={() => setAgendaTab('tasks')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'tasks' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ListChecks className="inline mr-2" size={20} />
                  Görevler
                </button>
                <button
                  onClick={() => setAgendaTab('prospects')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'prospects' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <UserPlus className="inline mr-2" size={20} />
                  İsim Listesi
                </button>
                <button
                  onClick={() => setAgendaTab('goals')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'goals' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Target className="inline mr-2" size={20} />
                  Hedefler
                </button>
                <button
                  onClick={() => setAgendaTab('habits')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'habits' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <CheckCircle2 className="inline mr-2" size={20} />
                  Günlük Alışkanlıklar
                </button>
                <button
                  onClick={() => setAgendaTab('dreams')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'dreams' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare className="inline mr-2" size={20} />
                  Hayaller
                </button>
                <button
                  onClick={() => setAgendaTab('character')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'character' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare className="inline mr-2" size={20} />
                  Karakter Analizi
                </button>
                <button
                  onClick={() => setAgendaTab('lifeprofile')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    agendaTab === 'lifeprofile' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Star className="inline mr-2" size={20} />
                  Tam Yaşam Tablosu
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {agendaTab === 'tasks' && (
                  <div>
                    {/* TASKS CONTENT - Will be moved here */}
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">Görevler</h2>
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
            <StatisticsPage user={currentUser} />
          )}

          {currentPage === 'statistics_old' && currentUser?.role === 'admin' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">İstatistikler & Analitik</h2>
                <div className="flex gap-3">
                  <button
                    onClick={exportToExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <Download size={20} />
                    Excel İndir
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

              {/* Dashboard Cards */}
              {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_users}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
                    <p className="text-sm opacity-80">Sistemdeki tüm kullanıcılar</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <UserPlus size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.users_today}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Bugün Kayıt</h3>
                    <p className="text-sm opacity-80">Bugün kayıt olan kullanıcılar</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Activity size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.active_users}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Aktif Kullanıcı</h3>
                    <p className="text-sm opacity-80">Son 7 gün içinde</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Target size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_goals}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Toplam Hedef</h3>
                    <p className="text-sm opacity-80">Oluşturulan hedefler</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_partners}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Toplam Partner</h3>
                    <p className="text-sm opacity-80">Eklenen partnerler</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <CalendarDays size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_events}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Toplam Etkinlik</h3>
                    <p className="text-sm opacity-80">Oluşturulan etkinlikler</p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <ListChecks size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_prospects}</span>
                    </div>
                    <h3 className="text-lg font-semibold">İsim Listesi</h3>
                    <p className="text-sm opacity-80">Toplam kayıtlar</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Mail size={32} className="opacity-80" />
                      <span className="text-3xl font-bold">{dashboardStats.total_messages}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Toplam Mesaj</h3>
                    <p className="text-sm opacity-80">Gönderilen mesajlar</p>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Registration Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Kullanıcı Kayıt Trendi (30 Gün)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userRegistrationData.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="Kayıt Sayısı" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Event Participation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Etkinlik Katılımları</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventParticipationData.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="event_name" tick={{fontSize: 10}} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="participants" fill="#3B82F6" name="Katılımcı" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">En Aktif Kullanıcılar</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hedefler</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partnerler</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nedenler</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeUsersData.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{user.goals}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{user.partners}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{user.prospects}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{user.reasons}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                              {user.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BLOGS PAGE */}
          {currentPage === 'blogs' && (
            <BlogPage user={currentUser} />
          )}

          {currentPage === 'blogs_old' && !selectedBlog && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Blog</h2>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setShowBlogModal(true);
                      setEditingBlog(null);
                      setNewBlog({ title: '', content: '', cover_image: '', excerpt: '', category: '', tags: [], published: false });
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                  >
                    <Plus size={20} />
                    Yeni Blog
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.filter(b => b.published || currentUser?.role === 'admin').map(blog => (
                  <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {blog.cover_image && (
                      <img 
                        src={blog.cover_image} 
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      {blog.category && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full mb-3 inline-block">
                          {blog.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{blog.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt || blog.content.substring(0, 150) + '...'}
                      </p>
                      <button
                        onClick={async () => {
                          const response = await blogAPI.getOne(blog.id);
                          setSelectedBlog(response.data);
                        }}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                      >
                        Oku
                      </button>
                    </div>
                  </div>
                ))}
                {blogs.filter(b => b.published || currentUser?.role === 'admin').length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Henüz blog yazısı yok
                  </div>
                )}
              </div>
            </div>
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
                <button
                  onClick={() => {
                    setShowMeetingModal(true);
                    setEditingMeeting(null);
                    setNewMeeting({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled', category: 'work', color: '#3b82f6', all_day: false });
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Yeni Görüşme</span>
                </button>
              </div>

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
                  events={meetings
                    .filter(m => {
                      // Filter by status
                      if (!showCompleted && m.status === 'completed') return false;
                      if (!showRejected && m.status === 'cancelled') return false;
                      // Filter by category
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
                      color: meeting.color || (
                        meeting.category === 'work' ? '#3b82f6' :
                        meeting.category === 'personal' ? '#10b981' :
                        meeting.category === 'important' ? '#ef4444' : '#3b82f6'
                      )
                    }))}
                  view={calendarView}
                  views={['day', 'week', 'work_week', 'month', 'agenda']}
                  onView={(view) => setCalendarView(view)}
                  date={currentDate}
                  onNavigate={(date) => setCurrentDate(date)}
                  toolbar={false}
                  onSelectSlot={(slotInfo) => {
                    setShowMeetingModal(true);
                    setEditingMeeting(null);
                    const dateStr = moment(slotInfo.start).format('YYYY-MM-DD');
                    const startTime = moment(slotInfo.start).format('HH:mm');
                    const endTime = moment(slotInfo.end).format('HH:mm');
                    setNewMeeting({ 
                      title: '', 
                      date: dateStr, 
                      start_time: startTime, 
                      end_time: endTime, 
                      person: '', 
                      notes: '', 
                      status: 'scheduled',
                      category: 'work',
                      color: '#3b82f6',
                      all_day: false
                    });
                  }}
                  onSelectEvent={(event) => {
                    setEditingMeeting(event.resource);
                    setNewMeeting(event.resource);
                    setShowMeetingModal(true);
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
                  draggableAccessor={() => true}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.color,
                      borderColor: event.color,
                      color: 'white'
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
                    onClick={() => setAdminTab('users')}
                    className={`px-4 py-2 font-medium transition-all ${
                      adminTab === 'users'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Kullanıcı Yönetimi
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
                      setNewUser({ name: '', email: '', password: '', role: 'user' });
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
                      <option value="user">Kullanıcı</option>
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
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === getFilteredUsers().length && getFilteredUsers().length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredUsers().map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                            #{formatUserNumber(user.user_number)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="text-green-600 hover:text-green-700"
                              title="Detayları Gör"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setNewUser({ ...user, password: '' });
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      
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
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="İsim"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder={editingUser ? "Şifre (boş bırakın değiştirmemek için)" : "Şifre"}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
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

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Kullanıcı Detayları</h3>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUserDetail(null);
                  setUserActivities(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUserDetail.name}</h4>
                  <p className="text-gray-600">{selectedUserDetail.email}</p>
                  <p className="text-sm text-purple-600 font-medium">ID: {formatUserNumber(selectedUserDetail.user_number)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Rol:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUserDetail.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedUserDetail.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Kayıt Tarihi:</span>
                  <span className="ml-2 text-sm font-medium text-gray-800">
                    {new Date(selectedUserDetail.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Activities */}
            {userActivities ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Goals */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Target size={20} className="text-purple-600" />
                    Hedefler ({userActivities.goals.length})
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userActivities.goals.length > 0 ? (
                      userActivities.goals.map(goal => (
                        <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{goal.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(goal.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz hedef eklenmemiş</p>
                    )}
                  </div>
                </div>

                {/* Partners */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    Partnerler ({userActivities.partners.length})
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userActivities.partners.length > 0 ? (
                      userActivities.partners.map(partner => (
                        <div key={partner.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">{partner.name}</p>
                          <p className="text-xs text-gray-500">{partner.phone}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz partner eklenmemiş</p>
                    )}
                  </div>
                </div>

                {/* Prospects */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <UserPlus size={20} className="text-green-600" />
                    İsim Listesi ({userActivities.prospects.length})
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userActivities.prospects.length > 0 ? (
                      userActivities.prospects.map(prospect => (
                        <div key={prospect.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">{prospect.name}</p>
                          <p className="text-xs text-gray-500">{prospect.phone}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz isim eklenmemiş</p>
                    )}
                  </div>
                </div>

                {/* Reasons */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquare size={20} className="text-orange-600" />
                    Nedenler ({userActivities.reasons.length})
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userActivities.reasons.length > 0 ? (
                      userActivities.reasons.map(reason => (
                        <div key={reason.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{reason.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(reason.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz neden eklenmemiş</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Aktiviteler yükleniyor...</p>
              </div>
            )}
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
    </>
  );
};

export default FocusProApp;
