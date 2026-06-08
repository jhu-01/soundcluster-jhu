---
name: checklist-generator
description: Generate or update SoundCluster implementation checklists from docs/Architecture.md, docs/product-plan.md, docs/pipeline.md, docs/routing.md, docs/checklist.md, GitHub issues, and current repository state. Use when the user asks what to do next, wants a milestone checklist, wants checklist.md updated, or needs implementation order clarified.
---

# Checklist Generator

## Purpose

Turn product intent, architecture, data pipeline, routing, current implementation state, and existing checklist progress into a practical next-step checklist. The output should answer "what should we do first, next, and why?"

## Inputs

Use the available inputs in this order:

1. `docs/product-plan.md` for product scope and current behavior.
2. `docs/Architecture.md` for folder boundaries and layer responsibilities.
3. `docs/pipeline.md` for FE/BE/DB/external API data flow.
4. `docs/routing.md` for actual route names and request contracts.
5. `docs/checklist.md` for existing issue numbering and completion state.
6. Current implementation state from `git status`, `rg --files`, package manifests, and relevant source files.
7. GitHub issue metadata when the user asks to keep checklist items aligned with issues.

## Workflow

1. Read `docs/product-plan.md`, `docs/Architecture.md`, `docs/pipeline.md`, `docs/routing.md`, `docs/checklist.md`, and any user-provided requirement.
2. Summarize the implemented flow before proposing new work.
3. Map each next task to an existing checklist number when one exists.
4. Detect blockers such as missing dependencies, mismatched routes, failing validation, or ambiguous product requirements.
5. Produce the smallest useful checklist for the next implementation slice.
6. When editing `docs/checklist.md`, mark items complete only after the implementation and validation actually passed.

## Output Format

Prefer this shape:

```markdown
## Current Flow
- #2 ...
- #3 ...

## Next Checklist
- [ ] #<issue> [type] <task>
  - Goal:
  - Files:
  - Validation:
  - Depends on:

## Blockers
- ...
```

Keep the checklist actionable. Avoid broad tasks like "build backend" when the next useful step is "add DB connection config and validate connection pool."

## Rules

- Respect the existing issue numbering in `docs/checklist.md`.
- Do not invent GitHub issue numbers. Use existing numbers or leave the number blank until issues are created.
- Keep task size small enough to implement, validate, and commit independently.
- Preserve the React, Express, shared, and docs layer boundaries from `docs/Architecture.md`.
- Use actual routes from `docs/routing.md`; do not invent `/api/tracks/*` or Spotify endpoints.
- Treat iTunes, LRCLIB, Gemini, and MySQL as the current implemented pipeline unless the user requests a change.
- Include validation commands or manual checks for every task.
- Call out when a task should be handled by `github-issue-publisher`.
