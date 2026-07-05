"""
NeXus research worker — optional Python sidecar for richer web scraping.

Usage:
  pip install -r nexus-engine/requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 8090

Set NEXUS_WORKER_URL=http://localhost:8090 on OfficeMitra.
"""

from __future__ import annotations

import re
from typing import Any

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="OfficeMitra NeXus Worker", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HEADERS = {
    "User-Agent": "OfficeMitra-NeXus-Python/1.0 (+https://officemitra.vercel.app)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-IN,en;q=0.9",
}

AP_PORTALS = [
    "https://goir.ap.gov.in/",
    "https://www.apfinance.ap.gov.in/",
    "https://treasury.ap.gov.in/",
    "https://cfms.ap.gov.in/",
    "https://www.apgli.ap.gov.in/",
    "https://health.ap.gov.in/",
]


class ResearchRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=300)


def clean_text(html: str, max_len: int = 900) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = " ".join(soup.get_text(separator=" ", strip=True).split())
    return text[:max_len] + ("…" if len(text) > max_len else "")


def topic_keywords(topic: str) -> list[str]:
    return [w for w in re.split(r"[^a-z0-9]+", topic.lower()) if len(w) > 2]


def fetch_source(url: str, title: str) -> dict[str, Any]:
    out = {"url": url, "title": title, "snippet": "", "ok": False}
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        page_title = soup.title.string.strip() if soup.title and soup.title.string else title
        out["title"] = page_title
        out["snippet"] = clean_text(resp.text)
        out["ok"] = True
    except Exception as exc:  # noqa: BLE001
        out["snippet"] = str(exc)
    return out


def find_relevant_links(html: str, base_url: str, keywords: list[str]) -> list[tuple[str, str, int]]:
    soup = BeautifulSoup(html, "html.parser")
    items: list[tuple[str, str, int]] = []
    seen: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        title = " ".join(a.get_text(separator=" ", strip=True).split())
        if not href or len(title) < 6:
            continue
        try:
            from urllib.parse import urljoin

            full = urljoin(base_url, href)
        except Exception:  # noqa: BLE001
            continue
        if full in seen:
            continue
        seen.add(full)
        score = sum(1 for kw in keywords if kw in f"{title} {full}".lower())
        if score > 0:
            items.append((full, title[:300], score))
    items.sort(key=lambda x: x[2], reverse=True)
    return items[:8]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nexus-worker"}


@app.post("/research")
def research(body: ResearchRequest) -> dict[str, Any]:
    keywords = topic_keywords(body.topic)
    candidates: list[tuple[str, str]] = []

    for portal in AP_PORTALS:
        try:
            resp = requests.get(portal, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            for url, title, _ in find_relevant_links(resp.text, portal, keywords):
                if (url, title) not in candidates:
                    candidates.append((url, title))
        except Exception:  # noqa: BLE001
            continue

    if not candidates:
        candidates = [(p, p) for p in AP_PORTALS[:3]]

    sources = [fetch_source(url, title) for url, title in candidates[:6]]
    ok = sum(1 for s in sources if s.get("ok"))
    return {
        "topic": body.topic,
        "sources": sources,
        "notes": f"Python worker: {ok}/{len(sources)} sources for keywords {keywords}",
    }
