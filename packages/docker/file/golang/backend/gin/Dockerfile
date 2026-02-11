# Stage 1: Build the Go application
FROM golang:1.26-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy go.mod and go.sum files for dependency management
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the application code to the container
COPY . .

# Build the Go application
RUN go build -o server main.go

# Stage 2: Run the application with a minimal image
FROM alpine:3.23.3

# Set the working directory in the container
WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/server .

# Expose the port Gin will run on
EXPOSE 8080

# Command to run the application
CMD ["./server"]
