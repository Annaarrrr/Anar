from fastapi import FastAPI

app = FastAPI(title="Anar AI Logic Service")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-logic"}