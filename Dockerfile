FROM golang:1.23rc2-alpine3.20

RUN set -eux \
    & apk add \
        --no-cache \
        nodejs \
        yarn \
        npm \
        git


RUN mkdir /app
WORKDIR /app

COPY . /app
RUN go run ./server/ -build-frontend \
  && go build -o edna ./server/

ENTRYPOINT ["./edna"]