# Self-Hosting, Docker & Production Deployment Guide

This document details 1-command self-hosting methods, containerization specs, environment variables, and reverse-proxy configurations for production deployment.

---

## 1. Minimal-Step Self-Hosting Options

### Option 1: 1-Command Docker Compose (Production Standard)
Spins up the Rust Axum engine, Next.js presentation gateway, SeaORM database, and persistent volume in the background:

```bash
git clone https://github.com/jimitchavda/gtm-ga4-open-source.git
cd gtm-ga4-open-source
docker compose up -d
```
Dashboard available at **`http://localhost:3000`**; Rust engine at **`http://localhost:8080`**.

### Option 2: 1-Command Native Quickstart (Development)
Checks prerequisites, initializes `.env`, compiles Rust, and runs both servers with unified terminal logs:

```bash
./quickstart.sh
```

---

## 2. Containerization Architecture

The system uses dual multi-stage Dockerfiles orchestrated via [`docker-compose.yml`](file:///home/jimitchavda/Jotaro/bakhodi/gtm-ga4-open-source/docker-compose.yml):

### 1. Rust Analytics Core Engine ([`Dockerfile.engine`](file:///home/jimitchavda/Jotaro/bakhodi/gtm-ga4-open-source/Dockerfile.engine))
- **Build Stage**: `rust:1.80-slim-bullseye` compiles `crates/engine` with `--release`.
- **Runtime Stage**: `debian:bullseye-slim` (minimal footprint, < 100MB), copies the single static `analytics-engine` binary.
- **Port**: `8080`.
- **Healthcheck**: Wget health probe against `http://127.0.0.1:8080/api/v1/healthz`.

### 2. Next.js Presentation Gateway ([`Dockerfile.web`](file:///home/jimitchavda/Jotaro/bakhodi/gtm-ga4-open-source/Dockerfile.web))
- **Builder & Runtime**: `oven/bun:latest` for high-speed JS bundling and static assets.
- **Port**: `3000`.
- **Proxy**: Directs all `/api/*` and `/_trk/*` traffic to `http://engine:8080`.

---

## 3. Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for Next.js frontend gateway. |
| `RUST_ENGINE_URL` | `http://localhost:8080` | URL of the Rust Axum backend. |
| `DATABASE_URL` | `sqlite://analytics.db?mode=rwc` | SeaORM connection string (SQLite, Postgres, MySQL). |

### Multi-Database Examples:
```bash
# SQLite (Local file with auto-create)
DATABASE_URL=sqlite:///data/analytics.db?mode=rwc

# PostgreSQL (Production cluster)
DATABASE_URL=postgres://analytics_user:strong_password@postgres-host:5432/analytics_db

# MySQL (Production cluster)
DATABASE_URL=mysql://analytics_user:strong_password@mysql-host:3306/analytics_db
```

---

## 4. Reverse Proxy & Domain Cloaking

To achieve full Anti-Adblock resilience, expose the Next.js gateway on your primary or first-party subdomain (e.g. `trk.yourdomain.com`).

### Caddy Example (`Caddyfile`):
```caddy
trk.yourdomain.com {
    reverse_proxy localhost:3000
    encode gzip zstd
}
```

### NGINX Example:
```nginx
server {
    server_name trk.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Production Healthchecks & Operations

- **System Health Probe**: `GET http://localhost:3000/api/healthz` -> returns `{ "status": "ok", "backend": "online" }`.
- **Database Backup**: If using SQLite, snapshot the `/data/analytics.db` volume or use `sqlite3 analytics.db ".backup backup.db"`.
