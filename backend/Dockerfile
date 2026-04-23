FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System deps: build essentials for any wheel that misses, and audio libs that
# Pipecat may pull in on шаг 6.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for cache friendliness.
COPY backend/pyproject.toml /app/backend/pyproject.toml
RUN pip install --upgrade pip && pip install /app/backend

# Copy app code
COPY backend /app/backend
COPY data /app/data

WORKDIR /app/backend

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
