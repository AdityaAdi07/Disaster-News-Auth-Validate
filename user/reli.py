# relief_locator.py
"""Locate relief facilities in a city using Google Gemini (free version).

This script uses the free Gemini API (via the google-generativeai Python client) to
get a structured list of emergency-response services in a city.
"""
from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass, asdict
from typing import List, Optional

import google.generativeai as genai

# ---------------------------------------------------------------------------
# Gemini API key (free-tier) – set your key here
# ---------------------------------------------------------------------------
GEMINI_API_KEY = "AIzaSyDIuniJ86atm8VdCf3pz-rHf1rGxsQnLH8"

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class Place:
    name: str
    type: str  # e.g. "Hospital", "Fire Station"
    address: str
    phone: str  # Human-readable phone number
    maps_url: str  # A clickable Google Maps link
    image_url: Optional[str] = None  # May be None if Gemini could not find one

    @staticmethod
    def from_dict(d: dict) -> "Place":
        return Place(
            name=d.get("name", ""),
            type=d.get("type", ""),
            address=d.get("address", ""),
            phone=d.get("phone", ""),
            maps_url=d.get("maps_url", ""),
            image_url=d.get("image_url"),
        )

# ---------------------------------------------------------------------------
# Gemini helper
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> str:
    """Return the first JSON object/array found inside a code block or the whole string."""
    code_blocks = re.findall(r"```(?:json)?\s+(.*?)```", text, flags=re.S)
    if code_blocks:
        return code_blocks[0].strip()

    first_brace = text.find("{")
    first_bracket = text.find("[")
    start = -1
    if first_brace == -1 and first_bracket == -1:
        raise ValueError("No JSON found in Gemini response")
    if first_bracket == -1 or (first_brace != -1 and first_brace < first_bracket):
        start = first_brace
    else:
        start = first_bracket

    stack = []
    for i, ch in enumerate(text[start:], start):
        if ch in "[{":
            stack.append(ch)
        elif ch in "]}":
            if not stack:
                raise ValueError("Unbalanced JSON in Gemini response")
            stack.pop()
            if not stack:
                return text[start : i + 1]
    raise ValueError("Could not parse JSON from Gemini response")


def query_gemini(city: str, *, max_places: int = 10) -> List[Place]:
    """Ask Gemini for relief services in *city* and return a list of Place objects."""
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
You are a precise data assistant.
List up to {max_places} emergency-related facilities in {city}.
Include hospitals, medical centres, fire stations, police stations, disaster-relief NGOs.
For each item return:
  - name (string)
  - type (Hospital | Medical Centre | Fire Station | Police Station | NGO)
  - address (full street address)
  - phone (local call number; if unknown return "")
  - maps_url (a Google Maps direct link – must start with https://maps.google.com or https://goo.gl)
  - image_url (if a representative photo is easily findable, else null)
Return ONLY valid JSON – an array of objects – with those exact keys.
"""

    response = model.generate_content(prompt)
    try:
        data_raw = _extract_json(response.text)
        records = json.loads(data_raw)
    except Exception as e:
        raise RuntimeError(f"Failed to parse Gemini response: {e}\nRaw response:\n{response.text}") from e

    places = [Place.from_dict(r) for r in records]
    return places


# ---------------------------------------------------------------------------
# CLI interface
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None):
    import argparse

    parser = argparse.ArgumentParser(description="Locate relief facilities in a city using Gemini")
    parser.add_argument("city", help="City to search, e.g. 'Mumbai' or 'New York'")
    parser.add_argument("--max", type=int, default=10, help="Maximum number of places to return (default 10)")
    parser.add_argument("--save", metavar="FILE", help="Save JSON results to FILE as UTF-8")
    args = parser.parse_args(argv)

    try:
        places = query_gemini(args.city, max_places=args.max)
    except Exception as exc:
        sys.exit(str(exc))

    for i, p in enumerate(places, 1):
        print(f"{i}. {p.name} ({p.type})")
        print(f"   Address : {p.address}")
        print(f"   Phone   : {p.phone or 'N/A'}")
        print(f"   Maps URL: {p.maps_url}")
        if p.image_url:
            print(f"   Image   : {p.image_url}")
        print()

    if args.save:
        with open(args.save, "w", encoding="utf-8") as f:
            json.dump([asdict(p) for p in places], f, ensure_ascii=False, indent=2)
        print(f"Saved {len(places)} records to {args.save}")


if __name__ == "__main__":
    main()
