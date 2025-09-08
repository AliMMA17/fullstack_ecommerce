# src/utils/auth_client.py
from __future__ import annotations

import os
import logging
from typing import Optional
from uuid import UUID
from http.cookies import SimpleCookie

import httpx
from fastapi import Request, HTTPException

# ---------- logging setup ----------
log = logging.getLogger("auth_client")
if not log.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s"))
    log.addHandler(_h)
log.setLevel(os.getenv("AUTH_LOG_LEVEL", "DEBUG").upper())

def _mask(tok: str, keep: int = 8) -> str:
    if not tok:
        return ""
    return tok[:keep] + "…" if len(tok) > keep else tok

# ---------- config ----------
AUTH_INTROSPECT_URL = os.getenv(
    "AUTH_INTROSPECT_URL",
    "http://auth_service_local:8000/auth/token/inspect",  # don't use localhost from another container
)
AUTH_TIMEOUT = float(os.getenv("AUTH_TIMEOUT_SECONDS", "3.0"))
DUMP_RESP_BODY = os.getenv("AUTH_DUMP_RESP_BODY", "0") in ("1", "true", "True")


def _access_from_cookie_header(cookie_header: str) -> Optional[str]:
    try:
        c = SimpleCookie()
        c.load(cookie_header)
        tok = c["access_token"].value if "access_token" in c else None
        log.debug("Parsed raw Cookie header -> access_token present=%s", bool(tok))
        return tok
    except Exception as e:
        log.debug("Failed parsing raw Cookie header: %s", e)
        return None


def get_access_token_from_request(request: Request) -> Optional[str]:
    """Cookie-only: read access_token from cookies (no Authorization header)."""
    # Show what cookies starlette already parsed (names only)
    try:
        cookie_names = list(request.cookies.keys())
    except Exception:
        cookie_names = []
    log.debug("Cookie names on request: %s", cookie_names)

    # 1) Starlette-parsed cookies
    tok = request.cookies.get("access_token")
    if tok:
        log.debug("Token found in request.cookies: %s", _mask(tok))
        return tok

    # 2) Raw Cookie header fallback — LOG THE FULL HEADER (requested)
    cookie_header = request.headers.get("cookie") or request.headers.get("Cookie")
    log.debug("Raw Cookie header present=%s", bool(cookie_header))
    if cookie_header:
        # ⚠️ prints the entire header, including tokens — don't use in production
        log.info("RAW Cookie header: %s", cookie_header)
        tok = _access_from_cookie_header(cookie_header)
        if tok:
            log.debug("Token found in raw Cookie header: %s", _mask(tok))
            return tok

    log.debug("No access_token found in cookies.")
    return None


async def introspect_access_token(token: str) -> UUID:
    """POST token to auth introspection; return user_id as UUID or raise HTTPException."""
    log.debug("Calling auth introspection URL=%s token=%s", AUTH_INTROSPECT_URL, _mask(token))
    try:
        async with httpx.AsyncClient(timeout=AUTH_TIMEOUT) as client:
            r = await client.post(AUTH_INTROSPECT_URL, json={"token": token})
    except httpx.HTTPError as e:
        log.error("Auth service request failed: %s", e)
        raise HTTPException(status_code=503, detail="Auth service unavailable") from e

    body_preview = r.text[:300] if DUMP_RESP_BODY else "<hidden>"
    log.debug("Auth response status=%s body=%s", r.status_code, body_preview)

    if r.status_code != 200:
        detail = None
        try:
            detail = r.json().get("detail")
        except Exception:
            pass
        log.warning("Auth returned non-200: %s detail=%s", r.status_code, detail)
        raise HTTPException(status_code=401, detail=detail or "Invalid token")

    try:
        data = r.json()
        user_id = UUID(data["user_id"])
        log.debug("Auth validated token. user_id=%s", user_id)
        return user_id
    except Exception as e:
        log.error("Invalid JSON from auth or missing user_id: %s; body=%s", e, r.text[:300])
        raise HTTPException(status_code=502, detail="Invalid response from auth service") from e


# FastAPI dependency
async def require_user(request: Request) -> UUID:
    log.debug("require_user: extracting token from request")
    token = get_access_token_from_request(request)
    if not token:
        has_refresh = "refresh_token" in (request.cookies or {})
        log.warning("Access token missing. refresh_present=%s", has_refresh)
        if has_refresh:
            raise HTTPException(status_code=401, detail="Access token missing (only refresh token present).")
        raise HTTPException(status_code=401, detail="Access token missing.")
    return await introspect_access_token(token)
