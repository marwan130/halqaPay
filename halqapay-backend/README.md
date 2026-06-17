# HalqaPay Backend — Spring Boot 3.4 API Engine

This is the API backend for HalqaPay. It manages user credentials, wallet ledger transactions, currency conversions, savings circles, and runs the validation logic that ensures members have the financial capacity to save without defaulting.

---

## Technology Choices

*   **Java 21 & Spring Boot 3.4:** Leverages modern Java syntax and Spring Boot auto-configuration.
*   **Spring Security & JWT:** State-free token authentication. A JWT is issued upon successful login/registration and must be sent in the `Authorization: Bearer <token>` header for protected routes.
*   **Flyway Database Migrations:** Automatically executes SQL scripts on startup to maintain schema consistency across different database instances.
*   **PostgreSQL Enums & Hibernate Mappings:** Maps strict Postgres database types (like custom currency enums) using `@JdbcType(PostgreSQLEnumJdbcType.class)` to prevent type-mismatch crashes.

---

## Environment Variables

The backend works out-of-the-box using the defaults defined in [`application.yml`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend/src/main/resources/application.yml). However, you can override these properties using standard environment variables:

| Variable Name | Description | Default Value |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/halqapay` |
| `DB_USER` | Database username | `halqapay` |
| `DB_PASS` | Database password | `halqapay` |
| `JWT_SECRET` | 256-bit signing secret for JWTs | `halqapay-dev-secret-change-in-production-min-256-bits` |
| `DTI_THRESHOLD` | Max percentage of user salary allowed for contributions | `0.4` (40%) |

---

## Key Directory Structure

```
src/main/java/com/halqapay/
├── auth/            # Registration, login, and JWT payload processing
├── common/          # Global exception handling and API safety wrappers
├── controller/      # REST endpoint controllers for circles, wallet, and admin
├── dto/             # API request and response data models
├── entity/          # JPA entities mapped to database tables
├── repository/      # Spring Data repositories
├── security/        # JWT authorization filters and path filters
├── service/         # Core business logic (DTI validations, FX calculations)
└── users/           # User details, salary verification, and status updates
```

---

## Core Services to Inspect

*   **[`ValidationService.java`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend/src/main/java/com/halqapay/service/ValidationService.java):** Houses the math for checking whether a user is financially eligible to join a circle. It factors in user salary, existing active circles, base FX rates, and offsets the total monthly burden using the user's current wallet balance.
*   **[`FxService.java`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend/src/main/java/com/halqapay/service/FxService.java):** Handles multi-currency support by normalizing currency valuations relative to USD using sandbox seed rates.
*   **[`PayoutService.java`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend/src/main/java/com/halqapay/service/PayoutService.java) / [`AdminService.java`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-backend/src/main/java/com/halqapay/service/AdminService.java):** Coordinates monthly cycle runs. It pulls monthly contributions from participants, determines whose turn it is to cash out (using slot rotations), updates the ledger, and transitions circle states.

---

## Running the Application Locally

1.  Verify PostgreSQL is running and has a database named `halqapay`.
2.  Run the application using the Maven wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
3.  The API will bind to `http://localhost:8080`. You can hit `http://localhost:8080/api/health` to confirm it is up.

---

## Testing

To run the JUnit unit tests validating the FX and DTI calculations:
```bash
./mvnw test
```
The test files are located in `src/test/java/com/halqapay/service/`.

---

## Flyway Troubleshooting Note
If you modify schema migrations during development and encounter checksum mismatch errors:
1.  Make sure you never edit historical migration files (e.g., `V1__init_schema.sql`). Write a new migration file (`V2__xxx.sql`) instead.
2.  To auto-repair checksum issues caused by formatting changes in development, `spring.flyway.repair-on-migrate: true` has been enabled in our configuration to auto-heal mismatches.