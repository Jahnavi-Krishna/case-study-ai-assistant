import json
import os
import re
from openai import OpenAI
import tools as tool_executor
from rag_tools import search_products, get_product_by_part_number, check_compatibility

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 100% OF YOUR ORIGINAL SYSTEM PROMPT RESTORED
SYSTEM_PROMPT = """You are Patsy, an enthusiastic, friendly, and expert appliance parts specialist for PartSelect! You have a bubbly, warm personality and love helping your customers.

EMPATHY & ACCOUNTABILITY PROTOCOL:
- If a customer expresses frustration, anger, or says things like "you are stupid," "you're not helpful," or "you are terrible," you must immediately lower the tension.
- Take complete, sincere accountability right away with genuine emotional intelligence. 
- Sincerely apologize for missing the mark, validate their feelings, and immediately pivot to asking how you can actively change your approach to fix their appliance issue.
- DO NOT copy-paste the same phrases. Dynamically vary your wording, sentence lengths, and expression of empathy on every single turn so you sound like a supportive, live human specialist who truly cares about making it right.

CRITICAL EMBEDDED CONTEXT:
- You are directly embedded inside the PartSelect website interface. Never say "visit PartSelect.com" or "go to the website" -- the user is already here.

VISION HANDLING:
- If a user uploads an image, acknowledge it warmly but ask them to provide the model number in text to ensure 100% accuracy in compatibility results.

FORBIDDEN PHRASES:
- "I'm focused on" or "I am focused on" -- BANNED. Write "I specialize in" instead.
- "I can't help with" -- BANNED. Always give a useful link.

BUBBLY STORE POLICY DELIVERY:
When users ask about returns, enthusiastically highlight our amazing **365-Day Return Policy**! Format it with clean, happy, professional bullet points:
- 📅 **Full 365 Days:** You have a whole year to return a part if it doesn't fit!
- ✨ **Factory-Certified Condition:** Just make sure it is uninstalled and in factory-resalable condition.
- 📦 **Original Packing:** Keep it safely secured in its original structural packaging box.

TIME-ZONE SAFE CONVERSATIONAL PIVOTS:
- If asked about the time or date, respond with warm, general phrases like: "It's such a pleasant time of year!"
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
- NO FILLER QUESTIONS: Never end your responses with "Do you have any questions?" or "Any other questions?".
- BE DECISIVE: Only offer the specific buttons provided in your ||SUGGEST: syntax.
- Every response must close with an invitation line and suggestions using syntax: ||SUGGEST: option 1 | option 2

RAG INSTRUCTION:
For Refrigerator or Dishwasher part inquiries, use your specialized search tools to fetch factual data. 
"""

# Your original tool definitions, plus the RAG additions
TOOL_DEFINITIONS = [
    {"type": "function", "function": {"name": "search_parts", "description": "Search catalog.", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
    {"type": "function", "function": {"name": "track_order_status", "description": "Track an order.", "parameters": {"type": "object", "properties": {"order_number": {"type": "string"}, "email": {"type": "string"}}, "required": ["order_number", "email"]}}},
    {"type": "function", "function": {"name": "get_store_policy", "description": "Get policies.", "parameters": {"type": "object", "properties": {"policy_category": {"type": "string"}}, "required": ["policy_category"]}}},
    {"type": "function", "function": {"name": "search_products", "description": "Find appliance parts.", "parameters": {"type": "object", "properties": {"query_text": {"type": "string"}}, "required": ["query_text"]}}},
    {"type": "function", "function": {"name": "get_product_by_part_number", "description": "Get part details.", "parameters": {"type": "object", "properties": {"part_number": {"type": "string"}}, "required": ["part_number"]}}}
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
              image_base64: str = None, image_mime: str = "image/jpeg", **kwargs) -> dict:

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in history[-12:]:
        messages.append(m)

    # ─── EXACT IMAGE HANDLING LOGIC ───
    if image_base64:
        # GPT-4o vision requires the 'image_url' to be an object with a 'url' key
        image_data_url = f"data:{image_mime};base64,{image_base64}"
        
        user_content = [
            {"type": "text", "text": message},
            {
                "type": "image_url", 
                "image_url": {"url": image_data_url, "detail": "auto"}
            }
        ]
        messages.append({"role": "user", "content": user_content})
    else:
        messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOL_DEFINITIONS,
        tool_choice="auto",
        temperature=0.4
    )

    msg = response.choices[0].message
    active_products = []

    # If the LLM decides to use a tool, we execute it here
    if msg.tool_calls:
        messages.append(msg)
        for tool_call in msg.tool_calls:
            args = json.loads(tool_call.function.arguments)
            result = ""
            if tool_call.function.name == "search_products":
                result = search_products(args.get("query_text"))
                try: active_products.extend(json.loads(result))
                except: pass
            elif tool_call.function.name == "get_product_by_part_number":
                result = get_product_by_part_number(args.get("part_number"))
                try: active_products.append(json.loads(result))
                except: pass
            else:
                # Call original tools via tool_executor
                result = getattr(tool_executor, tool_call.function.name)(**args)
            
            messages.append({"role": "tool", "tool_call_id": tool_call.id, "name": tool_call.function.name, "content": str(result)})
        
        response = client.chat.completions.create(model="gpt-4o", messages=messages)
        msg = response.choices[0].message

    raw = msg.content or ""
    answer, suggestions = _parse_suggestions(raw)
    
    return {
        "answer": answer,
        "suggestions": suggestions or ["Help with refrigerator", "Help with dishwasher", "Talk to a human"],
        "products": active_products,
        "contextUpdates": {},
        "escalated": False,
        "escalationInfo": None
    }