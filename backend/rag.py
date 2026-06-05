import json
import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI

load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma = chromadb.EphemeralClient()

parts_collection = None
troubleshooting_collection = None
parts_lookup: dict = {}
troubleshooting_lookup: dict = {}


def _embed(texts: list[str]) -> list[list[float]]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [item.embedding for item in response.data]


def load_data():
    global parts_collection, troubleshooting_collection, parts_lookup, troubleshooting_lookup

    with open("data/parts.json") as f:
        parts = json.load(f)
    with open("data/troubleshooting.json") as f:
        troubleshooting = json.load(f)

    parts_lookup = {p["partSelectNumber"]: p for p in parts}
    troubleshooting_lookup = {g["id"]: g for g in troubleshooting}

    # Index parts
    parts_collection = chroma.get_or_create_collection("parts")
    if parts_collection.count() == 0:
        print("Indexing parts catalog...")
        docs, ids, metas = [], [], []
        for p in parts:
            doc = (
                f"{p['name']} | Part: {p['partSelectNumber']} | "
                f"Category: {p['category']} | Brands: {', '.join(p['brands'])} | "
                f"{p['description']} | "
                f"Fixes: {', '.join(p['symptoms'])} | "
                f"Models: {', '.join(p['compatibleModels'][:8])}"
            )
            docs.append(doc)
            ids.append(p["partSelectNumber"])
            metas.append({
                "partSelectNumber": p["partSelectNumber"],
                "name": p["name"],
                "category": p["category"],
                "price": p["price"],
                "inStock": p["inStock"]
            })
        embeddings = _embed(docs)
        parts_collection.add(documents=docs, embeddings=embeddings, ids=ids, metadatas=metas)
        print(f"✓ Indexed {len(parts)} parts")

    # Index troubleshooting guides
    troubleshooting_collection = chroma.get_or_create_collection("troubleshooting")
    if troubleshooting_collection.count() == 0:
        print("Indexing troubleshooting guides...")
        docs, ids, metas = [], [], []
        for g in troubleshooting:
            doc = (
                f"Appliance: {g['appliance']} | Issue: {g['symptom']} | "
                f"Keywords: {', '.join(g['keywords'])} | "
                f"{g['overview']} | {' '.join(g['diagnosticSteps'])}"
            )
            docs.append(doc)
            ids.append(g["id"])
            metas.append({
                "id": g["id"],
                "appliance": g["appliance"],
                "symptom": g["symptom"]
            })
        embeddings = _embed(docs)
        troubleshooting_collection.add(documents=docs, embeddings=embeddings, ids=ids, metadatas=metas)
        print(f"✓ Indexed {len(troubleshooting)} guides")


def search_parts(query: str, category: str = "any", n: int = 4) -> list[dict]:
    q_emb = _embed([query])[0]
    where = {"category": category} if category in ("refrigerator", "dishwasher") else None
    results = parts_collection.query(query_embeddings=[q_emb], n_results=n, where=where)
    return [parts_lookup[pid] for pid in results["ids"][0] if pid in parts_lookup]


def get_part(part_number: str) -> dict | None:
    pn = part_number.strip().upper()
    if not pn.startswith("PS"):
        pn = "PS" + pn
    return parts_lookup.get(pn)


def check_compatibility(part_number: str, model_number: str) -> dict:
    part = get_part(part_number)
    if not part:
        return {"compatible": None, "error": f"Part {part_number} not found in catalog."}
    model = model_number.strip().upper()
    compatible = any(m.upper() == model for m in part["compatibleModels"])
    related = [parts_lookup[rp] for rp in part.get("relatedParts", []) if rp in parts_lookup]
    return {
        "compatible": compatible,
        "part": part,
        "modelChecked": model_number,
        "compatibleModels": part["compatibleModels"],
        "relatedParts": related
    }


def search_troubleshooting(symptom: str, appliance: str = None, n: int = 2) -> list[dict]:
    query = f"{appliance or ''} {symptom}".strip()
    q_emb = _embed([query])[0]
    where = {"appliance": appliance} if appliance in ("refrigerator", "dishwasher") else None
    results = troubleshooting_collection.query(query_embeddings=[q_emb], n_results=n, where=where)
    guides = [troubleshooting_lookup[gid] for gid in results["ids"][0] if gid in troubleshooting_lookup]
    return guides


def get_parts_by_numbers(part_numbers: list[str]) -> list[dict]:
    return [parts_lookup[pn] for pn in part_numbers if pn in parts_lookup]
