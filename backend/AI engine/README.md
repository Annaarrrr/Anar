# Arabic Goal Understanding & Task Generation AI

## Overview

This AI module uses DeepSeek API to:

1. Understand Arabic user goals.
2. Extract the main goal.
3. Generate actionable Arabic tasks.

---

# Files

## goal_prompt.py

Handles Arabic goal extraction.

Input:

* Arabic user text

Output:

```json
{
  "main_goal": "string",
  "response_ar": "string"
}
```

---

## task_prompt.py

Generates actionable Arabic tasks.

Input:

* Main goal

Output:

```json
{
  "main_goal": "string",
  "tasks": [
    "string",
    "string",
    "string",
    "string"
  ]
}
```

---

## test_cases.json

Contains Arabic test cases for:

* Slang
* Typos
* Vague goals
* Normal goals

---

## sample_outputs.json

Contains expected AI outputs.

---

# Supported Arabic Dialects

* Egyptian Arabic
* Gulf Arabic
* Levantine Arabic
* Modern Standard Arabic
* Arabic slang

---

# Prompt Rules

## Goal Extraction

* Return ONLY JSON
* Extract clear main goal
* Friendly Egyptian Arabic response

## Task Generation

* Generate exactly 4 tasks
* Tasks must start with Arabic imperative verbs
* Keep tasks short and practical

---

# Example Flow

User Input:
"عايز أتعلم برمجة"

↓

Extracted Goal:
"تعلم البرمجة"

↓

Generated Tasks:

* اقرأ أساسيات Python
* شاهد فيديو للمبتدئين
* اكتب برنامج بسيط
* حل تمرين صغير

---

# Limitations

* API may fail if balance is insufficient.
* Extreme slang may reduce accuracy.
* AI may occasionally return invalid JSON.
* Requires response validation.

---

# Technologies

* Python
* Requests Library
* DeepSeek API
