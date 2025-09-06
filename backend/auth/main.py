from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.health.index import router as health_router
from src.auth.index import router as auth_router
from lib.middleware.req_context import RequestIdMiddleware
from lib.observability.logging import setup_logging

setup_logging()
app = FastAPI(title="Auth Service", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,              # needed if you send cookies
    allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["Content-Type","Authorization","X-Requested-With"],
)

app.add_middleware(RequestIdMiddleware)

app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(auth_router,   prefix="/auth",   tags=["auth"])

@app.get("/", tags=["root"])
async def root():
    return {"name": "auth-service", "ok": True}
