from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str = "researcher"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = "researcher"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: Optional[str] = "en"
    theme: Optional[str] = "dark"
    reduced_motion: Optional[bool] = False

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    organization: Optional[str] = None
    preferred_language: Optional[str] = "en"
    theme: Optional[str] = "dark"
    reduced_motion: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
