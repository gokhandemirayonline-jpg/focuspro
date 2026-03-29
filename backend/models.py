from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid


# User Models
ALL_PERMISSIONS = [
    {"key": "users_view",        "label": "Kullanıcıları Görüntüle",      "icon": "👥", "group": "Kullanıcı Yönetimi"},
    {"key": "users_manage",      "label": "Kullanıcı Ekle/Düzenle",     "icon": "⚙️", "group": "Kullanıcı Yönetimi"},
    {"key": "statistics_view",  "label": "İstatistikleri Görüntüle",  "icon": "📊", "group": "Raporlama"},
    {"key": "reports_download", "label": "Rapor İndir",               "icon": "📥", "group": "Raporlama"},
    {"key": "videos_manage",    "label": "Video Yönetimi",           "icon": "🎥", "group": "İçerik"},
    {"key": "blogs_manage",     "label": "Blog Yönetimi",            "icon": "📝", "group": "İçerik"},
    {"key": "habits_manage",    "label": "Alışkanlık Yönetimi",      "icon": "📦", "group": "İçerik"},
    {"key": "events_manage",    "label": "Etkinlik Yönetimi",        "icon": "📅", "group": "İçerik"},
    {"key": "badges_manage",    "label": "Rozet Yönetimi",           "icon": "🏅", "group": "Kullanıcı Yönetimi"},
    {"key": "notifications_send","label": "Bildirim Gönder",         "icon": "🔔", "group": "Kullanıcı Yönetimi"},
]

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "user"  # user, manager or admin
    
    # Profil bilgileri
    profile_photo: str = ""  # Base64 encoded image
    career_title: str = ""   # Kariyer/Unvan
    phone: str = ""
    city: str = ""
    country: str = ""
    language: str = "tr"     # Dil ayarı
    
    # Sosyal medya bağlantıları
    linkedin_url: str = ""
    twitter_url: str = ""
    instagram_url: str = ""
    facebook_url: str = ""

class UserCreate(UserBase):
    password: str = ""   # Admin oluştururken boş, kullanıcı kendisi belirler
    user_number: Optional[int] = None  # Admin tarafından set edilir - 8 haneli
    permissions: List[str] = []  # Manager için yetkinlikler

class UserLogin(BaseModel):
    email_or_id: str  # Email veya ID numarası
    password: str

class UserUpdate(BaseModel):
    name: str = None
    career_title: str = None
    phone: str = None
    city: str = None
    country: str = None
    language: str = None
    linkedin_url: str = None
    twitter_url: str = None
    instagram_url: str = None
    facebook_url: str = None
    profile_photo: str = None

class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    user_number: Optional[int] = None
    permissions: Optional[List[str]] = None
    career_title: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    profile_photo: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password: str  # Password field for database storage
    user_number: int = Field(default=0)  # ID numarası
    permissions: List[str] = Field(default=[])  # Manager yetkinlikleri
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    user_number: int
    permissions: List[str] = []
    created_at: datetime
    profile_photo: str = ""
    career_title: str = ""
    phone: str = ""
    city: str = ""
    country: str = ""
    language: str = "tr"
    linkedin_url: str = ""
    twitter_url: str = ""
    instagram_url: str = ""
    facebook_url: str = ""


# Video Category Models
class VideoCategoryBase(BaseModel):
    name: str
    description: str = ""
    icon: str = "📚"
    order: int = 0

class VideoCategoryCreate(VideoCategoryBase):
    pass

class VideoCategory(VideoCategoryBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Video Models
class VideoBase(BaseModel):
    title: str
    youtube_id: str
    description: str
    duration: str
    category: str
    category_id: Optional[str] = None
    level: str = "Başlangıç"  # Başlangıç, Orta, İleri
    order: int = 0  # Sıralama için

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    view_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Video Progress Models
class VideoProgressBase(BaseModel):
    video_id: str
    watched: bool = False
    watch_percentage: int = 0  # 0-100 arası izleme yüzdesi
    unlocked: bool = True  # Varsayılan olarak açık
    comment: Optional[str] = None
    completed_at: Optional[datetime] = None
    view_count: int = 0  # Kaç kez izlendiği

class VideoProgressUpdate(BaseModel):
    watch_percentage: int
    watched: Optional[bool] = None

class VideoProgress(VideoProgressBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Learning Path Models
class LearningPathBase(BaseModel):
    title: str
    description: str = ""
    category_id: str
    level: str = "Başlangıç"  # Başlangıç, Orta, İleri
    video_ids: List[str] = []  # Sıralı video ID'leri
    prerequisites: List[str] = []  # Ön koşul path ID'leri
    is_active: bool = True

class LearningPathCreate(LearningPathBase):
    pass

class LearningPathUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    video_ids: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    is_active: Optional[bool] = None

class LearningPath(LearningPathBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Badge Models
class BadgeBase(BaseModel):
    name: str
    description: str
    icon: str = "🏆"  # Emoji ikonu
    type: str = "auto"  # auto (otomatik), manual (admin verir)
    criteria: str = ""  # Nasıl kazanılır açıklaması
    reward_type: str  # first_video, 10_goals, 1_month, most_active, all_videos, category_complete, special

class BadgeCreate(BadgeBase):
    pass

class Badge(BadgeBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# User Badge Models (Kullanıcının kazandığı rozetler)
class UserBadgeBase(BaseModel):
    user_id: str
    badge_id: str
    awarded_by: Optional[str] = None  # Admin ID (manuel verilmişse)
    note: Optional[str] = None  # Admin notu

class UserBadgeCreate(BaseModel):
    badge_id: str
    note: Optional[str] = None

class UserBadge(UserBadgeBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    earned_at: datetime = Field(default_factory=datetime.utcnow)


# Meeting Models
class MeetingBase(BaseModel):
    title: str
    date: str
    start_time: str = ""
    end_time: str = ""
    person: str = ""
    notes: str = ""
    status: str = "scheduled"  # scheduled, completed, cancelled
    category: str = "work"  # work, personal, important
    color: str = "#3b82f6"  # Default blue color
    all_day: bool = False

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Task Models
class TaskBase(BaseModel):
    title: str
    date: str = ""
    priority: str = "medium"  # low, medium, high
    status: str = "todo"  # todo, in_progress, done
    description: str = ""
    assignee: str = ""

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Goal Models
class GoalBase(BaseModel):
    title: str
    type: str = "daily"  # daily, weekly, monthly
    target: str
    deadline: str = ""
    current: int = 0
    done: bool = False

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target: Optional[str] = None
    deadline: Optional[str] = None
    current: Optional[int] = None
    done: Optional[bool] = None

class Goal(GoalBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Reason Models
class ReasonBase(BaseModel):
    title: str
    description: str = ""
    image: str = ""  # Base64 encoded image or file path

class ReasonCreate(ReasonBase):
    pass

class Reason(ReasonBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Dream Priority Models
class DreamPriorityBase(BaseModel):
    title: str = ""  # Analiz başlığı (opsiyonel)
    initial_dreams: List[str] = []  # 10 hayalin ilk listesi
    final_priorities: List[str] = []  # 10'dan 1'e elendikten sonraki öncelik sırası (sıralı)
    top_priority: str = ""  # En önemli hayal (final_priorities[0])
    descriptions: dict = {}  # Her hayal için detay açıklamalar {dream: description}
    images: dict = {}  # Her hayal için görsel URL'leri {dream: image_url}
    target_income: str = ""  # Hedef gelir
    target_months: str = ""  # Hedef süre (ay)
    daily_hours: str = ""  # Günlük ayırabileceği saat

class DreamPriorityCreate(DreamPriorityBase):
    pass

class DreamPriorityUpdate(BaseModel):
    title: str = None
    initial_dreams: List[str] = None
    final_priorities: List[str] = None
    top_priority: str = None
    descriptions: dict = None
    images: dict = None
    target_income: str = None
    target_months: str = None
    daily_hours: str = None

class DreamPriority(DreamPriorityBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Character Analysis Models
class RecentEvents(BaseModel):
    proud_moment: str = ""
    struggled_moment: str = ""
    avoided_moment: str = ""
    last_angry: str = ""
    last_happy: str = ""
    recurring_pattern: str = ""

class IdealDay(BaseModel):
    wake_up: str = ""
    morning: str = ""
    work: str = ""
    afternoon: str = ""
    evening: str = ""
    before_sleep: str = ""
    peoples_say: str = ""
    feelings: str = ""
    values: str = ""

class NinetyDayPlan(BaseModel):
    main_identity: str = ""
    weekly_action: str = ""
    obstacles: str = ""
    plan_b: str = ""
    weekly_check_in: str = ""
    first_week: str = ""

class CharacterAnalysisBase(BaseModel):
    recent_events: RecentEvents = RecentEvents()
    ideal_day: IdealDay = IdealDay()
    ninety_day_plan: NinetyDayPlan = NinetyDayPlan()
    ai_insights: str = ""

class CharacterAnalysisCreate(CharacterAnalysisBase):
    pass

class CharacterAnalysis(CharacterAnalysisBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Future Character Models (5+ years vision)
class FutureCharacterTraits(BaseModel):
    keywords: List[str] = []  # 5 kelime
    personality_traits: str = ""  # Kişilik özellikleri
    strengths: str = ""  # Güçlü yönler
    emotional_state: str = ""  # Duygusal hal
    mental_abilities: str = ""  # Zihinsel yetenekler

class FutureLifeVision(BaseModel):
    life_overview: str = ""  # Genel yaşam
    relationships: str = ""  # İlişkiler
    career: str = ""  # Kariyer
    mastery_areas: str = ""  # Uzmanlık alanları
    core_values: str = ""  # Değerler
    social_perception: str = ""  # Çevre nasıl tanımlasın

class TransformationPlan(BaseModel):
    changes_needed: str = ""  # Değişmesi gerekenler
    habits_to_gain: str = ""  # Kazanılacak alışkanlıklar
    habits_to_remove: str = ""  # Bırakılacak alışkanlıklar
    skills_to_learn: str = ""  # Öğrenilecek beceriler
    mentors: str = ""  # Mentorlar
    first_year_actions: str = ""  # İlk yıl aksiyonları

class FutureCharacterBase(BaseModel):
    character_traits: FutureCharacterTraits = FutureCharacterTraits()
    life_vision: FutureLifeVision = FutureLifeVision()
    transformation_plan: TransformationPlan = TransformationPlan()
    ai_insights: str = ""

class FutureCharacterCreate(FutureCharacterBase):
    pass

class FutureCharacter(FutureCharacterBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Full Life Profile Models (Detaylı Yaşam Tablosu)
class CurrentStateProfile(BaseModel):
    # Fiziksel
    physical: str = ""
    energy: str = ""
    style: str = ""
    # Yetenekler
    skills: str = ""
    hobbies: str = ""
    # Maddi
    home: str = ""
    car: str = ""
    possessions: str = ""
    financial: str = ""
    # Yaşam Tarzı
    places: str = ""
    social_circle: str = ""
    daily_routine: str = ""
    # Karakter
    positive_traits: str = ""
    negative_traits: str = ""

class FutureStateProfile(BaseModel):
    # Fiziksel
    physical: str = ""
    energy: str = ""
    style: str = ""
    # Yetenekler
    skills: str = ""
    hobbies: str = ""
    achievements: str = ""
    # Maddi
    home: str = ""
    car: str = ""
    possessions: str = ""
    financial: str = ""
    # Yaşam Tarzı
    places: str = ""
    social_circle: str = ""
    daily_routine: str = ""
    lifestyle: str = ""
    # Karakter
    transformed_traits: str = ""

class ActionPlan90Days(BaseModel):
    identity_90: str = ""
    skills_to_learn: str = ""
    financial_steps: str = ""
    health_steps: str = ""
    social_steps: str = ""
    first_month: str = ""

class FullLifeProfileBase(BaseModel):
    current_state: CurrentStateProfile = CurrentStateProfile()
    future_state: FutureStateProfile = FutureStateProfile()
    action_plan: ActionPlan90Days = ActionPlan90Days()
    current_ai_analysis: str = ""
    future_ai_analysis: str = ""
    gap_analysis: str = ""

class FullLifeProfileCreate(FullLifeProfileBase):
    pass

class FullLifeProfile(FullLifeProfileBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Prospect Category Models
class ProspectCategoryBase(BaseModel):
    name: str
    icon: str = "📋"
    color: str = "gray"
    order: int = 0

class ProspectCategoryCreate(ProspectCategoryBase):
    pass

class ProspectCategory(ProspectCategoryBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Prospect Column Models (Dynamic columns for prospects table)
class ProspectColumnBase(BaseModel):
    column_name: str
    column_type: str  # "text", "number", "date", "checkbox"
    order: int = 0
    is_required: bool = False

class ProspectColumnCreate(ProspectColumnBase):
    pass

class ProspectColumn(ProspectColumnBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str  # Admin ID who created this column
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Prospect Models
class ProspectBase(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    status: str = "new"  # new, contacted, interested, converted, lost
    notes: str = ""
    source: str = ""
    category_id: str = ""  # Kategori ID
    rating: int = 0  # 0-5 yıldız puanlama
    custom_fields: dict = {}  # Dynamic custom fields data

class ProspectCreate(ProspectBase):
    pass

class Prospect(ProspectBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    added_date: datetime = Field(default_factory=datetime.utcnow)


# Partner Models
class PartnerBase(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    rank: str = ""
    join_date: str = ""
    performance: str = ""
    status: str = "active"  # active, inactive

class PartnerCreate(PartnerBase):
    pass

class Partner(PartnerBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Habit Models
class HabitBase(BaseModel):
    title: str
    description: str = ""
    frequency: str = "daily"  # daily, weekly, monthly

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str  # Admin user ID
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Habit Completion Models (User-specific daily completions)
class HabitCompletionBase(BaseModel):
    habit_id: str
    completion_date: str  # YYYY-MM-DD format
    notes: str = ""

class HabitCompletionCreate(HabitCompletionBase):
    pass

class HabitCompletion(HabitCompletionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Event Models
class EventBase(BaseModel):
    title: str
    date: str
    time: str = ""
    location: str = ""
    description: str = ""
    max_participants: str = ""
    image: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)



# Notification Models
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, video_complete, admin
    link: str = ""
    read: bool = False

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Activity Log Models
class ActivityLogBase(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    action: str  # login, logout, create, update, delete
    resource_type: str  # user, video, goal, partner, etc.
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str = "success"  # success, failed

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Recommendation Models
class RecommendationBase(BaseModel):
    title: str
    type: str  # book, video, movie
    description: str
    cover_image: str = ""
    link: str = ""
    author: str = ""  # For books
    duration: str = ""  # For videos/movies
    category: str = ""

class RecommendationCreate(RecommendationBase):
    pass

class Recommendation(RecommendationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Blog Models
class BlogBase(BaseModel):
    title: str
    content: str
    cover_image: str = ""
    excerpt: str = ""
    category: str = ""
    tags: List[str] = []
    published: bool = False

class BlogCreate(BlogBase):
    pass

class Blog(BlogBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    author_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Event Registration Models
class EventRegistrationBase(BaseModel):
    event_id: str
    status: str = "pending"  # pending, approved, rejected

class EventRegistrationCreate(EventRegistrationBase):
    pass

class EventRegistration(EventRegistrationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    registered_at: datetime = Field(default_factory=datetime.utcnow)


# Message/Inbox Models
class MessageBase(BaseModel):
    subject: str
    content: str
    type: str = "inbox"  # inbox, notification, video_comment

class MessageCreate(MessageBase):
    recipient_ids: List[str]  # List of user IDs to send message to
    video_id: Optional[str] = None  # For video comments
    parent_id: Optional[str] = None  # For replies

class MessageReply(BaseModel):
    content: str

class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_name: str
    recipient_id: str
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    parent_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
