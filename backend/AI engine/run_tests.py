import json

from goal_prompt import extract_goal

with open("test_cases.json", "r", encoding="utf-8") as file:
    test_cases = json.load(file)

results = []

for case in test_cases:

    user_input = case["input"]

    ai_result = extract_goal(user_input)

    results.append({
        "input": user_input,
        "ai_output": ai_result
    })


with open("sample_outputs.json", "w", encoding="utf-8") as file:
    json.dump(results, file, ensure_ascii=False, indent=4)

print("Testing completed.")