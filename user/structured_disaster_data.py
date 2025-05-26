import requests
import pandas as pd
from bs4 import BeautifulSoup
import time
import json
import re
import google.generativeai as genai
import sys
import argparse
from concurrent.futures import ThreadPoolExecutor

# ====== Put your API keys here ======
GEMINI_API_KEY = "AIzaSyDtFLUrAZC6WDi5-entZum3dsHjpO-A9XY"
SERPER_API_KEY = "59fc861529871364094a54e71a34a306d19ffa9c"

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

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

def search_images(query, num_results=5):
    url = "https://google.serper.dev/images"
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "q": query
    }

    response = requests.post(url, json=body, headers=headers)
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return []

    images = response.json().get("images", [])
    return images[:num_results]

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
        print(f"[BS4 Fallback Error] {url}: {e}")
        return ""

def extract_social_links(text):
    urls = re.findall(r'(https?://\S+)', text)
    social_links = [u for u in urls if re.search(r'twitter|instagram|facebook', u, re.I)]
    return social_links if social_links else []

def extract_severity(text):
    severity_keywords = ["severe", "moderate", "mild", "critical", "extreme", "heavy", "low"]
    for word in severity_keywords:
        if re.search(r'\b' + re.escape(word) + r'\b', text, re.I):
            return word
    return "unknown"

def extract_death_count(text):
    pattern = re.compile(r'(?:death|dead|killed|fatalities|casualties)\D{0,10}(\d+)', re.I)
    matches = pattern.findall(text)
    if matches:
        try:
            return int(matches[0])
        except:
            return 0
    return 0

def process_item(img):
    title = img.get("title") or "N/A"
    image_urls = []
    if img.get("imageUrl"):
        image_urls.append(img.get("imageUrl"))
    if img.get("thumbnailUrl") and img.get("thumbnailUrl") not in image_urls:
        image_urls.append(img.get("thumbnailUrl"))

    source_url = img.get("link") or img.get("sourceUrl") or "N/A"
    newspaper_name = img.get("sourceName") or "N/A"

    article_text = extract_article_text(source_url) if source_url != "N/A" else ""

    # Prepare prompt for Gemini
    prompt = (
        f"Analyze this news article text:\n{article_text}\n\n"
        "Extract and respond ONLY in JSON with these keys:\n"
        "severity, death, social_media_clips_link\n"
        "If info is not available, use null.\n"
    )

    gemini_response = query_gemini(prompt)
    try:
        parsed_response = json.loads(gemini_response)
    except Exception:
        parsed_response = {
            "severity": None,
            "death": None,
            "social_media_clips_link": None,
            "raw_response": gemini_response
        }

    severity = parsed_response.get("severity")
    if not severity or severity.lower() == "null":
        severity = extract_severity(article_text)

    death = parsed_response.get("death")
    try:
        death = int(death)
        if death < 0:
            death = 0
    except (ValueError, TypeError):
        death = extract_death_count(article_text)

    social_media_clips_link = extract_social_links(article_text)
    if not social_media_clips_link:
        social_media_clips_link = []

    result = {
        "Title": title,
        "image_urls": image_urls,
        "newspaper_name": newspaper_name,
        "severity": severity,
        "death": death,
        "gemini_raw_response": parsed_response.get("raw_response") or gemini_response or "N/A",
        "social_media_clips_link": social_media_clips_link,
        "source_url": source_url
    }

    return result

def analyze_text(text):
    # Prepare prompt for Gemini
    prompt = (
        f"Analyze this text:\n{text}\n\n"
        "Extract and respond ONLY in JSON with these keys:\n"
        "severity, death, social_media_clips_link\n"
        "If info is not available, use null.\n"
    )

    gemini_response = query_gemini(prompt)
    try:
        parsed_response = json.loads(gemini_response)
    except Exception:
        parsed_response = {
            "severity": None,
            "death": None,
            "social_media_clips_link": None,
            "raw_response": gemini_response
        }

    # Fallback to regex if AI analysis fails
    severity = parsed_response.get("severity")
    if not severity or severity.lower() == "null":
        severity = extract_severity(text)

    death = parsed_response.get("death")
    try:
        death = int(death)
        if death < 0:
            death = 0
    except (ValueError, TypeError):
        death = extract_death_count(text)

    social_media_clips_link = extract_social_links(text)
    if not social_media_clips_link:
        social_media_clips_link = []

    return {
        "severity": severity,
        "death": death,
        "social_media_clips_link": social_media_clips_link,
        "raw_response": parsed_response.get("raw_response") or gemini_response
    }

def search_disaster_data(query):
    try:
        print(f"Searching for: {query}", file=sys.stderr)
        
        # Get images and news
        images = search_images(query, num_results=5)
        if not images:
            return {"error": "No results found"}

        results = []
        for img in images:
            print(f"Processing: {img.get('title', 'No Title')}", file=sys.stderr)
            result = process_item(img)
            
            # Format the result for the frontend
            formatted_result = {
                "title": result["Title"],
                "description": f"Reported by {result['newspaper_name']}",
                "location": "Multiple locations",  # You can extract this from the article text if needed
                "severity": result["severity"],
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "source": result["newspaper_name"],
                "url": result["source_url"],
                "images": result["image_urls"],
                "death_count": result["death"],
                "social_media": result["social_media_clips_link"]
            }
            results.append(formatted_result)

        return {"results": results}
    except Exception as e:
        print(f"Error in search_disaster_data: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

def main():
    try:
        parser = argparse.ArgumentParser(description='Search disaster data')
        parser.add_argument('--query', required=True, help='Search query')
        args = parser.parse_args()

        if not args.query:
            print(json.dumps({"error": "Query is required"}))
            sys.exit(1)

        result = search_disaster_data(args.query)
        print(json.dumps(result, ensure_ascii=False))
        sys.stdout.flush()

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
