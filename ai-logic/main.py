from fastapi import FastAPI

app = FastAPI(title="Anar AI Logic Service")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-logic"}

@app.post("/generate")
def generate_tasks(data: dict):
    goal_text = data.get("goalText", "")
    # Placeholder logic - in production this would call an LLM
    return {
        "tasks": [
            f"Review requirements for {goal_text}",
            f"Draft initial design for {goal_text}",
            f"Develop core features for {goal_text}"
        ]
    }