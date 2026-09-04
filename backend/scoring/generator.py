import json
import os
import random
from datetime import date
from typing import List, Dict, Any

# Load routes data
routes_data = []
for p in [
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "routes.json"),
    os.path.join(os.path.dirname(__file__), "..", "data", "routes.json"),
    os.path.join(os.getcwd(), "data", "routes.json"),
]:
    if os.path.exists(p):
        try:
            with open(p, "r", encoding="utf-8") as f:
                routes_data = json.load(f)
            break
        except Exception:
            pass

def get_route_info(origin: str, destination: str):
    o_lower = origin.lower().strip()
    d_lower = destination.lower().strip()
    for r in routes_data:
        ro = r.get("origin", "").lower()
        rd = r.get("destination", "").lower()
        if (o_lower in ro or ro in o_lower) and (d_lower in rd or rd in d_lower):
            return r
        if (d_lower in ro or ro in d_lower) and (o_lower in rd or rd in o_lower):
            return r
    # Default estimated route
    return {
        "distance_km": 1150,
        "flight_avg_min": 125,
        "train_avg_min": 980,
        "bus_available": True
    }

def generate_route_options(origin: str, destination: str, travel_date: date) -> Dict[str, List[Dict[str, Any]]]:
    r = get_route_info(origin, destination)
    dist = r.get("distance_km", 1150)
    fl_min = r.get("flight_avg_min", 125)
    tr_min = r.get("train_avg_min", 980)
    bus_avail = r.get("bus_available", True)

    # Flights
    flight_operators = [
        {"name": "IndiGo", "code": "6E", "logo": "https://logo.clearbit.com/goindigo.in", "base": 4200, "dur_offset": 0, "dep": "06:15", "arr": "08:25", "url": "https://www.goindigo.in"},
        {"name": "Air India", "code": "AI", "logo": "https://logo.clearbit.com/airindia.com", "base": 5100, "dur_offset": 10, "dep": "11:30", "arr": "13:50", "url": "https://www.airindia.com"},
        {"name": "Vistara", "code": "UK", "logo": "https://logo.clearbit.com/airvistara.com", "base": 5600, "dur_offset": 5, "dep": "18:40", "arr": "20:55", "url": "https://www.airvistara.com"},
        {"name": "Akasa Air", "code": "QP", "logo": "https://logo.clearbit.com/akasaair.com", "base": 3950, "dur_offset": 15, "dep": "21:10", "arr": "23:35", "url": "https://www.akasaair.com"},
    ]

    flights = []
    for idx, f in enumerate(flight_operators):
        price = round(f["base"] + (dist * 0.8) + random.uniform(-150, 250), 0)
        dur = fl_min + f["dur_offset"]
        flights.append({
            "id": f"fl-{idx+1}",
            "mode": "flight",
            "operator": f"{f['name']} {f['code']}-{random.randint(100, 999)}",
            "operatorLogo": f["logo"],
            "price": int(price),
            "durationMinutes": dur,
            "departureTime": f["dep"],
            "arrivalTime": f["arr"],
            "class": "Economy (Non-stop)",
            "promoCount": random.randint(2, 4),
            "bookingUrl": f["url"],
            "scores": {
                "fastest": round(max(75, 99 - (dur - fl_min) * 0.5), 1),
                "comfort": round(80.0 + random.uniform(0, 10), 1),
                "cost": round(max(40, 85 - (price / 150)), 1),
                "overall": round(84.0 + random.uniform(-4, 6), 1),
                "economic": round(max(45, 90 - (price / dist * 10)), 1),
            }
        })

    # Trains
    train_classes = [
        {"name": "Rajdhani Express", "class": "3rd AC (3A)", "mul": 1.4, "dur": tr_min - 60, "dep": "16:55", "arr": "08:35", "logo": "https://logo.clearbit.com/irctc.co.in"},
        {"name": "Vande Bharat Express", "class": "AC Chair Car (CC)", "mul": 1.5, "dur": int(tr_min * 0.75), "dep": "06:00", "arr": "14:15", "logo": "https://logo.clearbit.com/irctc.co.in"},
        {"name": "Superfast Express", "class": "Sleeper (SL)", "mul": 0.5, "dur": tr_min + 90, "dep": "20:20", "arr": "14:40", "logo": "https://logo.clearbit.com/irctc.co.in"},
        {"name": "Garib Rath Express", "class": "Economy AC (3E)", "mul": 0.9, "dur": tr_min + 30, "dep": "15:10", "arr": "08:45", "logo": "https://logo.clearbit.com/irctc.co.in"},
    ]

    trains = []
    for idx, t in enumerate(train_classes):
        price = round(max(350, (dist * 1.3 * t["mul"]) + random.uniform(-40, 60)), 0)
        dur = t["dur"]
        trains.append({
            "id": f"tr-{idx+1}",
            "mode": "train",
            "operator": f"IRCTC {t['name']}",
            "operatorLogo": t["logo"],
            "price": int(price),
            "durationMinutes": dur,
            "departureTime": t["dep"],
            "arrivalTime": t["arr"],
            "class": t["class"],
            "promoCount": random.randint(1, 2),
            "bookingUrl": "https://www.irctc.co.in",
            "scores": {
                "fastest": round(max(30, 75 - (dur / 60)), 1),
                "comfort": round(78.0 + (15 if "AC" in t["class"] else -10), 1),
                "cost": round(max(60, 98 - (price / 50)), 1),
                "overall": round(80.0 + random.uniform(-3, 5), 1),
                "economic": round(max(70, 99 - (price / dist * 15)), 1),
            }
        })

    # Buses
    bus_operators = [
        {"name": "Zingbus", "type": "AC Sleeper 2+1", "mul": 1.2, "dep": "21:00", "arr": "10:30", "logo": "https://logo.clearbit.com/zingbus.com"},
        {"name": "IntrCity SmartBus", "type": "Multi-Axle AC Sleeper", "mul": 1.3, "dep": "22:30", "arr": "11:45", "logo": "https://logo.clearbit.com/intrcity.com"},
        {"name": "State Transport (RTC)", "type": "Ultra Deluxe Non-AC", "mul": 0.8, "dep": "19:15", "arr": "09:00", "logo": "https://logo.clearbit.com/redbus.in"},
    ]

    buses = []
    if bus_avail or dist <= 1200:
        bus_duration = int(dist / 45 * 60) # ~45 km/h avg
        for idx, b in enumerate(bus_operators):
            price = round(max(400, (dist * 1.6 * b["mul"]) + random.uniform(-50, 50)), 0)
            buses.append({
                "id": f"bu-{idx+1}",
                "mode": "bus",
                "operator": b["name"],
                "operatorLogo": b["logo"],
                "price": int(price),
                "durationMinutes": bus_duration,
                "departureTime": b["dep"],
                "arrivalTime": b["arr"],
                "class": b["type"],
                "promoCount": random.randint(1, 3),
                "bookingUrl": "https://www.redbus.in",
                "scores": {
                    "fastest": round(max(20, 60 - (bus_duration / 60)), 1),
                    "comfort": round(72.0 + (10 if "Sleeper" in b["type"] else 0), 1),
                    "cost": round(max(65, 96 - (price / 30)), 1),
                    "overall": round(73.0 + random.uniform(-2, 4), 1),
                    "economic": round(max(75, 98 - (price / dist * 12)), 1),
                }
            })

    return {
        "flights": flights,
        "trains": trains,
        "buses": buses
    }
