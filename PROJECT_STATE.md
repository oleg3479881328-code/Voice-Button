---
status: in-progress
project_mode: full
current_step: 05_EXECUTION_SPEC
current_run: workflow-runs/0001-legacy-normalization-and-publication-readiness/
last_updated: 2026-05-22
next_action: Test current extension behavior in Chrome and complete release preparation files.
---

# Voice Button — Project State

## Phase

Existing project normalization and release preparation.

## Current Run

`workflow-runs/0001-legacy-normalization-and-publication-readiness/`

## Confirmed Decisions

- Product name: `Voice Button`.
- Product: Chrome extension for voice dictation into editable fields on normal web pages.
- This repository is the dedicated project repository.
- Branch `main` is the committed project source of truth.
- Store submission is not yet approved.

## Existing Code Commits

- `4e36c77`: language mode feature.
- `03c51de`: language state and focus fix.
- `7be3df5`: manual RU mode fix.
- `f810588`: launcher hide behavior fix.

## Validation Needed

- Test RU, EN and AUTO in Chrome.
- Test launcher display and hiding behavior.
- Test the extension ZIP on another computer.
- Prepare icons, screenshots, policy page URL and support contact for store work.

## Agents

No project-specific agents are required now.

## Latest Result

Project entrypoint has been committed. Current behavior changes exist in `main`; human browser testing is still needed.

## Next Action

Run manual browser testing against the latest committed extension.
