from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import rag
import json
import os
from datetime import datetime

load_dotenv()

from agent import run_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading PartSelect catalog...")
    rag.load_data()
    print("Ready.")
    yield


app = FastAPI(title="PartSelect Assistant API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = ""
    history: List = []
    context: dict = {}
    mode: Optional[str] = None
    imageBase64: Optional[str] = None
    imageMime: str = "image/jpeg"


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = run_agent(
            message=request.message,
            history=request.history,
            context=request.context,
            mode=request.mode,
            image_base64=request.imageBase64,
            image_mime=request.imageMime,
        )
        return result
    except Exception as e:
        print(f"[CHAT ERROR]: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "answer": "I ran into an issue — could you try again?",
            "suggestions": [],
            "products": [],
            "contextUpdates": {},
        }


class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"


@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        from openai import OpenAI
        import re
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        clean = re.sub(r'\*\*(.*?)\*\*', r'\1', request.text)
        clean = re.sub(r'\|\|SUGGEST:.*', '', clean, flags=re.DOTALL)
        clean = re.sub(r'\s+', ' ', clean).strip()[:4000]
        response = client.audio.speech.create(
            model="tts-1", voice=request.voice, input=clean, speed=0.95
        )
        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-cache"}
        )
    except Exception as e:
        print(f"[TTS ERROR]: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/feedback")
async def feedback(request: Request):
    data = await request.json()
    data["timestamp"] = datetime.now().isoformat()
    with open("feedback_log.json", "a") as f:
        f.write(json.dumps(data) + "\n")
    return {"received": True}


@app.get("/health")
def health():
    return {"status": "ok", "parts_loaded": len(rag.parts_lookup)}
