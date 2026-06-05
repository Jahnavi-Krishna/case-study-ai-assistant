import os
import json
import numpy as np
from openai import OpenAI

client = OpenAI()

def load_json(filename):
    path = os.path.join(os.path.dirname(__file__), "data", filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

PRODUCTS = load_json("products_sample.json")
COMPATIBILITY = load_json("compatibility_sample.json")
GUIDES = load_json("guides_sample.json")

class RAGEngine:
    def __init__(self):
        self.chunks = []
        self.embeddings = []
        self._build_index()

    def _get_embedding(self, text):
        res = client.embeddings.create(model="text-embedding-3-small", input=text)
        return res.data[0].embedding

    def _build_index(self):
        for guide in GUIDES:
            # Simple chunking by sentences for this slice
            sentences = guide["content"].split(". ")
            chunk_text = ". ".join(sentences).strip()
            chunk_obj = {
                "chunk_id": f"{guide['id']}_1",
                "guide_id": guide["id"],
                "url": guide["url"],
                "title": guide["title"],
                "type": guide["type"],
                "text": chunk_text,
                "part_numbers": guide.get("part_numbers", []),
                "model_numbers": guide.get("model_numbers", [])
            }
            self.chunks.append(chunk_obj)
            self.embeddings.append(self._get_embedding(chunk_text))

    def search_guides(self, intent, query_text, part_number=None, model_number=None):
        filtered_indices = []
        for idx, chunk in enumerate(self.chunks):
            if intent == "returns_policy" and chunk["type"] == "policy":
                filtered_indices.append(idx)
            elif intent == "installation_help" and chunk["type"] == "installation":
                if part_number and part_number.upper() in [p.upper() for p in chunk["part_numbers"]]:
                    filtered_indices.append(idx)
                elif not part_number:
                    filtered_indices.append(idx)
            elif intent == "troubleshooting" and chunk["type"] == "troubleshooting":
                filtered_indices.append(idx)

        if not filtered_indices:
            return json.dumps({"error": "No matching guides found. Ask user for more specific part/model details."})

        query_emb = np.array(self._get_embedding(query_text))
        results = []
        for idx in filtered_indices:
            chunk_emb = np.array(self.embeddings[idx])
            similarity = np.dot(query_emb, chunk_emb) / (np.linalg.norm(query_emb) * np.linalg.norm(chunk_emb))
            results.append((similarity, self.chunks[idx]))

        results.sort(key=lambda x: x[0], reverse=True)
        return json.dumps([item[1] for item in results[:3]])

rag_engine = RAGEngine()

def search_products(query_text):
    q = query_text.lower()
    matches = [p for p in PRODUCTS if q in p["name"].lower() or q in p["short_description"].lower()]
    return json.dumps(matches[:5])

def get_product_by_part_number(part_number):
    match = next((p for p in PRODUCTS if p["part_number"].upper() == part_number.upper()), None)
    return json.dumps(match) if match else json.dumps({"error": "Product not found."})

def check_compatibility(part_number, model_number):
    match = next((c for c in COMPATIBILITY if c["part_number"].upper() == part_number.upper() and c["model_number"].upper() == model_number.upper()), None)
    if match:
        return json.dumps({"compatible": match["compatible"], "notes": match["notes"]})
    return json.dumps({"compatible": None, "notes": "No compatibility data found for this part and model."})