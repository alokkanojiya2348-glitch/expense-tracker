# 🏗️ Full-Stack Technology Stack & Architecture Specification

> **Project**: Expense Tracker & Personal Wealth Intelligence Platform (Apex Finance Ledger)  
> **Auth Strategy**: Stateful Database Sessions (`httpOnly` Secure Cookie) — *No JWTs*  
> **Target Production Standard**: High-Precision Fintech Grade (ACID Compliant)

---

## 📑 Table of Contents
1. [Architectural Overview](#1-architectural-overview)
2. [Why Database Sessions Instead of JWT](#2-why-database-sessions-instead-of-jwt)
3. [Full-Stack Technology Matrix](#3-full-stack-technology-matrix)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend & API Architecture](#5-backend-api-architecture)
6. [Database Schema & Persistence Layer](#6-database-schema--persistence-layer)
7. [Authentication & Session Flow](#7-authentication--session-flow)
8. [Security Hardening & CSRF Defense](#8-security-hardening--csrf-defense)
9. [DevOps, Testing & Deployment](#9-devops-testing--deployment)

---

## 1. Architectural Overview

The application follows a decoupled **Client-Server Architecture** with strict server-side state enforcement for identity management and transactional integrity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (SPA)                              │
│   React 19 / Vite • Vanilla CSS Tokens • TanStack Query • Axios        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTPS (Credentials: 'include')
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY / REVERSE PROXY                     │
│   Nginx / Caddy • SSL Termination • Security Headers • Rate Limiting   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND APPLICATION (Node.js)                   │
│   Express.js / Fastify • express-session • Argon2id • Zod Validation   │
│   Layered Services: Controllers ──► Domain Services ──► Repositories   │
└───────────────────────┬────────────────────────┬───────────────────────┘
                        │                        │
         Session Queries│                        │ Transactional Queries
                        ▼                        ▼
┌──────────────────────────────────┐   ┌─────────────────────────────────┐
│     SESSION STORE (In-DB)        │   │    PRIMARY RELATIONAL STORE     │
│   PostgreSQL `sessions` Table    │   │   PostgreSQL 16 (ACID Safe)     │
│   (connect-pg-simple / Redis)    │   │   Prisma ORM / Drizzle ORM      │
└──────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 2. Why Database Sessions Instead of JWT

Stateless JWTs (JSON Web Tokens) introduce critical security and consistency risks in financial applications. This system explicitly uses **Stateful Server-Side Database Sessions**:

| Dimension | Stateful Database Sessions (Selected) | Stateless JWT (Rejected) |
|---|---|---|
| **Immediate Revocation** | ✅ **Instant**: Deleting or invalidating the session row in DB revokes access on the very next request. | ❌ **Impossible without blocklists**: Compromised tokens remain valid until expiration. |
| **Permission Freshness** | ✅ **Instant**: Role updates, password changes, or account freezes take effect immediately. | ❌ **Stale Data**: Claims baked into the token payload remain until expiry. |
| **Storage Security** | ✅ **`HttpOnly`, `Secure` Cookie**: Completely inaccessible to JavaScript; immune to XSS credential harvesting. | ❌ Often stored in `localStorage` or `sessionStorage`, making them trivially vulnerable to XSS. |
| **Active Devices & Auditing** | ✅ **Native Multi-Session Management**: Users can view all active logins (device, IP, last active) and click *"Logout of other devices"*. | ❌ Cannot enumerate or selectively terminate active sessions across devices. |
| **Network Overhead** | ✅ **Tiny**: Sends an opaque 32-character random session ID (~40 bytes). | ❌ Large header overhead (typically 500B–2KB per request with claims and signatures). |
| **Replay Attack Surface** | ✅ Can be rotated, throttled, and invalidated server-side per IP/User-Agent fingerprint. | ❌ Replayable by anyone in possession of the token until expiration. |

---

## 3. Full-Stack Technology Matrix

### Core Layers

| Layer | Primary Technology | Version | Key Purpose |
|---|---|---|---|
| **Runtime** | **Node.js** | `v20 LTS` | High-throughput asynchronous backend runtime |
| **Frontend Framework** | **React** | `v19 / v18` | Declarative, component-based user interface |
| **Build Tooling** | **Vite** | `v7.x` | Lightning-fast HMR and optimized production bundling |
| **Backend Framework** | **Express.js / Fastify** | `v4.21+ / v4.x` | Structured REST API routing and middleware pipeline |
| **Primary Database** | **PostgreSQL** | `v16+` | ACID-compliant relational storage with `DECIMAL` precision |
| **Session Store** | **PostgreSQL (connect-pg-simple)** *(or Redis)* | `v9.x` | Stateful session record persistence with automated TTL cleanup |
| **ORM / Data Access** | **Prisma ORM / Drizzle** | `v6.x / v0.38+` | End-to-end type safety, automated migrations, and schema modeling |
| **Password Hashing** | **Argon2id** | `v0.3+` | RFC 9106 winner; memory-hard defense against GPU brute force |
| **Session Middleware** | **express-session** | `v1.18+` | Robust session lifecycle and cookie signing middleware |
| **Schema Validation** | **Zod** | `v3.23+` | Unified type inference and strict input sanitization |

---

## 4. Frontend Architecture

### 4.1 State & Network Pipeline
- **HTTP Client**: `axios` instance configured with:
  ```typescript
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true, // Crucial: Transmits httpOnly session cookies automatically
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF mitigation header
    },
  });
  ```
- **Server State Management**: `@tanstack/react-query`
  - Query caching for categories, balance metrics, and transaction ledgers.
  - Optimistic updates for snappy UI when adding or deleting transactions.
  - Global `401 Unauthorized` interceptor that flushes cache and redirects to `/login`.

### 4.2 UI Design System & Component Architecture
- **Tokens & Typography**:
  - Primary UI Font: **Plus Jakarta Sans** (Weights: 400, 500, 600, 700)
  - Numeric Monospace: **JetBrains Mono** with `font-variant-numeric: tabular-nums`
  - Theme Engine: CSS custom property tokens (`--bg-app`, `--bg-surface`, `--income`, `--expense`, etc.) with persistent theme toggle.
- **Component Breakdown**:
  - `Summary.jsx`: Bento grid metric cards (Inflow, Outflow, Balance, Savings Rate).
  - `BarChart.jsx`: Cylinder bar visualization with dynamic insights and interactive category filters.
  - `TransactionForm.jsx`: Segmented switch, quick dollar presets (`+$10` to `+$500`), date/category picker.
  - `TransactionFilter.jsx`: Real-time debounce search, chips (`All`, `Inflow`, `Outflow`), sorting.
  - `TransactionTable.jsx`: Paginated/virtualized tabular rows with flow badges and action buttons.
  - `SessionManagerModal.jsx`: Interface for users to review active sessions/devices and revoke sessions remotely.

---

## 5. Backend & API Architecture

### 5.1 Layered Project Structure
```
server/
├── src/
│   ├── config/             # Environment, database, session options
│   │   ├── database.ts
│   │   └── session.ts
│   ├── controllers/        # Request handlers & HTTP responses
│   │   ├── auth.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── session.controller.ts
│   ├── middlewares/        # Auth guards, session validators, rate limiters
│   │   ├── requireAuth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── repositories/       # Database queries (Prisma/Drizzle)
│   ├── services/           # Pure business logic & financial calculations
│   │   ├── auth.service.ts
│   │   └── transaction.service.ts
│   ├── validation/         # Zod schemas for input validation
│   └── app.ts              # Express initialization
└── server.ts               # HTTP listener & graceful shutdown
```

### 5.2 Session Configuration (`config/session.ts`)
```typescript
import session from 'express-session';
import pgSimple from 'connect-pg-simple';
import { pool } from './database';

const PgStore = pgSimple(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15, // Purge expired sessions every 15 minutes
  }),
  name: 'sid', // Opaque cookie name (no leaks of framework identity)
  secret: process.env.SESSION_SECRET || 'a-cryptographically-secure-random-256-bit-key',
  resave: false, // Don't write back untouched sessions
  saveUninitialized: false, // Do not create sessions until user logs in (complies with privacy laws)
  rolling: true, // Reset cookie expiry on every authenticated user action
  cookie: {
    httpOnly: true, // Mitigates XSS cookie theft
    secure: process.env.NODE_ENV === 'production', // Transmit over HTTPS only
    sameSite: 'lax', // Protects against cross-site CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7-day session duration
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});
```

---

## 6. Database Schema & Persistence Layer

### 6.1 Database Schema (PostgreSQL)

```sql
-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Stateful Database Sessions Table (Managed by connect-pg-simple)
CREATE TABLE user_sessions (
    sid VARCHAR(128) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 3. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    icon VARCHAR(10) DEFAULT '📦',
    color VARCHAR(20) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transactions Table (Financial Precision: DECIMAL(12,2))
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
```

---

## 7. Authentication & Session Flow

The following sequence details how authentication and database-backed session verification operate:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant API as Express API Server
    participant DB as PostgreSQL Database

    Note over User,DB: User Login Flow
    User->>API: POST /api/v1/auth/login { email, password }
    API->>DB: SELECT * FROM users WHERE email = $1
    DB-->>API: User Record with Argon2id hash
    API->>API: Verify password with Argon2id
    
    API->>DB: INSERT INTO user_sessions (sid, sess, expire, user_id, ip, ua)
    DB-->>API: Session Persisted
    API-->>User: HTTP 200 OK + Set-Cookie: sid=s%3A...; HttpOnly; Secure; SameSite=Lax

    Note over User,DB: Authenticated Data Request
    User->>API: GET /api/v1/transactions (Cookie: sid=...)
    API->>API: express-session extracts signed cookie sid
    API->>DB: SELECT sess, expire FROM user_sessions WHERE sid = $1 AND expire > NOW()
    DB-->>API: Active Session (userId: "uuid-123")
    API->>DB: SELECT * FROM transactions WHERE user_id = "uuid-123"
    DB-->>API: Ledger Records
    API-->>User: HTTP 200 OK with Transactions JSON

    Note over User,DB: Logout / Session Kill Flow
    User->>API: POST /api/v1/auth/logout (Cookie: sid=...)
    API->>DB: DELETE FROM user_sessions WHERE sid = $1
    DB-->>API: Session Row Destroyed
    API-->>User: HTTP 200 OK + Clear-Cookie: sid
```

---

## 8. Security Hardening & CSRF Defense

1. **HttpOnly & Secure Flags**:
   - The session cookie `sid` cannot be read via JavaScript (`document.cookie` returns empty).
   - In production, transmission is restricted strictly to HTTPS.
2. **SameSite Cookie Configuration**:
   - `SameSite=Lax` ensures the session cookie is not submitted during ordinary cross-site `POST`/`PUT`/`DELETE` calls, mitigating CSRF vulnerabilities.
3. **Double Defense: Custom Header Validation**:
   - All mutation endpoints enforce the presence of `X-Requested-With: XMLHttpRequest` or an anti-CSRF token, which browsers forbid cross-origin scripts from forging without CORS approval.
4. **Brute Force & Rate Limiting**:
   - `express-rate-limit` throttles login attempts (`5 attempts per 15 minutes` per IP).
   - Successful logins reset the rate count.
5. **Session Fixation Prevention**:
   - On successful credential verification, `req.session.regenerate()` generates a completely new session ID before assigning user claims.

---

## 9. DevOps, Testing & Deployment

### 9.1 Test-First Deployment Pipeline (Deploy Skill)
Consistent with our custom **`deploy`** skill, all releases follow a mandatory multi-stage pipeline:

```
[Phase 1: Run All Tests] ──(Pass)──► [Phase 2: Build Production Bundle] ──(Pass)──► [Phase 3: Push to Staging]
          │                                        │
       (Fail)                                   (Fail)
          ▼                                        ▼
    [Abort Deploy]                           [Abort Deploy]
```

1. **Unit & Integration Testing**:
   - Frontend: `vitest run` (Component renders, input validation, currency math).
   - Backend: `jest` / `supertest` (Session creation, session cookie validation, unauthorized rejections).
2. **Production Compilation**:
   - `npm run build` generates minimized HTML, CSS, and JS chunks in `dist/`.
   - Asset compression via Gzip & Brotli.
3. **Zero-Downtime Deployment**:
   - Environment variables configured via `.env.production`.
   - Database migrations run automatically via `prisma migrate deploy`.

---

## 10. Summary & Recommended Next Steps

| Step | Goal | Status |
|---|---|---|
| **1. Specification** | Author complete full-stack tech stack with DB sessions | ✅ Complete (`tech-stack.md`) |
| **2. Backend Scaffold** | Initialize Node.js/Express server with `connect-pg-simple` | 🔄 Ready for implementation |
| **3. Database Setup** | Run PostgreSQL migration scripts for `users`, `user_sessions`, and `transactions` | 🔄 Ready for implementation |
| **4. Auth Integration** | Connect React frontend forms to session login/logout endpoints | 🔄 Ready for implementation |
