from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time


# ─── Auth / User ────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


# ─── Birth Details ───────────────────────────────────────────────────────────

class BirthDetailsRequest(BaseModel):
    name: Optional[str] = None
    birth_date: str          # "YYYY-MM-DD"
    birth_time: Optional[str] = "12:00"  # "HH:MM"
    birth_city: str
    birth_lat: Optional[float] = None
    birth_lng: Optional[float] = None


class PlanetPosition(BaseModel):
    name: str
    sign: str
    sign_num: int
    position: float
    abs_position: float
    house: str
    retrograde: bool


class HousePosition(BaseModel):
    number: int
    sign: str
    position: float


class LifeArea(BaseModel):
    name: str
    emoji: str
    score: int
    insight: str
    advice: str


class ChartData(BaseModel):
    sun: PlanetPosition
    moon: PlanetPosition
    mercury: PlanetPosition
    venus: PlanetPosition
    mars: PlanetPosition
    jupiter: PlanetPosition
    saturn: PlanetPosition
    uranus: PlanetPosition
    neptune: PlanetPosition
    pluto: PlanetPosition
    ascendant: dict
    houses: List[HousePosition]
    birth_date: str
    birth_time: str
    birth_city: str
    zodiac_type: str
    chart_summary: str
    life_areas: Optional[List[LifeArea]] = None


class BirthDetailsResponse(BaseModel):
    success: bool
    chart: Optional[ChartData] = None
    message: str = ""


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    language: Optional[str] = "English"


class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
