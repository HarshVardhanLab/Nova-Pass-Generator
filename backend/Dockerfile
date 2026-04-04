# Stage 1: Build dependency wheels
FROM python:3.11-slim as builder

WORKDIR /app

# Install system build dependencies required for compiling some python extensions
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# We pipe dependencies to a local wheel folder
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Final runtime container
FROM python:3.11-slim

WORKDIR /app

# Install runtime libs
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy pre-compiled dependencies from builder stage
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

# Copy remaining code
COPY . .

# Setup volumes for data stability
RUN mkdir -p /app/static/qr_codes /app/static/passes /app/uploads
VOLUME [ "/app/static", "/app/uploads" ]

# Default fastAPI command for production
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
