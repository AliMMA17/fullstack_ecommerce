# src/auth/index.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from lib.db.postgres import get_session
from .basemodels import RegisterIn, LoginIn, TokenOut
from .module import register_user, login_user
from src.models import User
from .cookies import set_auth_cookies

# >>> Use jose directly to avoid None returns from a helper
from jose import jwt, JWTError
from .basemodels import SECRET_KEY, ALGORITHM

router = APIRouter()


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    try:
        result = await register_user(session, payload)
        set_auth_cookies(response, result.access_token, result.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenOut)
async def login(
    payload: LoginIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    try:
        result = await login_user(session, payload)
        set_auth_cookies(response, result.access_token, result.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# -------- Token introspection for other microservices --------

class TokenIntrospectIn(BaseModel):
    token: str

class TokenIntrospectOut(BaseModel):
    user_id: UUID


@router.post("/token/inspect", response_model=TokenIntrospectOut)
async def inspect_token(
    payload: TokenIntrospectIn,
    session: AsyncSession = Depends(get_session),
):
    """
    Accepts a JWT (expected: access token) and returns the user's UUID if valid.
    Body: {"token": "<jwt>"}
    Response: {"user_id": "<uuid>"}
    """
    token = (payload.token or "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    # Decode & verify signature/exp with jose; raise 401 on any problem.
    try:
        claims = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Disallow refresh tokens for this endpoint (optional).
    if claims.get("type") == "refresh":
        raise HTTPException(status_code=401, detail="Refresh token not allowed for introspection")

    # Extract subject and validate UUID
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Missing 'sub' in token")
    try:
        user_id = UUID(sub)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid subject in token")

    # Ensure the user exists (optional: check is_active)
    user = (await session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return TokenIntrospectOut(user_id=user.id)
