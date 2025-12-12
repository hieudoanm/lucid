# ====================================
# ✅ Stage 1 — Build (optional for caching deps)
# ====================================

FROM denoland/deno:2.6.0 AS builder

# The working directory inside the container
WORKDIR /app

# Copy your Deno project files
COPY . .

# Cache dependencies by pre-fetching them
# (This speeds up rebuilds and uses Docker layer caching)
RUN deno cache main.ts

# ====================================
# ✅ Stage 2 — Production Runtime
# ====================================

# Use a clean official Deno runtime image
FROM denoland/deno:2.6.0

# Set working directory
WORKDIR /app

# Copy project files and cached deps from build stage
COPY --from=builder /app /app

# Expose your app’s port
EXPOSE 8000

# Run your Deno app — adapt entrypoint and permissions as needed
CMD ["run", "--allow-net", "main.ts"]
