# Case Desk pages and profile menu

## What to build
- Finish and verify the Bangla-first dashboard and intake form, keeping English as the alternate language.
- Add a profile dropdown in the dashboard header with Profile and Settings destinations.
- Give Overview, Patient cases, Follow-ups, Clinical notes, Profile, and Settings their own navigable pages.
- Keep the current sample records in page memory; do not add a database or persistence.
- Leave printable summaries, archive, and delete actions deferred.

## Technical details
- Preserve the existing ruled-paper, charcoal, and coral visual direction.
- Use the existing TanStack Start routing and shared dashboard state so navigating between pages does not discard in-memory cases.
- Use existing UI controls and semantic design tokens; give each page unique metadata.
- Verify the preview, language switch, profile menu, page navigation, tests, and build diagnostics before committing.