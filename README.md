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

## Development Testing

### Frontend
```bash
cd halqapay-frontend
npm run dev
```

### Backend
```bash
cd halqapay-backend
mvn spring-boot:run
```

### Prerequisites
- PostgreSQL database running on localhost:5432
- Java 17+ for backend
- Node.js 18+ for frontend
