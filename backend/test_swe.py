import swisseph as swe
from datetime import datetime

print("Sun ID:", swe.SUN)
print("Moon ID:", swe.MOON)

# Test Julian Day
jd = swe.julday(1990, 6, 15, 10.5)
print("Julian Day:", jd)

# Set Ayanamsa
swe.set_sid_mode(swe.SIDM_LAHIRI)

# Calculate Sun
flag = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
res, ret_flag = swe.calc_ut(jd, swe.SUN, flag)
print("Sun pos:", res[0], "Speed:", res[3])

# Calculate Houses
houses, ascmc = swe.houses(jd, 19.076, 72.877, b'P')
print("Houses:", houses)
print("Ascendant:", ascmc[0])
