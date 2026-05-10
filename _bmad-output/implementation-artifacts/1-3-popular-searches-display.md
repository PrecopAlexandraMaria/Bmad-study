# Story 1.3: Popular Searches Display

Status: review

## Story

As a tourist,
I want to see the top 3 most popular search terms on the homepage,
so that I can quickly explore what others are interested in.

## Acceptance Criteria

1. The `PopularSearches` component is rendered on the homepage (below the SearchBar).
2. The component makes a `GET /api/popular-searches` request on mount and when the window gains focus.
3. The component displays the top 3 search terms as clickable chips.
4. Clicking a chip correctly navigates the user to the search results page for that term.
5. The UI follows the sleek design color palette:
   - Backgrounds/Containers: #DFEBF6 or #E6E6E6
   - Primary Text/Accents: #29353C or #44576D
   - Chips: Outlined using #768A96 or #AAC7D8
6. If no popular searches are available, the component remains hidden (returns null).

## Tasks / Subtasks

- [x] Style PopularSearches with Design Palette (AC: 5)
  - [x] Update `PopularSearches.tsx` to use the specified hex colors for typography and chips.
  - [x] Ensure the container uses the light pale blue/gray background where appropriate.
- [x] Verify Top 3 Logic and Refetch (AC: 2, 3)
  - [x] Ensure the frontend correctly maps the response from the backend (already limited to 3).
  - [x] Confirm the `window focus` listener works as intended to refresh the popular list.
- [x] Visual Polish (AC: 1, 5)
  - [x] Center the component and ensure it has proper spacing relative to the SearchBar.
  - [x] Ensure responsiveness on mobile devices.

## Dev Notes

### Relevant architecture patterns and constraints
- **Frontend:** React with TypeScript and Material-UI (MUI) [Source: architecture.md#Section 2].
- **Sleek UI Palette:**
  - #29353C (Deep Slate)
  - #44576D (Muted Navy)
  - #768A96 (Steel Blue)
  - #AAC7D8 (Sky Blue)
  - #DFEBF6 (Pale Blue)
  - #E6E6E6 (Light Gray)
  [Source: epics.md#UX Design Requirements]

### Source tree components to touch
- `museum-artwork-explorer-frontend/src/components/PopularSearches/PopularSearches.tsx`: Updated with themed styling (#44576D text, #768A96 chips) and centered alignment.
- `museum-artwork-explorer-frontend/src/App.tsx`: Themed the `HomePage` container with #DFEBF6 background and #29353C text.

### Testing standards summary
- Verified chip colors match the Sky/Steel blue palette.
- Verified background and typography colors align with the sleek design mandate.

### Project Structure Notes
- Styling applied directly via MUI `sx` props for rapid implementation within the specified constraints.

### References
- [Source: epics.md#Story 1.3] - Story definition and AC.
- [Source: implementation-artifacts/1-1-database-infrastructure-for-search-tracking.md] - Backend groundwork.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Debug Log References
- Refactored `PopularSearches.tsx` to center-align items and use the palette's muted navy and steel blue.
- Refactored `App.tsx` (HomePage) to provide a full-screen themed background.

### Completion Notes List
- **Visual Completion:** The homepage now fully adheres to the requested sleek design color scheme.
- **Top 3 Display:** Verified the component correctly handles the list of popular terms.

### File List
- `museum-artwork-explorer-frontend/src/components/PopularSearches/PopularSearches.tsx` (modified)
- `museum-artwork-explorer-frontend/src/App.tsx` (modified)
