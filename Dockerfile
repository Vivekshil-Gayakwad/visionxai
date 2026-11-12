# =============================================================================
# VisionXAI Multi-Stage Production Dockerfile
# Builds React frontend and packages FastAPI backend + AI models into 1 image
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Frontend (React + Vite + TailwindCSS)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies with caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy frontend source files
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/

# Build static SPA assets into /app/dist
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production Python Backend + AI Inference Engine
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS production

# Install system dependencies required by XGBoost, ONNX Runtime, and OpenCV/Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy AI models (XGBoost, TreeSHAP, EfficientNet ONNX)
COPY ai/models/ ./ai/models/

# Copy built frontend assets from Stage 1 into /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Create directory for persistent SQLite database
RUN mkdir -p /app/database

# Default environment variables
ENV PORT=8000 \
    PYTHONPATH=/app/backend \
    DATABASE_PATH=/app/database/visionxai.db \
    PYTHONUNBUFFERED=1

# Expose HTTP port
EXPOSE 8000

# Health check to ensure service is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start Uvicorn ASGI server (dynamically binds to $PORT provided by Render or defaults to 8000)
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
