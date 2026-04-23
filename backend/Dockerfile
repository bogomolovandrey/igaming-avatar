FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for cache friendliness.
COPY backend/pyproject.toml /app/backend/pyproject.toml
RUN pip install --upgrade pip && pip install /app/backend

# Copy app code
COPY backend /app/backend
COPY data /app/data

WORKDIR /app/backend

# Listen port comes from compose env (BACKEND_PORT). EXPOSE is just
# documentation; override at build time with `--build-arg PORT=...` if you
# need a different default for raw `docker run`.
ARG PORT=8000
EXPOSE $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT:-${PORT}}"]
