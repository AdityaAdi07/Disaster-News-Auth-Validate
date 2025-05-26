import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
WEATHER_API_KEY = "c13cb7e9dd2049dc9f2145839252605"
GEMINI_API_KEY = "AIzaSyDIuniJ86atm8VdCf3pz-rHf1rGxsQnLH8"

# Fallback to default values if environment variables are not set
if not WEATHER_API_KEY:
    print("Warning: WEATHER_API_KEY not found in .env file. Using default value.")
    WEATHER_API_KEY = "82748bf03bf84850970181403252505"
    
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env file. Using default value.")
    GEMINI_API_KEY = "AIzaSyDIuniJ86atm8VdCf3pz-rHf1rGxsQnLH8"

def get_weather_history(lat, lon, date_str):
    url = f"http://api.weatherapi.com/v1/history.json?key={WEATHER_API_KEY}&q={lat},{lon}&dt={date_str}"
    response = requests.get(url)
    data = response.json()
    if "error" in data:
        raise Exception(f"WeatherAPI error: {data['error'].get('message', 'Unknown error')}")
    day = data["forecast"]["forecastday"][0]["day"]
    return {
        "date": date_str,
        "avg_temp_c": day["avgtemp_c"],
        "max_temp_c": day["maxtemp_c"],
        "min_temp_c": day["mintemp_c"],
        "total_precip_mm": day["totalprecip_mm"],
        "max_wind_kph": day["maxwind_kph"],
        "avg_humidity": day["avghumidity"]
    }

def get_past_week_weather(lat, lon):
    today = datetime.today()
    history = []
    for i in range(7):
        date = today - timedelta(days=i+1)
        date_str = date.strftime("%Y-%m-%d")
        day_weather = get_weather_history(lat, lon, date_str)
        history.append(day_weather)
    return history

def get_current_weather(lat, lon):
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={lat},{lon}"
    response = requests.get(url)
    data = response.json()
    if "error" in data:
        raise Exception(f"WeatherAPI error: {data['error'].get('message', 'Unknown error')}")
    current = data["current"]
    return {
        "temperature": current["temp_c"],
        "precipitation": current.get("precip_mm", 0),
        "windspeed_kph": current["wind_kph"],
        "humidity": current["humidity"]
    }

# Heuristic risk calculations for disasters

def calculate_flood_risk(weekly_precip_mm, soil_moisture=None):
    precip_norm = min(weekly_precip_mm / 100, 1.0)
    soil_norm = min(soil_moisture / 100, 1.0) if soil_moisture is not None else 0.5
    return 0.7 * precip_norm + 0.3 * soil_norm

def calculate_cyclone_risk(max_wind_kph):
    return min(max_wind_kph / 120, 1.0)  # normalized

def calculate_fire_risk(max_temp_c, avg_humidity):
    temp_norm = min(max_temp_c / 50, 1.0)
    humidity_norm = 1 - (avg_humidity / 100)
    return 0.7 * temp_norm + 0.3 * humidity_norm

def predict_disaster_and_risk(past_week_weather):
    total_precip = sum(day["total_precip_mm"] for day in past_week_weather)
    max_wind = max(day["max_wind_kph"] for day in past_week_weather)
    max_temp = max(day["max_temp_c"] for day in past_week_weather)
    avg_humidity = sum(day["avg_humidity"] for day in past_week_weather) / len(past_week_weather)

    flood_risk = calculate_flood_risk(total_precip)
    cyclone_risk = calculate_cyclone_risk(max_wind)
    fire_risk = calculate_fire_risk(max_temp, avg_humidity)

    risks = {
        "Flood": flood_risk,
        "Cyclone": cyclone_risk,
        "Forest Fire": fire_risk
    }

    disaster = max(risks, key=risks.get)
    risk_score = risks[disaster]

    if risk_score < 0.2:
        disaster = "No Disaster"
        risk_score = 0.0

    return disaster, risk_score

def generate_summary_with_gemini(prompt_text, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt_text}]
            }
        ]
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()

    # Extract text from response
    try:
        summary = data["candidates"][0]["content"]
    except (KeyError, IndexError):
        summary = "No summary returned from Gemini API."

    return summary

def create_disaster_report(past_week_weather, current_weather, disaster, risk_score):
    report_text = (
        f"Disaster Risk Report:\n\n"
        f"Location Weather Summary (Past 7 Days):\n"
    )
    for day in past_week_weather:
        report_text += (
            f"Date: {day['date']}, Avg Temp: {day['avg_temp_c']}°C, Max Temp: {day['max_temp_c']}°C, "
            f"Min Temp: {day['min_temp_c']}°C, Precipitation: {day['total_precip_mm']} mm, "
            f"Max Wind Speed: {day['max_wind_kph']} kph, Avg Humidity: {day['avg_humidity']}%\n"
        )
    report_text += f"\nCurrent Weather:\nTemperature: {current_weather['temperature']}°C\nPrecipitation: {current_weather['precipitation']} mm\n"
    report_text += f"Wind Speed: {current_weather['windspeed_kph']} kph\nHumidity: {current_weather['humidity']}%\n\n"
    report_text += f"Predicted Disaster: {disaster}\nRisk Score: {risk_score:.2f}\n\n"
    report_text += "Please take necessary precautions based on the risk level."

    # Generate summary with Gemini
    summary = generate_summary_with_gemini(report_text, GEMINI_API_KEY)

    # Save summary to file
    filename = "disaster_summary_report.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(summary if isinstance(summary, str) else str(summary))

    print(f"\nSummary report saved to {filename}")
    print("\nSummary:\n", summary)

def main():
    lat, lon = 26.2006, 92.9376  # example location
    
    current_weather = get_current_weather(lat, lon)
    past_week_weather = get_past_week_weather(lat, lon)

    print("Current Weather:", current_weather)
    print("\nPast Week Weather Summary:")
    for day in past_week_weather:
        print(day)

    disaster, risk_score = predict_disaster_and_risk(past_week_weather)
    print(f"\nPredicted Disaster Type: {disaster}")
    print(f"Predicted Risk Score: {risk_score:.2f}")

    create_disaster_report(past_week_weather, current_weather, disaster, risk_score)

if __name__ == "__main__":
    main()
