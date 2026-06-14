FROM python:3.11-slim

# Set the working directory to the root of the container
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 3004

COPY ai-logic/requirements.txt ./ai-logic/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ai-logic/requirements.txt

COPY ai-logic/ ./ai-logic/

COPY ["backend/AI engine/", "./backend/AI engine/"]

ENV PYTHONPATH="/app:/app/backend/AI engine"

WORKDIR /app/ai-logic

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3004"]