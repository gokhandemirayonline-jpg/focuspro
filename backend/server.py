from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import jwt
from datetime import datetime, timedelta
import bcrypt
import base64

from models import (
    UserCreate, UserLogin, User, UserResponse, UserUpdate, UserAdminUpdate, ChangePassword,
    VideoCreate, Video,
    VideoProgress, VideoProgressBase,
    MeetingCreate, Meeting,
    TaskCreate, Task,
    GoalCreate, Goal,
    ReasonCreate, Reason,
    ProspectCreate, Prospect,
    PartnerCreate, Partner,
    HabitCreate, Habit,
    EventCreate, Event,
    EventRegistrationCreate, EventRegistration,
    NotificationCreate, Notification,
    RecommendationCreate, Recommendation,
    BlogCreate, Blog
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Focus Pro API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


# Initialize default admin user
async def init_default_admin():
    admin = await db.users.find_one({"email": "admin@focuspro.com"}, {"_id": 0})
    if not admin:
        default_admin = {
            "id": "admin",
            "name": "Admin",
            "email": "admin@focuspro.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "user_number": 0,  # Admin'e 0 numarası
            "created_at": datetime.utcnow().isoformat()
        }
        await db.users.insert_one(default_admin)
        logger.info("Default admin user created")
    elif not admin.get('user_number'):
        # Mevcut admin'e user_number ekle
        await db.users.update_one(
            {"email": "admin@focuspro.com"},
            {"$set": {"user_number": 0}}
        )


# Helper function to send notification to admin
async def notify_admin(title: str, message: str, notification_type: str = "info"):
    """Send notification to admin user"""
    try:
        # Find admin user
        admin = await db.users.find_one({"role": "admin"}, {"_id": 0})
        if admin:
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": admin['id'],
                "title": title,
                "message": message,
                "type": notification_type,
                "read": False,
                "created_at": datetime.utcnow().isoformat()
            }
            await db.notifications.insert_one(notification_data)
            logger.info(f"Admin notification sent: {title}")
    except Exception as e:
        logger.error(f"Failed to send admin notification: {str(e)}")


# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Focus Pro API", "version": "1.0"}


# ============= AUTH ENDPOINTS =============
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Get next user number
    last_user = await db.users.find({}, {"_id": 0}).sort("user_number", -1).limit(1).to_list(1)
    next_user_number = 1
    if last_user and last_user[0].get('user_number'):
        next_user_number = last_user[0]['user_number'] + 1
    
    # Create new user
    user_dict = user_data.model_dump()
    user_dict['password'] = hash_password(user_dict['password'])
    user_dict['user_number'] = next_user_number
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Send notification to admin about new user registration
    await notify_admin(
        title="Yeni Kullanıcı Kaydı",
        message=f"{user_data.name} ({user_data.email}) sisteme kayıt oldu. ID: {next_user_number:02d}",
        notification_type="user"
    )
    
    return UserResponse(**doc)

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Email veya ID numarası ile arama
    user = None
    
    # Eğer girilen değer sayıysa ID numarası olarak ara
    if credentials.email_or_id.isdigit():
        user_number = int(credentials.email_or_id)
        user = await db.users.find_one({"user_number": user_number}, {"_id": 0})
    else:
        # Email olarak ara
        user = await db.users.find_one({"email": credentials.email_or_id}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Geçersiz email/ID veya şifre")
    
    access_token = create_access_token(data={"sub": user['id'], "role": user['role']})
    
    # Prepare user data
    user_data = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "role": user['role'],
        "user_number": user.get('user_number', 0),
        "profile_photo": user.get('profile_photo', ''),
        "career_title": user.get('career_title', ''),
        "phone": user.get('phone', ''),
        "city": user.get('city', ''),
        "country": user.get('country', ''),
        "language": user.get('language', 'tr'),
        "linkedin_url": user.get('linkedin_url', ''),
        "twitter_url": user.get('twitter_url', ''),
        "instagram_url": user.get('instagram_url', ''),
        "facebook_url": user.get('facebook_url', '')
    }
    
    # Handle created_at datetime serialization
    if 'created_at' in user:
        created_at = user['created_at']
        if hasattr(created_at, 'isoformat'):
            user_data['created_at'] = created_at.isoformat()
        else:
            user_data['created_at'] = created_at
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    # Eğer user_number yoksa 0 olarak ayarla
    if 'user_number' not in current_user:
        current_user['user_number'] = 0
    return UserResponse(**current_user)


# ============= USER MANAGEMENT (ADMIN) =============
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    # User'larda user_number yoksa 0 olarak ayarla
    for user in users:
        if 'user_number' not in user:
            user['user_number'] = 0
    return users

@api_router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict['password'] = hash_password(user_dict['password'])
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return UserResponse(**doc)

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: UserAdminUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only update fields that are provided (not None)
    update_data = {}
    for field, value in user_data.model_dump().items():
        if value is not None:
            if field == 'password' and value:  # Only hash if password is provided and not empty
                update_data[field] = hash_password(value)
            else:
                update_data[field] = value
    
    # If no data to update, return current user
    if not update_data:
        return UserResponse(**user)
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    # Fill missing fields with defaults for UserResponse
    if 'user_number' not in updated_user:
        updated_user['user_number'] = 0
    for field in ['profile_photo', 'career_title', 'phone', 'city', 'country', 'language', 'linkedin_url', 'twitter_url', 'instagram_url', 'facebook_url']:
        if field not in updated_user:
            updated_user[field] = '' if field != 'language' else 'tr'
    
    return UserResponse(**updated_user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if user_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}


# ============= VIDEO ENDPOINTS =============
@api_router.get("/videos", response_model=List[Video])
async def get_videos(current_user: dict = Depends(get_current_user)):
    videos = await db.videos.find({}, {"_id": 0}).to_list(1000)
    return videos

@api_router.post("/videos", response_model=Video)
async def create_video(video_data: VideoCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    video_obj = Video(**video_data.model_dump())
    doc = video_obj.model_dump()
    
    await db.videos.insert_one(doc)
    return video_obj

@api_router.put("/videos/{video_id}", response_model=Video)
async def update_video(video_id: str, video_data: VideoCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.videos.update_one({"id": video_id}, {"$set": video_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    
    updated_video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    return Video(**updated_video)

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {"message": "Video deleted successfully"}


# ============= VIDEO PROGRESS ENDPOINTS =============
@api_router.get("/progress", response_model=List[VideoProgress])
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    progress = await db.video_progress.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    # If no progress exists, initialize it
    if not progress:
        videos = await db.videos.find({}, {"_id": 0}).to_list(1000)
        progress = []
        for idx, video in enumerate(videos):
            prog = VideoProgress(
                user_id=current_user['id'],
                video_id=video['id'],
                unlocked=(idx == 0)
            )
            doc = prog.model_dump()
            doc['completed_at'] = doc['completed_at'].isoformat() if doc['completed_at'] else None
            await db.video_progress.insert_one(doc)
            progress.append(prog)
    
    return progress

@api_router.post("/progress/{video_id}")
async def complete_video(video_id: str, comment: str, current_user: dict = Depends(get_current_user)):
    # Get video info
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    
    # Mark current video as watched
    await db.video_progress.update_one(
        {"user_id": current_user['id'], "video_id": video_id},
        {"$set": {
            "watched": True,
            "comment": comment,
            "completed_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Create notification for video completion
    notification = Notification(
        user_id=current_user['id'],
        title="Video Tamamlandı! 🎉",
        message=f"'{video['title']}' videosunu tamamladınız!",
        type="video_complete",
        link=f"/videos/{video_id}"
    )
    notif_doc = notification.model_dump()
    notif_doc['created_at'] = notif_doc['created_at'].isoformat()
    await db.notifications.insert_one(notif_doc)
    
    # Find and unlock next video
    videos = await db.videos.find({}, {"_id": 0}).to_list(1000)
    current_idx = next((i for i, v in enumerate(videos) if v['id'] == video_id), None)
    
    if current_idx is not None and current_idx + 1 < len(videos):
        next_video_id = videos[current_idx + 1]['id']
        next_video = videos[current_idx + 1]
        await db.video_progress.update_one(
            {"user_id": current_user['id'], "video_id": next_video_id},
            {"$set": {"unlocked": True}}
        )
        
        # Create notification for unlocked video
        unlock_notification = Notification(
            user_id=current_user['id'],
            title="Yeni Video Açıldı! 🔓",
            message=f"'{next_video['title']}' videosu izlemeye hazır!",
            type="info",
            link=f"/videos"
        )
        unlock_doc = unlock_notification.model_dump()
        unlock_doc['created_at'] = unlock_doc['created_at'].isoformat()
        await db.notifications.insert_one(unlock_doc)
    
    return {"message": "Video completed successfully"}


# ============= MEETING ENDPOINTS =============
@api_router.get("/meetings", response_model=List[Meeting])
async def get_meetings(current_user: dict = Depends(get_current_user)):
    meetings = await db.meetings.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return meetings

@api_router.post("/meetings", response_model=Meeting)
async def create_meeting(meeting_data: MeetingCreate, current_user: dict = Depends(get_current_user)):
    meeting_dict = meeting_data.model_dump()
    meeting_dict['user_id'] = current_user['id']
    meeting_obj = Meeting(**meeting_dict)
    
    doc = meeting_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.meetings.insert_one(doc)
    
    # Notify admin if user is not admin
    if current_user['role'] != 'admin':
        admin_users = await db.users.find({"role": "admin"}, {"_id": 0}).to_list(100)
        for admin in admin_users:
            notification = Notification(
                user_id=admin['id'],
                title="Yeni Görüşme Planlandı",
                message=f"{current_user['name']} yeni bir görüşme planladı: '{meeting_data.title}'",
                type="meeting_created",
                link=f"/calendar"
            )
            notif_doc = notification.model_dump()
            notif_doc['created_at'] = notif_doc['created_at'].isoformat()
            await db.notifications.insert_one(notif_doc)
    
    return meeting_obj

@api_router.put("/meetings/{meeting_id}", response_model=Meeting)
async def update_meeting(meeting_id: str, meeting_data: MeetingCreate, current_user: dict = Depends(get_current_user)):
    result = await db.meetings.update_one(
        {"id": meeting_id, "user_id": current_user['id']},
        {"$set": meeting_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    updated_meeting = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    return Meeting(**updated_meeting)

@api_router.delete("/meetings/{meeting_id}")
async def delete_meeting(meeting_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.meetings.delete_one({"id": meeting_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return {"message": "Meeting deleted successfully"}


# ============= TASK ENDPOINTS =============
@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_dict = task_data.model_dump()
    task_dict['user_id'] = current_user['id']
    task_obj = Task(**task_dict)
    
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.update_one(
        {"id": task_id, "user_id": current_user['id']},
        {"$set": task_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return Task(**updated_task)

@api_router.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status: str, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.update_one(
        {"id": task_id, "user_id": current_user['id']},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task status updated"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}


# ============= GOAL ENDPOINTS =============
@api_router.get("/goals", response_model=List[Goal])
async def get_goals(current_user: dict = Depends(get_current_user)):
    goals = await db.goals.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return goals

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, current_user: dict = Depends(get_current_user)):
    goal_dict = goal_data.model_dump()
    goal_dict['user_id'] = current_user['id']
    goal_obj = Goal(**goal_dict)
    
    doc = goal_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.goals.insert_one(doc)
    return goal_obj

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.goals.delete_one({"id": goal_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {"message": "Goal deleted successfully"}


# ============= REASON ENDPOINTS =============
@api_router.get("/reasons", response_model=List[Reason])
async def get_reasons(current_user: dict = Depends(get_current_user)):
    reasons = await db.reasons.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return reasons

@api_router.post("/reasons", response_model=Reason)
async def create_reason(reason_data: ReasonCreate, current_user: dict = Depends(get_current_user)):
    reason_dict = reason_data.model_dump()
    reason_dict['user_id'] = current_user['id']
    reason_obj = Reason(**reason_dict)
    
    doc = reason_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reasons.insert_one(doc)
    return reason_obj

@api_router.delete("/reasons/{reason_id}")
async def delete_reason(reason_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.reasons.delete_one({"id": reason_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reason not found")
    
    return {"message": "Reason deleted successfully"}


# ============= PROSPECT ENDPOINTS =============
@api_router.get("/prospects", response_model=List[Prospect])
async def get_prospects(current_user: dict = Depends(get_current_user)):
    prospects = await db.prospects.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return prospects

@api_router.post("/prospects", response_model=Prospect)
async def create_prospect(prospect_data: ProspectCreate, current_user: dict = Depends(get_current_user)):
    prospect_dict = prospect_data.model_dump()
    prospect_dict['user_id'] = current_user['id']
    prospect_obj = Prospect(**prospect_dict)
    
    doc = prospect_obj.model_dump()
    doc['added_date'] = doc['added_date'].isoformat()
    
    await db.prospects.insert_one(doc)
    return prospect_obj

@api_router.put("/prospects/{prospect_id}", response_model=Prospect)
async def update_prospect(prospect_id: str, prospect_data: ProspectCreate, current_user: dict = Depends(get_current_user)):
    result = await db.prospects.update_one(
        {"id": prospect_id, "user_id": current_user['id']},
        {"$set": prospect_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prospect not found")
    
    updated_prospect = await db.prospects.find_one({"id": prospect_id}, {"_id": 0})
    return Prospect(**updated_prospect)

@api_router.delete("/prospects/{prospect_id}")
async def delete_prospect(prospect_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.prospects.delete_one({"id": prospect_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prospect not found")
    
    return {"message": "Prospect deleted successfully"}


# ============= PARTNER ENDPOINTS =============
@api_router.get("/partners", response_model=List[Partner])
async def get_partners(current_user: dict = Depends(get_current_user)):
    partners = await db.partners.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return partners

@api_router.post("/partners", response_model=Partner)
async def create_partner(partner_data: PartnerCreate, current_user: dict = Depends(get_current_user)):
    partner_dict = partner_data.model_dump()
    partner_dict['user_id'] = current_user['id']
    partner_obj = Partner(**partner_dict)
    
    doc = partner_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.partners.insert_one(doc)
    return partner_obj

@api_router.put("/partners/{partner_id}", response_model=Partner)
async def update_partner(partner_id: str, partner_data: PartnerCreate, current_user: dict = Depends(get_current_user)):
    result = await db.partners.update_one(
        {"id": partner_id, "user_id": current_user['id']},
        {"$set": partner_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    updated_partner = await db.partners.find_one({"id": partner_id}, {"_id": 0})
    return Partner(**updated_partner)

@api_router.delete("/partners/{partner_id}")
async def delete_partner(partner_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.partners.delete_one({"id": partner_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {"message": "Partner deleted successfully"}


# ============= HABIT ENDPOINTS =============
@api_router.get("/habits", response_model=List[Habit])
async def get_habits(current_user: dict = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    habits = await db.habits.find({"user_id": current_user['id'], "date": today}, {"_id": 0}).to_list(1000)
    
    # If no habits for today, create default ones
    if not habits:
        default_habits = [
            {"title": "Yeni kişilerle konuş", "target": 5, "completed": 0, "done": False},
            {"title": "Follow-up yap", "target": 3, "completed": 0, "done": False},
            {"title": "Sosyal medya paylaşımı", "target": 2, "completed": 0, "done": False},
            {"title": "Eğitim izle", "target": 1, "completed": 0, "done": False}
        ]
        
        habits = []
        for habit_data in default_habits:
            habit_data['user_id'] = current_user['id']
            habit_obj = Habit(**habit_data)
            doc = habit_obj.model_dump()
            await db.habits.insert_one(doc)
            habits.append(habit_obj)
    
    return habits

@api_router.patch("/habits/{habit_id}")
async def update_habit(habit_id: str, completed: int, current_user: dict = Depends(get_current_user)):
    habit = await db.habits.find_one({"id": habit_id, "user_id": current_user['id']}, {"_id": 0})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    new_completed = min(completed, habit['target'])
    done = new_completed >= habit['target']
    
    await db.habits.update_one(
        {"id": habit_id},
        {"$set": {"completed": new_completed, "done": done}}
    )
    
    return {"message": "Habit updated"}


# ============= EVENT ENDPOINTS =============
@api_router.get("/events", response_model=List[Event])
async def get_events(current_user: dict = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    return events

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    event_obj = Event(**event_data.model_dump())
    doc = event_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.events.insert_one(doc)
    return event_obj

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.events.update_one({"id": event_id}, {"$set": event_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    updated_event = await db.events.find_one({"id": event_id}, {"_id": 0})
    return Event(**updated_event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}


# ============= EVENT REGISTRATION ENDPOINTS =============
@api_router.get("/event-registrations", response_model=List[EventRegistration])
async def get_event_registrations(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'admin':
        registrations = await db.event_registrations.find({}, {"_id": 0}).to_list(1000)
    else:
        registrations = await db.event_registrations.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return registrations

@api_router.post("/event-registrations")
async def register_for_event(event_id: str, current_user: dict = Depends(get_current_user)):
    # Check if already registered
    existing = await db.event_registrations.find_one({
        "event_id": event_id,
        "user_id": current_user['id']
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Get event details
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    registration_obj = EventRegistration(
        event_id=event_id,
        user_id=current_user['id'],
        user_name=current_user['name'],
        user_email=current_user['email']
    )
    
    doc = registration_obj.model_dump()
    doc['registered_at'] = doc['registered_at'].isoformat()
    
    await db.event_registrations.insert_one(doc)
    
    # Create notification for admin
    admin_users = await db.users.find({"role": "admin"}, {"_id": 0}).to_list(100)
    for admin in admin_users:
        notification = Notification(
            user_id=admin['id'],
            title="Yeni Etkinlik Kaydı",
            message=f"{current_user['name']} '{event['title']}' etkinliğine katılmak istiyor.",
            type="event_registration",
            link=f"/events"
        )
        notif_doc = notification.model_dump()
        notif_doc['created_at'] = notif_doc['created_at'].isoformat()
        await db.notifications.insert_one(notif_doc)
    
    return {"message": "Registration successful"}

@api_router.patch("/event-registrations/{registration_id}/status")
async def update_registration_status(registration_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.event_registrations.update_one(
        {"id": registration_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"message": "Registration status updated"}


# ============= NOTIFICATION ENDPOINTS =============
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return notifications

@api_router.post("/notifications", response_model=Notification)
async def create_notification(notification_data: NotificationCreate, user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    notif_dict = notification_data.model_dump()
    notif_dict['user_id'] = user_id
    notif_obj = Notification(**notif_dict)
    
    doc = notif_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.notifications.insert_one(doc)
    return notif_obj

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@api_router.patch("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user['id'], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.notifications.count_documents({"user_id": current_user['id'], "read": False})
    return {"count": count}


# ============= RECOMMENDATION ENDPOINTS =============
@api_router.get("/recommendations", response_model=List[Recommendation])
async def get_recommendations(type: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if type:
        query['type'] = type
    
    recommendations = await db.recommendations.find(query, {"_id": 0}).to_list(1000)
    return recommendations

@api_router.post("/recommendations", response_model=Recommendation)
async def create_recommendation(rec_data: RecommendationCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rec_obj = Recommendation(**rec_data.model_dump())
    doc = rec_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.recommendations.insert_one(doc)
    return rec_obj

@api_router.put("/recommendations/{rec_id}", response_model=Recommendation)
async def update_recommendation(rec_id: str, rec_data: RecommendationCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.recommendations.update_one({"id": rec_id}, {"$set": rec_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    updated_rec = await db.recommendations.find_one({"id": rec_id}, {"_id": 0})
    return Recommendation(**updated_rec)

@api_router.delete("/recommendations/{rec_id}")
async def delete_recommendation(rec_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.recommendations.delete_one({"id": rec_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    return {"message": "Recommendation deleted successfully"}


# ============= BLOG ENDPOINTS =============
@api_router.get("/blogs", response_model=List[Blog])
async def get_blogs(published: Optional[bool] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if published is not None:
        query['published'] = published
    elif current_user['role'] != 'admin':
        query['published'] = True
    
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return blogs

@api_router.get("/blogs/{blog_id}", response_model=Blog)
async def get_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if not blog['published'] and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Blog not published")
    
    return Blog(**blog)

@api_router.post("/blogs", response_model=Blog)
async def create_blog(blog_data: BlogCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    blog_dict = blog_data.model_dump()
    blog_dict['author_id'] = current_user['id']
    blog_dict['author_name'] = current_user['name']
    blog_obj = Blog(**blog_dict)
    
    doc = blog_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.blogs.insert_one(doc)
    return blog_obj

@api_router.put("/blogs/{blog_id}", response_model=Blog)
async def update_blog(blog_id: str, blog_data: BlogCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_dict = blog_data.model_dump()
    update_dict['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.blogs.update_one({"id": blog_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    updated_blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    return Blog(**updated_blog)

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    return {"message": "Blog deleted successfully"}


# ============= SEARCH ENDPOINT =============
@api_router.get("/search")
async def search(q: str, current_user: dict = Depends(get_current_user)):
    if not q or len(q) < 2:
        return {"results": []}
    
    search_pattern = {"$regex": q, "$options": "i"}
    
    # Search users (admin only)
    users_results = []
    if current_user['role'] == 'admin':
        users = await db.users.find(
            {"$or": [{"name": search_pattern}, {"email": search_pattern}]},
            {"_id": 0, "password": 0}
        ).limit(10).to_list(10)
        users_results = [{"type": "user", "data": user} for user in users]
    
    # Search videos
    videos = await db.videos.find(
        {"$or": [{"title": search_pattern}, {"description": search_pattern}, {"category": search_pattern}]},
        {"_id": 0}
    ).limit(10).to_list(10)
    videos_results = [{"type": "video", "data": video} for video in videos]
    
    # Search prospects
    prospects = await db.prospects.find(
        {"$or": [{"name": search_pattern}, {"email": search_pattern}, {"phone": search_pattern}]},
        {"_id": 0}
    ).limit(10).to_list(10)
    prospects_results = [{"type": "prospect", "data": prospect} for prospect in prospects]
    
    # Search partners
    partners = await db.partners.find(
        {"$or": [{"name": search_pattern}, {"email": search_pattern}, {"rank": search_pattern}]},
        {"_id": 0}
    ).limit(10).to_list(10)
    partners_results = [{"type": "partner", "data": partner} for partner in partners]
    
    # Search recommendations
    recommendations = await db.recommendations.find(
        {"$or": [{"title": search_pattern}, {"description": search_pattern}]},
        {"_id": 0}
    ).limit(10).to_list(10)
    recommendations_results = [{"type": "recommendation", "data": rec} for rec in recommendations]
    
    # Search blogs
    blogs = await db.blogs.find(
        {"$or": [{"title": search_pattern}, {"content": search_pattern}]},
        {"_id": 0}
    ).limit(10).to_list(10)
    blogs_results = [{"type": "blog", "data": blog} for blog in blogs]
    
    # Combine all results
    all_results = users_results + videos_results + prospects_results + partners_results + recommendations_results + blogs_results
    
    return {"results": all_results[:20]}  # Limit to 20 results

# Profile Update Endpoints
@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(profile_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {}
    
    # Only update fields that are provided
    for field, value in profile_data.model_dump().items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password": 0})
    if 'user_number' not in updated_user:
        updated_user['user_number'] = 0
    
    # Fill missing fields with defaults
    for field in ['profile_photo', 'career_title', 'phone', 'city', 'country', 'language', 'linkedin_url', 'twitter_url', 'instagram_url', 'facebook_url']:
        if field not in updated_user:
            updated_user[field] = ""
    
    if 'language' not in updated_user:
        updated_user['language'] = "tr"
    
    return UserResponse(**updated_user)

@api_router.post("/auth/change-password")
async def change_password(password_data: ChangePassword, current_user: dict = Depends(get_current_user)):
    # Verify current password
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    if not user or not verify_password(password_data.current_password, user['password']):
        raise HTTPException(status_code=400, detail="Mevcut şifre yanlış")
    
    # Update password
    new_password_hash = hash_password(password_data.new_password)
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"password": new_password_hash}}
    )
    
    return {"message": "Şifre başarıyla değiştirildi"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# File Upload endpoint
@app.post("/api/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload image and return base64 encoded string"""
    try:
        # Check file size (max 500KB)
        contents = await file.read()
        file_size_kb = len(contents) / 1024
        
        if file_size_kb > 500:
            raise HTTPException(status_code=400, detail=f"Dosya boyutu çok büyük. Maksimum 500KB. Sizinki: {file_size_kb:.2f}KB")
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)")
        
        # Convert to base64
        base64_encoded = base64.b64encode(contents).decode('utf-8')
        data_url = f"data:{file.content_type};base64,{base64_encoded}"
        
        return {
            "success": True,
            "data": data_url,
            "size_kb": round(file_size_kb, 2),
            "filename": file.filename
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dosya yüklenirken hata oluştu: {str(e)}")

@app.on_event("startup")
async def startup_event():
    await init_default_admin()
    logger.info("Focus Pro API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()