# ====================================
# ✅ Stage 1 — Build
# ====================================

# Use a pinned version of Bun for reproducibility
FROM oven/bun:1.3.4 AS builder

# Set work directory
WORKDIR /app

# Copy lockfile and manifest first (for better caching)
COPY bun.lockb package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# If your Bun project needs a build step (e.g. transpile TS, build frontend), do it here:
# For example, if you have "build": "bun build" in package.json:
RUN bun run build

# ====================================
# ✅ Stage 2 — Production Runtime
# ====================================

# Use a lighter Bun base for runtime only
FROM oven/bun:slim

WORKDIR /app

# Copy only what you need from the builder stage
COPY --from=builder /app .

# Expose your app’s port (adjust if needed)
EXPOSE 3000

# Start your app — replace with your real start command
CMD ["bun", "start"]
