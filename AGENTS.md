A type-safe, maintainable web interface for stock portfolio analysis and rebalancing.

# Mandatory delivery workflow

For any non-trivial code change, follow this order:
1. Design: write a short plan and identify files to inspect.
2. Minimal implementation: make the smallest viable code change.
3. Tests: add or update tests for the change.
4. Refactor: improve structure only after tests pass.
5. Review: require an independent reviewer before git management or completion.

## Agent Division of Labor

### Claude (primary implementer)
Claude owns the full implementation pipeline:
1. planning
2. implementation
3. refactoring
4. tests and verification
5. self-review (1차)

After `pnpm verify` passes and self-review is done, Claude requests a Codex independent review.

Claude also owns:
- Codex 피드백 반영 및 수정
- PR 생성 / ship / merge

### Codex (independent reviewer)
Codex is used exclusively as a **second-opinion reviewer** after Claude completes implementation.

Run via `/codex review` (pass/fail gate) or `/codex challenge` (adversarial — tries to break the code).

Codex must **not**:
- implement features
- make code changes
- create PRs or commits

Codex review output is handed back to Claude for triage and fixes.

Required Codex review output:
- Pass/fail gate verdict
- P1 blockers (must fix before merge)
- P2 suggestions (optional improvements)
- Cross-model findings vs Claude's own review

Definition of done:
- `pnpm verify` passes
- If `pnpm` is unavailable on `PATH`, use `COREPACK_ENABLE_AUTO_PIN=0 corepack pnpm@9.15.4 verify` without mutating `package.json`
- no lint/typecheck/test failures
- final response must include:
  - Plan
  - Files Changed
  - Commands Run
  - Test Results
  - Remaining Risks

Rules:
- Never claim completion without running the verification command.
- Never use natural-language-only validation.
- Prefer smaller, staged changes over one large rewrite.
- Do not refactor before tests are updated.
- The implementer agent must not perform final review on its own changes.

## Role Lanes

- **Planner:** writes the short plan, names files to inspect, and lists required test updates before code changes begin. Owner: **Claude**.
- **Implementer:** makes the smallest viable code change that satisfies the plan and hands off without doing final review. Owner: **Claude**.
- **Tester:** adds or updates tests, runs `pnpm verify`, and reports exact failures if verification breaks. Owner: **Claude**.
- **Reviewer (1차):** performs self-review, flags obvious issues before Codex review. Owner: **Claude**.
- **Reviewer (2차):** independent second-opinion review via `/codex review` or `/codex challenge`. Owner: **Codex**.
- **Git Manager:** handles branch, staging, commit, push, and PR hygiene only after Codex review is clean. Owner: **Claude**.

## Role Execution Order

For any non-trivial change, route work through:

`planner → implementer → tester → reviewer(Claude) → reviewer(Codex) → git-manager`

Additional rules:
- Claude self-review comes before Codex review. Fix obvious issues first.
- Codex review is required after Claude self-review and before git management.
- If Codex finds P1 issues, return to implementer → tester → Claude self-review → Codex review again.
- Use the role prompts in `prompts/` for these lanes when delegating.
- `git-manager` lane is always Claude.

## Role Prompt Files

- `prompts/planner.md`
- `prompts/implementer.md`
- `prompts/tester.md`
- `prompts/reviewer.md`
- `prompts/git-manager.md`

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** CSS Modules
- **Testing:** Vitest
- **External Services:**
  - Anthropic Claude API (`@anthropic-ai/sdk`) — portfolio explanation/analysis
  - Upstash Redis (`@upstash/redis`) — rate limiting (via middleware)

## Directory Structure

```
src/
  app/
    api/explain/route.ts   # Claude API integration
    api/ocr/route.ts       # OCR API integration
    page.tsx               # Main page
    layout.tsx
  components/              # UI components (CSS Modules)
  lib/
    engine.ts              # Core portfolio analysis logic
    types.ts               # Domain types
    sectors.ts             # Sector utilities
  data/
    sectors.json           # Static sector data
```

## Core Philosophy: Easy-to-Change Code

Code is "easy to change" when it satisfies four criteria: **Readability, Predictability, Cohesion, Coupling**.

### 1. Readability

- **Separate code that doesn't execute together** — split components by role/condition rather than mixing branches
- **Abstract implementation details** — components call named functions, not raw fetch/localStorage
- **Split hooks by logic type** — `usePortfolioData`, `usePortfolioUI`, `usePortfolioForm` instead of one monolithic hook
- **Name complex conditions and magic numbers** — no unexplained numeric literals
- **Top-to-bottom flow** — null checks first, data fetching next, effects last, render at the end
- **Avoid nested ternaries** — extract to named functions when conditions are complex

### 2. Predictability

- **Consistent return types** — similar hooks return the same shape
- **Reveal hidden logic** — no side effects inside functions that appear to only fetch data
- **No name collisions** — if renaming is needed to disambiguate, do it

### 3. Cohesion

- **Related files stay together** — as the project grows, organize by domain (e.g., `features/portfolio/`) rather than file type
- **Single source of truth for constants** — shared values live in `src/lib/` or `src/data/`, never duplicated

### 4. Coupling

- **Single responsibility** — components and hooks do one thing
- **Allow duplication over wrong abstraction** — extract only when a pattern repeats 3+ times
- **Eliminate props drilling beyond 2–3 levels** — use composition or context

## Domain Rules

- **중복 티커 자동 제거 금지:** 같은 티커가 입력되더라도 자동으로 제거하지 않는다. 유저가 직접 판단해야 하며, 다른 계좌에 동일 종목이 존재할 수 있다.

## Coding Conventions

- Functional components only. No `any`.
- Declarative UI: `UI = f(state)`.
- Use CSS Modules for component-scoped styles.
- TypeScript: use type inference where possible, be explicit for function parameters, use union types for finite states (`'idle' | 'loading' | 'success' | 'error'`).

## Tidy First Approach

**Structural changes** (renaming, extracting components, updating types) and **behavioral changes** (new logic, API calls) must never be mixed in the same commit.
- Never mix structural and behavioral changes in the same commit
- Always make structural changes first when both are needed
- Validate structural changes do not alter behavior by running tests before and after

## Commit Discipline

- Only commit when all Vitest suites pass and TypeScript shows zero errors.
- Commit message prefixes: `refactor:` (structural), `feat:` / `fix:` (behavioral).

## Refactoring Signals

Refactor when:
- A file exceeds 200 lines
- A function exceeds 50 lines
- Props pass through 3+ components unchanged
- The same code appears in 3+ places
- A component has 3+ separate responsibilities

## [Review Mandate]

### Claude 1차 리뷰 (self-review)
Claude가 구현 후 스스로 점검하는 항목:
1. **Tidy First 준수**: structural/behavioral 변경 분리 여부
2. **테스트 커버리지**: 변경된 로직에 대한 테스트 존재 여부
3. **타입 안전성**: `any` 사용 여부, 타입 추론 적절성
4. **보안**: API route 입력 검증, 인증 처리

### Codex 2차 리뷰 (independent review)
Claude 1차 리뷰 통과 후 `/codex review` 또는 `/codex challenge` 실행.

Codex 리뷰 관점:
1. **Maintainer**: architecture & Tidy First compliance
2. **Security Officer**: data safety & financial integrity
3. **Performance Engineer**: query optimization & resource usage
4. **QA Engineer**: test coverage & edge cases

P1 (blocker) 발견 시 Claude가 수정 후 재검토. P2는 Claude 판단으로 반영 여부 결정.

## Deploy Configuration

- Platform: Vercel
- Production URL: (Vercel 프로젝트 생성 후 기입)
- Deploy workflow: auto-deploy on push to main
- Health check: production URL
- Pre-merge: `bun run verify`

환경변수 (Vercel 대시보드에서 설정):
- `ANTHROPIC_API_KEY` — Production + Preview 모두 설정 필수
- `UPSTASH_REDIS_REST_URL` — Production만 (없으면 rate limiting 비활성화, 정상 동작)
- `UPSTASH_REDIS_REST_TOKEN` — Production만

## Progress Tracking

작업 단위(계획 → 구현 → 리팩토링 → 테스트 → 리뷰 → PR → 병합)를 `PROGRESS.md`에 기록한다.

형식:
```
## YYYY-MM-DD
- [ ] 작업 한 줄 요약   ← 작업 시작 시 추가
- [x] 작업 한 줄 요약   ← PR 병합 후 체크
```

규칙:
- 작업 시작 시 `- [ ]`로 항목을 추가한다
- PR이 main에 병합되면 `- [x]`로 변경한다
- 파일 단위가 아닌 논리적 변경 단위로 한 줄씩 작성한다
- 한국어로 작성한다
