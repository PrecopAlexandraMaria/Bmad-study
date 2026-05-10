# Story 1.1: Database Infrastructure for Search Tracking

Status: done

## Story

As a system developer,
I want to create the search tracking table and configure the backend database connection via environment variables,
so that search terms can be reliably logged and retrieved without exposing credentials.

## Acceptance Criteria

1. The SQL Server instance is running and reachable.
2. The `ArtworkSearchCount` table is created with `SearchTerm` (NVARCHAR(200), PRIMARY KEY) and `SearchCount` (INT, DEFAULT 1) columns.
3. The backend is configured to use environment variables (`.env`) for database credentials (DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME).
4. The backend server successfully connects to the database on startup.
5. `dotenv` is added to dependencies for environment variable management.

## Tasks / Subtasks

- [x] Install environment management dependencies (AC: 3, 5)
  - [x] Run `npm install dotenv`
  - [x] Run `npm install --save-dev @types/dotenv`
- [x] Initialize Database Schema (AC: 2)
  - [x] Create a migration or setup script to create the `ArtworkSearchCount` table if it doesn't exist.
- [x] Configure Environment Variables (AC: 3)
  - [x] Create a `.env.template` file with the required variables.
  - [x] Update `src/index.ts` to load environment variables using `dotenv`.
- [x] Refactor Database Connection (AC: 3, 4)
  - [x] Update the `dbConfig` in `src/index.ts` to use `process.env` values.
  - [x] Implement robust error handling for the initial database connection.

### Review Findings

- [x] [Review][Decision] Scope Creep: API Endpoints — Kept endpoints as requested by user.
- [x] [Review][Patch] Search Term Length Validation — Added 200-char check in `POST /api/log-search`.
- [x] [Review][Patch] Integer Overflow Guard — Updated `SearchCount` to `BIGINT` in `setup-db.ts`.
- [x] [Review][Patch] Startup Sequence Enforcement — Server now waits for `poolConnect` before listening.
- [x] [Review][Patch] Env Variable Validation — Added validation checks for required DB env vars.
- [x] [Review][Defer] Pre-existing ESLint Warnings — deferred, pre-existing

## Dev Notes

### Relevant architecture patterns and constraints
- **Backend:** Node.js with Express and `mssql` library [Source: architecture.md#Section 2].
- **Database:** Microsoft SQL Server. Use pre-defined schema where possible [Source: architecture.md#Section 4].
- **Security:** Use environment variables for all sensitive configuration [Readiness Report Recommendation].

### Source tree components to touch
- `museum-artwork-explorer-backend/package.json`: Added `dotenv`, added scripts for DB management.
- `museum-artwork-explorer-backend/src/index.ts`: Refactored to use `dotenv` and `process.env`.
- `museum-artwork-explorer-backend/.env`: Created with default placeholders.
- `museum-artwork-explorer-backend/.env.template`: Created for reference.
- `museum-artwork-explorer-backend/scripts/setup-db.ts`: Created for table initialization.
- `museum-artwork-explorer-backend/scripts/verify-connection.ts`: Created for connection testing.

### Testing standards summary
- Connection success log added to `index.ts`.
- `npm run verify-db` script provided for verification.

### Project Structure Notes
- Added `scripts` folder for database utilities.

### References
- [Source: architecture.md#Section 4] - SQL Server schema.
- [Source: epics.md#Story 1.1] - Story definition and AC.
- [Source: implementation-readiness-report.md#Epic Quality Review] - Security recommendation for `.env`.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Debug Log References
- Successfully installed `dotenv` and `@types/dotenv`.
- Created `.env` and `.env.template`.
- Refactored `index.ts` to use `process.env`.
- Created `setup-db.ts` and `verify-connection.ts`.

### Completion Notes List
- **Database Infrastructure:** The backend is now ready for secure database communication.
- **Table Creation:** `npm run setup-db` will create the necessary `ArtworkSearchCount` table.
- **Connection Verification:** `npm run verify-db` can be used to confirm connectivity once credentials are provided in `.env`.

### File List
- `museum-artwork-explorer-backend/package.json` (modified)
- `museum-artwork-explorer-backend/src/index.ts` (modified)
- `museum-artwork-explorer-backend/.env` (new)
- `museum-artwork-explorer-backend/.env.template` (new)
- `museum-artwork-explorer-backend/scripts/setup-db.ts` (new)
- `museum-artwork-explorer-backend/scripts/verify-connection.ts` (new)
