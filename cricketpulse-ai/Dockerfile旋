# Stage 1: Build the Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend

# Copy package files and install dependencies cleanly
COPY frontend/package*.json ./
RUN npm install

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Backend and Serve
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./static

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PORT=8080

# Command to run the app
CMD ["python", "backend/main.py"]
