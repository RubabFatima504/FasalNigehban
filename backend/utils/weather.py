"""
Open-Meteo API se weather data laata hai — FREE, no API key needed.

v2: get_forecast() ab daily aggregated endpoint use karta hai (hourly se
better — Open-Meteo khud aggregation karta hai, humein 24-point averaging
nahi karni). Additional daily variables bhi fetch karta hai: precipitation,
weathercode (WMO standard), wind speed, precipitation probability.

classify_forecast_events() un raw numbers ko named hazard events mein
convert karta hai jo agents ke prompts aur scenario penalty logic mein
seedha use ho sakein.

get_weather_full() ek hi call mein current + forecast + events return
karta hai taake agents mein multiple calls na karni paden.
"""
import requests
from datetime import datetime


# ─── WMO Weather Code Groups ────────────────────────────────────────────────
# Ref: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
WMO_RAIN_CODES = set(range(51, 68))          # drizzle + rain (51-67)
WMO_SHOWER_CODES = set(range(80, 83))        # rain showers (80-82)
WMO_STORM_CODES = set(range(95, 100))        # thunderstorm / hail (95-99)
WMO_HEAVY_PRECIP_CODES = WMO_SHOWER_CODES | WMO_STORM_CODES | {65, 66, 67}  # heavy variants

# ─── Hazard Thresholds (Pakistan agricultural context) ───────────────────────
HEAVY_RAIN_MM_THRESHOLD = 15.0    # mm/day → transport disruption risk
EXTREME_HEAT_CELSIUS = 42.0       # °C max → severe acceleration of decay
HIGH_HUMIDITY_PCT = 85            # % avg → fungal growth risk for open-air
STORM_CODE_MIN = 95               # WMO codes 95–99 = thunderstorm/hail


def get_current_weather(lat: float, lng: float) -> dict:
    """
    Current conditions fetch karo.
    Returns: {"temperature": 38.5, "humidity": 45, "apparent_temp": 42.1}
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature"
        f"&timezone=Asia/Karachi"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        current = data.get("current", {})
        return {
            "temperature": current.get("temperature_2m", 35.0),
            "humidity": current.get("relative_humidity_2m", 50),
            "apparent_temp": current.get("apparent_temperature", 38.0),
        }
    except Exception as e:
        print(f"[WARNING] Weather API error: {e}, using defaults")
        return {"temperature": 35.0, "humidity": 50, "apparent_temp": 38.0}


def get_forecast(lat: float, lng: float, days: int = 7) -> list:
    """
    7-din ka enriched daily forecast fetch karo.

    v2 changes vs v1:
    - Ab daily aggregation endpoint use hoti hai (hourly nahi), isliye
      Open-Meteo khud max/min/sum calculate karta hai — code saaf, data
      zyada accurate.
    - Naye fields: precipitation_mm, weathercode, wind_kmh,
      precip_probability_pct — ye sab classify_forecast_events() ko
      feed hote hain.

    Returns: list of dicts, one per day:
    {
        "date": "2025-07-03",
        "avg_temp": 34.2,
        "max_temp": 41.5,
        "min_temp": 28.1,
        "avg_humidity": 62,
        "precipitation_mm": 18.4,
        "weathercode": 80,
        "wind_kmh": 22.3,
        "precip_probability_pct": 75,
    }
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
        f"relative_humidity_2m_mean,precipitation_sum,weathercode,"
        f"windspeed_10m_max,precipitation_probability_max"
        f"&forecast_days={days}&timezone=Asia/Karachi"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        daily = data.get("daily", {})

        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        mean_temps = daily.get("temperature_2m_mean", [])
        humidities = daily.get("relative_humidity_2m_mean", [])
        precips = daily.get("precipitation_sum", [])
        codes = daily.get("weathercode", [])
        winds = daily.get("windspeed_10m_max", [])
        precip_probs = daily.get("precipitation_probability_max", [])

        forecast = []
        for i, date_str in enumerate(dates):
            forecast.append({
                "date": date_str,
                "avg_temp": round(float(mean_temps[i] or 35.0), 1),
                "max_temp": round(float(max_temps[i] or 38.0), 1),
                "min_temp": round(float(min_temps[i] or 28.0), 1),
                "avg_humidity": int(humidities[i] or 50),
                "precipitation_mm": round(float(precips[i] or 0.0), 1),
                "weathercode": int(codes[i] or 0),
                "wind_kmh": round(float(winds[i] or 0.0), 1),
                "precip_probability_pct": int(precip_probs[i] or 0),
            })
        return forecast

    except Exception as e:
        print(f"[WARNING] Forecast API error: {e}, returning empty forecast")
        return []


def classify_forecast_events(forecast: list) -> list:
    """
    Raw daily forecast data ko named hazard events mein classify karo.

    Har event ek dict hai:
    {
        "day_offset": 2,              # 0 = aaj, 1 = kal, etc.
        "date": "2025-07-03",
        "event_type": "HEAVY_RAIN",   # HEAVY_RAIN | EXTREME_HEAT | HIGH_HUMIDITY | STORM
        "severity": "HIGH",           # LOW | MEDIUM | HIGH
        "description": "28mm precipitation expected — transport may be disrupted",
        "affects_transport": True,    # kya yeh event transport ko block kar sakta hai?
        "affects_open_air": True,     # kya yeh open-air storage ke liye risk hai?
    }

    Ek din pe multiple events possible hain (e.g. EXTREME_HEAT + HIGH_HUMIDITY).
    """
    events = []

    for i, day in enumerate(forecast):
        date = day.get("date", "")
        code = day.get("weathercode", 0)
        precip_mm = day.get("precipitation_mm", 0.0)
        max_temp = day.get("max_temp", 30.0)
        avg_humidity = day.get("avg_humidity", 50)
        precip_prob = day.get("precip_probability_pct", 0)

        # ── STORM (highest priority — thunderstorm / hail) ──────────────────
        if code >= STORM_CODE_MIN:
            events.append({
                "day_offset": i,
                "date": date,
                "event_type": "STORM",
                "severity": "HIGH",
                "description": (
                    f"Thunderstorm or hail forecast (WMO code {code}) — "
                    f"dangerous for transport and open-air storage"
                ),
                "affects_transport": True,
                "affects_open_air": True,
            })

        # ── HEAVY RAIN ───────────────────────────────────────────────────────
        elif (
            precip_mm >= HEAVY_RAIN_MM_THRESHOLD
            or code in WMO_HEAVY_PRECIP_CODES
            or precip_prob >= 80
        ):
            sev = "HIGH" if (precip_mm >= 30 or code >= 80) else "MEDIUM"
            events.append({
                "day_offset": i,
                "date": date,
                "event_type": "HEAVY_RAIN",
                "severity": sev,
                "description": (
                    f"{precip_mm:.0f}mm precipitation expected "
                    f"({precip_prob}% probability) — road conditions may "
                    f"delay or block transport"
                ),
                "affects_transport": True,
                "affects_open_air": True,
            })

        # ── EXTREME HEAT ─────────────────────────────────────────────────────
        if max_temp >= EXTREME_HEAT_CELSIUS:
            sev = "HIGH" if max_temp >= 45.0 else "MEDIUM"
            events.append({
                "day_offset": i,
                "date": date,
                "event_type": "EXTREME_HEAT",
                "severity": sev,
                "description": (
                    f"Extreme heat expected — max {max_temp}°C will "
                    f"significantly accelerate crop decay during transport "
                    f"and in open-air storage"
                ),
                "affects_transport": True,
                "affects_open_air": True,
            })

        # ── HIGH HUMIDITY ────────────────────────────────────────────────────
        if avg_humidity >= HIGH_HUMIDITY_PCT:
            events.append({
                "day_offset": i,
                "date": date,
                "event_type": "HIGH_HUMIDITY",
                "severity": "MEDIUM",
                "description": (
                    f"High humidity ({avg_humidity}%) forecast — promotes "
                    f"fungal growth and accelerates decay for open-air "
                    f"stored crops"
                ),
                "affects_transport": False,
                "affects_open_air": True,
            })

    return events


def get_weather_full(lat: float, lng: float, days: int = 7) -> dict:
    """
    Ek call mein current weather + enriched forecast + classified events
    return karo.

    Agents yahi call karein — multiple separate calls ki zaroorat nahi.

    Returns:
    {
        "current": {"temperature": 38.5, "humidity": 45, "apparent_temp": 42.1},
        "forecast": [...],     # list of daily dicts (7 days)
        "events":   [...],     # list of ForecastEvent dicts (only hazards)
    }
    """
    current = get_current_weather(lat, lng)
    forecast = get_forecast(lat, lng, days=days)
    events = classify_forecast_events(forecast)

    return {
        "current": current,
        "forecast": forecast,
        "events": events,
    }


def format_events_for_prompt(events: list) -> str:
    """
    Events list ko LLM prompt ke liye readable string mein format karo.
    Agar koi event nahi → "No significant weather hazards forecast."
    """
    if not events:
        return "No significant weather hazards forecast in the next 7 days."

    lines = []
    for e in events:
        day_label = "Today" if e["day_offset"] == 0 else (
            "Tomorrow" if e["day_offset"] == 1 else f"Day {e['day_offset']}"
        )
        lines.append(
            f"  • [{e['severity']}] {day_label} ({e['date']}): "
            f"{e['event_type'].replace('_', ' ')} — {e['description']}"
        )
    return "\n".join(lines)
