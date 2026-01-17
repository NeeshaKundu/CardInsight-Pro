FROM node:18-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for scikit-learn
RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=frontend /app/frontend/build ./static
COPY backend/ ./backend/

# Handle sample_data optionally
RUN mkdir -p ./sample_data
COPY sample_data/ ./sample_data/ 2>/dev/null || true

EXPOSE 8000
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]