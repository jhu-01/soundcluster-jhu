---
name: checklist-generator
description: Generate the next implementation checklist for SoundCluster from docs/Architecture.md, a PRD or product requirements note, docs/checklist.md, GitHub issues, and the current repository state. Use when the user asks what to do next, wants a milestone checklist, wants checklist.md updated, or needs implementation order clarified.
---

# Checklist Generator

## Purpose

Turn architecture, PRD intent, current implementation state, and existing checklist progress into a practical next-step checklist. The output should answer "what should we do first, next, and why?"

## Inputs

Use the available inputs in this order:

1. `docs/Architecture.md` for folder boundaries and layer responsibilities.
2. PRD text or product requirements supplied by the user. If no PRD file is named, inspect likely docs and ask only when the requirement cannot be inferred.
3. `docs/checklist.md` for existing issue numbering and completion state.
4. Current implementation state from `git status`, `rg --files`, package manifests, and relevant source files.
5. GitHub issue metadata when the user asks to keep checklist items aligned with issues.

## Workflow

1. Read `docs/Architecture.md`, `docs/checklist.md`, and any user-provided PRD.
2. Summarize the current project flow from completed items to pending items.
3. Map each next task to an existing checklist number when one exists.
4. Detect blockers such as missing dependencies, mismatched directory layout, failing validation, or ambiguous product requirements.
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
- Include validation commands or manual checks for every task.
- Call out when a task should be handled by `github-issue-publisher`.
