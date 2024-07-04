# Edna

[Edna](https://edna.arslexis.io) is a note taking app for developers and power users.

To learn more, see https://edna.arslexis.io/help

## Compiling and running for yourself

* `go run ./server/ -build-frontend`
* `go build -o edna ./server/` (on Windows, `-o edna.exe`)

This generates a stand-along `edna` binary that can run on Windows desktop, Mac desktop or Linux server.

To run: `./edna -run-prod`

Edna runs on port `9325` so visit http://localhost:9325'

