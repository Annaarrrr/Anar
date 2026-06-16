import os
import json
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

custom_http_client = httpx.Client(trust_env=False)

client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
    http_client=custom_http_client
)


def extract_goal(user_input):

    prompt = f"""
    You are an AI assistant specialized in understanding Arabic goals.

    Understand Egyptian Arabic and slang.

    Return ONLY valid JSON.

    Format:
    {{
      "main_goal": "string",
      "response_ar": "string"
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