# """
# Scenario Simulator — 3 options compare karta hai with financial outcomes
# """
# import json
# import math
# from pathlib import Path


# def load_markets():
#     data_path = Path(__file__).parent.parent / "data" / "markets.json"
#     with open(data_path, "r", encoding="utf-8") as f:
#         return json.load(f)


# def load_market_prices():
#     data_path = Path(__file__).parent.parent / "data" / "market_prices.json"
#     with open(data_path, "r", encoding="utf-8") as f:
#         return json.load(f)


# def haversine_distance(lat1, lon1, lat2, lon2):
#     """Do locations ke beech distance (km) calculate karo"""
#     R = 6371  # Earth radius in km
#     phi1, phi2 = math.radians(lat1), math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


# def get_market_price(market_id: str, crop_id: str) -> float:
#     """Market ki average price return karo"""
#     markets_data = load_market_prices()
#     for market in markets_data:
#         if market["market_id"] == market_id:
#             for price_entry in market.get("prices", []):
#                 if price_entry["crop_id"] == crop_id:
#                     return price_entry["price_avg_per_kg"]
#     return 50.0  # Default fallback price


# def find_nearest_market(batch_lat: float, batch_lng: float) -> dict:
#     """Batch se nearest mandi dhundho"""
#     markets = load_markets()
#     nearest = None
#     min_dist = float('inf')
#     for market in markets:
#         dist = haversine_distance(batch_lat, batch_lng, market["latitude"], market["longitude"])
#         if dist < min_dist:
#             min_dist = dist
#             nearest = {**market, "distance_km": round(dist, 1)}
#     return nearest


# def find_premium_market(batch_lat: float, batch_lng: float, crop_id: str) -> dict:
#     """Sabse premium (is_premium=true) mandi dhundho"""
#     markets = load_markets()
#     premium_markets = [m for m in markets if m.get("is_premium", False)]
#     if not premium_markets:
#         premium_markets = markets

#     best = None
#     best_price = 0
#     for market in premium_markets:
#         price = get_market_price(market["market_id"], crop_id)
#         if price > best_price:
#             best_price = price
#             dist = haversine_distance(batch_lat, batch_lng, market["latitude"], market["longitude"])
#             best = {**market, "distance_km": round(dist, 1), "price": price}

#     return best


# def simulate_scenarios(
#     crop_id: str,
#     quantity_kg: float,
#     decay_rate_k: float,
#     days_since_harvest: int,
#     batch_lat: float,
#     batch_lng: float,
#     current_value_pct: float,
# ) -> list:
#     """
#     MAIN FUNCTION — 3 scenarios generate karo
    
#     Returns: list of 3 scenario dicts
#     """
#     TRANSPORT_COST_PER_KM = 15  # ₨ per km (truck cost estimate)
#     COLD_STORAGE_COST_PER_KG_PER_DAY = 3  # ₨/kg/day

#     nearest = find_nearest_market(batch_lat, batch_lng)
#     premium = find_premium_market(batch_lat, batch_lng, crop_id)

#     nearest_price = get_market_price(nearest["market_id"], crop_id)
#     premium_price = get_market_price(premium["market_id"], crop_id) if premium else nearest_price

#     scenarios = []

#     # ─── SCENARIO A: Sell Today at Nearest Market ───
#     spoilage_loss_a = 1 - (current_value_pct / 100)
#     effective_qty_a = quantity_kg * (1 - spoilage_loss_a * 0.5)  # Already some loss
#     transport_cost_a = nearest["distance_km"] * TRANSPORT_COST_PER_KM
#     revenue_a = effective_qty_a * nearest_price
#     net_a = revenue_a - transport_cost_a

#     scenarios.append({
#         "scenario_id": "A",
#         "title": "Sell Today",
#         "description": f"Sell at {nearest['market_name']} (nearest)",
#         "market_name": nearest["market_name"],
#         "market_id": nearest["market_id"],
#         "distance_km": nearest["distance_km"],
#         "price_per_kg": nearest_price,
#         "spoilage_risk_pct": round(spoilage_loss_a * 100, 1),
#         "transport_cost": round(transport_cost_a),
#         "storage_cost": 0,
#         "storage_days": 0,
#         "effective_quantity_kg": round(effective_qty_a, 1),
#         "gross_revenue": round(revenue_a),
#         "net_revenue": round(net_a),
#         "quality_grade": "A (Premium)" if current_value_pct > 80 else "B+ (Good)",
#         "tag": "Safest Option ✓",
#         "is_recommended": False,
#     })

#     # ─── SCENARIO B: Store 2 Days in Cold Storage, Sell at Premium Market ───
#     store_days = 2
#     cold_k = decay_rate_k * 0.2  # Cold storage mein 5x slower decay
#     future_value_b = 100 * math.exp(-cold_k * (days_since_harvest + store_days))
#     spoilage_loss_b = 1 - (future_value_b / 100)
#     effective_qty_b = quantity_kg * (1 - spoilage_loss_b * 0.5)
#     transport_cost_b = (premium["distance_km"] if premium else nearest["distance_km"]) * TRANSPORT_COST_PER_KM
#     storage_cost_b = quantity_kg * COLD_STORAGE_COST_PER_KG_PER_DAY * store_days
#     revenue_b = effective_qty_b * premium_price
#     net_b = revenue_b - transport_cost_b - storage_cost_b

#     scenarios.append({
#         "scenario_id": "B",
#         "title": "Store & Sell",
#         "description": f"Cold store {store_days} days → sell at {premium['market_name'] if premium else nearest['market_name']}",
#         "market_name": premium["market_name"] if premium else nearest["market_name"],
#         "market_id": premium["market_id"] if premium else nearest["market_id"],
#         "distance_km": premium["distance_km"] if premium else nearest["distance_km"],
#         "price_per_kg": premium_price,
#         "spoilage_risk_pct": round(spoilage_loss_b * 100, 1),
#         "transport_cost": round(transport_cost_b),
#         "storage_cost": round(storage_cost_b),
#         "storage_days": store_days,
#         "effective_quantity_kg": round(effective_qty_b, 1),
#         "gross_revenue": round(revenue_b),
#         "net_revenue": round(net_b),
#         "quality_grade": "A- (Good)",
#         "tag": "Best Return ⭐",
#         "is_recommended": True,
#     })

#     # ─── SCENARIO C: Transport Immediately to Premium Market ───
#     # No storage, but longer transport = more spoilage from heat
#     transport_hours = (premium["distance_km"] if premium else nearest["distance_km"]) / 40  # avg 40km/h
#     transport_decay_days = transport_hours / 24
#     future_value_c = 100 * math.exp(-decay_rate_k * (days_since_harvest + transport_decay_days))
#     spoilage_loss_c = 1 - (future_value_c / 100)
#     effective_qty_c = quantity_kg * (1 - spoilage_loss_c * 0.5)
#     transport_cost_c = (premium["distance_km"] if premium else nearest["distance_km"]) * TRANSPORT_COST_PER_KM * 1.5  # Rush transport = expensive
#     revenue_c = effective_qty_c * premium_price * 0.95  # Slightly lower price for rushed delivery
#     net_c = revenue_c - transport_cost_c

#     scenarios.append({
#         "scenario_id": "C",
#         "title": "Transport Now",
#         "description": f"Transport immediately to {premium['market_name'] if premium else nearest['market_name']}",
#         "market_name": premium["market_name"] if premium else nearest["market_name"],
#         "market_id": premium["market_id"] if premium else nearest["market_id"],
#         "distance_km": premium["distance_km"] if premium else nearest["distance_km"],
#         "price_per_kg": round(premium_price * 0.95, 1),
#         "spoilage_risk_pct": round(spoilage_loss_c * 100, 1),
#         "transport_cost": round(transport_cost_c),
#         "storage_cost": 0,
#         "storage_days": 0,
#         "effective_quantity_kg": round(effective_qty_c, 1),
#         "gross_revenue": round(revenue_c),
#         "net_revenue": round(net_c),
#         "quality_grade": "B+ (Acceptable)",
#         "tag": "Highest Risk ⚠️",
#         "is_recommended": False,
#     })

#     # Re-evaluate recommendation: jo zyada net revenue de wo recommended
#     max_net = max(s["net_revenue"] for s in scenarios)
#     for s in scenarios:
#         s["is_recommended"] = (s["net_revenue"] == max_net)
#         if s["is_recommended"]:
#             s["tag"] = "Best Return ⭐"

#     # Sort by net revenue descending
#     scenarios.sort(key=lambda x: x["net_revenue"], reverse=True)

#     return scenarios
"""
Scenario Simulator — 3 options compare karta hai with financial outcomes

v2 fixes:
  - get_market_price() ab sabse RECENT date wala price return karta hai
    (pehle jo bhi list mein pehla match milta, wahi le leta tha - jo
    aksar purana data hota, kyunki scraper naye entries end mein
    append karta hai).
  - Fake "50.0 fallback price" hata diya. Agar kisi market ke paas us
    crop ka koi price data nahi hai, function ab explicitly None
    deta hai - "pata nahi" honestly bolta hai, fake number nahi deta.
  - find_nearest_market ab sirf geographically nearest nahi dhundta -
    ab "nearest market JISKE PAAS is crop ka real price data hai"
    dhundta hai, taake scenarios kabhi fake price pe based na hon.
  - Agar poore Punjab mein kisi bhi market ke paas is crop ka price
    data na ho (extreme edge case), function clearly ValueError
    raise karta hai - taake caller (main.py) ko pata chale data
    missing hai, aur fake confident numbers na dikhayen.

v3 additions:
  - simulate_scenarios() ab optional forecast_events parameter accept
    karta hai. Jab forecast events diye jayen, transport/storage windows
    pe hazards ka financial penalty lagta hai (HEAVY_RAIN/STORM = 20%
    net revenue penalty, EXTREME_HEAT = 10%, HIGH_HUMIDITY = 8% per
    storage day). Affected scenarios pe forecast_warning aur
    forecast_adjusted flags attach hote hain. Recommendation re-runs
    after penalties — recommendation change ho sakti hai based on forecast.
"""
import json
import math
from pathlib import Path


def load_markets():
    data_path = Path(__file__).parent.parent / "data" / "markets.json"
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_market_prices():
    data_path = Path(__file__).parent.parent / "data" / "market_prices.json"
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


def haversine_distance(lat1, lon1, lat2, lon2):
    """Do locations ke beech distance (km) calculate karo"""
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def get_market_price(market_id: str, crop_id: str):
    """
    Market ki SABSE RECENT price return karta hai (ya None agar data hi nahi hai).

    Purana behavior list ka pehla match return karta tha (jo scraper ke
    append-only design ki wajah se aksar sabse PURANA date hota, naya
    nahi) - ab hum saare matches collect karke unme se max(date) wala
    choose karte hain.

    Agar us market+crop ke liye koi price entry hi nahi milti, None
    return hota hai - 50.0 jaisa fake number kabhi nahi.
    """
    markets_data = load_market_prices()
    for market in markets_data:
        if market["market_id"] == market_id:
            matches = [p for p in market.get("prices", []) if p["crop_id"] == crop_id]
            if matches:
                latest = max(matches, key=lambda p: p["date"])
                return latest["price_avg_per_kg"]
            return None
    return None


def load_markets_with_distance(batch_lat: float, batch_lng: float) -> list:
    """Har market ke sath uska distance batch se attach karke list return karta hai."""
    markets = load_markets()
    result = []
    for market in markets:
        dist = haversine_distance(batch_lat, batch_lng, market["latitude"], market["longitude"])
        result.append({**market, "distance_km": round(dist, 1)})
    return result


def find_nearest_market(batch_lat: float, batch_lng: float, crop_id: str = None) -> dict:
    """
    Batch se nearest mandi dhundho.

    Agar crop_id diya jaye: sirf un markets mein se dhundhta hai jinke
    paas us crop ka REAL price data ho, taake scenarios kabhi fake/missing
    price pe base na hon (raises ValueError agar koi bhi market ke paas
    data na ho).

    Agar crop_id NAHI diya (default None - backward compatible for any
    other caller that just wants "nearest mandi" for display purposes,
    without needing price data): purana behavior - sirf geographically
    nearest market return karta hai, price check nahi karta.
    """
    candidates = load_markets_with_distance(batch_lat, batch_lng)
    candidates.sort(key=lambda m: m["distance_km"])

    if crop_id is None:
        return candidates[0] if candidates else None

    for market in candidates:
        price = get_market_price(market["market_id"], crop_id)
        if price is not None:
            return {**market, "price": price}

    raise ValueError(
        f"No market in the tracked list has any price data for crop_id="
        f"'{crop_id}'. Cannot generate reliable scenarios without real "
        f"price data - refusing to fall back to a fake price."
    )


def find_premium_market(batch_lat: float, batch_lng: float, crop_id: str) -> dict:
    """
    Sabse premium (is_premium=true) mandi dhundho JISKE PAAS is crop
    ka real price data ho. Markets jinke paas price data nahi hai,
    skip ho jate hain (fake price pe compare nahi karte).

    Returns None agar koi bhi premium market (ya, agar koi premium
    market nahi hai to koi bhi market) is crop ka price data na
    rakhta ho - caller (simulate_scenarios) is case mein nearest
    market ka data fallback ke tor pe use karta hai.
    """
    candidates = load_markets_with_distance(batch_lat, batch_lng)
    premium_candidates = [m for m in candidates if m.get("is_premium", False)]
    if not premium_candidates:
        premium_candidates = candidates

    best = None
    best_price = -1  # -1 taake 0 wali valid price bhi qualify ho sake
    for market in premium_candidates:
        price = get_market_price(market["market_id"], crop_id)
        if price is not None and price > best_price:
            best_price = price
            best = {**market, "price": price}

    return best  # None if no premium market has price data for this crop


def _get_events_in_window(forecast_events: list, day_start: int, day_end: int) -> list:
    """
    Ek time window (day_start to day_end inclusive) ke andar ane wale
    forecast events return karo. day_offset 0 = aaj, 1 = kal, etc.
    """
    return [
        e for e in forecast_events
        if day_start <= e.get("day_offset", -1) <= day_end
    ]


def _apply_forecast_penalties(scenarios: list, forecast_events: list) -> list:
    """
    Har scenario ki transport/storage window check karo against forecast
    events. Hazardous events pe financial penalty lagao aur warning attach
    karo.

    Transport windows (day_offset based):
      Scenario A (Sell Today):     transport day 0–1
      Scenario B (Store & Sell):   transport day 2–3 (after 2-day cold store)
      Scenario C (Transport Now):  transport day 0–1

    Penalty rates (of net_revenue):
      STORM:        -20%   (road blockage, crop damage)
      HEAVY_RAIN:   -20%   (road conditions, transit spoilage)
      EXTREME_HEAT: -10%   (in-transit decay acceleration)
      HIGH_HUMIDITY: -8%   (open-air storage quality loss per affected storage day)

    Each penalized scenario gets:
      "forecast_warning": {event dict of the worst event in the window}
      "forecast_adjusted": True
      The net_revenue field is reduced by the penalty amount.
    """
    # Penalty rates by event type
    PENALTY_RATES = {
        "STORM":        0.20,
        "HEAVY_RAIN":   0.20,
        "EXTREME_HEAT": 0.10,
        "HIGH_HUMIDITY": 0.08,
    }

    # Severity ordering for "worst event" selection
    SEVERITY_ORDER = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

    # Transport windows per scenario_id
    WINDOWS = {
        "A": (0, 1),
        "B": (2, 3),
        "C": (0, 1),
    }

    for scenario in scenarios:
        sid = scenario["scenario_id"]
        window = WINDOWS.get(sid)
        if window is None:
            continue

        events_in_window = _get_events_in_window(forecast_events, window[0], window[1])
        if not events_in_window:
            # No hazard in this window — mark clean
            scenario["forecast_warning"] = None
            scenario["forecast_adjusted"] = False
            continue

        # Pick the worst event (by severity, then by penalty rate)
        worst = max(
            events_in_window,
            key=lambda e: (
                SEVERITY_ORDER.get(e.get("severity", "LOW"), 1),
                PENALTY_RATES.get(e.get("event_type", ""), 0),
            ),
        )

        # Calculate total penalty: apply each unique event type once
        # (avoid double-counting the same event type in the same window)
        seen_types = set()
        total_penalty_pct = 0.0
        for e in events_in_window:
            etype = e.get("event_type", "")
            if etype not in seen_types:
                total_penalty_pct += PENALTY_RATES.get(etype, 0.0)
                seen_types.add(etype)

        total_penalty_pct = min(total_penalty_pct, 0.40)  # cap at 40% max penalty
        penalty_amount = round(scenario["net_revenue"] * total_penalty_pct)

        # Apply penalty
        scenario["net_revenue"] = scenario["net_revenue"] - penalty_amount
        scenario["forecast_warning"] = worst
        scenario["forecast_adjusted"] = True
        scenario["forecast_penalty_pkr"] = penalty_amount

    return scenarios


def simulate_scenarios(
    crop_id: str,
    quantity_kg: float,
    decay_rate_k: float,
    days_since_harvest: int,
    batch_lat: float,
    batch_lng: float,
    current_value_pct: float,
    forecast_events: list | None = None,
) -> list:
    """
    MAIN FUNCTION — 3 scenarios generate karo

    v3: Optional forecast_events parameter. Jab diya jaye, transport
    windows pe hazard penalties lagti hain aur recommendation re-runs.

    Returns: list of 3 scenario dicts (each now has forecast_warning,
    forecast_adjusted fields — None/False when no hazard in window).

    Raises ValueError if genuinely no market anywhere has price data
    for this crop - caller should surface this as a clear "insufficient
    data" message rather than ever showing fabricated numbers.
    """
    TRANSPORT_COST_PER_KM = 15  # ₨ per km (truck cost estimate)
    COLD_STORAGE_COST_PER_KG_PER_DAY = 3  # ₨/kg/day

    # find_nearest_market now guarantees real price data or raises clearly
    nearest = find_nearest_market(batch_lat, batch_lng, crop_id)
    nearest_price = nearest["price"]

    premium = find_premium_market(batch_lat, batch_lng, crop_id)
    premium_price = premium["price"] if premium else nearest_price
    if premium is None:
        premium = nearest  # no premium market had data - fall back to nearest (which we know has data)

    scenarios = []

    # ─── SCENARIO A: Sell Today at Nearest Market ───
    spoilage_loss_a = 1 - (current_value_pct / 100)
    effective_qty_a = quantity_kg * (1 - spoilage_loss_a * 0.5)  # Already some loss
    transport_cost_a = nearest["distance_km"] * TRANSPORT_COST_PER_KM
    revenue_a = effective_qty_a * nearest_price
    net_a = revenue_a - transport_cost_a

    scenarios.append({
        "scenario_id": "A",
        "title": "Sell Today",
        "description": f"Sell at {nearest['market_name']} (nearest)",
        "market_name": nearest["market_name"],
        "market_id": nearest["market_id"],
        "distance_km": nearest["distance_km"],
        "price_per_kg": nearest_price,
        "spoilage_risk_pct": round(spoilage_loss_a * 100, 1),
        "transport_cost": round(transport_cost_a),
        "storage_cost": 0,
        "storage_days": 0,
        "effective_quantity_kg": round(effective_qty_a, 1),
        "gross_revenue": round(revenue_a),
        "net_revenue": round(net_a),
        "quality_grade": "A (Premium)" if current_value_pct > 80 else "B+ (Good)",
        "tag": "Safest Option ✓",
        "is_recommended": False,
    })

    # ─── SCENARIO B: Store 2 Days in Cold Storage, Sell at Premium Market ───
    store_days = 2
    cold_k = decay_rate_k * 0.2  # Cold storage mein 5x slower decay
    future_value_b = 100 * math.exp(-cold_k * (days_since_harvest + store_days))
    spoilage_loss_b = 1 - (future_value_b / 100)
    effective_qty_b = quantity_kg * (1 - spoilage_loss_b * 0.5)
    transport_cost_b = premium["distance_km"] * TRANSPORT_COST_PER_KM
    storage_cost_b = quantity_kg * COLD_STORAGE_COST_PER_KG_PER_DAY * store_days
    revenue_b = effective_qty_b * premium_price
    net_b = revenue_b - transport_cost_b - storage_cost_b

    scenarios.append({
        "scenario_id": "B",
        "title": "Store & Sell",
        "description": f"Cold store {store_days} days → sell at {premium['market_name']}",
        "market_name": premium["market_name"],
        "market_id": premium["market_id"],
        "distance_km": premium["distance_km"],
        "price_per_kg": premium_price,
        "spoilage_risk_pct": round(spoilage_loss_b * 100, 1),
        "transport_cost": round(transport_cost_b),
        "storage_cost": round(storage_cost_b),
        "storage_days": store_days,
        "effective_quantity_kg": round(effective_qty_b, 1),
        "gross_revenue": round(revenue_b),
        "net_revenue": round(net_b),
        "quality_grade": "A- (Good)",
        "tag": "Best Return ⭐",
        "is_recommended": True,
    })

    # ─── SCENARIO C: Transport Immediately to Premium Market ───
    # No storage, but longer transport = more spoilage from heat
    transport_hours = premium["distance_km"] / 40  # avg 40km/h
    transport_decay_days = transport_hours / 24
    future_value_c = 100 * math.exp(-decay_rate_k * (days_since_harvest + transport_decay_days))
    spoilage_loss_c = 1 - (future_value_c / 100)
    effective_qty_c = quantity_kg * (1 - spoilage_loss_c * 0.5)
    transport_cost_c = premium["distance_km"] * TRANSPORT_COST_PER_KM * 1.5  # Rush transport = expensive
    # Use the same premium_price (not a discounted version) — the 0.95 discount
    # was creating a confusing price difference between B and C that looked like
    # a data error when both scenarios show the same market name. Rush transport
    # cost already captures the urgency penalty — no need to also cut price.
    revenue_c = effective_qty_c * premium_price
    net_c = revenue_c - transport_cost_c

    scenarios.append({
        "scenario_id": "C",
        "title": "Transport Now",
        "description": f"Transport immediately to {premium['market_name']}",
        "market_name": premium["market_name"],
        "market_id": premium["market_id"],
        "distance_km": premium["distance_km"],
        "price_per_kg": premium_price,   # same price as B — rush cost already in transport_cost
        "spoilage_risk_pct": round(spoilage_loss_c * 100, 1),
        "transport_cost": round(transport_cost_c),
        "storage_cost": 0,
        "storage_days": 0,
        "effective_quantity_kg": round(effective_qty_c, 1),
        "gross_revenue": round(revenue_c),
        "net_revenue": round(net_c),
        "quality_grade": "B+ (Acceptable)",
        "tag": "Highest Risk ⚠️",
        "is_recommended": False,
    })

    # ── Apply forecast penalties (if any events provided) ───────────────────
    # Do this BEFORE re-evaluating recommendation — penalties may change
    # which scenario has the highest net_revenue.
    if forecast_events:
        scenarios = _apply_forecast_penalties(scenarios, forecast_events)
    else:
        # No forecast data — mark all scenarios clean (consistent shape)
        for s in scenarios:
            s["forecast_warning"] = None
            s["forecast_adjusted"] = False

    # ── Quality floor: disqualify Store & Sell when batch is already degraded ─
    # If current value is below 40% (distressed/waste), cold storing it for
    # 2 more days and expecting premium price is unrealistic — the batch is
    # already past the acceptable quality threshold. Force B to never be
    # recommended in this state, regardless of its calculated net_revenue.
    QUALITY_FLOOR_FOR_COLD_STORE = 40.0
    if current_value_pct < QUALITY_FLOOR_FOR_COLD_STORE:
        for s in scenarios:
            if s["scenario_id"] == "B":
                s["_disqualified"] = True
                s["tag"] = "Not Recommended ✗"

    # Re-evaluate recommendation: highest net_revenue among non-disqualified
    eligible = [s for s in scenarios if not s.get("_disqualified")]
    if not eligible:
        eligible = scenarios  # safety: if all disqualified, pick from all
    max_net = max(s["net_revenue"] for s in eligible)
    for s in scenarios:
        s["is_recommended"] = (not s.get("_disqualified")) and (s["net_revenue"] == max_net)
        if s["is_recommended"]:
            s["tag"] = "Best Return ⭐"

    # Clean up internal flag before returning
    for s in scenarios:
        s.pop("_disqualified", None)

    # Sort by net revenue descending
    scenarios.sort(key=lambda x: x["net_revenue"], reverse=True)

    return scenarios