# -----------------------------
# Stage 1: Build
# -----------------------------
FROM openjdk:21-jdk AS build

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and build files
COPY ../gradlew .
COPY ../gradle gradle
COPY ../build.gradle .
COPY ../settings.gradle .
COPY ../gradle.properties .

# Copy source code
COPY ../src src

# Make Gradle wrapper executable
RUN chmod +x ./gradlew

# Build the Spring Boot jar
RUN ./gradlew clean bootJar --no-daemon

# -----------------------------
# Stage 2: Run
# -----------------------------
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/micro-core-banking-0.0.1-SNAPSHOT.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

# Use a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Set entrypoint
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
