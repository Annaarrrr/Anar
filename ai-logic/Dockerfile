FROM python:3.11-slim

# Set the working directory to the root of the container
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy the requirements file using the correct path from the repo root
COPY ai-logic/requirements.txt ./ai-logic/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ai-logic/requirements.txt

# Copy the rest of the AI logic code
COPY ai-logic/ ./ai-logic/

# Change into the specific directory to run the app
WORKDIR /app/ai-logic

EXPOSE 3004

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3004"]