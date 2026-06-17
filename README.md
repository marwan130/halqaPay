# HalqaPay (حلقة باي) — Savings Circles for Everyone

HalqaPay is a modern digital platform designed to modernize traditional Middle Eastern Rotating Savings and Credit Associations, commonly known as **Savings Circles** or **جمعية**. 

Traditional savings circles depend entirely on personal trust, physical proximity, and social connections. If one person defaults, the circle falls apart, and participant relationships are ruined. HalqaPay steps in as a **platform-managed trust intermediary**. Users join circles anonymously, and all payments flow to and from the platform. The platform guarantees the payout rotation, completely removing counterparty risk.

---

## Project Structure

This repository is split into two primary applications and a set of local orchestration configs:

*   **[`halqapay-backend/`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend)**: Spring Boot 3.4 API handling core ledger calculations, JWT authentication, user DTI validations, and cycle simulation.
*   **[`halqapay-frontend/`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-frontend)**: Responsive React client built with Vite, Tailwind CSS, Zustand, and TanStack Query. It fully supports both English (LTR) and Arabic (RTL).
*   **`docker-compose.yml`**: Configured to orchestrate PostgreSQL, the Spring Boot backend, and the React frontend locally.

---

## Quick Start (Docker Compose)

The fastest way to get the entire stack up and running is via Docker Compose.

1.  **Clone the Repository** and make sure Docker is running.
2.  **Spin up the services**:
    ```bash
    docker compose up --build
    ```
3.  **Access the applications**:
    *   **Frontend Client:** [http://localhost:5173](http://localhost:5173)
    *   **Backend API:** [http://localhost:8080](http://localhost:8080)
    *   **PostgreSQL Database:** Port `5432` (accessible externally if needed)

---

## Manual Local Development

If you prefer running the backend and frontend separately for development, follow these prerequisites and steps:

### Prerequisites
*   **Java 17+** (Java 21 recommended)
*   **Node.js 18+**
*   **PostgreSQL** database running on `localhost:5432` with a database named `halqapay`.

### Step 1: Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd halqapay-backend
    ```
2.  Make sure your local database is running and matches the credentials in `src/main/resources/application.yml`.
3.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    *Flyway migrations will run automatically on startup to seed the schema and rates.*

### Step 2: Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd halqapay-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```

---

## Core Domain Mechanics

For developers working on this project, keep in mind these three crucial rules built into our business logic:

1.  **The 40% DTI Cap:** A user cannot join a savings circle if their total monthly contribution burden (across all active circles) exceeds **40% of their salary**.
2.  **Wallet Balances as Buffers:** If a user deposits funds into their wallet, that balance offsets their monthly burden requirement (`Wallet Balance / Circle Duration`), temporarily boosting their eligibility for larger circles.
3.  **Anonymity by Design:** Users never see who else is in their circle. Payout logs display slot recipients as anonymized indices (e.g., `Participant #3`) to preserve financial privacy.

---

## Seeding & Running a Payout Demo

To demonstrate the lifecycle of a savings circle without waiting for months:
1.  Register a few users on the signup screen or log in as a demo user.
2.  Go to the **Admin Dashboard** `/admin` (or click Admin in the navigation bar).
3.  Click **Seed Demo Data** to populate active circles, users, and transactions instantly.
4.  Use the **Advance Month** simulator control. This triggers the background payout worker, deductions are debited from everyone's wallets, and the pooled payout is automatically deposited to the slot-winning user's wallet.