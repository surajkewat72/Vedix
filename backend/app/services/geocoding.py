from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

import ssl
import certifi

ctx = ssl.create_default_context(cafile=certifi.where())
geolocator = Nominatim(user_agent="vedix-astrology-app", ssl_context=ctx)
tf = TimezoneFinder()


def geocode_city(city: str) -> Optional[Tuple[float, float, str]]:
    """
    Returns (latitude, longitude, timezone_str) for a given city name.
    Returns None if not found.
    """
    try:
        location = geolocator.geocode(city, timeout=10)
        if not location:
            return None

        lat = location.latitude
        lng = location.longitude
        tz_str = tf.timezone_at(lat=lat, lng=lng) or "UTC"

        logger.info(f"Geocoded '{city}' -> ({lat}, {lng}), tz: {tz_str}")
        return lat, lng, tz_str

    except Exception as e:
        logger.error(f"Geocoding error for '{city}': {e}")
        return None
