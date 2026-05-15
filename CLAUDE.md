# CLAUDE.md - Azure DAB Full-Stack Demo

> **Note:** This project previously used Archon v1 for task tracking. Archon v1 was archived by its author in April 2026. Historical Archon task records were exported to `.claude/migrated-archon-tasks.md` at migration time. Use TodoWrite + GitHub Issues going forward (see Rule 0).

> **Purpose**: This file provides guidance to Claude Code when working with this repository.

---

## Critical Rules (Override Everything)

### Rule 0: Task Tracking — Native-First

For tracking work in the current session and across sessions, use **native Claude Code tools**:

| Scope | Tool | When |
|-------|------|------|
| Within-turn / within-session checklist | `TodoWrite` | Multi-step task you'll finish soon |
| Cross-session work | **GitHub Issues** (`gh issue`) | Work that spans days or needs visibility |
| Long-form planning | `PRPs/plans/<name>.plan.md` (if PRP framework selected) | Multi-PR initiatives with phases |
| Recurring backlog item | GitHub Issue with a label | Anything you'll reference more than twice |

`TodoWrite` is the right default. Use it freely. Cross-session durability comes from the **filesystem** (`.claude/reference/`, plan files, this CLAUDE.md) and **GitHub** (Issues, PRs, commit messages) — not from a separate task database.

### Rule 1: Load Context First

At the start of EVERY session, before any code work:

1. Run the [Startup Protocol](#startup-protocol).
2. Read this `CLAUDE.md` and any relevant `.claude/reference/*.md`.
3. Check `git status` and `git log -10` for in-flight work.
4. Check open GitHub Issues / PRs if relevant: `gh pr list` / `gh issue list`.
5. Check `MEMORY.md` if there's per-project auto-memory at `~/.claude/projects/<slug>/memory/`.

Never start coding without orienting first.

### Rule 2: Preserve Context in the Filesystem

Project knowledge that survives context resets lives in **files**, not in your conversation:

| Document | Where | When to update |
|----------|-------|----------------|
| Architecture decisions | `.claude/reference/architecture.md` | After any architectural decision |
| Deployment runbook | `.claude/reference/deployment.md` | After deployment changes |
| Session handoff | `.claude/reference/session-context.md` | End of each significant session, before `/compact` or `/clear` |
| API surface | `.claude/reference/api.md` (or generated OpenAPI) | After API surface changes |
| Non-obvious facts / gotchas | `MEMORY.md` (auto-memory) | When you hit something a future session needs |

If the context window approaches 70%, update `session-context.md` BEFORE compacting. Load specific reference docs on demand with `@.claude/reference/<file>.md` syntax — don't preload everything.

### Rule 3: Skills Discovery

Before implementing anything non-trivial, check available skills (`.claude/skills/` and `~/.claude/skills/`). Skills are tested, opinionated workflows - prefer them over ad-hoc solutions.

### Rule 4: Temporary Files Go in `temp/`

All temp files MUST be created under `./temp/` (gitignored), never the repo root. Create the directory if it doesn't exist. Never commit temp files.

### Rule 5: Never Tamper with Security Software

This machine may be Intune-managed. Claude must NEVER attempt to disable, stop, or modify Windows Defender, antivirus, or any security software. If a task seems blocked by security, STOP and ask the user - do not work around it.

### Rule 6: Never Read Secrets

Forbidden paths: `.env`, `.env.*`, `secrets/**`, `~/.ssh/**`, `~/.aws/**`, `**/credentials.json`, `**/service-account.json`. Use `.env.example` as a template only.

### Rule 7: Automatic Behaviors Live in Hooks, Not Memory

If you want Claude to "always do X when Y happens" (e.g., run a linter after every edit, post to Slack on session end, validate env vars before deploy), that **must** be a hook in `.claude/settings.json` — not a memory entry or a CLAUDE.md instruction.

| Mechanism | Fires when | Best for |
|-----------|-----------|----------|
| **Hooks** (`settings.json`) | Deterministic events: PreToolUse, PostToolUse, UserPromptSubmit, Stop, etc. | "Always run X after Y" |
| **Memory** (`MEMORY.md`) | Recalled by Claude when relevant context appears | Facts, preferences, prior decisions |
| **CLAUDE.md** | Loaded into every session | Project-wide policies and conventions |
| **Skills** | Auto-invoked when description matches user intent | Reusable workflows |

If your rule says "from now on, when X, do Y" — write a hook. Memory cannot enforce; it only informs.

---

## Project Reference

| Field | Value |
|-------|-------|
| **Project Title** | [PROJECT_TITLE] |
| **GitHub Repo** | [GITHUB_REPO] |
| **Repository Path** | [REPOSITORY_PATH] |
| **Primary Stack** | [PRIMARY_STACK] |

```bash
gh repo view [GITHUB_REPO]              # current state
gh issue list --state open               # in-flight backlog
gh pr list --state open                  # in-flight changes
```

---

## Startup Protocol

Run at the start of EVERY session:

1. **Read this file** + any reference docs the task touches (`@.claude/reference/<topic>.md`).

2. **Check git state**:

   ```bash
   git status
   git log --oneline -10
   ```

3. **Check in-flight GitHub work** (if relevant):

   ```bash
   gh pr list --state open
   gh issue list --state open --assignee @me
   ```

4. **Check `.claude/reference/session-context.md`** if it exists — picks up where the prior session left off.

5. **Brief the user** with: what was being worked on, uncommitted changes, recommended next step.

---

## Project Type: Backend API

| Concern | Guidance |
|---------|----------|
| **Validate at boundaries** | Pydantic / DTO / Zod at request ingress. Trust internal code; don't re-validate between layers. |
| **Error responses** | Generic message to client + `logger.exception(...)` server-side. Never `return {"error": str(exc)}` — leaks stack traces (CodeQL `py/stack-trace-exposure`). |
| **Database access** | Parameterized queries only. Connection pooling at the app boundary, not per-request. |
| **Auth** | At middleware level, not per-route. Never trust client-provided user IDs. |
| **Integration tests** | Hit a real database (testcontainers or ephemeral instance). Mocking the DB hides migration breakage. |
| **API versioning** | URL-versioned (`/v1/`) or header-versioned. Never silently break clients. |

Long-running operations: return a job ID + status endpoint, not a hung connection.
---

## Code Style

| Principle | Apply to |
|-----------|----------|
| Single responsibility | Functions, classes, modules |
| Readable over clever | Default |
| DRY | Extract after the third repetition, not the second |
| Testable | Pure functions where possible |
| Minimal dependencies | Add only when truly needed |

[PRIMARY_LANGUAGE]-specific conventions: customize this section.

---

## Testing

| Type | Target | Location |
|------|--------|----------|
| Unit | 80%+ on changed code | `tests/unit/` |
| Integration | Critical paths | `tests/integration/` |
| E2E | Happy paths + critical flows | `tests/e2e/` |

AAA pattern: Arrange / Act / Assert. Run tests before marking a task `review`.

---

## Security

Never commit: API keys, passwords, private keys, connection strings, `.env` files.
Use environment variables. The `.env.example` in this repo lists required variables.

Validate user input. Parameterize queries. Sanitize output. Keep deps updated.

---

## Git Workflow

Branches: `feature/<ticket>-desc`, `bugfix/<ticket>-desc`, `hotfix/<ticket>-desc`.

Commit format: `<type>(<scope>): <short summary>` where type is `feat|fix|docs|style|refactor|test|chore|perf`.

PR requirements: clear description, linked issue, tests, CI green.

---

## End of Session Protocol

1. Update `.claude/reference/session-context.md` with: what was completed, decisions made, next steps, blockers.
2. Update or close any open `TodoWrite` items (mark completed as you go, don't batch).
3. Commit uncommitted work with a descriptive message.
4. If the work warrants a follow-up GitHub Issue (something you'll want to find later), open it now: `gh issue create`.
5. Brief the user with a session summary.

Always update `session-context.md` BEFORE `/clear` or `/compact` near 70%.

---

## Available Tools

> Generated by the project wizard from the deployed skills/commands/agents/MCP servers.

### Skills (`.claude/skills/`)

_No project-specific skills deployed. Check `~/.claude/skills/` for global skills._

### Commands (`.claude/commands/`)

| Command | Category |
|---------|----------|
| `/end` | base_commands |
| `/next` | base_commands |
| `/save` | base_commands |
| `/start` | base_commands |
| `/status` | base_commands |

### Agents (`.claude/agents/`)

| Agent | Type |
|-------|------|
| `api-documenter` | Markdown |
| `architect-review` | Markdown |
| `background-researcher` | Markdown |
| `code-simplifier` | Markdown |
| `data-engineer` | Markdown |
| `docs-architect` | Markdown |
| `documentation-manager` | Markdown |
| `mermaid-expert` | Markdown |
| `reference-builder` | Markdown |
| `search-specialist` | Markdown |
| `validation-gates` | Markdown |
| `verify-app` | Markdown |

### MCP Servers (`.vscode/mcp.json`)

_No project-specific MCP servers configured. See `.vscode/mcp.json` for active servers._

---

## Claude Code Capabilities Quick Reference

Pointers to features that meaningfully change how a task gets done. Use these when the situation matches — don't reach for them by default.

### Sub-agents and isolation

| When | Tool | Notes |
|------|------|-------|
| Need independent research that would bloat main context | `Agent` with `subagent_type: Explore` or `general-purpose` | Returns a single message; main thread stays clean |
| Need 2+ independent investigations | Multiple `Agent` calls in **one** message | Run in parallel |
| Risky refactor that might fail | `Agent` with `isolation: worktree` | Auto-cleanup if no changes made |
| Specialized work matches an agent | `Agent` with the right `subagent_type` | See agent registry in `.claude/agents/` |

### Background tasks

| When | How |
|------|-----|
| Command runs >5 min (CI watch, large build) | `Bash` with `run_in_background: true` |
| Want notification on completion | The harness notifies automatically — **don't poll** |
| Long agent run that doesn't block your next steps | `Agent` with `run_in_background: true` |

### Context management

| Action | Command / Syntax |
|--------|------------------|
| Check token usage | `/cost` |
| Compress conversation (preserves intent) | `/compact` — update Session Context first if near 70% |
| Hard reset | `/clear` — save context to disk first |
| Load a reference doc on demand | `@.claude/reference/<file>.md` in user prompt |
| Switch model mid-session | `/model opus` / `/model sonnet` / `/model haiku` |
| Faster Opus output | `/fast` (Opus 4.6 / 4.7 only — no quality drop) |

### Permission & settings

| Need | Where |
|------|-------|
| Allow specific commands without prompts | `permissions.allow` in `.claude/settings.json` |
| Per-tool restrictions for a skill/agent | `allowed-tools:` frontmatter |
| Auto-accept edits in current session | `/permissions` → accept edits mode |
| Plan-only mode (read, don't write) | `/permissions` → plan mode |

### Model selection heuristic

| Task type | Default model |
|-----------|---------------|
| Heavy reasoning, architecture, audits | Opus (Opus 4.7 has 1M context) |
| Day-to-day coding, refactors | Sonnet |
| Quick lookups, simple edits, batch ops | Haiku |

### Skill & command frontmatter (modern fields)

```yaml
---
name: my-skill
description: When to use it (matters for auto-invocation)
effort: high              # low|medium|high|max — reasoning depth
context: fork             # Run in isolated subagent
allowed-tools: Read, Grep # Restrict tool access
argument-hint: "[file]"   # Shown in autocomplete
hooks:                    # Skill-scoped hooks
  PostToolUse:
    - matcher: "Edit"
      hooks: [{type: command, command: "./format.sh"}]
---
```

### Memory system

Per-project auto-memory lives in `~/.claude/projects/<project-slug>/memory/`. Index is `MEMORY.md`. Save user/feedback/project/reference notes there — never duplicate facts already in code or git history.

---

## Project Structure

```
[PROJECT_NAME]/
+-- CLAUDE.md                # This file
+-- README.md
+-- .env.example             # Required env vars (copy to .env locally)
+-- .gitignore
+-- .pre-commit-config.yaml
+-- .claude/
|   +-- settings.json
|   +-- reference/           # Long-lived project docs (architecture, deployment, etc.)
|   +-- kb/                  # Optional: extracted internal docs for project-kb skill
|   +-- skills/              # Project-scoped skills
|   +-- commands/            # Project-scoped commands
|   +-- agents/              # Project-scoped agents
|   +-- hooks/               # Project-scoped hooks
|   +-- migrated-archon-tasks.md  # Historical: tasks at Archon-v1 cutover (if applicable)
+-- .github/
|   +-- ISSUE_TEMPLATE/
|   +-- PULL_REQUEST_TEMPLATE.md
+-- .vscode/
|   +-- settings.json
|   +-- mcp.json
+-- src/                     # Source
+-- tests/                   # Tests
+-- docs/                    # Documentation
+-- scripts/                 # Build / deploy
+-- temp/                    # Temp files (gitignored)
```

---

## Quick Reference

| Phrase | Action |
|--------|--------|
| `/start` | Run startup protocol |
| `/status` | Project status (git + open issues + recent commits) |
| `/end` | End-of-session protocol (update session-context, commit, summarize) |
| `@.claude/reference/<file>.md` | Load a specific reference doc into context on demand |

---

> **Template Version**: 4.0.0 | **Generated**: [CREATION_DATE]
> **Source**: claude-code-tools project wizard

## Project Overview

This is a demonstration project showcasing Azure Data API Builder deployed as a containerized solution with:

- **Backend**: Data API Builder in Azure Container Apps
- **Frontend**: React + TypeScript consuming DAB REST/GraphQL APIs
- **Database**: Azure SQL Database
- **Auth**: Microsoft Entra ID (tenant-only access)
- **IaC**: Azure Bicep for all infrastructure

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, MSAL |
| Backend | Azure Data API Builder |
| Database | Azure SQL Database |
| Auth | Microsoft Entra ID |
| Hosting | Azure Container Apps |
| Registry | Azure Container Registry |
| Storage | Azure File Share |
| IaC | Azure Bicep |
| CI/CD | GitHub Actions |

## Key Files

| File | Purpose |
|------|---------|
| `infrastructure/bicep/main.bicep` | Main Azure deployment template |
| `src/dab-config/dab-config.json` | Data API Builder configuration |
| `src/frontend/src/App.tsx` | React application entry |
| `docs/setup-guide.md` | Step-by-step deployment guide |

## Development Commands

```bash
# Frontend development

cd src/frontend
npm install
npm run dev

# DAB local development

cd src/dab-config
dab start

# Deploy infrastructure

cd infrastructure/scripts
./deploy.ps1 -ResourceGroupName "rg-dab-demo"

# Build containers

./build-push-dab.ps1
./build-push-frontend.ps1
```

## Architecture Decisions

1. **ACI over AKS**: Simpler for demo purposes, lower cost
2. **Bicep over Terraform**: Native Azure tooling, better integration
3. **MSAL.js for Auth**: Official Microsoft library for Entra ID
4. **Vite over CRA**: Faster builds, better DX

## Security Notes

- Never commit `.env` files
- SQL credentials via Azure Key Vault
- Container Registry is private
- All traffic over HTTPS
- Entra ID enforces tenant membership

## Optional: Archon RAG

> **Skip this section unless you have a substantial private/internal corpus** that genuinely needs vector search. For library docs (FastAPI, React, Pydantic, etc.), use the `project-kb` skill — it wraps Context7 MCP, which already indexes 1000+ libraries with fresher content than any local corpus.

For projects with extracted internal documentation:

1. Drop markdown files in `.claude/kb/` (gitignored if confidential, committed if public).
2. The `project-kb` skill will grep them automatically.
3. No vector store, no MCP server, no background indexing — just filesystem search with `Grep`.

If you genuinely need vector retrieval (semantic similarity, fuzzy concept matching across a large private corpus), evaluate options like LanceDB-on-disk or a self-hosted Qdrant — but that's a deliberate, scoped infrastructure decision, not a default.

---

