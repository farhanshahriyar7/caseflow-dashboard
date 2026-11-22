# Finish Case Desk dashboard

## What to build
- Make Bangla the default throughout the dashboard and case-intake form, with a clear English language switch.
- Add a case summary and prescription dialog that can be printed cleanly.
- Add archive and delete actions for patient cases, with confirmation before deleting and a way to view archived cases.
- Keep sample and newly entered records in page memory only; do not connect a database.

## Technical details
- Preserve the existing warm ruled-paper, charcoal, and coral visual direction and current single-page workflow.
- Translate visible dashboard and intake labels while leaving clinical record values and internal statuses unchanged.
- Use the existing UI controls, semantic design tokens, and the browser print dialog; keep archived cases separate from active counts and follow-ups.
- Verify Bangla default, English switching, printing view, archive/restore, and delete confirmation in the preview; run focused tests and inspect build diagnostics before committing.
