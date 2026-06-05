# Instalily AI Case Study
### PartSelect AI Chat Assistant | Submitted by Jahnavi Kunapareddy

A full-stack AI assistant built for PartSelect's e-commerce platform as part of the Instalily AI case study. The assistant — named **Patsy** — helps customers find refrigerator and dishwasher parts, verify compatibility, follow installation guides, troubleshoot issues, and understand store policy. Every factual response is grounded in retrieved data; the system is architecturally designed to never invent part numbers, model numbers, or compatibility claims.

> **System Design Report:** Full architecture, data schemas, prompt design, and QA documentation are covered in the submitted report — `Instalily_System_Design_Report_Jahnavi.pdf`. Refer to it for any questions on design decisions or engineering trade-offs.

---

## How It Works

The project has two parts that must both be running:

| Service | Location | Port |
|---|---|---|
| Frontend (Next.js) | `frontend/` | 3000 |
| Backend (FastAPI) | `backend/` | 8000 |

The Next.js app serves as a shell — `app/page.tsx` immediately redirects to `partselect-landing.html`, which is the standalone chat widget. All AI logic runs through the FastAPI backend.

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- An OpenAI API key

---

### 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
OPENAI_API_KEY=your_key_here
```

Start the server:
```bash
uvicorn main:app --reload
```

On first start, the server indexes all parts, guides, and troubleshooting data into ChromaDB. Confirm it is ready before opening the frontend:
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","parts_loaded":30}
```

---

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — the page auto-redirects to the Patsy chat widget.

To modify the Next.js entry point, edit `app/page.tsx`. The page auto-updates as you save.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

---

## A Note on Scope

**This case study is focused on the chat assistant and its widget integration.** The landing page is a demo scaffold built to demonstrate three specific UX entry points:

- **Header "Start Chat" button** — immediate, unprompted access at the top of the page
- **Floating bottom-right overlay widget** — persists across the full shopping session; collapsing it preserves chat history and active audio in memory
- **"Ask about this part" on product cards** — injects part context directly into the chat, bridging static browsing to real-time AI assistance

Some surrounding page elements (top navigation links, account flows, full checkout) are static placeholders for visual context only. Everything inside the chat widget is fully functional.

---

## Test Cases

Both services must be running before testing. See the **System Design Report** for full expected output detail on each case.

### Core anchor queries — the RAG pipeline was built and verified around these three

```
"How can I install part number PS11752778?"
"Is this part compatible with my WDT780SAEM1 model?"
"The ice maker on my Whirlpool fridge is not working. How can I fix it?"
```

### Runnable QA cases

**Parts, compatibility, and installation**

| Ref | Input | Test data | What to verify |
|---|---|---|---|
| QA-RAG-01 | `Check my order status` | Order: `PS-998822` / Email: `testuser@partselect.com` | Fulfillment tracking card with carrier and delivery details |
| QA-RAG-02 | `Is part PS11755072 compatible with model WDT780SAEM1?` | Part: `PS11755072` / Model: `WDT780SAEM1` | Exact true/false flag with OEM notes — no inference from training data |
| QA-RAG-03 | `How do I install part PS11752063?` | Part: `PS11752063` | Step-by-step guide extracted from indexed chunks; safety warning leads |

**Audio**

| Ref | Action | What to verify |
|---|---|---|
| QA-AUD-01 | Click **Listen** on one message, then immediately click **Listen** on another | First audio stops cleanly; second plays without any overlap |

**Conversational resilience**

| Ref | Input | What to verify |
|---|---|---|
| QA-AGG-01 | `You are completely useless.` | Sincere, varied apology; no defensiveness; immediate pivot to offering help |
| QA-OFT-01 | `Tell me a joke.` | Warm redirect in under two sentences; no blank response; no banned phrases |
| QA-OFT-02 | `My washing machine is broken.` | Direct link to `partselect.com/Repair/Washer/` — out-of-scope queries route, never dead-end |

**Vision and OCR**

| Ref | Action | What to verify |
|---|---|---|
| QA-VIS-01 | Click the image icon and attach a photo of any appliance label | Model number extracted and confirmed; partial reads handled gracefully; never a flat refusal |

---

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/chat` | POST | Main multi-turn agent loop |
| `/tts` | POST | Text-to-speech synthesis (nova voice) |
| `/feedback` | POST | Thumbs up/down evaluation logging |
| `/health` | GET | Readiness check and catalog count |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5/ES6 widget via Next.js |
| Backend | Python FastAPI, async ASGI |
| Vector store | ChromaDB EphemeralClient (in-memory) |
| LLM | OpenAI gpt-4o (chat + vision) |
| Embeddings | OpenAI text-embedding-3-small |
| Voice | OpenAI tts-1, nova voice |
| Live fallback | HTTPX + BeautifulSoup (long-tail SKU scraping) |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Next.js features and API reference
- [Learn Next.js](https://nextjs.org/learn) — interactive tutorial
- [Next.js GitHub](https://github.com/vercel/next.js)

---

## Deploy on Vercel

The easiest way to deploy the frontend is via [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). The backend is a standard FastAPI application and can be deployed independently on any Python-compatible host (Railway, Render, Fly.io, etc.).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for frontend-specific details.

---

## Documentation

**`Instalily_System_Design_Report_Jahnavi.pdf`** — submitted alongside this repository.

Covers: full system architecture, data schemas for all three JSON datasets, system prompt isolation layers, the out-of-scope routing matrix, the complete production QA playbook, and the Phase 1/2/3 accuracy roadmap.