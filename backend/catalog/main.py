from fastapi import FastAPI
from src.health.index import router as health_router
from src.catalog.index import router as catalog_router
from lib.middleware.req_context import RequestIdMiddleware
from lib.observability.logging import setup_logging
setup_logging()
app = FastAPI(title="Catalog Service", version="3.0.0")
app.add_middleware(RequestIdMiddleware)
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(catalog_router, prefix="/catalog", tags=["catalog"])
@app.get("/", tags=["root"])
async def root():
    return {"name": "catalog-service", "ok": True}