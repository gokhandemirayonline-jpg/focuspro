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
import uuid

# Load environment variables
load_dotenv("/app/backend/.env")

from models import (
    UserCreate, UserLogin, User, UserResponse, UserUpdate, UserAdminUpdate, ChangePassword,
    VideoCategoryCreate, VideoCategory,
    VideoCreate, Video,
    VideoProgress, VideoProgressBase, VideoProgressUpdate,
    LearningPathCreate, LearningPath, LearningPathUpdate,
    BadgeCreate, Badge,
    UserBadgeCreate, UserBadge,
    MeetingCreate, Meeting,
    TaskCreate, Task,
    GoalCreate, Goal, GoalUpdate,
    ReasonCreate, Reason,
    ProspectCategoryCreate, ProspectCategory,
    ProspectColumnCreate, ProspectColumn,
    ProspectCreate, Prospect,
    PartnerCreate, Partner,
    HabitCreate, Habit,
    HabitCompletionCreate, HabitCompletion,
    EventCreate, Event,
    EventRegistrationCreate, EventRegistration,
    NotificationCreate, Notification,
    ActivityLogCreate, ActivityLog,
    RecommendationCreate, Recommendation,
    BlogCreate, Blog,
    MessageCreate, Message, MessageReply,
    DreamPriorityCreate, DreamPriorityUpdate, DreamPriority,
    CharacterAnalysisCreate, CharacterAnalysis,
    FutureCharacterCreate, FutureCharacter,
    FullLifeProfileCreate, FullLifeProfile
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
    except Exception:
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


# Initialize default video categories
async def init_default_categories():
    """6 varsayılan eğitim kategorisini ekler"""
    categories = [
        {"name": "Başlangıç Eğitimleri", "description": "Yeni üyelere özel temel eğitimler", "order": 1},
        {"name": "Ürün Bilgisi", "description": "Satılan ürünler hakkında detaylı bilgiler", "order": 2},
        {"name": "Satış Teknikleri", "description": "İkna ve sunum becerileri eğitimleri", "order": 3},
        {"name": "Takım Yönetimi", "description": "Downline liderlik ve yönetim eğitimleri", "order": 4},
        {"name": "Motivasyon & Gelişim", "description": "Kişisel gelişim ve motivasyon içerikleri", "order": 5},
        {"name": "Pazarlama Stratejileri", "description": "Dijital pazarlama ve sosyal medya stratejileri", "order": 6}
    ]
    
    for category in categories:
        existing = await db.video_categories.find_one({"name": category["name"]}, {"_id": 0})
        if not existing:
            category_data = {
                "id": str(uuid.uuid4()),
                "name": category["name"],
                "description": category["description"],
                "order": category["order"],
                "created_at": datetime.utcnow().isoformat()
            }
            await db.video_categories.insert_one(category_data)
            logger.info(f"Category created: {category['name']}")


# Initialize default badges
async def init_default_badges():
    """7 varsayılan rozet tipini ekler"""
    badges = [
        {
            "name": "İlk Adım",
            "description": "İlk videonuzu izlediniz!",
            "icon": "🎬",
            "type": "auto",
            "criteria": "Herhangi bir videoyu ilk kez izle",
            "reward_type": "first_video"
        },
        {
            "name": "Hedef Odaklı",
            "description": "10 hedef tamamladınız!",
            "icon": "🎯",
            "type": "auto",
            "criteria": "Toplam 10 hedef tamamla",
            "reward_type": "10_goals"
        },
        {
            "name": "Sadık Üye",
            "description": "1 aydır bizimlesiniz!",
            "icon": "📅",
            "type": "auto",
            "criteria": "Kayıt tarihinden itibaren 30 gün geçmesi",
            "reward_type": "1_month"
        },
        {
            "name": "Görüşme Uzmanı",
            "description": "Bu hafta en çok görüşme yaptınız!",
            "icon": "⭐",
            "type": "auto",
            "criteria": "Haftalık en çok görüşme yapan kullanıcı",
            "reward_type": "most_meetings"
        },
        {
            "name": "Bilgi Ustası",
            "description": "Tüm eğitim videolarını izlediniz!",
            "icon": "🏆",
            "type": "auto",
            "criteria": "Sistemdeki tüm videoları izle",
            "reward_type": "all_videos"
        },
        {
            "name": "Kategori Şampiyonu",
            "description": "Bir kategorideki tüm videoları tamamladınız!",
            "icon": "📚",
            "type": "auto",
            "criteria": "Herhangi bir kategorideki tüm videoları izle",
            "reward_type": "category_complete"
        },
        {
            "name": "Özel Ödül",
            "description": "Yönetici tarafından özel olarak verildi!",
            "icon": "🌟",
            "type": "manual",
            "criteria": "Admin tarafından manuel olarak verilir",
            "reward_type": "special"
        }
    ]
    
    for badge in badges:
        existing = await db.badges.find_one({"reward_type": badge["reward_type"]}, {"_id": 0})
        if not existing:
            badge_data = {
                "id": str(uuid.uuid4()),
                "name": badge["name"],
                "description": badge["description"],
                "icon": badge["icon"],
                "type": badge["type"],
                "criteria": badge["criteria"],
                "reward_type": badge["reward_type"],
                "created_at": datetime.utcnow().isoformat()
            }
            await db.badges.insert_one(badge_data)
            logger.info(f"Badge created: {badge['name']}")


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
    
    # Log user registration
    await create_activity_log(
        user_id=doc['id'],
        user_name=user_data.name,
        user_email=user_data.email,
        action="register",
        resource_type="user",
        resource_id=doc['id'],
        resource_name=user_data.name,
        details="New user registered"
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
    
    # Log successful login
    await create_activity_log(
        user_id=user['id'],
        user_name=user['name'],
        user_email=user['email'],
        action="login",
        resource_type="auth",
        details="Successful login"
    )
    
    # Check for 1 month membership badge
    await check_membership_badge(user['id'], user.get('created_at'))
    
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
    
    # Get user info before deletion
    user_to_delete = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log user deletion
    if user_to_delete:
        await create_activity_log(
            user_id=current_user['id'],
            user_name=current_user['name'],
            user_email=current_user['email'],
            action="delete",
            resource_type="user",
            resource_id=user_id,
            resource_name=user_to_delete.get('name', 'Unknown'),
            details=f"Deleted user: {user_to_delete.get('email', 'Unknown')}"
        )
    
    return {"message": "User deleted successfully"}


# ============= VIDEO CATEGORY ENDPOINTS =============
@api_router.get("/video-categories", response_model=List[VideoCategory])
async def get_video_categories(current_user: dict = Depends(get_current_user)):
    categories = await db.video_categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return categories

@api_router.post("/video-categories", response_model=VideoCategory)
async def create_video_category(category_data: VideoCategoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category_obj = VideoCategory(**category_data.model_dump())
    doc = category_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.video_categories.insert_one(doc)
    return category_obj

@api_router.put("/video-categories/{category_id}", response_model=VideoCategory)
async def update_video_category(category_id: str, category_data: VideoCategoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.video_categories.update_one(
        {"id": category_id}, 
        {"$set": category_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.video_categories.find_one({"id": category_id}, {"_id": 0})
    return VideoCategory(**updated_category)

@api_router.delete("/video-categories/{category_id}")
async def delete_video_category(category_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.video_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}


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

@api_router.post("/videos/{video_id}/view")
async def track_video_view(video_id: str, current_user: dict = Depends(get_current_user)):
    """Track video view/watch"""
    result = await db.videos.update_one(
        {"id": video_id},
        {"$inc": {"view_count": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {"success": True}

@api_router.get("/videos/statistics/views")
async def get_video_statistics(current_user: dict = Depends(get_current_user)):
    """Get video view statistics (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    videos = await db.videos.find({}, {"_id": 0}).sort("view_count", -1).to_list(1000)
    
    return {
        "total_videos": len(videos),
        "total_views": sum(v.get('view_count', 0) for v in videos),
        "most_watched": videos[:10] if videos else []
    }


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
    
    # Send comment as message to admin if comment exists
    if comment and comment.strip():
        # Find admin user
        admin = await db.users.find_one({"role": "admin"}, {"_id": 0})
        if admin:
            message = Message(
                sender_id=current_user['id'],
                sender_name=current_user['name'],
                recipient_id=admin['id'],
                subject=f"Video Yorumu: {video['title'][:50]}",
                content=comment,
                type="video_comment",
                video_id=video_id,
                video_title=video['title'],
                read=False
            )
            msg_doc = message.model_dump()
            msg_doc['created_at'] = msg_doc['created_at'].isoformat()
            await db.messages.insert_one(msg_doc)
            
            # Create notification for admin
            admin_notification = Notification(
                user_id=admin['id'],
                title="Yeni Video Yorumu",
                message=f"{current_user['name']} '{video['title']}'  videosuna yorum yaptı",
                type="message",
                link="/messages"
            )
            admin_notif_doc = admin_notification.model_dump()
            admin_notif_doc['created_at'] = admin_notif_doc['created_at'].isoformat()
            await db.notifications.insert_one(admin_notif_doc)
    
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
            link="/videos"
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
                link="/calendar"
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
    
    # Notify admin if user is not admin
    if current_user.get('role') != 'admin':
        await notify_admin(
            title="Yeni Hedef Eklendi",
            message=f"{current_user.get('name')} yeni bir hedef ekledi: {goal_data.title}",
            notification_type="goal"
        )
    
    return goal_obj

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, goal_update: GoalUpdate, current_user: dict = Depends(get_current_user)):
    """Update a goal"""
    update_data = {k: v for k, v in goal_update.model_dump().items() if v is not None}
    
    result = await db.goals.update_one(
        {"id": goal_id, "user_id": current_user['id']},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Check if goal was just completed
    if goal_update.done:
        await check_and_award_badges(current_user['id'], "goal_complete", goal_id)
    
    updated_goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return updated_goal

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
    
    # Notify admin if user is not admin
    if current_user.get('role') != 'admin':
        await notify_admin(
            title="Yeni Neden Eklendi",
            message=f"{current_user.get('name')} yeni bir neden ekledi: {reason_data.description[:50]}{'...' if len(reason_data.description) > 50 else ''}",
            notification_type="reason"
        )
    
    return reason_obj

@api_router.delete("/reasons/{reason_id}")
async def delete_reason(reason_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.reasons.delete_one({"id": reason_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reason not found")
    
    return {"message": "Reason deleted successfully"}


# ============= DREAM PRIORITY ENDPOINTS =============
@api_router.get("/dream-priorities", response_model=DreamPriority)
async def get_dream_priority(current_user: dict = Depends(get_current_user)):
    """Get user's dream priority data"""
    dream_priority = await db.dream_priorities.find_one(
        {"user_id": current_user['id']},
        {"_id": 0}
    )
    
    if not dream_priority:
        # Return empty structure if not exists
        return DreamPriority(
            user_id=current_user['id'],
            initial_dreams=[],
            final_priorities=[],
            target_income="",
            target_months="",
            daily_hours=""
        )
    
    return DreamPriority(**dream_priority)

@api_router.post("/dream-priorities", response_model=DreamPriority)
async def create_or_update_dream_priority(
    dream_data: DreamPriorityCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create or update user's dream priority"""
    # Check if exists
    existing = await db.dream_priorities.find_one({"user_id": current_user['id']}, {"_id": 0})
    
    dream_priority = DreamPriority(
        user_id=current_user['id'],
        **dream_data.model_dump()
    )
    
    dream_doc = dream_priority.model_dump()
    dream_doc['created_at'] = dream_doc['created_at'].isoformat()
    dream_doc['updated_at'] = datetime.utcnow().isoformat()
    
    if existing:
        # Update existing
        await db.dream_priorities.update_one(
            {"user_id": current_user['id']},
            {"$set": dream_doc}
        )
    else:
        # Create new
        await db.dream_priorities.insert_one(dream_doc)
    
    return dream_priority


# ============= PROSPECT ENDPOINTS =============
# ==================== PROSPECT CATEGORIES ====================
@api_router.post("/prospect-categories", response_model=ProspectCategory)
async def create_prospect_category(
    category_data: ProspectCategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Yeni prospect kategorisi oluşturur"""
    try:
        category_dict = category_data.model_dump()
        category_dict['user_id'] = current_user['id']
        category_dict['id'] = str(uuid.uuid4())
        category_dict['created_at'] = datetime.utcnow()
        
        await db.prospect_categories.insert_one(category_dict)
        return category_dict
    except Exception as e:
        logger.error(f"Error creating prospect category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kategori oluşturulurken hata: {str(e)}")

@api_router.get("/prospect-categories", response_model=List[ProspectCategory])
async def get_prospect_categories(current_user: dict = Depends(get_current_user)):
    """Kullanıcının tüm kategorilerini getirir"""
    try:
        categories = await db.prospect_categories.find(
            {"user_id": current_user['id']},
            {"_id": 0}
        ).sort("order", 1).to_list(100)
        
        # Eğer kategori yoksa varsayılanları oluştur
        if not categories:
            default_categories = [
                {"id": str(uuid.uuid4()), "name": "Sıcak", "icon": "🔥", "color": "red", "order": 0, "user_id": current_user['id'], "created_at": datetime.utcnow()},
                {"id": str(uuid.uuid4()), "name": "Ilık", "icon": "🟡", "color": "yellow", "order": 1, "user_id": current_user['id'], "created_at": datetime.utcnow()},
                {"id": str(uuid.uuid4()), "name": "Soğuk", "icon": "❄️", "color": "blue", "order": 2, "user_id": current_user['id'], "created_at": datetime.utcnow()}
            ]
            await db.prospect_categories.insert_many(default_categories)
            categories = default_categories
        
        return categories
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kategoriler getirilirken hata: {str(e)}")

@api_router.put("/prospect-categories/{category_id}", response_model=ProspectCategory)
async def update_prospect_category(
    category_id: str,
    category_data: ProspectCategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Kategoriyi günceller"""
    try:
        existing = await db.prospect_categories.find_one(
            {"id": category_id, "user_id": current_user['id']},
            {"_id": 0}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Kategori bulunamadı")
        
        update_dict = category_data.model_dump()
        await db.prospect_categories.update_one(
            {"id": category_id},
            {"$set": update_dict}
        )
        
        updated = await db.prospect_categories.find_one({"id": category_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kategori güncellenirken hata: {str(e)}")

@api_router.delete("/prospect-categories/{category_id}")
async def delete_prospect_category(
    category_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Kategoriyi siler (prospect'ler category_id = "" olur)"""
    try:
        # Önce bu kategorideki prospect'lerin category_id'sini temizle
        await db.prospects.update_many(
            {"category_id": category_id, "user_id": current_user['id']},
            {"$set": {"category_id": ""}}
        )
        
        # Kategoriyi sil
        result = await db.prospect_categories.delete_one(
            {"id": category_id, "user_id": current_user['id']}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Kategori bulunamadı")
        
        return {"success": True, "message": "Kategori silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kategori silinirken hata: {str(e)}")

# ==================== END PROSPECT CATEGORIES ====================

# ==================== PROSPECT COLUMNS (Dynamic Columns) ====================
@api_router.get("/prospect-columns", response_model=List[ProspectColumn])
async def get_prospect_columns(current_user: dict = Depends(get_current_user)):
    """Get all dynamic columns for prospects table"""
    try:
        columns = await db.prospect_columns.find({}, {"_id": 0}).sort("order", 1).to_list(100)
        return columns
    except Exception as e:
        logger.error(f"Error fetching prospect columns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sütunlar getirilirken hata: {str(e)}")

@api_router.post("/prospect-columns", response_model=ProspectColumn)
async def create_prospect_column(
    column_data: ProspectColumnCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new dynamic column (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        column_dict = column_data.model_dump()
        column_dict['id'] = str(uuid.uuid4())
        column_dict['created_by'] = current_user['id']
        column_dict['created_at'] = datetime.utcnow()
        
        await db.prospect_columns.insert_one(column_dict)
        return column_dict
    except Exception as e:
        logger.error(f"Error creating prospect column: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sütun oluşturulurken hata: {str(e)}")

@api_router.put("/prospect-columns/{column_id}", response_model=ProspectColumn)
async def update_prospect_column(
    column_id: str,
    column_data: ProspectColumnCreate,
    current_user: dict = Depends(get_current_user)
):
    """Update dynamic column (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        existing = await db.prospect_columns.find_one({"id": column_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Sütun bulunamadı")
        
        update_dict = column_data.model_dump()
        await db.prospect_columns.update_one(
            {"id": column_id},
            {"$set": update_dict}
        )
        
        updated = await db.prospect_columns.find_one({"id": column_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating prospect column: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sütun güncellenirken hata: {str(e)}")

@api_router.delete("/prospect-columns/{column_id}")
async def delete_prospect_column(
    column_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete dynamic column (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        # Get column info before deletion
        column = await db.prospect_columns.find_one({"id": column_id}, {"_id": 0})
        if not column:
            raise HTTPException(status_code=404, detail="Sütun bulunamadı")
        
        column_name = column['column_name']
        
        # Remove this field from all prospects' custom_fields
        prospects = await db.prospects.find({}, {"_id": 0}).to_list(1000)
        for prospect in prospects:
            if 'custom_fields' in prospect and column_name in prospect['custom_fields']:
                del prospect['custom_fields'][column_name]
                await db.prospects.update_one(
                    {"id": prospect['id']},
                    {"$set": {"custom_fields": prospect['custom_fields']}}
                )
        
        # Delete the column
        result = await db.prospect_columns.delete_one({"id": column_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Sütun bulunamadı")
        
        return {"success": True, "message": "Sütun silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting prospect column: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sütun silinirken hata: {str(e)}")

# ==================== END PROSPECT COLUMNS ====================

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
    
    # Notify admin if user is not admin
    if current_user.get('role') != 'admin':
        await notify_admin(
            title="Yeni İsim Eklendi",
            message=f"{current_user.get('name')} isim listesine yeni kişi ekledi: {prospect_data.name}",
            notification_type="prospect"
        )
    
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
    
    # Notify admin if user is not admin
    if current_user.get('role') != 'admin':
        await notify_admin(
            title="Yeni Partner Eklendi",
            message=f"{current_user.get('name')} yeni bir partner ekledi: {partner_data.name}",
            notification_type="partner"
        )
    
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


# ============= HABIT ENDPOINTS (Admin manages habits, Users track completions) =============
@api_router.get("/habits", response_model=List[Habit])
async def get_habits(current_user: dict = Depends(get_current_user)):
    """Get all habits (created by admin)"""
    habits = await db.habits.find({}, {"_id": 0}).to_list(1000)
    return habits

@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_data: HabitCreate, current_user: dict = Depends(get_current_user)):
    """Create new habit (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        habit_dict = habit_data.model_dump()
        habit_dict['id'] = str(uuid.uuid4())
        habit_dict['created_by'] = current_user['id']
        habit_dict['created_at'] = datetime.utcnow()
        
        await db.habits.insert_one(habit_dict)
        return habit_dict
    except Exception as e:
        logger.error(f"Error creating habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alışkanlık oluşturulurken hata: {str(e)}")

@api_router.put("/habits/{habit_id}", response_model=Habit)
async def update_habit(habit_id: str, habit_data: HabitCreate, current_user: dict = Depends(get_current_user)):
    """Update habit (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        existing = await db.habits.find_one({"id": habit_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Alışkanlık bulunamadı")
        
        update_dict = habit_data.model_dump()
        await db.habits.update_one(
            {"id": habit_id},
            {"$set": update_dict}
        )
        
        updated = await db.habits.find_one({"id": habit_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alışkanlık güncellenirken hata: {str(e)}")

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    """Delete habit (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    
    try:
        result = await db.habits.delete_one({"id": habit_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Alışkanlık bulunamadı")
        
        # Also delete all completions for this habit
        await db.habit_completions.delete_many({"habit_id": habit_id})
        
        return {"success": True, "message": "Alışkanlık silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alışkanlık silinirken hata: {str(e)}")


# ============= HABIT COMPLETION ENDPOINTS =============
@api_router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    """Mark habit as completed for today"""
    try:
        # Check if habit exists
        habit = await db.habits.find_one({"id": habit_id}, {"_id": 0})
        if not habit:
            raise HTTPException(status_code=404, detail="Alışkanlık bulunamadı")
        
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Check if already completed today
        existing = await db.habit_completions.find_one({
            "habit_id": habit_id,
            "user_id": current_user['id'],
            "completion_date": today
        }, {"_id": 0})
        
        if existing:
            return {"message": "Bu alışkanlık bugün zaten tamamlanmış", "already_completed": True}
        
        # Create completion record
        completion_dict = {
            "id": str(uuid.uuid4()),
            "habit_id": habit_id,
            "user_id": current_user['id'],
            "completion_date": today,
            "notes": "",
            "created_at": datetime.utcnow()
        }
        
        await db.habit_completions.insert_one(completion_dict)
        return {"message": "Alışkanlık tamamlandı!", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alışkanlık tamamlanırken hata: {str(e)}")

@api_router.delete("/habits/{habit_id}/complete")
async def uncomplete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    """Remove today's completion for habit"""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        result = await db.habit_completions.delete_one({
            "habit_id": habit_id,
            "user_id": current_user['id'],
            "completion_date": today
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bugün için tamamlanma kaydı bulunamadı")
        
        return {"success": True, "message": "Tamamlanma işareti kaldırıldı"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uncompleting habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"İşaret kaldırılırken hata: {str(e)}")

@api_router.get("/habits/completions/today")
async def get_today_completions(current_user: dict = Depends(get_current_user)):
    """Get user's habit completions for today"""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        completions = await db.habit_completions.find({
            "user_id": current_user['id'],
            "completion_date": today
        }, {"_id": 0}).to_list(1000)
        
        # Return just habit IDs for easier checking
        completed_habit_ids = [c['habit_id'] for c in completions]
        return {"completed_habit_ids": completed_habit_ids, "completions": completions}
    except Exception as e:
        logger.error(f"Error getting today completions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tamamlamalar getirilirken hata: {str(e)}")

@api_router.get("/habits/completions/date/{date}")
async def get_date_completions(date: str, current_user: dict = Depends(get_current_user)):
    """Get user's habit completions for a specific date"""
    try:
        completions = await db.habit_completions.find({
            "user_id": current_user['id'],
            "completion_date": date
        }, {"_id": 0}).to_list(1000)
        
        completed_habit_ids = [c['habit_id'] for c in completions]
        return {"completed_habit_ids": completed_habit_ids, "completions": completions, "date": date}
    except Exception as e:
        logger.error(f"Error getting date completions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tarih için tamamlamalar getirilirken hata: {str(e)}")

@api_router.get("/habits/stats")
async def get_habit_stats(current_user: dict = Depends(get_current_user)):
    """Get habit statistics for current user"""
    try:
        # Get all habits
        habits = await db.habits.find({}, {"_id": 0}).to_list(1000)
        total_habits = len(habits)
        
        if total_habits == 0:
            return {
                "daily_rate": 0,
                "monthly_rate": 0,
                "total_habits": 0,
                "today_completed": 0,
                "month_completed": 0,
                "month_total": 0
            }
        
        today = datetime.utcnow().strftime("%Y-%m-%d")
        current_month = datetime.utcnow().strftime("%Y-%m")
        
        # Today's completions
        today_completions = await db.habit_completions.count_documents({
            "user_id": current_user['id'],
            "completion_date": today
        })
        
        # This month's completions
        month_completions = await db.habit_completions.find({
            "user_id": current_user['id'],
            "completion_date": {"$regex": f"^{current_month}"}
        }, {"_id": 0}).to_list(10000)
        
        # Calculate unique days in month
        unique_days = len(set([c['completion_date'] for c in month_completions]))
        days_in_month = datetime.utcnow().day  # Current day of month
        
        # Calculate rates
        daily_rate = round((today_completions / total_habits) * 100, 1) if total_habits > 0 else 0
        month_total_possible = total_habits * days_in_month
        monthly_rate = round((len(month_completions) / month_total_possible) * 100, 1) if month_total_possible > 0 else 0
        
        return {
            "daily_rate": daily_rate,
            "monthly_rate": monthly_rate,
            "total_habits": total_habits,
            "today_completed": today_completions,
            "month_completed": len(month_completions),
            "month_total": month_total_possible,
            "days_tracked": unique_days
        }
    except Exception as e:
        logger.error(f"Error getting habit stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"İstatistikler getirilirken hata: {str(e)}")

@api_router.get("/habits/calendar/{year}/{month}")
async def get_habit_calendar(year: int, month: int, current_user: dict = Depends(get_current_user)):
    """Get habit completion calendar for a specific month"""
    try:
        # Get all habits count
        total_habits = await db.habits.count_documents({})
        
        if total_habits == 0:
            return {"days": [], "total_habits": 0}
        
        # Get month's completions
        month_str = f"{year}-{month:02d}"
        completions = await db.habit_completions.find({
            "user_id": current_user['id'],
            "completion_date": {"$regex": f"^{month_str}"}
        }, {"_id": 0}).to_list(10000)
        
        # Group by day
        from collections import defaultdict
        daily_counts = defaultdict(int)
        for completion in completions:
            daily_counts[completion['completion_date']] += 1
        
        # Build calendar data
        import calendar as cal
        days_in_month = cal.monthrange(year, month)[1]
        calendar_data = []
        
        for day in range(1, days_in_month + 1):
            date_str = f"{year}-{month:02d}-{day:02d}"
            completed_count = daily_counts.get(date_str, 0)
            completion_rate = round((completed_count / total_habits) * 100, 1) if total_habits > 0 else 0
            
            calendar_data.append({
                "date": date_str,
                "completed": completed_count,
                "total": total_habits,
                "rate": completion_rate
            })
        
        return {"days": calendar_data, "total_habits": total_habits}
    except Exception as e:
        logger.error(f"Error getting habit calendar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Takvim getirilirken hata: {str(e)}")

    await db.habits.update_one(
        {"id": habit_id},
        {"$set": {"completed": new_completed, "done": done}}
    )
    
    return {"message": "Habit updated"}

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    habit = await db.habits.find_one({"id": habit_id, "user_id": current_user['id']}, {"_id": 0})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    await db.habits.delete_one({"id": habit_id})
    return {"message": "Habit deleted successfully"}


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
            link="/events"
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


# ============= MESSAGE/INBOX ENDPOINTS =============
@api_router.post("/messages", response_model=List[Message])
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send message to one or multiple users (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    created_messages = []
    
    for recipient_id in message_data.recipient_ids:
        # Check if recipient exists
        recipient = await db.users.find_one({"id": recipient_id}, {"_id": 0})
        if not recipient:
            continue
        
        # Create message for each recipient
        message_dict = {
            "id": str(uuid.uuid4()),
            "sender_id": current_user['id'],
            "sender_name": current_user['name'],
            "recipient_id": recipient_id,
            "subject": message_data.subject,
            "content": message_data.content,
            "type": message_data.type,
            "read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        await db.messages.insert_one(message_dict)
        created_messages.append(Message(**message_dict))
        
        # Also create a notification for the user
        notification_data = {
            "id": str(uuid.uuid4()),
            "user_id": recipient_id,
            "title": f"Yeni Mesaj: {message_data.subject}",
            "message": f"{current_user['name']} size bir mesaj gönderdi",
            "type": "message",
            "read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.notifications.insert_one(notification_data)
    
    return created_messages

@api_router.get("/messages", response_model=List[Message])
async def get_user_messages(current_user: dict = Depends(get_current_user)):
    """Get all messages for current user"""
    messages = await db.messages.find(
        {"recipient_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [Message(**msg) for msg in messages]

@api_router.get("/messages/unread-count")
async def get_unread_message_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread messages"""
    count = await db.messages.count_documents({
        "recipient_id": current_user['id'],
        "read": False
    })
    return {"count": count}

@api_router.patch("/messages/{message_id}/read")
async def mark_message_read(message_id: str, current_user: dict = Depends(get_current_user)):
    """Mark message as read"""
    result = await db.messages.update_one(
        {"id": message_id, "recipient_id": current_user['id']},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"success": True}

@api_router.patch("/messages/read-all")
async def mark_all_messages_read(current_user: dict = Depends(get_current_user)):
    """Mark all messages as read for current user"""
    await db.messages.update_many(
        {"recipient_id": current_user['id'], "read": False},
        {"$set": {"read": True}}
    )
    return {"success": True}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a message"""
    result = await db.messages.delete_one({
        "id": message_id,
        "recipient_id": current_user['id']
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"success": True}

@api_router.post("/messages/{message_id}/reply", response_model=Message)
async def reply_to_message(message_id: str, reply_data: MessageReply, current_user: dict = Depends(get_current_user)):
    """Reply to a message"""
    # Get original message
    original_msg = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not original_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Ensure user is recipient or sender of original message
    if current_user['id'] not in [original_msg['sender_id'], original_msg['recipient_id']]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Determine recipient (reply to sender if I'm recipient, or to recipient if I'm sender)
    if current_user['id'] == original_msg['recipient_id']:
        recipient_id = original_msg['sender_id']
    else:
        recipient_id = original_msg['recipient_id']
    
    # Get recipient info
    recipient = await db.users.find_one({"id": recipient_id}, {"_id": 0})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create reply message
    reply_message = Message(
        sender_id=current_user['id'],
        sender_name=current_user['name'],
        recipient_id=recipient_id,
        subject=f"Re: {original_msg['subject']}" if not original_msg['subject'].startswith('Re:') else original_msg['subject'],
        content=reply_data.content,
        type=original_msg['type'],
        video_id=original_msg.get('video_id'),
        video_title=original_msg.get('video_title'),
        parent_id=original_msg.get('parent_id') or message_id,  # Use parent_id if exists, otherwise use current message_id
        read=False
    )
    
    msg_doc = reply_message.model_dump()
    msg_doc['created_at'] = msg_doc['created_at'].isoformat()
    await db.messages.insert_one(msg_doc)
    
    # Create notification for recipient
    notification = Notification(
        user_id=recipient_id,
        title="Yeni Mesaj Cevabı",
        message=f"{current_user['name']} mesajınıza cevap verdi",
        type="message",
        link="/messages"
    )
    notif_doc = notification.model_dump()
    notif_doc['created_at'] = notif_doc['created_at'].isoformat()
    await db.notifications.insert_one(notif_doc)
    
    return reply_message

@api_router.get("/messages/{message_id}/thread", response_model=List[Message])
async def get_message_thread(message_id: str, current_user: dict = Depends(get_current_user)):
    """Get message thread (parent + all replies)"""
    # Get the message
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Ensure user is part of conversation
    if current_user['id'] not in [message['sender_id'], message['recipient_id']]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find root message (if this is a reply, find parent)
    root_id = message.get('parent_id') or message_id
    
    # Get root message and all replies
    thread_messages = []
    
    # Get root
    root_msg = await db.messages.find_one({"id": root_id}, {"_id": 0})
    if root_msg:
        thread_messages.append(Message(**root_msg))
    
    # Get all replies
    replies = await db.messages.find(
        {"parent_id": root_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    for reply in replies:
        thread_messages.append(Message(**reply))
    
    return thread_messages


# ============= STATISTICS & ANALYTICS ENDPOINTS =============
@api_router.get("/statistics/dashboard")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Users registered today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    users_today = await db.users.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    # Active users (registered in last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    active_users = await db.users.count_documents({
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    
    # Total counts
    total_goals = await db.goals.count_documents({})
    total_partners = await db.partners.count_documents({})
    total_events = await db.events.count_documents({})
    total_prospects = await db.prospects.count_documents({})
    total_videos = await db.videos.count_documents({})
    total_messages = await db.messages.count_documents({})
    
    return {
        "total_users": total_users,
        "users_today": users_today,
        "active_users": active_users,
        "total_goals": total_goals,
        "total_partners": total_partners,
        "total_events": total_events,
        "total_prospects": total_prospects,
        "total_videos": total_videos,
        "total_messages": total_messages
    }

@api_router.get("/statistics/user-registrations")
async def get_user_registration_trend(current_user: dict = Depends(get_current_user)):
    """Get user registration trend for last 30 days (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all users
    users = await db.users.find({}, {"_id": 0, "created_at": 1}).to_list(None)
    
    # Group by date
    registrations_by_date = {}
    for i in range(30):
        date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
        registrations_by_date[date] = 0
    
    for user in users:
        try:
            user_date = datetime.fromisoformat(user['created_at']).strftime('%Y-%m-%d')
            if user_date in registrations_by_date:
                registrations_by_date[user_date] += 1
        except (ValueError, KeyError, TypeError):
            continue
    
    # Convert to list format
    data = [{"date": date, "count": count} for date, count in sorted(registrations_by_date.items())]
    
    return {"data": data}

@api_router.get("/statistics/active-users")
async def get_most_active_users(current_user: dict = Depends(get_current_user)):
    """Get most active users by their activity counts (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0}).to_list(None)
    
    user_activities = []
    for user in users:
        if user.get('role') == 'admin':
            continue
            
        goals_count = await db.goals.count_documents({"user_id": user['id']})
        partners_count = await db.partners.count_documents({"user_id": user['id']})
        prospects_count = await db.prospects.count_documents({"user_id": user['id']})
        reasons_count = await db.reasons.count_documents({"user_id": user['id']})
        
        total_activity = goals_count + partners_count + prospects_count + reasons_count
        
        user_activities.append({
            "name": user.get('name', 'Unknown'),
            "email": user.get('email', ''),
            "goals": goals_count,
            "partners": partners_count,
            "prospects": prospects_count,
            "reasons": reasons_count,
            "total": total_activity
        })
    
    # Sort by total activity
    user_activities.sort(key=lambda x: x['total'], reverse=True)
    
    return {"data": user_activities[:10]}  # Top 10 users

@api_router.get("/statistics/event-participation")
async def get_event_participation_stats(current_user: dict = Depends(get_current_user)):
    """Get event participation statistics (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    events = await db.events.find({}, {"_id": 0}).to_list(None)
    
    event_stats = []
    for event in events:
        registrations_count = await db.event_registrations.count_documents({"event_id": event['id']})
        
        event_stats.append({
            "event_name": event['title'],
            "date": event['date'],
            "participants": registrations_count
        })
    
    # Sort by participants
    event_stats.sort(key=lambda x: x['participants'], reverse=True)
    
    return {"data": event_stats}

@api_router.get("/statistics/export-users")
async def export_users_data(current_user: dict = Depends(get_current_user)):
    """Export all users data for Excel/PDF (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(None)
    
    # Add activity counts for each user
    for user in users:
        user['goals_count'] = await db.goals.count_documents({"user_id": user['id']})
        user['partners_count'] = await db.partners.count_documents({"user_id": user['id']})
        user['prospects_count'] = await db.prospects.count_documents({"user_id": user['id']})
        user['total_activity'] = user['goals_count'] + user['partners_count'] + user['prospects_count']
    
    return {"data": users}


# ============= ACTIVITY LOG ENDPOINTS =============
async def create_activity_log(
    user_id: str,
    user_name: str,
    user_email: str,
    action: str,
    resource_type: str,
    resource_id: str = None,
    resource_name: str = None,
    details: str = None,
    ip_address: str = None,
    status: str = "success"
):
    """Helper function to create activity logs"""
    try:
        log_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "user_name": user_name,
            "user_email": user_email,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "resource_name": resource_name,
            "details": details,
            "ip_address": ip_address,
            "user_agent": None,
            "status": status,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.activity_logs.insert_one(log_data)
        logger.info(f"Activity log created: {action} on {resource_type} by {user_name}")
    except Exception as e:
        logger.error(f"Failed to create activity log: {str(e)}")

@api_router.get("/activity-logs")
async def get_activity_logs(
    current_user: dict = Depends(get_current_user),
    action: str = None,
    resource_type: str = None,
    user_id: str = None,
    date_from: str = None,
    date_to: str = None,
    limit: int = 100
):
    """Get activity logs with filters (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = {}
    
    if action:
        query['action'] = action
    
    if resource_type:
        query['resource_type'] = resource_type
    
    if user_id:
        query['user_id'] = user_id
    
    if date_from:
        query['created_at'] = {"$gte": date_from}
    
    if date_to:
        if 'created_at' in query:
            query['created_at']['$lte'] = date_to
        else:
            query['created_at'] = {"$lte": date_to}
    
    # Get logs
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": len(logs)}

@api_router.get("/activity-logs/statistics")
async def get_activity_log_statistics(current_user: dict = Depends(get_current_user)):
    """Get activity log statistics (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total logs
    total_logs = await db.activity_logs.count_documents({})
    
    # Logs by action
    login_logs = await db.activity_logs.count_documents({"action": "login"})
    create_logs = await db.activity_logs.count_documents({"action": "create"})
    update_logs = await db.activity_logs.count_documents({"action": "update"})
    delete_logs = await db.activity_logs.count_documents({"action": "delete"})
    
    # Recent failed attempts
    failed_logs = await db.activity_logs.count_documents({"status": "failed"})
    
    # Most active users (top 10)
    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}, "user_name": {"$first": "$user_name"}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    most_active = await db.activity_logs.aggregate(pipeline).to_list(10)
    
    return {
        "total_logs": total_logs,
        "login_count": login_logs,
        "create_count": create_logs,
        "update_count": update_logs,
        "delete_count": delete_logs,
        "failed_count": failed_logs,
        "most_active_users": most_active
    }

@api_router.delete("/activity-logs/clear")
async def clear_old_activity_logs(
    current_user: dict = Depends(get_current_user),
    days: int = 90
):
    """Clear activity logs older than specified days (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    result = await db.activity_logs.delete_many({"created_at": {"$lt": cutoff_date}})
    
    return {
        "success": True,
        "deleted_count": result.deleted_count,
        "message": f"Deleted logs older than {days} days"
    }


# ============= LEARNING PATH ENDPOINTS =============
@api_router.get("/learning-paths", response_model=List[LearningPath])
async def get_learning_paths(current_user: dict = Depends(get_current_user)):
    """Get all learning paths"""
    paths = await db.learning_paths.find({"is_active": True}, {"_id": 0}).to_list(1000)
    return paths


@api_router.post("/learning-paths", response_model=LearningPath)
async def create_learning_path(path: LearningPathCreate, current_user: dict = Depends(get_current_user)):
    """Create a new learning path (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    path_obj = LearningPath(**path.model_dump())
    path_doc = path_obj.model_dump()
    path_doc['created_at'] = path_doc['created_at'].isoformat()
    path_doc['updated_at'] = path_doc['updated_at'].isoformat()
    
    await db.learning_paths.insert_one(path_doc)
    return path_obj


@api_router.put("/learning-paths/{path_id}", response_model=LearningPath)
async def update_learning_path(
    path_id: str,
    path_update: LearningPathUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a learning path (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {k: v for k, v in path_update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.learning_paths.update_one(
        {"id": path_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Learning path not found")
    
    updated_path = await db.learning_paths.find_one({"id": path_id}, {"_id": 0})
    return updated_path


@api_router.delete("/learning-paths/{path_id}")
async def delete_learning_path(path_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a learning path (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.learning_paths.delete_one({"id": path_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Learning path not found")
    
    return {"success": True}


@api_router.get("/learning-paths/{path_id}/progress")
async def get_learning_path_progress(path_id: str, current_user: dict = Depends(get_current_user)):
    """Get user's progress in a specific learning path"""
    path = await db.learning_paths.find_one({"id": path_id}, {"_id": 0})
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")
    
    # Get user's progress for all videos in the path
    video_progress = []
    for video_id in path.get('video_ids', []):
        progress = await db.video_progress.find_one(
            {"user_id": current_user['id'], "video_id": video_id},
            {"_id": 0}
        )
        if not progress:
            # Create initial progress if not exists
            progress = {
                "id": str(uuid.uuid4()),
                "user_id": current_user['id'],
                "video_id": video_id,
                "watched": False,
                "watch_percentage": 0,
                "unlocked": True,
                "updated_at": datetime.utcnow().isoformat()
            }
            await db.video_progress.insert_one(progress)
        video_progress.append(progress)
    
    # Calculate overall progress
    total_videos = len(path.get('video_ids', []))
    completed_videos = sum(1 for p in video_progress if p.get('watched', False))
    progress_percentage = (completed_videos / total_videos * 100) if total_videos > 0 else 0
    
    return {
        "path": path,
        "total_videos": total_videos,
        "completed_videos": completed_videos,
        "progress_percentage": round(progress_percentage, 2),
        "video_progress": video_progress
    }


# ============= VIDEO PROGRESS ENDPOINTS (Enhanced) =============
@api_router.patch("/videos/{video_id}/progress")
async def update_video_progress(
    video_id: str,
    progress_update: VideoProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update video watch progress (percentage)"""
    watch_percentage = progress_update.watch_percentage
    
    # Check if %80 completed
    is_watched = watch_percentage >= 80
    
    update_data = {
        "watch_percentage": watch_percentage,
        "watched": is_watched,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if is_watched and progress_update.watched is None:
        update_data['completed_at'] = datetime.utcnow().isoformat()
    
    # Update or create progress
    await db.video_progress.update_one(
        {"user_id": current_user['id'], "video_id": video_id},
        {"$set": update_data},
        upsert=True
    )
    
    # If video just completed (%80 reached), check for badges
    if is_watched:
        await check_and_award_badges(current_user['id'], "video_complete", video_id)
    
    return {"success": True, "watched": is_watched, "watch_percentage": watch_percentage}


# ============= BADGE ENDPOINTS =============
@api_router.get("/badges", response_model=List[Badge])
async def get_all_badges():
    """Get all available badges"""
    badges = await db.badges.find({}, {"_id": 0}).to_list(1000)
    return badges


@api_router.post("/badges", response_model=Badge)
async def create_badge(badge: BadgeCreate, current_user: dict = Depends(get_current_user)):
    """Create a new badge (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    badge_obj = Badge(**badge.model_dump())
    badge_doc = badge_obj.model_dump()
    badge_doc['created_at'] = badge_doc['created_at'].isoformat()
    
    await db.badges.insert_one(badge_doc)
    return badge_obj


@api_router.put("/badges/{badge_id}", response_model=Badge)
async def update_badge(badge_id: str, badge_data: BadgeCreate, current_user: dict = Depends(get_current_user)):
    """Update a badge (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.badges.update_one(
        {"id": badge_id},
        {"$set": badge_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    updated_badge = await db.badges.find_one({"id": badge_id}, {"_id": 0})
    return updated_badge


@api_router.delete("/badges/{badge_id}")
async def delete_badge(badge_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a badge (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.badges.delete_one({"id": badge_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    return {"success": True}


@api_router.get("/users/{user_id}/badges")
async def get_user_badges(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get all badges earned by a user"""
    # Check permission
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get user's badges
    user_badges = await db.user_badges.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Get badge details
    badges_with_details = []
    for ub in user_badges:
        badge = await db.badges.find_one({"id": ub['badge_id']}, {"_id": 0})
        if badge:
            badges_with_details.append({
                **ub,
                "badge_details": badge
            })
    
    return badges_with_details


@api_router.get("/badges/my-collection")
async def get_my_badge_collection(current_user: dict = Depends(get_current_user)):
    """Get current user's badge collection with earned and not earned badges"""
    # Get all badges
    all_badges = await db.badges.find({}, {"_id": 0}).to_list(1000)
    
    # Get user's earned badges
    user_badges = await db.user_badges.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    earned_badge_ids = [ub['badge_id'] for ub in user_badges]
    
    # Separate earned and not earned
    earned_badges = []
    not_earned_badges = []
    
    for badge in all_badges:
        if badge['id'] in earned_badge_ids:
            ub = next((ub for ub in user_badges if ub['badge_id'] == badge['id']), None)
            earned_badges.append({
                **badge,
                "earned_at": ub.get('earned_at') if ub else None,
                "note": ub.get('note') if ub else None
            })
        else:
            not_earned_badges.append(badge)
    
    return {
        "earned_badges": earned_badges,
        "not_earned_badges": not_earned_badges,
        "total_earned": len(earned_badges),
        "total_badges": len(all_badges)
    }


@api_router.post("/admin/badges/award")
async def award_badge_to_user(
    user_id: str,
    badge_data: UserBadgeCreate,
    current_user: dict = Depends(get_current_user)
):
    """Award a badge to a user (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if user already has this badge
    existing = await db.user_badges.find_one(
        {"user_id": user_id, "badge_id": badge_data.badge_id},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already has this badge")
    
    # Check if badge exists
    badge = await db.badges.find_one({"id": badge_data.badge_id}, {"_id": 0})
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    # Award badge
    user_badge = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "badge_id": badge_data.badge_id,
        "awarded_by": current_user['id'],
        "note": badge_data.note,
        "earned_at": datetime.utcnow().isoformat()
    }
    await db.user_badges.insert_one(user_badge)
    
    # Send notification to user
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user:
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": f"Yeni Rozet Kazandınız! {badge['icon']}",
            "message": f"'{badge['name']}' rozetini kazandınız! {badge['description']}",
            "type": "success",
            "read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.notifications.insert_one(notification)
    
    return {"success": True, "badge": badge}


# Helper function to check and award badges automatically
async def check_and_award_badges(user_id: str, trigger_type: str, context_id: str = None):
    """Check if user qualifies for any badges and award them"""
    
    # Check for "first_video" badge
    if trigger_type == "video_complete":
        # Check if this is user's first video
        video_count = await db.video_progress.count_documents({
            "user_id": user_id,
            "watched": True
        })
        
        if video_count == 1:
            badge = await db.badges.find_one({"reward_type": "first_video"}, {"_id": 0})
            if badge:
                existing = await db.user_badges.find_one(
                    {"user_id": user_id, "badge_id": badge['id']},
                    {"_id": 0}
                )
                if not existing:
                    user_badge = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "badge_id": badge['id'],
                        "awarded_by": None,
                        "note": "İlk videonuzu izlediğiniz için otomatik verildi",
                        "earned_at": datetime.utcnow().isoformat()
                    }
                    await db.user_badges.insert_one(user_badge)
                    
                    # Send notification
                    notification = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "title": f"Yeni Rozet! {badge['icon']}",
                        "message": f"'{badge['name']}' rozetini kazandınız!",
                        "type": "success",
                        "read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    await db.notifications.insert_one(notification)
        
        # Check for "all_videos" badge
        total_videos = await db.videos.count_documents({})
        watched_videos = await db.video_progress.count_documents({
            "user_id": user_id,
            "watched": True
        })
        
        if total_videos > 0 and watched_videos >= total_videos:
            badge = await db.badges.find_one({"reward_type": "all_videos"}, {"_id": 0})
            if badge:
                existing = await db.user_badges.find_one(
                    {"user_id": user_id, "badge_id": badge['id']},
                    {"_id": 0}
                )
                if not existing:
                    user_badge = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "badge_id": badge['id'],
                        "awarded_by": None,
                        "note": "Tüm videoları izlediğiniz için otomatik verildi",
                        "earned_at": datetime.utcnow().isoformat()
                    }
                    await db.user_badges.insert_one(user_badge)
                    
                    # Send notification
                    notification = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "title": f"Tebrikler! {badge['icon']}",
                        "message": f"'{badge['name']}' rozetini kazandınız!",
                        "type": "success",
                        "read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    await db.notifications.insert_one(notification)
        
        # Check for "category_complete" badge
        if context_id:
            video = await db.videos.find_one({"id": context_id}, {"_id": 0})
            if video and video.get('category_id'):
                # Get all videos in this category
                category_videos = await db.videos.find(
                    {"category_id": video['category_id']},
                    {"_id": 0}
                ).to_list(1000)
                category_video_ids = [v['id'] for v in category_videos]
                
                # Check if user watched all videos in this category
                watched_in_category = await db.video_progress.count_documents({
                    "user_id": user_id,
                    "video_id": {"$in": category_video_ids},
                    "watched": True
                })
                
                if len(category_video_ids) > 0 and watched_in_category >= len(category_video_ids):
                    badge = await db.badges.find_one({"reward_type": "category_complete"}, {"_id": 0})
                    if badge:
                        # Check if already awarded for this category
                        existing = await db.user_badges.find_one(
                            {
                                "user_id": user_id,
                                "badge_id": badge['id'],
                                "note": {"$regex": video.get('category', '')}
                            },
                            {"_id": 0}
                        )
                        if not existing:
                            user_badge = {
                                "id": str(uuid.uuid4()),
                                "user_id": user_id,
                                "badge_id": badge['id'],
                                "awarded_by": None,
                                "note": f"{video.get('category', 'Kategori')} kategorisindeki tüm videoları izlediğiniz için verildi",
                                "earned_at": datetime.utcnow().isoformat()
                            }
                            await db.user_badges.insert_one(user_badge)
                            
                            # Send notification
                            notification = {
                                "id": str(uuid.uuid4()),
                                "user_id": user_id,
                                "title": f"Kategori Tamamlandı! {badge['icon']}",
                                "message": f"'{video.get('category', '')}' kategorisini tamamladınız!",
                                "type": "success",
                                "read": False,
                                "created_at": datetime.utcnow().isoformat()
                            }
                            await db.notifications.insert_one(notification)
    
    # Check for "10_goals" badge
    elif trigger_type == "goal_complete":
        completed_goals = await db.goals.count_documents({
            "user_id": user_id,
            "done": True
        })
        
        if completed_goals >= 10:
            badge = await db.badges.find_one({"reward_type": "10_goals"}, {"_id": 0})
            if badge:
                existing = await db.user_badges.find_one(
                    {"user_id": user_id, "badge_id": badge['id']},
                    {"_id": 0}
                )
                if not existing:
                    user_badge = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "badge_id": badge['id'],
                        "awarded_by": None,
                        "note": "10 hedef tamamladığınız için otomatik verildi",
                        "earned_at": datetime.utcnow().isoformat()
                    }
                    await db.user_badges.insert_one(user_badge)
                    
                    # Send notification
                    notification = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "title": f"Yeni Rozet! {badge['icon']}",
                        "message": f"'{badge['name']}' rozetini kazandınız!",
                        "type": "success",
                        "read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    await db.notifications.insert_one(notification)


# Helper function to check 1 month membership badge
async def check_membership_badge(user_id: str, created_at):
    """Check if user qualifies for 1 month membership badge"""
    if not created_at:
        return
    
    # Parse created_at
    try:
        if isinstance(created_at, str):
            created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        else:
            created_date = created_at
        
        # Check if 30 days have passed
        days_since_registration = (datetime.utcnow() - created_date).days
        
        if days_since_registration >= 30:
            badge = await db.badges.find_one({"reward_type": "1_month"}, {"_id": 0})
            if badge:
                existing = await db.user_badges.find_one(
                    {"user_id": user_id, "badge_id": badge['id']},
                    {"_id": 0}
                )
                if not existing:
                    user_badge = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "badge_id": badge['id'],
                        "awarded_by": None,
                        "note": "1 aylık üyelik süresini doldurduğunuz için otomatik verildi",
                        "earned_at": datetime.utcnow().isoformat()
                    }
                    await db.user_badges.insert_one(user_badge)
                    
                    # Send notification
                    notification = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "title": f"Sadık Üye Rozetiniz Hazır! {badge['icon']}",
                        "message": f"'{badge['name']}' rozetini kazandınız! 1 aydır bizimlesiniz!",
                        "type": "success",
                        "read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    await db.notifications.insert_one(notification)
    except Exception as e:
        logger.error(f"Error checking membership badge: {e}")


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

# ==================== CHARACTER ANALYSIS ====================
@api_router.post("/character-analysis", response_model=CharacterAnalysis)
async def create_character_analysis(
    analysis: CharacterAnalysisCreate,
    current_user: dict = Depends(get_current_user)
):
    """Yeni bir karakter analizi oluşturur"""
    try:
        analysis_dict = analysis.model_dump()
        analysis_dict["user_id"] = current_user["id"]
        analysis_dict["id"] = str(uuid.uuid4())
        analysis_dict["created_at"] = datetime.utcnow()
        analysis_dict["updated_at"] = datetime.utcnow()
        
        await db.character_analysis.insert_one(analysis_dict)
        return analysis_dict
    except Exception as e:
        logger.error(f"Error creating character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Karakter analizi oluşturulurken hata oluştu: {str(e)}")

@api_router.get("/character-analysis", response_model=List[CharacterAnalysis])
async def get_user_character_analyses(
    current_user: dict = Depends(get_current_user)
):
    """Kullanıcının tüm karakter analizlerini getirir"""
    try:
        analyses = await db.character_analysis.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return analyses
    except Exception as e:
        logger.error(f"Error fetching character analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Karakter analizleri getirilirken hata oluştu: {str(e)}")

@api_router.get("/character-analysis/{analysis_id}", response_model=CharacterAnalysis)
async def get_character_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Belirli bir karakter analizini getirir"""
    try:
        analysis = await db.character_analysis.find_one(
            {"id": analysis_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not analysis:
            raise HTTPException(status_code=404, detail="Karakter analizi bulunamadı")
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Karakter analizi getirilirken hata oluştu: {str(e)}")

@api_router.put("/character-analysis/{analysis_id}", response_model=CharacterAnalysis)
async def update_character_analysis(
    analysis_id: str,
    analysis_update: CharacterAnalysisCreate,
    current_user: dict = Depends(get_current_user)
):
    """Mevcut bir karakter analizini günceller"""
    try:
        existing = await db.character_analysis.find_one(
            {"id": analysis_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Karakter analizi bulunamadı")
        
        update_dict = analysis_update.model_dump()
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.character_analysis.update_one(
            {"id": analysis_id},
            {"$set": update_dict}
        )
        
        updated = await db.character_analysis.find_one({"id": analysis_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Karakter analizi güncellenirken hata oluştu: {str(e)}")

@api_router.delete("/character-analysis/{analysis_id}")
async def delete_character_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Bir karakter analizini siler"""
    try:
        result = await db.character_analysis.delete_one(
            {"id": analysis_id, "user_id": current_user["id"]}
        )
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Karakter analizi bulunamadı")
        return {"success": True, "message": "Karakter analizi başarıyla silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Karakter analizi silinirken hata oluştu: {str(e)}")

@api_router.post("/character-analysis/ai-analyze")
async def analyze_character_with_ai(
    analysis_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Kullanıcının karakter analizi verilerini AI ile analiz eder
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Kullanıcı verilerini formatlı metne dönüştür
        recent_events = analysis_data.get("recent_events", {})
        ideal_day = analysis_data.get("ideal_day", {})
        ninety_day = analysis_data.get("ninety_day_plan", {})
        
        # AI için prompt oluştur
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Aşağıdaki bilgilere dayanarak detaylı bir karakter analizi yap:

**SON OLAYLAR:**
- Mutlu eden: {recent_events.get('happy', '')}
- Üzen: {recent_events.get('sad', '')}
- Kızdıran: {recent_events.get('angry', '')}
- Sabırla yüklü: {recent_events.get('patience_heavy', '')}
- Gururlandıran: {recent_events.get('proud', '')}

**İDEAL GÜN:**
- Sabah: {ideal_day.get('morning', '')}
- Öğlen: {ideal_day.get('afternoon', '')}
- Akşam: {ideal_day.get('evening', '')}
- Uyku öncesi: {ideal_day.get('before_sleep', '')}
- İnsanlar ne der: {ideal_day.get('peoples_say', '')}
- Hissettikleri: {ideal_day.get('feelings', '')}
- Değerler: {ideal_day.get('values', '')}

**90 GÜN PLANI:**
- Ana kimlik: {ninety_day.get('main_identity', '')}
- Haftalık aksiyon: {ninety_day.get('weekly_action', '')}
- Engeller: {ninety_day.get('obstacles', '')}
- Plan B: {ninety_day.get('plan_b', '')}
- Haftalık kontrol: {ninety_day.get('weekly_check_in', '')}
- İlk hafta: {ninety_day.get('first_week', '')}

Lütfen şu başlıklar altında detaylı bir analiz yap:

1. KİŞİLİK PROFİLİ: Kişinin genel karakter özellikleri
2. DUYGUSAL DURUM: Mevcut duygusal durumu ve eğilimleri
3. GÜÇLÜ YÖNLER: Belirgin güçlü yanları ve yetenekleri
4. GELİŞİM ALANLARI: Geliştirilmesi gereken alanlar
5. YAŞAM VİZYONU: İdeal yaşam hedefleri ve değerleri
6. ÖNERİLER: Kişisel gelişim için somut öneriler
7. EYLEM PLANI: 90 günlük plan için somut adımlar

Analizi pozitif, motivasyonel ve yapıcı bir dille yaz. Her bölüm en az 2-3 paragraf olsun."""

        # Claude ile AI analizi yap
        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"char_analysis_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Detaylı, empatik ve motivasyonel analizler yaparsın."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analizi yapılırken hata oluştu: {str(e)}")

# ==================== END CHARACTER ANALYSIS ====================

# ==================== FUTURE CHARACTER ====================
@api_router.post("/future-character", response_model=FutureCharacter)
async def create_future_character(
    future_char: FutureCharacterCreate,
    current_user: dict = Depends(get_current_user)
):
    """Yeni bir gelecek karakter profili oluşturur"""
    try:
        future_dict = future_char.model_dump()
        future_dict["user_id"] = current_user["id"]
        future_dict["id"] = str(uuid.uuid4())
        future_dict["created_at"] = datetime.utcnow()
        future_dict["updated_at"] = datetime.utcnow()
        
        await db.future_character.insert_one(future_dict)
        return future_dict
    except Exception as e:
        logger.error(f"Error creating future character: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gelecek karakter profili oluşturulurken hata oluştu: {str(e)}")

@api_router.get("/future-character", response_model=List[FutureCharacter])
async def get_user_future_characters(
    current_user: dict = Depends(get_current_user)
):
    """Kullanıcının tüm gelecek karakter profillerini getirir"""
    try:
        characters = await db.future_character.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return characters
    except Exception as e:
        logger.error(f"Error fetching future characters: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gelecek karakter profilleri getirilirken hata oluştu: {str(e)}")

@api_router.get("/future-character/{character_id}", response_model=FutureCharacter)
async def get_future_character(
    character_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Belirli bir gelecek karakter profilini getirir"""
    try:
        character = await db.future_character.find_one(
            {"id": character_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not character:
            raise HTTPException(status_code=404, detail="Gelecek karakter profili bulunamadı")
        return character
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching future character: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gelecek karakter profili getirilirken hata oluştu: {str(e)}")

@api_router.put("/future-character/{character_id}", response_model=FutureCharacter)
async def update_future_character(
    character_id: str,
    character_update: FutureCharacterCreate,
    current_user: dict = Depends(get_current_user)
):
    """Mevcut bir gelecek karakter profilini günceller"""
    try:
        existing = await db.future_character.find_one(
            {"id": character_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Gelecek karakter profili bulunamadı")
        
        update_dict = character_update.model_dump()
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.future_character.update_one(
            {"id": character_id},
            {"$set": update_dict}
        )
        
        updated = await db.future_character.find_one({"id": character_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating future character: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gelecek karakter profili güncellenirken hata oluştu: {str(e)}")

@api_router.delete("/future-character/{character_id}")
async def delete_future_character(
    character_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Bir gelecek karakter profilini siler"""
    try:
        result = await db.future_character.delete_one(
            {"id": character_id, "user_id": current_user["id"]}
        )
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Gelecek karakter profili bulunamadı")
        return {"success": True, "message": "Gelecek karakter profili başarıyla silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting future character: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gelecek karakter profili silinirken hata oluştu: {str(e)}")

@api_router.post("/future-character/ai-analyze")
async def analyze_future_character_with_ai(
    future_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Kullanıcının gelecek karakter hedeflerini AI ile analiz eder
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Kullanıcı verilerini formatlı metne dönüştür
        traits = future_data.get("character_traits", {})
        vision = future_data.get("life_vision", {})
        plan = future_data.get("transformation_plan", {})
        
        # AI için prompt oluştur
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcının 5+ yıl sonrası için belirlediği hedef karakterini analiz et:

**HEDEF KARAKTERİSTİKLER:**
- Anahtar Kelimeler: {', '.join(traits.get('keywords', []))}
- Kişilik Özellikleri: {traits.get('personality_traits', '')}
- Güçlü Yönler: {traits.get('strengths', '')}
- Duygusal Durum: {traits.get('emotional_state', '')}
- Zihinsel Yetenekler: {traits.get('mental_abilities', '')}

**YAŞAM VİZYONU:**
- Genel Durum: {vision.get('life_overview', '')}
- İlişkiler: {vision.get('relationships', '')}
- Kariyer: {vision.get('career', '')}
- Uzmanlık: {vision.get('mastery_areas', '')}
- Değerler: {vision.get('core_values', '')}
- Sosyal Algı: {vision.get('social_perception', '')}

**DÖNÜŞÜM PLANI:**
- Değişmesi Gerekenler: {plan.get('changes_needed', '')}
- Kazanılacak Alışkanlıklar: {plan.get('habits_to_gain', '')}
- Bırakılacak Alışkanlıklar: {plan.get('habits_to_remove', '')}
- Öğrenilecek Beceriler: {plan.get('skills_to_learn', '')}
- Mentorlar: {plan.get('mentors', '')}
- İlk Yıl: {plan.get('first_year_actions', '')}

Lütfen şu başlıklar altında detaylı bir analiz yap:

1. HEDEFLERİN TUTARLILIĞI: Belirlenen hedefler gerçekçi ve uyumlu mu?
2. VİZYON DEĞERLENDİRMESİ: Yaşam vizyonu ne kadar net ve ulaşılabilir?
3. DÖNÜŞÜM PLANININ GÜCLENDİRİLMESİ: Plana eklenebilecek öneriler
4. POTANSİYEL ENGELLER: Karşılaşabileceği zorluklar
5. BAŞARI STRATEJİLERİ: Hedefe ulaşmak için somut stratejiler
6. 5 YILLIK YOL HARİTASI: Yıl yıl ne yapmalı?
7. İLK ADIMLAR: Bugünden başlayarak neler yapabilir?

Analizi motivasyonel, realistik ve detaylı yap. Her bölüm en az 2-3 paragraf olsun."""

        # Claude ile AI analizi yap
        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"future_char_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcıların gelecek hedeflerini analiz edip detaylı roadmap'ler oluşturursun."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI future character analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analizi yapılırken hata oluştu: {str(e)}")

@api_router.post("/character-gap-analysis")
async def analyze_character_gap(
    analysis_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Mevcut durum ve gelecek hedefleri karşılaştırıp gap analysis yapar
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        current = analysis_data.get("current", {})
        future = analysis_data.get("future", {})
        
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcının MEVCUT karakteri ile İSTENİLEN karakteri arasında GAP ANALİZİ yap:

**MEVCUT DURUM ÖZETİ:**
{analysis_data.get("current_summary", "Mevcut durum analizi yapılmamış")}

**İSTENİLEN KARAKTER ÖZETİ:**
{analysis_data.get("future_summary", "Hedef karakter tanımlanmamış")}

Lütfen şu başlıklar altında detaylı bir GAP ANALİZİ yap:

1. 📊 FARK ANALİZİ (GAP ANALYSIS)
   - Mevcut vs. İstenilen karşılaştırması
   - Hangi alanlarda en büyük farklar var?
   - Tablolu karşılaştırma

2. 🎯 ÖNCELİKLİ GELİŞİM ALANLARI
   - İlk önce hangi alanlara odaklanmalı?
   - Neden bu alanlar kritik?

3. 📅 5 YILLIK DÖNÜŞÜM ROADMAP'İ
   - Yıl 1: Temel değişimler
   - Yıl 2: Alışkanlık yerleştirme
   - Yıl 3: Beceri geliştirme
   - Yıl 4: Derinleşme
   - Yıl 5: Hedef karaktere varış

4. 🚀 HEMEN BAŞLAYACAK AKSIYONLAR
   - Bu hafta: 3 somut aksiyon
   - Bu ay: 5 önemli adım
   - İlk 3 ay: Ana hedefler

5. ⚠️ DİKKAT EDİLMESİ GEREKENLER
   - Potansiyel tuzaklar
   - Motivasyon düşüşü anları
   - Nasıl önlem alınır?

6. 💪 MOTİVASYON VE DESTEK
   - Motivasyonu yüksek tutma stratejileri
   - Destek sistemleri kurma
   - İlerlemeyi ölçme yöntemleri

Analizi son derece detaylı, motivasyonel ve uygulanabilir yap."""

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"gap_analysis_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Mevcut durum ile hedefler arasındaki farkları analiz edip detaylı roadmap'ler oluşturursun."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "gap_analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in gap analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gap analizi yapılırken hata oluştu: {str(e)}")

# ==================== END FUTURE CHARACTER ====================

# ==================== FULL LIFE PROFILE ====================
@api_router.post("/full-life-profile", response_model=FullLifeProfile)
async def create_full_life_profile(
    profile: FullLifeProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """Tam yaşam profili oluşturur"""
    try:
        profile_dict = profile.model_dump()
        profile_dict["user_id"] = current_user["id"]
        profile_dict["id"] = str(uuid.uuid4())
        profile_dict["created_at"] = datetime.utcnow()
        profile_dict["updated_at"] = datetime.utcnow()
        
        await db.full_life_profile.insert_one(profile_dict)
        return profile_dict
    except Exception as e:
        logger.error(f"Error creating full life profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil oluşturulurken hata oluştu: {str(e)}")

@api_router.get("/full-life-profile", response_model=List[FullLifeProfile])
async def get_user_full_life_profiles(
    current_user: dict = Depends(get_current_user)
):
    """Kullanıcının tüm yaşam profillerini getirir"""
    try:
        profiles = await db.full_life_profile.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return profiles
    except Exception as e:
        logger.error(f"Error fetching full life profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profiller getirilirken hata oluştu: {str(e)}")

@api_router.get("/full-life-profile/{profile_id}", response_model=FullLifeProfile)
async def get_full_life_profile(
    profile_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Belirli bir yaşam profilini getirir"""
    try:
        profile = await db.full_life_profile.find_one(
            {"id": profile_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Profil bulunamadı")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching full life profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil getirilirken hata oluştu: {str(e)}")

@api_router.put("/full-life-profile/{profile_id}", response_model=FullLifeProfile)
async def update_full_life_profile(
    profile_id: str,
    profile_update: FullLifeProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """Mevcut bir yaşam profilini günceller"""
    try:
        existing = await db.full_life_profile.find_one(
            {"id": profile_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Profil bulunamadı")
        
        update_dict = profile_update.model_dump()
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.full_life_profile.update_one(
            {"id": profile_id},
            {"$set": update_dict}
        )
        
        updated = await db.full_life_profile.find_one({"id": profile_id}, {"_id": 0})
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating full life profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil güncellenirken hata oluştu: {str(e)}")

@api_router.post("/full-life-profile/analyze-current")
async def analyze_current_state(
    current_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Mevcut durumu AI ile analiz eder"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcının mevcut yaşam durumunu analiz et:

**FİZİKSEL DURUM:**
- Fiziksel: {current_data.get('physical', '')}
- Enerji: {current_data.get('energy', '')}
- Giyim: {current_data.get('style', '')}

**YETENEKLER:**
- Yetenekler: {current_data.get('skills', '')}
- Hobiler: {current_data.get('hobbies', '')}

**MADDİ DURUM:**
- Ev: {current_data.get('home', '')}
- Araba: {current_data.get('car', '')}
- Eşyalar: {current_data.get('possessions', '')}
- Finans: {current_data.get('financial', '')}

**YAŞAM TARZI:**
- Mekanlar: {current_data.get('places', '')}
- Sosyal: {current_data.get('socialCircle', '')}
- Rutin: {current_data.get('dailyRoutine', '')}

**KARAKTER:**
- Olumlu: {current_data.get('positiveTraits', '')}
- Olumsuz: {current_data.get('negativeTraits', '')}

Lütfen şu başlıklar altında analiz yap:

1. **GENEL DURUM ÖZETİ**: Kişinin şu anki yaşam durumu nasıl?

2. **GÜÇLÜ YÖNLER**: Olumlu olan ve üzerine inşa edilebilecek alanlar

3. **GELİŞİM ALANLARI**: İyileştirilebilecek alanlar

4. **FİZİKSEL & ENERJİ**: Sağlık, enerji, yaşam tarzı değerlendirmesi

5. **MADDİ & FİNANSAL**: Mevcut durum değerlendirmesi

6. **SOSYAL & DUYGUSAL**: İlişkiler ve sosyal yaşam kalitesi

7. **HEMEN YAPILACAKLAR**: İlk adımlar için öneriler

Analizi empatik, motivasyonel ve yapıcı yap. Her bölüm 2-3 paragraf olsun."""

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"current_analysis_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in current state analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analiz yapılırken hata oluştu: {str(e)}")

@api_router.post("/full-life-profile/analyze-future")
async def analyze_future_state(
    future_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Gelecek hedeflerini AI ile analiz eder"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcının 5 yıl sonrası için belirlediği hedeflerini analiz et:

**FİZİKSEL HEDEFLERİ:**
- Fiziksel: {future_data.get('physical', '')}
- Enerji: {future_data.get('energy', '')}
- Giyim: {future_data.get('style', '')}

**YETENEK HEDEFLERİ:**
- Yetenekler: {future_data.get('skills', '')}
- Hobiler: {future_data.get('hobbies', '')}
- Başarılar: {future_data.get('achievements', '')}

**MADDİ HEDEFLERİ:**
- Ev: {future_data.get('home', '')}
- Araba: {future_data.get('car', '')}
- Eşyalar: {future_data.get('possessions', '')}
- Finans: {future_data.get('financial', '')}

**YAŞAM TARZI HEDEFLERİ:**
- Mekanlar: {future_data.get('places', '')}
- Sosyal: {future_data.get('socialCircle', '')}
- İdeal Gün: {future_data.get('dailyRoutine', '')}
- Yaşam Tarzı: {future_data.get('lifestyle', '')}

**KARAKTER DEĞİŞİMİ:**
- Dönüşüm: {future_data.get('transformedTraits', '')}

Lütfen şu başlıklar altında analiz yap:

1. **VİZYON DEĞERLENDİRMESİ**: Hedefler net ve gerçekçi mi?

2. **GÜÇLÜ HEDEFLENMİŞ ALANLAR**: En güçlü ve net olan hedefler

3. **DAHA NETLEŞTİRİLMESİ GEREKENLER**: Eksik veya belirsiz alanlar

4. **FİNANSAL GERÇEKÇİLİK**: Maddi hedefler ulaşılabilir mi?

5. **YAŞAM TARZI UYUMU**: Hedefler birbirleriyle uyumlu mu?

6. **5 YILLIK YOLCULUK**: Adım adım nasıl gidilir?

7. **MOTİVASYON ÖNERİLERİ**: Motivasyonu nasıl korur?

Analizi motivasyonel ve realistik yap. Her bölüm 2-3 paragraf olsun."""

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"future_analysis_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in future state analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analiz yapılırken hata oluştu: {str(e)}")

@api_router.post("/full-life-profile/gap-analysis")
async def full_gap_analysis(
    analysis_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Mevcut durum ve gelecek hedefleri arasında detaylı gap analysis yapar"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        current = analysis_data.get("current", {})
        future = analysis_data.get("future", {})
        
        prompt = f"""Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Kullanıcının BUGÜN vs. 5 YIL SONRA durumu arasında detaylı GAP ANALİZİ yap:

**BUGÜN:**
Fiziksel: {current.get('physical', '')}
Yetenekler: {current.get('skills', '')}
Ev: {current.get('home', '')}
Araba: {current.get('car', '')}
Finans: {current.get('financial', '')}
Sosyal: {current.get('socialCircle', '')}
Olumlu: {current.get('positiveTraits', '')}
Olumsuz: {current.get('negativeTraits', '')}

**5 YIL SONRA:**
Fiziksel: {future.get('physical', '')}
Yetenekler: {future.get('skills', '')}
Ev: {future.get('home', '')}
Araba: {future.get('car', '')}
Finans: {future.get('financial', '')}
Sosyal: {future.get('socialCircle', '')}
Dönüşmüş Özellikler: {future.get('transformedTraits', '')}

Lütfen şu şekilde detaylı bir analiz yap:

1. **📊 KARŞILAŞTIRMA TABLOSU** (Markdown tablo formatında):
   - Fiziksel durum karşılaştırması
   - Yetenek farkı
   - Maddi durum farkı
   - Yaşam tarzı farkı
   - Karakter dönüşümü

2. **🎯 EN BÜYÜK FARKLAR** (3-5 madde):
   - Hangi alanlarda en büyük dönüşüm var?
   - Hangi hedefler en zorlayıcı?

3. **🗓️ 5 YILLIK DÖNÜŞÜM ROADMAP'İ**:
   **YIL 1 (Temel Oluşturma):**
   - Yapılacaklar
   - Hedefler
   
   **YIL 2 (Momentum Kazanma):**
   - Yapılacaklar
   - Hedefler
   
   **YIL 3 (Derinleşme):**
   - Yapılacaklar
   - Hedefler
   
   **YIL 4 (Konsolidasyon):**
   - Yapılacaklar
   - Hedefler
   
   **YIL 5 (Hedef Karaktere Varış):**
   - Yapılacaklar
   - Nihai durum

4. **🚀 İLK 90 GÜN İÇİN HEMEN BAŞLANACAK ADIMLAR**:
   - İlk hafta
   - İlk ay
   - İlk 3 ay

5. **⚠️ POTANSİYEL ENGELLER VE ÇÖZÜMLER**:
   - Karşılaşılabilecek zorluklar
   - Nasıl aşılır?

6. **💪 MOTİVASYON STRATEJİSİ**:
   - Motivasyonu nasıl korursun?
   - İlerleme nasıl ölçülür?

Analizi çok detaylı, motivasyonel ve uygulanabilir yap."""

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI servisi yapılandırılmamış")
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"full_gap_{current_user['id']}_{uuid.uuid4()}",
            system_message="Sen profesyonel bir yaşam koçu ve kişisel gelişim uzmanısın. Detaylı roadmap'ler oluşturursun."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "gap_analysis": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in full gap analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gap analizi yapılırken hata oluştu: {str(e)}")

# ==================== END FULL LIFE PROFILE ====================

# Include the router in the main app
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    await init_default_admin()
    await init_default_categories()
    await init_default_badges()
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