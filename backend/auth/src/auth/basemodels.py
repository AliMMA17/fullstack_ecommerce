from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import os
from uuid import UUID
SECRET_KEY = os.getenv("AUTH_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_MIN = int(os.getenv("ACCESS_MINUTES", "15"))
REFRESH_DAYS = int(os.getenv("REFRESH_DAYS", "30"))
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    model_config = {"from_attributes": True}
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
class LoginIn(BaseModel):
    email: EmailStr
    password: str
class TokenOut(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserOut | None = None
def hash_password(p: str) -> str:
    return pwd_ctx.hash(p)
def verify_password(p: str, h: str) -> bool:
    return pwd_ctx.verify(p, h)
def create_access_token(sub: str, roles: list[str]) -> str:
    now = datetime.utcnow()
    payload = {"sub": sub, "roles": roles, "iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=ACCESS_MIN)).timestamp())}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
def create_refresh_token(sub: str) -> str:
    now = datetime.utcnow()
    payload = {"sub": sub, "type": "refresh", "iat": int(now.timestamp()), "exp": int((now + timedelta(days=REFRESH_DAYS)).timestamp())}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)