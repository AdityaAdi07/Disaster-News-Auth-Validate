import feedparser
from urllib.parse import quote
import json
import random

# Dictionary of Indian cities with their coordinates [latitude, longitude]
indian_cities = {
    "Delhi": [28.6139, 77.2090],
    "Mumbai": [19.0760, 72.8777],
    "Bengaluru": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707],
    "Hyderabad": [17.3850, 78.4867],
    "Kolkata": [22.5726, 88.3639],
    "Pune": [18.5204, 73.8567],
    "Ahmedabad": [23.0225, 72.5714],
    "Jaipur": [26.9124, 75.7873],
    "Lucknow": [26.8467, 80.9462],
    "Bhopal": [23.2599, 77.4126],
    "Indore": [22.7196, 75.8577],
    "Nagpur": [21.1458, 79.0882],
    "Visakhapatnam": [17.6868, 83.2185],
    "Guwahati": [26.1445, 91.7362],
    "Chandigarh": [30.7333, 76.7794],
    "Raipur": [21.2514, 81.6296],
    "Ranchi": [23.3441, 85.3096],
    "Dehradun": [30.3165, 78.0322],
    "Thiruvananthapuram": [8.5241, 76.9366],
    "Kozhikode": [11.2588, 75.7804],
    "Imphal": [24.8170, 93.9368],
    "Itanagar": [27.0844, 93.6053],
    "Aizawl": [23.7271, 92.7176],
    "Agartala": [23.8315, 91.2868],
    "Shillong": [25.5788, 91.8933],
    "Panaji": [15.4989, 73.8278],
    "Gangtok": [27.3314, 88.6138],
    "Puducherry": [11.9416, 79.8083],
    "Patna": [25.5941, 85.1376],
    "Jammu": [32.7266, 74.8570],
    "Amritsar": [31.6340, 74.8723],
    "Ludhiana": [30.9009, 75.8573],
    "Kanpur": [26.4499, 80.3319],
    "Varanasi": [25.3176, 82.9739],
    "Surat": [21.1702, 72.8311],
    "Vadodara": [22.3072, 73.1812],
    "Gwalior": [26.2183, 78.1828],
    "Jodhpur": [26.2389, 73.0243],
    "Coimbatore": [11.0168, 76.9558],
    "Madurai": [9.9252, 78.1198],
    "Nashik": [20.0059, 73.7897]
}

def extract_location_from_title(title):
    for loc in indian_cities.keys():
        if loc.lower() in title.lower():
            return loc
    # If no location found, return a random city
    random_city = random.choice(list(indian_cities.keys()))
    return random_city

def fetch_disaster_news(query, limit=4):
    encoded_query = quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}+when:7d&hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(url)
    results = []
    for entry in feed.entries[:limit]:
        location = extract_location_from_title(entry.title)
        results.append({
            "title": entry.title,
            "description": entry.get("description", ""),
            "url": entry.link,
            "source": entry.get("source", {}).get("title", ""),
            "publishedAt": entry.published,
            "location": location,
            "coordinates": indian_cities[location]  # Add coordinates for the location
        })
    return results

def main():
    disaster_keywords = [
        "India flood", "earthquake India", "cyclone india",
        "landslide northeast", "drought India", "Bengaluru rainfall"
    ]

    all_data = []
    for q in disaster_keywords:
        results = fetch_disaster_news(q, limit=4)
        if results:
            all_data.extend(results)
    
    # Only output the JSON data
    print(json.dumps(all_data))

if __name__ == "__main__":
    main()
