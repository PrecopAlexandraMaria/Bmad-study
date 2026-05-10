# Story 1.2: Search Logging API & Integration

Status: done

## Story

As a system,
I want to log every artwork search performed by the user,
so that we can identify which terms are most popular.

## Acceptance Criteria

1. The frontend `SearchBar` component sends a `POST /api/log-search` request when a user submits a search.
2. The `POST /api/log-search` request includes the `searchTerm` in the request body.
3. The backend correctly processes the log request by either creating a new record with `SearchCount = 1` or incrementing the existing `SearchCount` for the term.
4. User navigation to the search results page is not blocked by the logging request (handled asynchronously).
5. Robust error handling is implemented to ensure the search flow continues even if logging fails.

## Tasks / Subtasks

- [x] Integrate Logging into Frontend SearchBar (AC: 1, 2, 4, 5)
  - [x] Update `SearchBar.tsx` to call the logging API on search submission.
  - [x] Implement a non-blocking `fetch` call to `POST /api/log-search`.
  - [x] Add basic error logging for failed API calls without interrupting the user journey.
- [x] Refine Backend Logging Logic (AC: 3)
  - [x] (Note: Initial logic was implemented in Story 1.1 due to scope creep).
  - [x] Verify the `MERGE` query in `src/index.ts` works correctly with the new `BIGINT` column.
  - [x] Ensure the endpoint returns appropriate status codes (200 for success, 400 for bad input, 500 for DB errors).

### Review Findings

- [x] [Review][Patch] False Success: HTTP Error Catching — Added `.then` check for `response.ok`.
- [x] [Review][Patch] Payload Validation — Added frontend length check (200 chars).
- [x] [Review][Patch] Duplicate Log Guard — Added basic submission check logic.
- [ ] [Review][Defer] Centralized API Client — Moving API URLs and fetch logic to a dedicated service layer. (Deferred to later infrastructure story)
- [ ] [Review][Defer] AbortController — Cancelling in-flight requests on unmount. (Deferred for this simple utility component)

## Dev Notes

### Relevant architecture patterns and constraints
- **Frontend:** React with TypeScript. Use `fetch` for API calls [Source: architecture.md#Section 2].
- **API Patterns:** RESTful `POST` for logging actions [Source: epics.md#Additional Requirements].
- **Sleek UI:** Ensure any UI changes (though minimal here) align with the established color palette (#29353C, #44576D, etc.) [Source: epics.md#UX Design Requirements].

### Source tree components to touch
- `museum-artwork-explorer-frontend/src/components/SearchBar/SearchBar.tsx`: Integrated `logSearch` using a non-blocking `fetch` call.
- `museum-artwork-explorer-backend/src/index.ts`: Verified and refined the `POST /api/log-search` endpoint with length validation and proper status codes (applied in Story 1.1 remediation).

### Testing standards summary
- Verified that searching for a term triggers the `fetch` call in the network tab.
- Confirmed navigation to results page is instantaneous and not delayed by the API request.

### Project Structure Notes
- Component-level API integration is sufficient for this initial stage.

### References
- [Source: epics.md#Story 1.2] - Story definition and AC.
- [Source: implementation-artifacts/1-1-database-infrastructure-for-search-tracking.md] - Learnings on DB setup and environment variables.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Debug Log References
- Refactored `SearchBar.tsx` to remove `async/await` from `logSearch` to ensure non-blocking execution.
- Verified backend `MERGE` logic handles `BIGINT` correctly (implicit in `mssql` driver).

### Completion Notes List
- **Frontend Integration:** Search bar now successfully fire-and-forgets logging requests.
- **Error Resiliency:** If the backend is down or logging fails, the user is still navigated to search results without interruption.

### File List
- `museum-artwork-explorer-frontend/src/components/SearchBar/SearchBar.tsx` (modified)
- `museum-artwork-explorer-backend/src/index.ts` (already updated in previous cycle)
