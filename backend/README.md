# ESTUDIO ARKIPELAGO — Spring Boot 3 Backend

Enterprise **Java 21 + Spring Boot 3.3.4** backend engineered specifically for **Estudio Arkipelago Studio Operations OS**.

---

## Features

- **Enterprise Role-Based Access Control (RBAC)**:
  - `PARTNER`: Super-admin with full studio oversight, billing progress in `₱`, and HR approvals.
  - `SENIOR_ARCHITECT`: Project leads, drawing set versioning, RFI reviews, and task delegation.
  - `JUNIOR_ARCHITECT`: Drafting tasks, time tracking, sketch markups, and wall communications.
  - `CONTRACTOR`: Sandboxed strictly to assigned project codes (e.g. `CV-2024`).
  - `CLIENT`: Tokenized review links for drawing reviews and digital sign-offs.
- **HR & Time Tracking**:
  - Live clock-in and clock-out with billable project attribution.
  - Live WebSocket broadcasts (`/topic/attendance`) so all open studio tabs see who is clocked in.
  - Daily time tracking ledger with duration calculations.
- **Philippine 5-Stage Contract Billing**:
  - Pre-configured standard milestone breakdown (Schematic 15%, Design Dev 20%, Contract Docs 35%, Bidding 5%, Construction Admin 25%) in Philippine Pesos (`₱`).
- **Mobile Push Notifications (VAPID / WebPush)**:
  - Native browser and mobile PWA push notification engine.
  - Background scheduled nudges (`ScheduledReminderService`):
    - **9:00 AM Weekday Reminder**: Automatically prompts architects who haven't clocked in yet.
    - **Overtime Alert**: Automatically nudges users whose active timer exceeds 8 hours.
- **Sketch Studio Markup Persistence**:
  - Digital blueprint layer storage, architectural scale calibration (`1:100`, `1:50`), and official stamps (`APPROVED`, `FOR REVISION`).
- **Real-Time Communications & Wall Feed**:
  - STOMP WebSockets (`/ws`) for project chat threads and firm-wide announcements.
- **Interactive Documentation**:
  - Complete OpenAPI 3.0 / Swagger UI documentation at `/swagger-ui.html`.

---

## Default Seeded Credentials

When launched in `dev` mode, the database is automatically seeded:

| Role | Email | Password | Scope / Permissions |
|---|---|---|---|
| **Partner** | `partner@arkipelago.ph` | `admin` | Full Super-Admin & Financials |
| **Senior Architect** | `architect@arkipelago.ph` | `architect` | Project Management & Approvals |
| **Junior Architect** | `junior@arkipelago.ph` | `junior` | Drafting & Personal Timesheets |
| **Contractor** | `contractor@arkipelago.ph` | `contractor` | Sandboxed to `CV-2024` only |

---

## Quick Start

### 1. Launch Spring Boot Backend

Using PowerShell:
```powershell
.\backend\run-backend.ps1
```

Or using Command Prompt:
```cmd
backend\run-backend.bat
```

### 2. Available Endpoints

- **API Base**: `http://localhost:8080/api`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema**: `http://localhost:8080/api-docs`
- **H2 In-Memory DB Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:arkipelagodb`, User: `sa`, Password: empty)
- **WebSocket STOMP Endpoint**: `ws://localhost:8080/ws`

---

## Production / Docker Setup

To run with dedicated PostgreSQL 16 and MinIO object storage:

```bash
docker compose up -d
```

Then run the backend with the `prod` profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```
