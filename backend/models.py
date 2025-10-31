from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid


# User Models
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "user"  # user or admin

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


# Video Models
class VideoBase(BaseModel):
    title: str
    youtube_id: str
    description: str
    duration: str
    category: str

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


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
