import requests
import pandas as pd
from bs4 import BeautifulSoup
import time
import json
import re
import google.generativeai as genai
import sys

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

def main():
    # Check if input is coming from stdin
    if not sys.stdin.isatty():
        try:
            input_data = json.loads(sys.stdin.read())
            text = input_data.get('text', '')
            if text:
                result = analyze_text(text)
                print(json.dumps(result))
                return
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            return

    # Original functionality for command-line usage
    query = input("Enter the disaster-related search query: ").strip()
    print(f"Searching images and news for: '{query}' ...")

    images = search_images(query, num_results=5)
    if not images:
        print("No images found.")
        return

    results = []
    for i, img in enumerate(images, 1):
        print(f"\nProcessing item {i}/{len(images)}: {img.get('title', 'No Title')} ...")
        result = process_item(img)
        results.append(result)
        time.sleep(1)

    with open("structured_disaster_data.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    pd.DataFrame(results).to_csv("structured_disaster_data.csv", index=False, encoding="utf-8")

    print("\n✅ Saved structured disaster data to 'structured_disaster_data.json' and 'structured_disaster_data.csv'")

if __name__ == "__main__":
    main()
