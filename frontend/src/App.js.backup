import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, GraduationCap, User, Play, Lock, Check, Shield, Plus, Trash2, Target, ListChecks, MessageSquare, BarChart3, LogOut, Eye, EyeOff, TrendingUp, Clock, CheckCircle2, Menu, X, Edit, ChevronLeft, ChevronRight, CalendarDays, UserPlus } from 'lucide-react';
import { authAPI, userAPI, videoAPI, progressAPI, meetingAPI, taskAPI, goalAPI, reasonAPI, prospectAPI, partnerAPI, habitAPI, eventAPI, eventRegistrationAPI } from './services/api';
import './App.css';

const FocusProApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarView, setCalendarView] = useState('week');

  const [videos, setVideos] = useState([]);
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
  
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProspect, setEditingProspect] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', start_time: '', end_time: '', person: '', notes: '', status: 'scheduled' });
  const [newTask, setNewTask] = useState({ title: '', date: '', priority: 'medium', status: 'todo', description: '', assignee: '' });
  const [newGoal, setNewGoal] = useState({ title: '', type: 'daily', target: '', deadline: '', current: 0 });
  const [newReason, setNewReason] = useState({ title: '', description: '' });
  const [newProspect, setNewProspect] = useState({ name: '', phone: '', email: '', status: 'new', notes: '', source: '' });
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', email: '', rank: '', join_date: '', performance: '', status: 'active' });
  const [newVideo, setNewVideo] = useState({ title: '', youtube_id: '', description: '', duration: '', category: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', max_participants: '' });

  useEffect(() => {
    checkAutoLogin();
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadAllData();
    }
  }, [isLoggedIn, currentUser]);

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
      const response = await authAPI.login(loginForm.email, loginForm.password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert('Email veya şifre hatalı!');
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
        currentUser?.role === 'admin' ? loadUsers() : Promise.resolve()
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

  const loadVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setVideos(response.data);
    } catch (error) {
      console.error('Videolar yüklenemedi:', error);
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
