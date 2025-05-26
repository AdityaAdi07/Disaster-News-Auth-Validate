import requests
import pandas as pd
from bs4 import BeautifulSoup
import time
import json
import re
import google.generativeai as genai
import sys

# ====== API Keys ======
GEMINI_API_KEY = "AIzaSyDtFLUrAZC6WDi5-entZum3dsHjpO-A9XY"
SERPER_API_KEY = "59fc861529871364094a54e71a34a306d19ffa9c"

genai.configure(api_key=GEMINI_API_KEY)

INDIAN_CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata", "Chennai", "Ahmedabad", "Pune"]
INDIAN_STATES = ["Maharashtra", "Tamil Nadu", "West Bengal", "Karnataka", "Uttar Pradesh", "Rajasthan", "Kerala"]

def query_gemini(prompt):
    try:
        response = genai.chat.completions.create(
            model="models/chat-bison-001",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=800
        )
        return response.choices[0].message.content
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

    prompt = (
        f"Analyze this news text:\n{article_text}\n\n"
        "Extract and respond ONLY in JSON with these keys:\n"
        "severity, city, state\n"
        "If info is not available, use null.\n"
    )

    gemini_response = query_gemini(prompt)
    try:
        parsed = json.loads(gemini_response)
    except:
        parsed = {"severity": None, "city": None, "state": None, "raw_response": gemini_response}

    severity = parsed.get("severity") or extract_severity(article_text)
    city = parsed.get("city") or extract_city_state(article_text)[0]
    state = parsed.get("state") or extract_city_state(article_text)[1]

    return {
        "event": event,
        "title": title,
        "source_url": source_url,
        "newspaper": newspaper_name,
        "severity": severity,
        "city": city,
        "state": state,
        "gemini_raw_response": parsed.get("raw_response") or gemini_response
    }

def main():
    query = input("Enter the disaster event (e.g. flood, earthquake): ").strip()
    print(f"🔎 Searching news for: '{query} India'...")

    articles = search_news(query, num_results=5)
    if not articles:
        print("No relevant Indian news articles found.")
        return

    results = []
    for i, article in enumerate(articles, 1):
        print(f"\n📄 Processing article {i}/{len(articles)}: {article.get('title', 'No Title')}")
        result = process_article(article, query)
        results.append(result)
        time.sleep(1)

    with open("event_data_india.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    pd.DataFrame(results).to_csv("event_data_india.csv", index=False, encoding="utf-8")

    print("\n✅ Saved event data to 'event_data_india.json' and 'event_data_india.csv'")

if __name__ == "__main__":
    main()
