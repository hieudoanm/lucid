FROM golang:1.25.6

LABEL maintainer="hieumdoan@gmail.com"
LABEL version="1.0"
LABEL description="Description"

WORKDIR /app

COPY . .

RUN go mod download & CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./dist/main

ENTRYPOINT ["./dist/main"]
