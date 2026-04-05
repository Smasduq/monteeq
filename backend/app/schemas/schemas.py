from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    interests: Optional[str] = None
    referral_source: Optional[str] = None
    goals: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    password: Optional[str] = None

    @field_validator('password')
    @classmethod
    def password_complexity(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in "!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~" for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    bio: Optional[str] = None
    is_onboarded: Optional[bool] = None
    interests: Optional[str] = None
    referral_source: Optional[str] = None
    goals: Optional[str] = None

class User(UserBase):
    id: int
    is_premium: bool
    is_verified: bool
    is_onboarded: bool
    flash_uploads: int
    home_uploads: int
    flash_quota_limit: int
    home_quota_limit: int
    google_id: Optional[str] = None
    bio: Optional[str] = None
    role: str
    public_key: Optional[str] = None

class EmailVerification(BaseModel):
    email: str
    code: str

class VerificationResponse(BaseModel):
    message: str
    username: Optional[str] = None
    email: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserProfile(User):
    followers_count: int
    following_count: int
    total_views: int
    videos_count: int
    flash_videos_count: int
    posts_count: int
    videos: List["Video"]
    flash_videos: List["Video"]
    posts: List["Post"]
    trophies: List["ChallengeEntry"] = []
    is_following: bool = False

class UserUpdateResponse(BaseModel):
    user: User
    access_token: Optional[str] = None

class UserGoogleAuth(BaseModel):
    credential: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_type: str
    tags: Optional[str] = None

class VideoCreate(VideoBase):
    video_url: str
    url_480p: Optional[str] = None
    url_720p: Optional[str] = None
    url_1080p: Optional[str] = None
    url_2k: Optional[str] = None
    url_4k: Optional[str] = None
    thumbnail_url: str
    duration: Optional[int] = 0
    processing_key: Optional[str] = None
    description: Optional[str] = None

class Video(VideoBase):
    id: int
    video_url: str
    url_480p: Optional[str] = None
    url_720p: Optional[str] = None
    url_1080p: Optional[str] = None
    url_2k: Optional[str] = None
    url_4k: Optional[str] = None
    thumbnail_url: str
    status: str
    owner_id: int
    owner: Optional[UserBase] = None
    views: int
    earnings: float
    shares: int = 0
    likes_count: int = 0
    comments_count: int = 0
    liked_by_user: bool = False
    owner_followed: bool = False
    duration: int = 0
    processing_key: Optional[str] = None
    failed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PostBase(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None

class PostCreate(PostBase):
    original_post_id: Optional[int] = None

class Post(PostBase):
    id: int
    owner_id: int
    owner: Optional[UserBase] = None
    created_at: Optional[datetime] = None
    likes_count: int = 0
    comments_count: int = 0
    liked_by_user: bool = False
    original_post_id: Optional[int] = None
    original_post: Optional["Post"] = None
    views_count: int = 0
    reposted_by: Optional[UserBase] = None

    model_config = ConfigDict(from_attributes=True)

class AdBase(BaseModel):
    title: str
    image_url: str
    is_active: bool

class Ad(AdBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    parent_id: Optional[int] = None

class Comment(CommentBase):
    id: int
    video_id: Optional[int] = None
    post_id: Optional[int] = None
    parent_id: Optional[int] = None
    owner_id: int
    owner: Optional[UserBase] = None
    created_at: Optional[datetime] = None
    replies: List["Comment"] = []

    model_config = ConfigDict(from_attributes=True)

class Achievement(BaseModel):
    id: int
    milestone_name: str
    reached_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UnifiedSearchResponse(BaseModel):
    videos: List[Video]
    users: List[User]
    posts: List[Post]

class UserInsights(BaseModel):
    total_views: int
    total_likes: int
    total_earnings: float
    total_shares: int
    home_videos: int
    flash_videos: int
    posts_count: int
    followers: int
    following: int
    next_milestone: int
    new_milestone_reached: Optional[str] = None
    achievements: List[str]

class PerformanceDataPoint(BaseModel):
    date: str
    views: int
    likes: int
    followers: int
    earnings: float

class UserPerformance(BaseModel):
    data: List[PerformanceDataPoint]
    metric: str # views, likes, followers, earnings

class ChatMessageBase(BaseModel):
    encrypted_content: str
    iv: str
    recipient_key: str
    sender_key: str

class ChatMessageCreate(ChatMessageBase):
    recipient_username: str

class ChatMessage(ChatMessageBase):
    id: int
    conversation_id: int
    sender_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Conversation(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    user1: UserBase
    user2: UserBase
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KeyUpload(BaseModel):
    public_key: str

class ChallengeBase(BaseModel):
    title: str
    description: str
    brand: Optional[str] = None
    prize: str
    is_open: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeEntryCreate(BaseModel):
    video_id: int

class ChallengeEntry(BaseModel):
    id: int
    challenge_id: int
    user_id: int
    video_id: int
    is_winner: bool = False
    created_at: datetime
    user: Optional[UserBase] = None
    video: Optional[Video] = None
    challenge: Optional["Challenge"] = None

    model_config = ConfigDict(from_attributes=True)

class Challenge(ChallengeBase):
    id: int
    entry_count: int
    winner_picked: bool = False
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChallengeLeaderboardEntry(BaseModel):
    username: str
    profile_pic: Optional[str] = None
    video_count: int = 0 # In case we want to show multiple entries, but requirement says "one video"
    # For now, let's just return the ChallengeEntry details in the leaderboard
    entry: ChallengeEntry
    score: int # e.g., views or likes

