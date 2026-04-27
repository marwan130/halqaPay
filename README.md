# HalqaPay

HalqaPay is a hackathon MVP for platform-managed savings circles.

## Project Structure

- `halqapay-backend/` - Spring Boot 3.4 
- `halqapay-frontend/` - React + Vite + Tailwind client
- `docker-compose.yml` - local orchestration for DB, backend, frontend

## Quick Start

1. Copy environment values as needed:
   - Backend uses defaults in `application.yml` and env overrides.
   - Frontend uses `halqapay-frontend/.env`.
2. Start services:
   - `docker compose up --build`
