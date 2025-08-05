from pydantic import BaseModel
from data_loader import get_nasa_wind_speed_data, get_slope, get_ndvi_data

class LocationInput(BaseModel):
    latitude: float
    longitude: float

def calculate_windmill_feasibility(location: LocationInput):
    lat = location.latitude
    lon = location.longitude

    wind_score = get_nasa_wind_speed_data(lat, lon)
    slope_raw = get_slope(lat, lon) * 45 
    slope_score = max(1.0 - (slope_raw / 15.0), 0.0) if slope_raw <= 15 else 0.0
    ndvi_data = get_ndvi_data(lat, lon, 3500)
    land_score = ndvi_data["barren_cover"] if ndvi_data and ndvi_data["barren_cover"] is not None else 0.0

    final_score = (0.5 * wind_score) + (0.3 * slope_score) + (0.2 * land_score)

    if final_score >= 0.6:
        feasibility = "✅ Windmill installation is feasible."
    elif final_score >= 0.4:
        feasibility = "⚠️ Windmill installation may be moderately feasible."
    else:
        feasibility = "🚫 Windmill installation is not feasible."

    return {
        "wind_score": round(wind_score, 2),
        "slope_score": round(slope_score, 2),
        "land_score": round(land_score, 2),
        "windmill_feasibility_score": round(final_score, 2),
        "feasibility": feasibility
    }