import feedparser
from urllib.parse import quote
import json
import random

# Diverse list of Indian cities across different regions
indian_cities = [
    "Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata",
    "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Bhopal", "Indore", "Nagpur",
    "Visakhapatnam", "Guwahati", "Chandigarh", "Raipur", "Ranchi",
    "Dehradun", "Thiruvananthapuram", "Kozhikode", "Imphal", "Itanagar",
    "Aizawl", "Agartala", "Shillong", "Panaji", "Gangtok", "Puducherry",
    "Patna", "Jammu", "Amritsar", "Ludhiana", "Kanpur", "Varanasi", "Surat",
    "Vadodara", "Gwalior", "Jodhpur", "Coimbatore", "Madurai", "Nashik"
]

def extract_location_from_title(title):
    for loc in indian_cities:
        if loc.lower() in title.lower():
            return loc
    return random.choice(indian_cities)  # fallback to random city

def fetch_disaster_news(query, limit=4):
    encoded_query = quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}+when:7d&hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(url)
    results = []
    for entry in feed.entries[:limit]:
        location = extract_location_from_title(entry.title)
        results.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
            "source": entry.get("source", {}).get("title", ""),
            "location": location
        })
    return results

def main():
    disaster_keywords = [
        "India flood", "earthquake India", "cyclone india",
        "landslide northeast", "drought India", "Bengaluru rainfall"
    ]

    all_data = []
    for q in disaster_keywords:
        print(f"🔍 Fetching news for: {q}")
        results = fetch_disaster_news(q, limit=4)
        if results:
            all_data.extend(results)
        else:
            print("❌ No news found.")

    print(f"\n✅ Total news articles fetched: {len(all_data)}\n")
    for item in all_data:
        print(f"📌 {item['title']}\n🔗 {item['link']}\n🗓️ {item['published']}\n📍 Location: {item['location']}\n")

    # Save to JSON
    with open("disaster_news.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print("✅ Saved results to disaster_news.json")

if __name__ == "__main__":
    main()
