#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js 22.13+ is required." >&2
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_REST="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_REST%%.*}"
if (( NODE_MAJOR < 22 || (NODE_MAJOR == 22 && NODE_MINOR < 13) )); then
  echo "Error: Node.js 22.13+ is required; found $NODE_VERSION." >&2
  exit 1
fi

echo "Installing dependencies..."
npm ci

echo "Building and verifying the MCP server..."
npm run check

if [[ ! -f "$PROJECT_DIR/data/catalog.db" ]]; then
  echo "Error: bundled catalog snapshot is missing: $PROJECT_DIR/data/catalog.db" >&2
  exit 1
fi

cat <<EOF

Installation complete.

Add this server to your MCP client:
{
  "mcpServers": {
    "cryptography_research": {
      "command": "node",
      "args": ["$PROJECT_DIR/dist/index.js"]
    }
  }
}

The bundled offline catalog is ready. To refresh public sources later, run:
  npm run ingest
EOF
