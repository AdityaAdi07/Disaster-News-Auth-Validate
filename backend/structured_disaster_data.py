import requests
import pandas as pd
from bs4 import BeautifulSoup
import json
import argparse
import sys
import google.generativeai as genai
from datetime import datetime

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyDtFLUrAZC6WDi5-entZum3dsHjpO-A9XY"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)

def query_gemini(prompt):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[Gemini API Error] {str(e)}", file=sys.stderr)
        return "N/A"

def search_images(query):
    try:
        # Use Serper API for image search
        url = "https://google.serper.dev/images"
        payload = json.dumps({
            "q": query,
            "gl": "in",
            "hl": "en"
        })
        headers = {
            'X-API-KEY': '59fc861529871364094a54e71a34a306d19ffa9c',  # Replace with your actual API key
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()
        return [img['imageUrl'] for img in data.get('images', [])[:5]]
    except Exception as e:
        print(f"[Image Search Error] {str(e)}", file=sys.stderr)
        return []

def extract_article_text(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        # Get text
        text = soup.get_text()
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        return text
    except Exception as e:
        print(f"[Article Extraction Error] {str(e)}", file=sys.stderr)
        return ""

def process_item(title):
    try:
        # Search for images
        image_urls = search_images(title)
        
        # Extract article text
        article_text = extract_article_text(title)
        
        # Try to get Gemini analysis, but don't fail if it errors
        try:
            prompt = f"""
            Analyze this disaster news title and provide structured information:
            Title: {title}
            
            Please provide the following information in JSON format:
            - severity (low/moderate/severe)
            - estimated death count
            - key points from the article
            """
            
            gemini_response = query_gemini(prompt)
        except Exception as e:
            print(f"[Gemini Analysis Error] {str(e)}", file=sys.stderr)
            gemini_response = "N/A"
        
        # Create structured data with default values
        structured_data = {
            "Title": title,
            "image_urls": image_urls,
            "newspaper_name": "N/A",
            "severity": "moderate",  # Default to moderate severity
            "death": 0,  # Default to 0 deaths
            "gemini_raw_response": gemini_response,
            "social_media_clips_link": [],
            "source_url": title,
            "Notes": "Analysis completed with default values due to API limitations."
        }
        
        # Output only the JSON data
        print(json.dumps(structured_data))
        
    except Exception as e:
        print(f"[Processing Error] {str(e)}", file=sys.stderr)
        # Return a minimal valid response instead of exiting
        print(json.dumps({
            "Title": title,
            "image_urls": [],
            "newspaper_name": "N/A",
            "severity": "moderate",
            "death": 0,
            "gemini_raw_response": "N/A",
            "social_media_clips_link": [],
            "source_url": title,
            "Notes": f"Error during processing: {str(e)}"
        }))

def main():
    # Read title from stdin
    title = sys.stdin.read().strip()
    
    if not title:
        print(json.dumps({"error": "No title provided"}), file=sys.stderr)
        sys.exit(1)
    
    process_item(title)

if __name__ == "__main__":
    main()
