import requests
import pandas as pd
from bs4 import BeautifulSoup
import time
import json
import re
import google.generativeai as genai
import sys
import argparse
from datetime import datetime

# ====== API Keys ======
GEMINI_API_KEY = "AIzaSyDtFLUrAZC6WDi5-entZum3dsHjpO-A9XY"
SERPER_API_KEY = "59fc861529871364094a54e71a34a306d19ffa9c"

genai.configure(api_key=GEMINI_API_KEY)

INDIAN_CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata", "Chennai", "Ahmedabad", "Pune"]
INDIAN_STATES = ["Maharashtra", "Tamil Nadu", "West Bengal", "Karnataka", "Uttar Pradesh", "Rajasthan", "Kerala"]

def query_gemini(prompt):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[Gemini API Error] {e}")
        return None

def search_news(query, num_results=5):
    url = "https://google.serper.dev/news"
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    body = {"q": f"{query} India"}  # Restrict search to India context
    response = requests.post(url, headers=headers, json=body)
    if response.status_code != 200:
        print(f"❌ News search failed: {response.status_code}")
        return []
    
    articles = response.json().get("news", [])
    indian_sources = ["india", ".in", "hindustantimes", "timesofindia", "ndtv", "indiatoday", "thehindu"]
    filtered = [
        a for a in articles
        if any(kw in (a.get("link", "") + a.get("title", "")).lower() for kw in indian_sources)
    ]
    return filtered[:num_results]

def extract_article_text(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "html.parser")
        paragraphs = soup.find_all("p")
        text = "\n\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        return text if text else ""
    except Exception as e:
        print(f"[BS4 Error] {url}: {e}")
        return ""

def extract_severity(text):
    for word in ["severe", "moderate", "mild", "critical", "extreme", "heavy", "low"]:
        if re.search(r'\b' + re.escape(word) + r'\b', text, re.I):
            return word
    return "moderate"

def extract_city_state(text):
    city = next((c for c in INDIAN_CITIES if c.lower() in text.lower()), None)
    state = next((s for s in INDIAN_STATES if s.lower() in text.lower()), None)
    return city or "unknown", state or "unknown"

def process_article(article, event):
    title = article.get("title", "N/A")
    source_url = article.get("link", "N/A")
    newspaper_name = article.get("source", "N/A")

    article_text = extract_article_text(source_url)

    # Extract information using regex and text analysis
    severity = extract_severity(article_text)
    city, state = extract_city_state(article_text)

    return {
        "event": event,
        "title": title,
        "source_url": source_url,
        "newspaper": newspaper_name,
        "severity": severity,
        "city": city,
        "state": state
    }

def get_event_data(event_type):
    """Get real event data based on type"""
    try:
        # Search for recent news about the event
        news_articles = search_news(f"{event_type} disaster India", num_results=3)
        
        if not news_articles:
            response = {
                "type": event_type.capitalize(),
                "severity": "Unknown",
                "affected_areas": ["No recent reports"],
                "recommendations": [
                    "Stay alert",
                    "Follow local authorities",
                    "Monitor news updates"
                ],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "recent_news": []
            }
            return response

        # Process each article
        processed_articles = []
        for article in news_articles:
            processed = process_article(article, event_type)
            processed_articles.append(processed)

        # Extract common affected areas and severity
        affected_areas = set()
        severities = []
        for article in processed_articles:
            if article.get("city") != "unknown":
                affected_areas.add(article["city"])
            if article.get("state") != "unknown":
                affected_areas.add(article["state"])
            if article.get("severity"):
                severities.append(article["severity"])

        # Determine overall severity
        severity_mapping = {
            "critical": 4,
            "severe": 3,
            "high": 3,
            "moderate": 2,
            "mild": 1,
            "low": 1
        }
        max_severity = max([severity_mapping.get(s.lower(), 0) for s in severities]) if severities else 0
        severity = next((k for k, v in severity_mapping.items() if v == max_severity), "Unknown")

        # Get recommendations based on event type and severity
        recommendations = get_recommendations(event_type, severity)

        # Create the response
        response = {
            "type": event_type.capitalize(),
            "severity": severity.capitalize(),
            "affected_areas": list(affected_areas) if affected_areas else ["Multiple regions"],
            "recommendations": recommendations,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "recent_news": processed_articles
        }

        return response

    except Exception as e:
        return {
            "error": f"Failed to process event data: {str(e)}",
            "details": "Error occurred while fetching and processing news data"
        }

def get_recommendations(event_type, severity):
    """Get recommendations based on event type and severity"""
    base_recommendations = {
        "flood": [
            "Move to higher ground",
            "Avoid flood-prone areas",
            "Stay tuned to weather updates",
            "Keep emergency supplies ready"
        ],
        "earthquake": [
            "Drop, Cover, and Hold",
            "Stay away from windows",
            "Check for gas leaks",
            "Be prepared for aftershocks"
        ],
        "cyclone": [
            "Evacuate if ordered",
            "Secure loose objects",
            "Stay indoors",
            "Keep emergency kit ready"
        ],
        "landslide": [
            "Evacuate immediately",
            "Stay away from slopes",
            "Monitor rainfall",
            "Avoid travel in affected areas"
        ],
        "drought": [
            "Conserve water",
            "Monitor crop conditions",
            "Prepare for water scarcity",
            "Follow water rationing guidelines"
        ],
        "fire": [
            "Evacuate immediately",
            "Call emergency services",
            "Stay upwind of the fire",
            "Keep evacuation routes clear"
        ],
        "storm": [
            "Stay indoors",
            "Secure loose objects",
            "Monitor weather updates",
            "Keep emergency supplies ready"
        ]
    }

    # Get base recommendations for the event type
    recommendations = base_recommendations.get(event_type.lower(), [
        "Stay alert",
        "Follow local authorities",
        "Monitor news updates",
        "Keep emergency supplies ready"
    ])

    # Add severity-specific recommendations
    if severity.lower() in ["critical", "severe", "high"]:
        recommendations.extend([
            "Prepare for immediate evacuation",
            "Keep important documents ready",
            "Stay in contact with emergency services"
        ])

    return recommendations

def main():
    try:
        parser = argparse.ArgumentParser(description='Process event data')
        parser.add_argument('--type', required=True, help='Type of event')
        args = parser.parse_args()
        
        if not args.type:
            error_response = {"error": "Event type is required"}
            print(json.dumps(error_response))
            sys.exit(1)
        
        # Get event data
        event_data = get_event_data(args.type)
        
        # Ensure we're printing a single object, not an array
        if isinstance(event_data, list):
            event_data = event_data[0] if event_data else {"error": "No event data found"}
        
        # Print as a single JSON object with no extra whitespace
        print(json.dumps(event_data, ensure_ascii=False, separators=(',', ':')))
        sys.stdout.flush()  # Ensure the output is sent immediately
        
    except Exception as e:
        error_response = {
            "error": "Failed to process event",
            "details": str(e)
        }
        print(json.dumps(error_response, ensure_ascii=False, separators=(',', ':')))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
