import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from backend.app.models.user import User, Profile
from backend.app.schemas.auth import (
    UserCreate, UserLogin, Token, UserResponse, UserUpdate,
    PasswordResetRequest, PasswordResetConfirm
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_current_user(token: str = None, db: AsyncSession = Depends(get_db)) -> User:
    # Optional / header authorization helper
    if not token:
        # Default mock researcher for convenience in development if token is omitted
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if user:
            return user
        # Create default demo researcher
        user = User(
            id=str(uuid.uuid4()),
            email="researcher@wayfinder.ai",
            hashed_password=get_password_hash("Wayfinder2026!"),
            full_name="Dr. Elena Vance",
            organization="Vision & Language Navigation Lab",
            role="lead_researcher"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name or user_in.email.split("@")[0],
        role=user_in.role or "researcher",
        organization=user_in.organization or "Autonomous Navigation Institute"
    )
    profile = Profile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        preferred_language="en",
        theme="dark",
        reduced_motion=False
    )
    db.add(user)
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(subject=user.id)
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        organization=current_user.organization,
        created_at=current_user.created_at
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.organization is not None:
        current_user.organization = profile_in.organization

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        organization=current_user.organization,
        created_at=current_user.created_at
    )

@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    # Verify account exists
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        # Don't leak user existence for security
        return {"status": "ok", "message": "If this email is registered, a recovery link has been dispatched."}
    
    reset_token = create_access_token(subject=user.id)
    return {
        "status": "ok",
        "message": "Password recovery token generated successfully.",
        "recovery_token": reset_token
    }

@router.post("/reset-password")
async def reset_password(req: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    payload = decode_access_token(req.token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.hashed_password = get_password_hash(req.new_password)
    await db.commit()
    return {"status": "ok", "message": "Password reset successfully. You may now log in."}
