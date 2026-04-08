from kerykeion import AstrologicalSubject
from app.models import ChartData, PlanetPosition, HousePosition
from app.services.geocoding import geocode_city
from typing import Optional
import logging

logger = logging.getLogger(__name__)

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

PLANET_EMOJIS = {
    "Sun": "☀️", "Moon": "🌙", "Mercury": "☿️", "Venus": "♀️",
    "Mars": "♂️", "Jupiter": "♃", "Saturn": "♄",
    "Uranus": "⛢", "Neptune": "♆", "Pluto": "♇"
}


def _planet_to_model(planet_obj) -> PlanetPosition:
    return PlanetPosition(
        name=planet_obj.name,
        sign=planet_obj.sign,
        sign_num=planet_obj.sign_num,
        position=round(planet_obj.position, 2),
        abs_position=round(planet_obj.abs_pos, 2),
        house=str(planet_obj.house),
        retrograde=planet_obj.retrograde if hasattr(planet_obj, 'retrograde') else False,
    )


def _build_chart_summary(subject: AstrologicalSubject) -> str:
    """Build a rich text summary for AI context."""
    lines = [
        f"Birth Chart for {subject.name}",
        f"Born: {subject.year}-{subject.month:02d}-{subject.day:02d} at {subject.hour:02d}:{subject.minute:02d}",
        f"Place: {subject.city} (Lat: {subject.lat:.2f}, Lng: {subject.lng:.2f})",
        f"Zodiac: {subject.zodiac_type}",
        "",
        "PLANETARY POSITIONS:",
    ]

    planets = [
        subject.sun, subject.moon, subject.mercury, subject.venus, subject.mars,
        subject.jupiter, subject.saturn, subject.uranus, subject.neptune, subject.pluto
    ]

    for p in planets:
        retro = " (Retrograde)" if getattr(p, 'retrograde', False) else ""
        emoji = PLANET_EMOJIS.get(p.name, "")
        lines.append(f"  {emoji} {p.name}: {p.sign} {p.position:.1f}° in {p.house}{retro}")

    lines += [
        "",
        f"ASCENDANT (Rising): {subject.first_house.sign} {subject.first_house.position:.1f}°",
        "",
        "HOUSE CUSPS:",
    ]

    houses = [
        subject.first_house, subject.second_house, subject.third_house,
        subject.fourth_house, subject.fifth_house, subject.sixth_house,
        subject.seventh_house, subject.eighth_house, subject.ninth_house,
        subject.tenth_house, subject.eleventh_house, subject.twelfth_house,
    ]
    for i, h in enumerate(houses, 1):
        lines.append(f"  House {i}: {h.sign} {h.position:.1f}°")

    return "\n".join(lines)


def calculate_chart(
    name: str,
    birth_date: str,
    birth_time: str,
    city: str,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    zodiac_type: str = "Sidereal",
    sidereal_mode: str = "LAHIRI",
) -> Optional[ChartData]:
    """
    Calculate a birth chart using Kerykeion.
    Returns ChartData or None on failure.
    """
    try:
        # Parse date/time
        year, month, day = [int(x) for x in birth_date.split("-")]
        hour, minute = [int(x) for x in (birth_time or "12:00").split(":")]

        # Always geocode to get timezone (required by Kerykeion v5 in offline mode)
        tz_str = "Asia/Kolkata"
        if lat is None or lng is None:
            result = geocode_city(city)
            if result:
                lat, lng, tz_str = result
            else:
                # Default to geographic center of India
                lat, lng, tz_str = 20.5937, 78.9629, "Asia/Kolkata"
                logger.warning(f"Could not geocode '{city}', using India defaults")
        else:
            # Have coords but still need timezone
            result = geocode_city(city)
            if result:
                _, _, tz_str = result

        subject = AstrologicalSubject(
            name=name,
            year=year,
            month=month,
            day=day,
            hour=hour,
            minute=minute,
            city=city,
            lat=lat,
            lng=lng,
            tz_str=tz_str,
            zodiac_type=zodiac_type,
            sidereal_mode=sidereal_mode if zodiac_type == "Sidereal" else None,
            online=False,
        )

        houses_list = [
            subject.first_house, subject.second_house, subject.third_house,
            subject.fourth_house, subject.fifth_house, subject.sixth_house,
            subject.seventh_house, subject.eighth_house, subject.ninth_house,
            subject.tenth_house, subject.eleventh_house, subject.twelfth_house,
        ]

        chart = ChartData(
            sun=_planet_to_model(subject.sun),
            moon=_planet_to_model(subject.moon),
            mercury=_planet_to_model(subject.mercury),
            venus=_planet_to_model(subject.venus),
            mars=_planet_to_model(subject.mars),
            jupiter=_planet_to_model(subject.jupiter),
            saturn=_planet_to_model(subject.saturn),
            uranus=_planet_to_model(subject.uranus),
            neptune=_planet_to_model(subject.neptune),
            pluto=_planet_to_model(subject.pluto),
            ascendant={
                "sign": subject.first_house.sign,
                "position": round(subject.first_house.position, 2),
            },
            houses=[
                HousePosition(number=i + 1, sign=h.sign, position=round(h.position, 2))
                for i, h in enumerate(houses_list)
            ],
            birth_date=birth_date,
            birth_time=birth_time or "12:00",
            birth_city=city,
            zodiac_type=zodiac_type,
            chart_summary=_build_chart_summary(subject),
        )

        return chart

    except Exception as e:
        logger.error(f"Chart calculation error: {e}", exc_info=True)
        return None
