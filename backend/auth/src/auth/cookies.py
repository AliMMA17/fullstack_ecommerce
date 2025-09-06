# src/auth/cookies.py
from fastapi import Response
import os

IS_DEV = os.getenv("ENV", "dev") == "dev"

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """
    Set HttpOnly cookies for access & refresh tokens.
    In dev (localhost over http) Secure must be False.
    """
    common = dict(
        httponly=True,
        samesite="lax",
        secure=not IS_DEV,  # False on localhost (http)
        path="/",
    )

    # Adjust lifetimes to your needs
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=15 * 60,  # 15 min
        **common,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=30 * 24 * 60 * 60,  # 30 days
        **common,
    )
