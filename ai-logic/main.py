from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from goal_prompt import extract_goal
from task_prompt import generate_tasks
import json

app = FastAPI(title="Anar AI Logic Service")

# ── Models ────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    goalText: str          # receives Arabic or English user input

class GenerateResponse(BaseModel):
    tasks: list[str]
    main_goal: str
    response_ar: str       # friendly Arabic confirmation message

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-logic"}

@app.post("/generate", response_model=GenerateResponse)
def generate(data: GenerateRequest):
    try:
        # Step 1: understand what the user wants
        goal_result = extract_goal(data.goalText)
        main_goal = goal_result["main_goal"]
        response_ar = goal_result["response_ar"]

        # Step 2: generate 4 actionable Arabic tasks
        task_result = generate_tasks(main_goal)
        tasks = task_result["tasks"]

        return GenerateResponse(
            tasks=tasks,
            main_goal=main_goal,
            response_ar=response_ar,
        )

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI returned invalid JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI pipeline failed: {str(e)}"
        )