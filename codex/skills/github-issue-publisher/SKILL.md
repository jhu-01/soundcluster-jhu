---
name: github-issue-publisher
description: Convert SoundCluster checklist items into GitHub issues and keep docs/checklist.md issue numbers aligned. Use when the user asks to register checklist tasks as issues, publish milestones to GitHub, sync checklist numbering, or create GitHub issues from docs/checklist.md.
---

# GitHub Issue Publisher

## Purpose

Convert checklist items into GitHub issues with clear titles, bodies, labels, and traceable numbering. This skill defines the publishing workflow; actual GitHub writes must be performed through an external tool such as the GitHub MCP connector or `gh` CLI.

## Core Constraint

Skills alone do not write to GitHub. Before creating or updating issues, use the available GitHub MCP tools or `gh` CLI. If no GitHub tool is available, prepare issue drafts and report that publishing is blocked by missing external tool access.

## Inputs

- Checklist item text from `docs/checklist.md`.
- Related product and architecture constraints from `docs/product-plan.md`, `docs/Architecture.md`, `docs/pipeline.md`, and `docs/routing.md`.
- Current implementation state when issue scope depends on existing files.
- Existing GitHub issue list or issue view results when avoiding duplicates.

## Workflow

1. Read the checklist items the user wants to publish.
2. Inspect existing GitHub issues for duplicates or already assigned numbers.
3. For each item, create a GitHub issue draft:
   - Title: preserve checklist prefix such as `[Env]`, `[Feat]`, `[Fix]`.
   - Body: include goal, scope, task list, validation, routing impact, data pipeline impact, and architecture notes.
   - Labels: suggest labels only if the repository already uses them or the user asks.
4. Use GitHub MCP or `gh issue create` to publish.
5. Update `docs/checklist.md` with the assigned issue number only after creation succeeds.
6. Commit checklist number updates separately from implementation commits unless the user asks otherwise.

## Issue Body Template

```markdown
## Goal
<one paragraph>

## Scope
- <file or layer>
- <file or layer>

## Tasks
- [ ] <task>
- [ ] <task>

## Validation
- [ ] <command or manual check>

## Notes
- Product reference: docs/product-plan.md
- Architecture reference: docs/Architecture.md
- Pipeline reference: docs/pipeline.md
- Routing reference: docs/routing.md
```

## Rules

- Do not create duplicate issues for checklist items that already have numbers.
- Do not close issues from this skill unless the user explicitly requests it or a commit intentionally includes `Closes #<number>`.
- Do not fake issue creation. If the tool fails, report the exact failure and keep the checklist unchanged.
- Keep issue titles short and implementation-oriented.
- Use Korean for issue content when the checklist item is Korean.
- Use actual implemented API names. Current external APIs are iTunes Search API, LRCLIB, and Gemini.
- Do not publish Spotify-related issue text unless the user explicitly reintroduces Spotify.
