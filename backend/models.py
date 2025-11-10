from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid


# User Models
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "user"  # user or admin
    
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
    password: str

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    user_number: int
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
    unlocked: bool = False
    comment: Optional[str] = None
    completed_at: Optional[datetime] = None

class VideoProgress(VideoProgressBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str


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

class GoalCreate(GoalBase):
    pass

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


# Prospect Models
class ProspectBase(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    status: str = "new"  # new, contacted, interested, converted, lost
    notes: str = ""
    source: str = ""

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
    target: int
    completed: int = 0
    done: bool = False

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))


# Event Models
class EventBase(BaseModel):
    title: str
    date: str
    time: str = ""
    location: str = ""
    description: str = ""
    max_participants: str = ""

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
    type: str = "inbox"  # inbox, notification

class MessageCreate(MessageBase):
    recipient_ids: List[str]  # List of user IDs to send message to

class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_name: str
    recipient_id: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
