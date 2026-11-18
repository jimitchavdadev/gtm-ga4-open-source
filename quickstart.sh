#!/usr/bin/env bash
set -e

# ==============================================================================
# Open Source Analytics Platform (GTM & GA4 Full Parity) — Quickstart
# ==============================================================================

echo "⚡ Initializing Open Source Analytics Platform..."

# 1. Environment configuration check
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
  else
    echo "PORT=3000" > .env
    echo "RUST_ENGINE_URL=http://localhost:8080" >> .env
    echo "DATABASE_URL=sqlite://analytics.db?mode=rwc" >> .env
  fi
fi

# 2. Check prerequisites
MISSING_PREREQS=0
if ! command -v bun &> /dev/null; then
  echo "⚠️  Bun is not installed. Please install Bun from https://bun.sh"
  MISSING_PREREQS=1
fi

if ! command -v cargo &> /dev/null; then
  echo "⚠️  Rust / Cargo is not installed. Please install Rust from https://rustup.rs"
  MISSING_PREREQS=1
fi

if [ $MISSING_PREREQS -eq 1 ]; then
  if command -v docker &> /dev/null; then
    echo "🐳 Docker detected! You can self-host via Docker Compose:"
    echo "   docker compose up -d"
  fi
  exit 1
fi

# 3. Install frontend dependencies
echo "📦 Installing frontend dependencies via Bun..."
bun install

# 4. Build Rust Analytics Core Engine
echo "🦀 Compiling Rust Analytics Core Engine (SeaORM + Axum)..."
cargo build --manifest-path crates/engine/Cargo.toml

# 5. Trap to clean up background processes on CTRL+C
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 6. Start the Rust Engine in the background
echo "🚀 Starting Rust Analytics Engine on port 8080..."
cargo run --manifest-path crates/engine/Cargo.toml &
ENGINE_PID=$!

# Wait briefly for engine to bind
sleep 2

# 7. Start the Next.js Presentation Gateway
echo "🌐 Starting Next.js Presentation Gateway on port 3000..."
echo ""
echo "=============================================================="
echo "🎉 Platform Ready!"
echo "   - Web Dashboard:    http://localhost:3000"
echo "   - Setup Wizard:     Click '⚡ Setup Guide' in the header"
echo "   - Rust Ingestion:   http://localhost:8080"
echo "=============================================================="
echo ""
bun run dev
