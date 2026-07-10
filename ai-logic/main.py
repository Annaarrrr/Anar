from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from goal_prompt import extract_goal
from task_prompt import generate_tasks
from chat_prompt import chat_with_ai
import json

app = FastAPI(title="Anar AI Logic Service")

# ── Models ────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    goalText: str          # receives Arabic or English user input

class StageItem(BaseModel):
    label: str
    sublabel: str
    emoji: str
    tasks: list[str]

class GenerateResponse(BaseModel):
    stages: list[StageItem]
    main_goal: str
    response_ar: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    lang: str = "ar"

class ChatResponse(BaseModel):
    response_ar: str
    suggestedGoal: str | None = None

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-logic"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(data: ChatRequest):
    try:
        msgs = [{"role": m.role, "content": m.content} for m in data.messages]
        result = chat_with_ai(msgs, data.lang)
        return ChatResponse(
            response_ar=result["response_ar"],
            suggestedGoal=result.get("suggestedGoal")
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat pipeline failed: {str(e)}"
        )

@app.post("/generate", response_model=GenerateResponse)
def generate(data: GenerateRequest):
    try:
        # Step 1: understand what the user wants
        goal_result = extract_goal(data.goalText)
        main_goal = goal_result["main_goal"]
        response_ar = goal_result["response_ar"]

        # Step 2: generate custom journey stages and tasks
        task_result = generate_tasks(main_goal)
        stages = task_result["stages"]

        return GenerateResponse(
            stages=stages,
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