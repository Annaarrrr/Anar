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


def extract_goal(user_input):
    import re
    is_english = bool(re.search('[a-zA-Z]', user_input))

    if not os.getenv("SAMBANOVA_API_KEY"):
        if is_english:
            return {
                "main_goal": user_input,
                "response_ar": f"Great! Working towards '{user_input}' is a fantastic choice. Let's make progress together step by step."
            }
        else:
            return {
                "main_goal": user_input,
                "response_ar": f"رائع! السعي نحو '{user_input}' هو بداية التغيير الحقيقي للأفضل. سنعمل معاً خطوة بخطوة للوصول إلى غايتك."
            }

    if is_english:
        prompt = f"""
        You are an AI assistant specialized in understanding English goals.
        Return ONLY valid JSON.
        Format:
        {{
          "main_goal": "A concise summary of the goal (e.g. 'Learn Spanish in 3 months')",
          "response_ar": "A friendly and supportive response confirming the goal (in English)"
        }}

        User Input:
        "{user_input}"
        """
    else:
        prompt = f"""
        You are an AI assistant specialized in understanding Arabic goals.
        Understand Egyptian Arabic and slang.
        Return ONLY valid JSON.
        Format:
        {{
          "main_goal": "A concise summary of the goal (in Arabic)",
          "response_ar": "A friendly and supportive response confirming the goal (in Egyptian Arabic)"
        }}

        User Input:
        "{user_input}"
        """

    response = client.chat.completions.create(
        model="Meta-Llama-3.3-70B-Instruct",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    return json.loads(content)