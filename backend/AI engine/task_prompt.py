from openai import OpenAI
import os
import json

client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1"
)

def generate_tasks(main_goal):

    prompt = f"""
    Create exactly 4 Arabic tasks.

    Return ONLY valid JSON.

    Tasks must start with Arabic imperative verbs.

    Format:
    {{
      "main_goal": "string",
      "tasks": [
        "string",
        "string",
        "string",
        "string"
      ]
    }}

    Goal:
    "{main_goal}"
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