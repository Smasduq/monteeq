# --- Build Stage ---
FROM rust:1.75-slim-bookworm as builder

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY . .

# Build the application
RUN cargo build --release

# --- Runtime Stage ---
FROM debian:bookworm-slim

# Install runtime dependencies: FFmpeg for video processing and Python for recognition
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/target/release/montage-video-service /app/video-service
# Copy the recognition scripts
COPY ./scripts /app/scripts

# Expose the service port
EXPOSE 8081

# Command to run the service
CMD ["./video-service"]
