from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.routers import chart, chat, swisseph_chart
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("🔮 Vedix API starting up...")
    logger.info(f"   Supabase: {settings.supabase_url[:40]}..." if settings.supabase_url else "   Supabase: NOT CONFIGURED")
    yield
    logger.info("🔮 Vedix API shutting down...")


app = FastAPI(
    title="Vedix AI Astrology API",
    description="The backend powering Vedix — your personal AI Vedic astrologer.",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chart.router)
app.include_router(chat.router)
app.include_router(swisseph_chart.router)


@app.get("/")
async def root():
    return {
        "app": "Vedix AI Astrology API",
        "status": "🔮 Online",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
