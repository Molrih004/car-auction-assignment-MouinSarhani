# Creating Issues

This document explains how to turn your assignment work — both analysis/design products and code — into GitHub issues that are small enough to resolve in a single pull request.

A user story or a product from [products/products.md](products/products.md) is a **requirement**, not a unit of work. Your job is to break it down into issues that are each independently completable, reviewable, and closeable.

## Two kinds of issues

You will create two categories of issues over the course of the assignment:

1. **Analysis/design issues** — produce one of the products listed in [products/products.md](products/products.md) (persona, system context diagram, use case specification, ERD, component diagram, API specification, UXD test plan, etc.). The deliverable is a document or diagram committed to the `products/` folder.
2. **Coding issues** — implement part of a user story. The deliverable is working code in `code/`, merged via a PR.

Both kinds follow the same rules: small, independently mergeable, and reviewable in one PR. A 20-page requirements document dumped in one PR is exactly as unreviewable as a 2,000-line code PR — split both the same way.

Analysis/design issues usually come first (they inform the stories), and coding issues follow once the story and its acceptance criteria are clear. In practice the two interleave: you might open a design issue for the reset-password sequence diagram, and only once that's merged can you correctly split the coding issues for that story.

## Part A — Analysis/design issues

### 1. One issue ≠ one entire product

A product from `products/products.md` is a category, not a single deliverable. Split it:

| Product | Split by |
| --- | --- |
| Persona | One issue per persona |
| System requirements | One issue per requirement group (e.g. per epic/story) |
| Use case specification | One issue per use case |
| Entity relationship diagram | One issue for the full diagram if small; split by bounded context/aggregate if large |
| Component diagram | One issue for the full diagram if small; one per subsystem if large |
| API specification | One issue per resource/endpoint group, not one per endpoint |
| High fidelity prototype | One issue per screen or flow |
| UXD testing | Separate issues for plan, script, and results — they're produced at different times and reviewed by different people |
| System context diagram | Usually one issue — it's meant to stay small (one diagram, external actors + system boundary) |

Rule of thumb: if you can't finish the artifact in a few hours and describe what "done" looks like in one sentence, split it further.

### 2. What the issue must contain

- **Title**: `[Product] Subject`, e.g. `[Persona] Frontdesk employee`, `[Use case] Reset password`.
- **Description**: what needs to be produced and why (link the story or requirement it supports).
- **Definition of done**: e.g. "Diagram committed as `products/erd.md` (Mermaid), reviewed by one teammate, terminology matches the glossary."
- **Links**: the story/epic this supports, and any prerequisite issue (e.g. the persona issue that this use case depends on).

### 3. Review like code

Commit products as text where possible (Markdown, Mermaid, PlantUML) so diffs are reviewable in a PR, not just an attached image. Open a PR, get a review, merge — same workflow as code.

## Part B — Coding issues

### 1. Start from acceptance criteria

Every user story needs acceptance criteria (Given/When/Then or plain bullets) before you split it into issues. No acceptance criteria means you're guessing at scope — write them first, as part of the requirements/use case product, not as an afterthought in the issue.

### 2. Decompose as vertical slices

Default to **one issue = one acceptance criterion, cutting through UI → API → DB**. You see the feature work end to end instead of getting lost in a "backend issue" that does nothing visible on its own.

Only split horizontally (separate frontend/backend/tests issues) if you're working in a pair where one person genuinely owns the API and the other the UI for that criterion — and even then, keep the pieces mergeable independently (e.g. behind a feature flag or with the frontend calling a stubbed endpoint first).

### 3. Cross-cutting concerns: use a sequence diagram

Concerns like auth checks, validation, or error handling are usually hidden inside the story's prose. Don't guess how to split them — draw a sequence diagram first (actor, controller/endpoint, service, repository/external system — no class-level detail), then use it to split issues:

- Each arrow crossing a lifeline boundary is a candidate issue (e.g. `Controller → Service` = one issue).
- Each `alt`/`opt` branch is its own issue, regardless of how many lifelines it touches — an error path (e.g. "expired token") only makes sense end-to-end, so don't split it further by component.
- Attach the diagram to the parent story issue; individual task issues reference "see step 3 in the sequence diagram" instead of re-explaining the flow.

This only helps for concerns that are about **flow** (order/timing matters: auth, retries, error handling). For concerns that are uniform everywhere and not sequence-dependent (logging conventions, input sanitization), don't force them into the diagram — track them as a checklist/definition-of-done item that applies to every issue instead.

**Worked example** — story: *"As a user, I want to reset my password so I can regain access to my account."*

Happy path (one issue per arrow):

1. Reset request form (frontend)
2. `POST /reset-request` endpoint (routing, input validation)
3. Token generation + persistence (service + token store)
4. Send reset email
5. Reset-confirm form (frontend)
6. `POST /reset-confirm` endpoint (routing, input validation)
7. Token validation + password update (service)

Cross-cutting concern (issue 8), split from the `alt` block, not by component:

- Handle expired/invalid token — token store returns invalid → service builds error → controller returns 400. One coherent issue even though it touches three components.

### 4. Size check

Each coding issue should be:
- Completable in a few hours to one day
- Independently mergeable
- Testable on its own (even if behind a feature flag)

If you can't describe it in one sentence plus a short checklist, it's still a story in disguise — split it further.

### 5. What the issue must contain

- **Title**: short, action-oriented, e.g. `Send password reset email`.
- **Description**: which acceptance criterion (or sequence diagram step) this implements.
- **Checklist**: concrete sub-tasks if any.
- **Links**: `Closes #<parent story/epic>`.

## Traceability (applies to both kinds)

- Use GitHub issue-linking (`Closes #12`) in every PR description.
- Track each user story as a parent issue (epic) with the analysis and coding issues linked as sub-issues, or listed as a checklist in the parent issue body.
- If you're not using epics, label every issue with the story ID (e.g. `story-3`).
- Keep the sequence diagram (if you made one) in the parent issue so task issues can reference it by step instead of repeating context.

## Anti-patterns

- **One giant issue per story, one giant PR** — defeats the point of reviewing PRs at all.
- **Splitting too finely** (e.g. "create button" separate from "wire button to endpoint") — creates PR noise without teaching anything about scope.
- **Splitting an error path by component** instead of keeping it as one issue for the whole `alt` branch.
- **Forcing a non-sequential concern (logging, sanitization) through a sequence diagram** — use a checklist instead.
- **Writing acceptance criteria inside the issue instead of the requirements/use case product** — the story should already have them; the issue just implements one.
