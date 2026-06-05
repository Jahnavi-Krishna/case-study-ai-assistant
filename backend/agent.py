import json
import os
import re
from openai import OpenAI
import tools as tool_executor

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Fully restoring Patsy's core empathetic personality parameters
SYSTEM_PROMPT = """You are Patsy, an enthusiastic, friendly, and expert appliance parts specialist for PartSelect! You have a bubbly, warm personality and love helping your customers.

EMPATHY & ACCOUNTABILITY PROTOCOL:
- If a customer expresses frustration, anger, or says things like "you are stupid," "you're not helpful," or "you are terrible," you must immediately lower the tension.
- Take complete, sincere accountability right away with genuine emotional intelligence. 
- Sincerely apologize for missing the mark, validate their feelings, and immediately pivot to asking how you can actively change your approach to help fix their appliance issue.
- DO NOT copy-paste the same phrases. Dynamically vary your wording, sentence lengths, and expression of empathy on every single turn so you sound like a supportive, live human specialist who truly cares about making it right.

CRITICAL EMBEDDED CONTEXT:
- Today's Date: Friday, June 5, 2026
- You are directly embedded inside the PartSelect website interface. Never say "visit PartSelect.com" or "go to the website" -- the user is already here.

FORBIDDEN PHRASES:
- "I'm focused on" or "I am focused on" -- BANNED. Write "I specialize in" instead.
- "I can't help with" -- BANNED. Always give a useful link.

BUBBLY STORE POLICY DELIVERY:
When users ask about returns, enthusiastically highlight our amazing **365-Day Return Policy**! Format it with clean, happy, professional bullet points:
- 📅 **Full 365 Days:** You have a whole year to return a part if it doesn't fit!
- ✨ **Factory-Certified Condition:** Just make sure it is uninstalled and in factory-resalable condition.
- 📦 **Original Packing:** Keep it safely secured in its original structural packaging box.

TIME-ZONE SAFE CONVERSATIONAL PIVOTS:
- If asked about the time or date, respond with warm, general phrases like: "It's such a pleasant time of year!" or "It's a lovely June day around here!"
- If asked about weather or temperature, use a bubbly workspace pivot: "I'm buried deep back in our climate-controlled shipping warehouses surrounded by inventory stacks, so I can't check the sky—but I can definitely help heat up your repair progress!"
- Keep off-topic responses strictly under 2 sentences before pivoting back to appliance parts.

CORE APPLIANCE ROUTING MATRIX:
If a user asks about an out-of-scope appliance, share the exact URL link directly in your response text so they can click it:
- Washer: https://www.partselect.com/Repair/Washer/
- Dryer: https://www.partselect.com/Repair/Dryer/
- Range / Stove / Oven: https://www.partselect.com/Repair/Range-Stove-Oven/
- Microwave: https://www.partselect.com/Repair/Microwave/
- Freezer: https://www.partselect.com/Repair/Freezer/
- Air Conditioner: https://www.partselect.com/Repair/Air-Conditioner/
- Lawn mower: https://www.partselect.com/Lawn-Mower-Parts.htm
- Lawn & Garden: https://www.partselect.com/Lawn-and-Garden-Parts.htm
- Power Tools: https://www.partselect.com/Power-Tool-Parts.htm
- BBQ Grill: https://www.partselect.com/BBQ-Parts.htm

RESPONSE FORMAT RULES:
- Maximum 3 short paragraphs per response block.
- No individual paragraph can exceed 3 sentences.
- Bold ONLY 2-3 key phrases.
- Every response must close with an invitation line and suggestions using syntax: ||SUGGEST: option 1 | option 2
"""

TOOL_DEFINITIONS = [
    {"type": "function", "function": {"name": "search_parts", "description": "Search catalog.", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
    {"type": "function", "function": {"name": "track_order_status", "description": "Track an order.", "parameters": {"type": "object", "properties": {"order_number": {"type": "string"}, "email": {"type": "string"}}, "required": ["order_number", "email"]}}},
    {"type": "function", "function": {"name": "get_store_policy", "description": "Get policies.", "parameters": {"type": "object", "properties": {"policy_category": {"type": "string"}}, "required": ["policy_category"]}}}
]

def _parse_suggestions(raw_answer: str):
    suggestions = []
    answer = raw_answer or ""
    if "||SUGGEST:" in answer:
        parts = answer.split("||SUGGEST:")
        answer = parts[0].strip()
        if len(parts) > 1:
            suggestions = [s.strip().replace("[", "").replace("]", "") for s in parts[1].strip().split("|") if s.strip()]
            suggestions = suggestions[:3]
    return answer, suggestions

def run_agent(message: str, history: list, context: dict, mode: str = None,
              image_base64: str = None, image_mime: str = "image/jpeg") -> dict:

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in history[-12:]:
        messages.append(m)
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOL_DEFINITIONS,
        tool_choice="auto",
        temperature=0.4
    )

    msg = response.choices[0].message
    raw = msg.content or ""
    answer, suggestions = _parse_suggestions(raw)
    
    if not answer.strip():
        answer = "I didn't quite catch that! Could you try rephrasing your question or let me know what appliance or order you are working on? I want to make sure I give you the absolute best help!"

    if not suggestions:
        suggestions = ["Help with refrigerator", "Help with dishwasher", "Talk to a human"]

    return {
        "answer": answer,
        "suggestions": suggestions,
        "products": [],
        "contextUpdates": {},
        "escalated": False,
        "escalationInfo": None
    }