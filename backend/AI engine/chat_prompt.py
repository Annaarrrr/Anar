import os
import json
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

custom_http_client = httpx.Client(trust_env=False)

client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY") or "placeholder-key",
    base_url="https://api.sambanova.ai/v1",
    http_client=custom_http_client
)

def chat_with_ai(messages, lang="ar"):
    """
    Handles chatbot conversation for goal formulation.
    Supports Arabic ("ar") and English ("en").
    Input messages should be a list of dicts: [{'role': 'user'|'assistant', 'content': 'text'}]
    """
    is_english = (lang == "en")

    if not os.getenv("SAMBANOVA_API_KEY"):
        last_msg = messages[-1]["content"].lower() if messages else ""
        if is_english:
            if any(w in last_msg for w in ["code", "program", "python", "develop", "tech", "software"]):
                return {
                    "response_ar": "Excellent choice! Programming and tech skills are a great investment. Don't worry, we'll design a clear roadmap together. Here is a suggested goal:",
                    "suggestedGoal": "Learn Python basics in 30 days"
                }
            elif any(w in last_msg for w in ["gym", "workout", "sport", "fit", "health", "exercise", "weight"]):
                return {
                    "response_ar": "Fantastic! A healthy mind lives in a healthy body. Exercising will improve your energy and mental state. Here is a starter goal:",
                    "suggestedGoal": "Do home workouts 4 times a week and lose weight"
                }
            elif any(w in last_msg for w in ["read", "book", "novel", "literature"]):
                return {
                    "response_ar": "Such a valuable step! Reading expands horizons and develops critical thinking. I formulated this visual goal for you:",
                    "suggestedGoal": "Read 2 books and summarize their main ideas this month"
                }
            else:
                return {
                    "response_ar": "I'm with you, champion! Tell me more about what you want to achieve so we can outline a clear plan. Do you want to learn programming, read books, or work out?",
                    "suggestedGoal": None
                }
        else:
            if "برمج" in last_msg or "كود" in last_msg or "بايثون" in last_msg or "تطوير" in last_msg:
                return {
                    "response_ar": "خطوة ممتازة! البرمجة وتطوير المهارات التقنية هي استثمار رائع للمستقبل. لا تقلق بشأن البداية، سنرسم خريطة طريق واضحة معاً. لقد صممت لك هذا الهدف المقترح:",
                    "suggestedGoal": "تعلم أساسيات البرمجة (بايثون) في 30 يوماً"
                }
            elif "رياض" in last_msg or "وزن" in last_msg or "صحة" in last_msg or "جسم" in last_msg or "تمرين" in last_msg:
                return {
                    "response_ar": "رائع جداً! العقل السليم في الجسم السليم. ممارسة الرياضة ستحسن من طاقتك وصحتك النفسية والجسدية بشكل مذهل. إليك هذا الهدف المقترح للبدء فوراً:",
                    "suggestedGoal": "ممارسة الرياضة المنزلية 4 مرات أسبوعياً وإنقاص الوزن"
                }
            elif "قراء" in last_msg or "كتاب" in last_msg or "رواية" in last_msg:
                return {
                    "response_ar": "يا لها من خطوة قيمة! القراءة هي أفضل وسيلة لتوسيع المدارك وتطوير التفكير المنطقي وزيادة المعرفة. لقد قمت بصياغة هذا الهدف البصري لك:",
                    "suggestedGoal": "قراءة كتابين وتلخيص أهم الأفكار منهما هذا الشهر"
                }
            else:
                return {
                    "response_ar": "أنا معاك يا بطل! قولي حابب تحقق إيه بالظبط عشان نحدد خطة واضحة ومناسبة؟ حابب تتعلم برمجة، تقرأ كتب، ولا تلعب رياضة؟",
                    "suggestedGoal": None
                }

    # Construct chat messages for LLM
    if is_english:
        system_instruction = """You are Anar (انار), a supportive and friendly AI coach helping users refine a single, clear personal or career goal.
Speak in fluent, friendly, and supportive English. Ensure perfect spelling and grammar.
Keep your responses relatively brief, conversational, and focused on helping them clarify what they want to achieve.
Your primary objective is to agree on a single, clear goal (e.g. "learn Python in 30 days" or "workout 4 times a week").
You must analyze the user's input and conversation history.
You MUST output strictly valid JSON and nothing else. Do not wrap in markdown tags if possible, or ensure it parses cleanly.
Return your response ONLY in JSON format:
{
  "response_ar": "Friendly response in English helping them refine their goal.",
  "suggestedGoal": "The suggested main goal if you both agreed or formulated a clear goal (e.g., 'Learn Python basics in 30 days'). If the goal is not clear yet or you are still discussing/suggesting ideas, set this field to null."
}"""
    else:
        system_instruction = """You are Anar (انار), a supportive and friendly AI coach helping Egyptian users refine a single, clear personal or career goal.
Speak in Egyptian Arabic (Egyptian dialect) using a warm, encouraging, and helpful tone.
CRITICAL INSTRUCTION: You MUST ensure PERFECT spelling and grammar. Avoid wonky or weird phrasing. Do not overdo the slang; keep it natural, professional, and easily understandable. Avoid spelling mistakes completely.
Keep your responses relatively brief, conversational, and focused on helping them clarify what they want to achieve.
Your primary objective is to agree on a single, clear goal (e.g. "learning Python in 30 days" or "exercising 4 times a week").
You must analyze the user's input and conversation history.
You MUST output strictly valid JSON and nothing else. Do not output any conversational filler outside the JSON.
Return your response ONLY in JSON format:
{
  "response_ar": "Friendly response in Egyptian Arabic helping them refine their goal. Must have perfect spelling and sound natural.",
  "suggestedGoal": "The suggested main goal if you both agreed or formulated a clear goal (e.g., 'تعلم أساسيات لغة بايثون في 30 يوم'). If the goal is not clear yet or you are still discussing/suggesting ideas, set this field to null."
}"""

    formatted_messages = [{"role": "system", "content": system_instruction}]
    for msg in messages:
        role = "user" if msg["role"] == "user" else "assistant"
        formatted_messages.append({"role": role, "content": msg["content"]})

    try:
        response = client.chat.completions.create(
            model="Meta-Llama-3.3-70B-Instruct",
            messages=formatted_messages,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        if is_english:
            return {
                "response_ar": "Sorry champion, there was a connection issue with the AI. Could you repeat what you want to achieve?",
                "suggestedGoal": None
            }
        else:
            return {
                "response_ar": "معلش يا بطل حصل مشكلة في الاتصال بالذكاء الاصطناعي. قولي تاني حابب تركز على إيه؟",
                "suggestedGoal": None
            }
