# src/auth/index.py
from fastapi import APIRouter, Depends, HTTPException, status, Header, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from lib.db.postgres import get_session
from .basemodels import RegisterIn, LoginIn, TokenOut, UserOut
from .module import register_user, login_user
from lib.security.jwt import decode
from sqlalchemy import select
from src.models import User
from .cookies import set_auth_cookies  # <-- NEW
import os, json

router = APIRouter()

@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    try:
        result = await register_user(session, payload)   # TokenOut
        set_auth_cookies(response, result.access_token, result.refresh_token)
        return result                                   # still return body (optional)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenOut)
async def login(
    payload: LoginIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    try:
        result = await login_user(session, payload)     # TokenOut
        set_auth_cookies(response, result.access_token, result.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
