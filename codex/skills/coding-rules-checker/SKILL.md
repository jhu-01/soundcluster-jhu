---
name: coding-rules-checker
description: Review SoundCluster code changes for project coding rules, directory structure, validation patterns, error handling, readability, cohesion, comments, hardcoded values, and paradigm consistency. Use before committing code, during review, or whenever the user asks whether changed code follows the rules.
---

# Coding Rules Checker

## Purpose

Review changed code against SoundCluster rules and report actionable violations. Prioritize issues that affect maintainability, architecture consistency, validation safety, runtime behavior, or readability.

## Inputs

- Changed code from `git diff`, staged diff, or a user-provided patch.
- `docs/agents.md` for coding rules.
- `docs/Architecture.md` for directory and layer boundaries.
- `docs/routing.md` for route names and API contracts.
- `docs/pipeline.md` for data flow expectations.
- `docs/checklist.md` for the current issue scope.
- Relevant source files when a diff depends on surrounding context.

## Workflow

1. Run `git status --short` and inspect the changed file list.
2. Read the relevant parts of `docs/agents.md` and `docs/Architecture.md`.
3. Review the diff first, then open surrounding code only where needed.
4. Classify findings by severity:
   - `P0`: broken build, data loss, security exposure, impossible runtime path.
   - `P1`: likely bug, invalid validation, wrong layer, unsafe error handling.
   - `P2`: maintainability, cohesion, duplication, readability, inconsistent style.
   - `P3`: minor naming, organization, or documentation drift.
5. Provide findings first with file and line references when possible.
6. If no issue is found, say so and list residual risks or skipped checks.

## Required Checks

- No explanatory code comments unless they clarify a complex algorithm, external constraint, or performance reason.
- No mixing procedural, functional, and object-oriented styles in one context without a clear reason.
- No clever one-line compression that hides intent.
- No nested condition expressions that call additional logic in a way that makes control flow hard to read.
- No repeated hardcoded strings, route paths, ports, API URLs, status names, or vector keys that should be constants.
- No route names that drift from `shared/constants/*` or `docs/routing.md`.
- No data flow that skips required validation, cache lookup, or fallback behavior from `docs/pipeline.md`.
- No duplicated data shapes that should become a shared type, schema, constant object, or reusable component.
- No unrelated logic scattered across distant sections when it belongs together.
- No large component absorbing multiple responsibilities that should be split into cohesive functions, hooks, utilities, or components.
- Validation logic must be explicit, named, and close to the data boundary.
- Error handling must preserve useful context without leaking secrets.
- Frontend code must follow CSS Modules and avoid unapproved UI libraries.
- Server code must keep secrets on the backend and avoid frontend exposure.
- Shared contracts must live under `shared/types`, `shared/constants`, or `shared/utils` when both client and server need them.
- Current implemented external APIs are iTunes Search API, LRCLIB, and Gemini. Flag accidental Spotify references unless the change is explicitly migrating providers.

## Readability Rules

- Prefer clear intermediate variables over nested function calls inside `if` conditions.
- Prefer early returns when they reduce nesting.
- Prefer small named functions for validation and transformation.
- Keep similar code shapes near each other.
- Group related constants, state, handlers, and effects by feature.
- Extract repeated values or repeated UI/data patterns into one component, constant object, helper, or shared type.

## Output Format

Use this structure:

```markdown
## Findings
- [P1] <title> — <file:line>
  <why it matters and what to change>

## Checks Run
- <command or manual check>

## Residual Risk
- <anything not checked>
```

Keep the report concise. Do not rewrite the whole patch unless the user asks for fixes.
