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

def generate_tasks(main_goal):
    import re
    is_english = bool(re.search('[a-zA-Z]', main_goal))

    if not os.getenv("SAMBANOVA_API_KEY"):
        if is_english:
            return {
                "main_goal": main_goal,
                "stages": [
                  {
                    "label": "Preparation", "sublabel": "Getting started", "emoji": "🌱",
                    "tasks": ["Identify the right learning resources", "Set up your environment"]
                  },
                  {
                    "label": "Daily Practice", "sublabel": "Consistency is key", "emoji": "🏃",
                    "tasks": ["Dedicate 20 minutes daily to practice", "Review your progress weekly"]
                  }
                ]
            }
        else:
            return {
                "main_goal": main_goal,
                "stages": [
                  {
                    "label": "التحضير", "sublabel": "البداية الصحيحة", "emoji": "🌱",
                    "tasks": ["حدد الموارد التعليمية المناسبة", "جهز بيئة العمل الخاصة بك"]
                  },
                  {
                    "label": "التدريب اليومي", "sublabel": "الاستمرارية", "emoji": "🏃",
                    "tasks": ["خصص ٢٠ دقيقة يومياً للتدريب", "راجع تقدمك أسبوعياً"]
                  }
                ]
            }

    if is_english:
        prompt = f"""
        Design a highly specific and actionable learning/action journey for the following goal.
        Create exactly 4 to 6 stages (nodes) for the journey.
        For each stage, provide a "label" (e.g. Basic Vocabulary), a "sublabel" (e.g. Everyday words), an "emoji", and an array of EXACTLY 3 to 5 actionable "tasks".
        Tasks must be highly specific and practical (avoid vague tasks like 'Learn the basics'—instead use 'Memorize 20 common vocabulary words' or 'Write a simple hello world script').
        Tasks must start with action/imperative verbs (e.g. Read, Practice, Build, Solve).
        Return ONLY valid JSON.

        Format:
        {{
          "main_goal": "{main_goal}",
          "stages": [
            {{
              "label": "string",
              "sublabel": "string",
              "emoji": "emoji",
              "tasks": [
                "string",
                "string",
                "string"
              ]
            }}
          ]
        }}

        Goal:
        "{main_goal}"
        """
    else:
        prompt = f"""
        صمم خريطة رحلة محددة جداً وعملية للهدف التالي.
        يجب إنشاء ٤ إلى ٦ مراحل (stages) للرحلة.
        لكل مرحلة، اكتب "label" (اسم المرحلة)، "sublabel" (وصف قصير)، "emoji" (رمز تعبيري)، وقائمة تتكون من ٣ إلى ٥ مهام (tasks) بالظبط.
        يجب أن تكون المهام محددة جداً وقابلة للتطبيق الفوري (تجنب المهام المبهمة مثل 'تعلم الأساسيات' - بدلاً من ذلك استخدم 'احفظ ٢٠ كلمة شائعة' أو 'اكتب أول برنامج لك').
        يجب أن تبدأ المهام بأفعال أمر عربية صريحة (مثل: اقرأ، تدرب، ابدأ، اكتب).
        يجب أن تكون النتيجة بتنسيق JSON صحيح فقط. تأكد من صحة الإملاء العربي واستخدام لهجة مفهومة.

        Format:
        {{
          "main_goal": "{main_goal}",
          "stages": [
            {{
              "label": "string",
              "sublabel": "string",
              "emoji": "emoji",
              "tasks": [
                "string",
                "string",
                "string"
              ]
            }}
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
        temperature=0.3,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    return json.loads(content)