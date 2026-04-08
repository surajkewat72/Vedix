from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import swisseph as swe
from datetime import datetime
import pytz

from app.services.geocoding import geocode_city

router = APIRouter(prefix="/api/swisseph", tags=["SwissEph"])

class BirthInput(BaseModel):
    name: str = "User"
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str

class PlanetData(BaseModel):
    name: str
    sign: str
    sign_number: int
    degree_in_sign: float
    absolute_degree: float
    retrograde: bool

class HouseData(BaseModel):
    number: int
    absolute_degree: float
    sign: str

class SwissephResult(BaseModel):
    julian_day_utc: float
    planets: Dict[str, PlanetData]
    houses: List[HouseData]
    ascendant: float

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

PLANET_MAP = {
    0: "Sun",
    1: "Moon",
    2: "Mercury",
    3: "Venus",
    4: "Mars",
    5: "Jupiter",
    6: "Saturn"
}

def get_zodiac_sign(degree: float) -> tuple[str, int, float]:
    """Given an absolute degree (0-360), returns (Sign Name, Sign Index, Degree in Sign)."""
    sign_idx = int(degree / 30)
    deg_in_sign = degree % 30
    return ZODIAC_SIGNS[sign_idx], sign_idx + 1, deg_in_sign

@router.post("/calculate", response_model=SwissephResult)
def calculate_with_swisseph(data: BirthInput):
    # 1. Geocode city to get timezone and coordinates
    location = geocode_city(data.city)
    if not location:
        raise HTTPException(status_code=400, detail="Could not geocode city")
    
    lat, lng, tz_str = location
    
    # 2. Convert local time to UTC
    try:
        local_tz = pytz.timezone(tz_str)
        local_dt = local_tz.localize(datetime(data.year, data.month, data.day, data.hour, data.minute))
        utc_dt = local_dt.astimezone(pytz.utc)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Time conversion error: {e}")

    # Calculate hour float in UTC
    hour_utc = utc_dt.hour + (utc_dt.minute / 60.0) + (utc_dt.second / 3600.0)

    # 3. Get Julian Day Number
    jd_utc = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, hour_utc)
    
    # Enable Lahiri Ayanamsa (Vedic / Sidereal)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    calc_flag = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

    # 4. Calculate Planets
    calculated_planets = {}
    for swe_id, name in PLANET_MAP.items():
        res, _ = swe.calc_ut(jd_utc, swe_id, calc_flag)
        abs_pos = res[0]
        speed = res[3]
        
        sign_name, sign_idx, deg_in_sign = get_zodiac_sign(abs_pos)
        
        calculated_planets[name] = PlanetData(
            name=name,
            sign=sign_name,
            sign_number=sign_idx,
            degree_in_sign=deg_in_sign,
            absolute_degree=abs_pos,
            retrograde=speed < 0
        )

    # 5. Calculate Houses (Placidus)
    try:
        # Houses function also respects sidereal flag in some versions, but to be sure we pass 0 for sidereal
        # Actually in pyswisseph, sidereal houses can be tricky but let's use the default logic
        houses, ascmc = swe.houses_ex(jd_utc, lat, lng, b'P', calc_flag)
    except Exception:
        # Fallback to standard houses if _ex fails or throws
        houses, ascmc = swe.houses(jd_utc, lat, lng, b'P')

    calculated_houses = []
    # pyswisseph returns a tuple for houses, where index 0 is house 1
    for i, house_cusp in enumerate(houses):
        sign_name, _, _ = get_zodiac_sign(house_cusp)
        calculated_houses.append(HouseData(
            number=i + 1,
            absolute_degree=house_cusp,
            sign=sign_name
        ))

    ascendant_degree = ascmc[0]

    swe.close() # Free memory

    return SwissephResult(
        julian_day_utc=jd_utc,
        planets=calculated_planets,
        houses=calculated_houses,
        ascendant=ascendant_degree
    )
