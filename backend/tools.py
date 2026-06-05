import json
import httpx
from bs4 import BeautifulSoup
import rag

PARTSELECT_SUPPORT_PHONE = "1-866-319-8402"
PARTSELECT_SUPPORT_EMAIL = "customerservice@partselect.com"
PARTSELECT_SUPPORT_HOURS = "Monday to Saturday, 8am-8pm EST"


def tool_search_parts(query: str, category: str = "any") -> dict:
    parts = rag.search_parts(query=query, category=category)
    return {"parts": parts, "count": len(parts)}


def tool_get_part_details(part_number: str) -> dict:
    part = rag.get_part(part_number)
    if part:
        related = rag.get_parts_by_numbers(part.get("relatedParts", []))
        return {"found": True, "part": part, "relatedParts": related}
    # Not in catalog — try live fetch
    live = fetch_from_partselect(part_number)
    if live.get("found"):
        return {"found": True, "part": live["part"], "relatedParts": [], "source": "live"}
    return {"found": False, "message": f"Part {part_number} not found in catalog or on PartSelect."}


def tool_check_compatibility(part_number: str, model_number: str) -> dict:
    return rag.check_compatibility(part_number, model_number)


def tool_troubleshoot(symptom: str, appliance: str, brand: str = None) -> dict:
    guides = rag.search_troubleshooting(symptom=symptom, appliance=appliance)
    all_parts = []
    for guide in guides:
        parts = rag.get_parts_by_numbers(guide.get("recommendedParts", []))
        all_parts.extend(parts)

    seen, unique_parts = set(), []
    for p in all_parts:
        if p["partSelectNumber"] not in seen:
            seen.add(p["partSelectNumber"])
            unique_parts.append(p)

    return {
        "guides": guides,
        "recommendedParts": unique_parts,
        "followUpQuestions": guides[0]["followUpQuestions"] if guides else []
    }


def tool_escalate(reason: str, chat_summary: str) -> dict:
    return {
        "escalated": True,
        "reason": reason,
        "message": (
            f"For this situation, I recommend speaking with a PartSelect technician directly. "
            f"They can help you get the right diagnosis and part.\n\n"
            f"📞 **{PARTSELECT_SUPPORT_PHONE}** — {PARTSELECT_SUPPORT_HOURS}\n"
            f"📧 **{PARTSELECT_SUPPORT_EMAIL}**"
        ),
        "chatSummary": chat_summary,
        "supportPhone": PARTSELECT_SUPPORT_PHONE,
        "supportEmail": PARTSELECT_SUPPORT_EMAIL
    }


def fetch_from_partselect(part_number: str) -> dict:
    """Attempt to fetch live part data from PartSelect's website."""
    pn = part_number.strip().upper()
    if not pn.startswith("PS"):
        pn = "PS" + pn

    url = f"https://www.partselect.com/{pn}.htm"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }

    try:
        resp = httpx.get(url, headers=headers, timeout=8.0, follow_redirects=True)
        if resp.status_code != 200:
            return {"found": False}

        soup = BeautifulSoup(resp.text, "lxml")

        # Extract part name
        name_el = soup.select_one("h1.title-main") or soup.select_one("h1")
        name = name_el.get_text(strip=True) if name_el else None

        # Extract price
        price_el = soup.select_one(".js-partPrice") or soup.select_one(".pd-price")
        price_text = price_el.get_text(strip=True) if price_el else None
        price = None
        if price_text:
            try:
                price = float(price_text.replace("$", "").replace(",", ""))
            except ValueError:
                pass

        # Extract description
        desc_el = soup.select_one(".pd-description") or soup.select_one(".description")
        description = desc_el.get_text(strip=True)[:400] if desc_el else None

        if not name:
            return {"found": False}

        return {
            "found": True,
            "part": {
                "partSelectNumber": pn,
                "name": name,
                "price": price,
                "description": description,
                "productUrl": str(resp.url),
                "imageUrl": None,
                "inStock": True,
                "source": "live_fetch"
            }
        }
    except Exception:
        return {"found": False}


TOOL_MAP = {
    "search_parts": tool_search_parts,
    "get_part_details": tool_get_part_details,
    "check_compatibility": tool_check_compatibility,
    "troubleshoot": tool_troubleshoot,
    "escalate_to_human": tool_escalate
}


def execute(tool_name: str, args: dict) -> dict:
    fn = TOOL_MAP.get(tool_name)
    if not fn:
        return {"error": f"Unknown tool: {tool_name}"}
    return fn(**{k: v for k, v in args.items() if k in fn.__code__.co_varnames})
