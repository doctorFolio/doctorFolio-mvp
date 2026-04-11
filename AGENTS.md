A type-safe, maintainable web interface for stock portfolio analysis and rebalancing.

## Definition of Done

- `pnpm verify` passes (lint + typecheck + tests)
- `pnpm` 미설치 시: `COREPACK_ENABLE_AUTO_PIN=0 corepack pnpm@9.15.4 verify`
- no lint/typecheck/test failures
- final response includes: Plan / Files Changed / Commands Run / Test Results / Remaining Risks

Rules:
- Never claim completion without running the verification command.
- Prefer smaller, staged changes over one large rewrite.
- Do not refactor before tests are updated.

## Agent Roles & Execution

| Role | Owner | Description |
|------|-------|-------------|
| Planner | Claude | 이슈 생성 및 수용 기준 작성 |
| Implementer | Codex | 구현 → `pnpm verify` → `discord-review-notify`로 완료+Claude 리뷰 요청 |
| Reviewer | Claude | Codex 구현물 검토 → REVIEW-N.md 작성 → P1 있으면 Codex 재트리거 |
| Git Manager | Claude | APPROVED 후 PR 생성 및 머지 |

- Codex 시작: `omc team 1:codex "..."` (worktree에서 실행)

## Work Unit & Worktree Workflow

**GitHub Issues = 작업 백로그의 단일 진실 공급원.** 모든 작업은 이슈로 먼저 등록한 뒤 구현을 시작한다.

새 작업 시작 / 활성 작업 확인 / PR 머지 후 정리는 `worktree-workflow` 스킬 참고.

### Review Handoff (REVIEW-N.md 컨벤션)

**리뷰어 작성 형식** (`REVIEW-1.md` → `REVIEW-2.md` 순서로 워크트리 루트에 작성):
```
---
cycle: 1
branch: feat/N-slug
status: NEEDS_REVISION  # NEEDS_REVISION | APPROVED | ESCALATED
p1_count: 2
p2_count: 1
---

## P1 (must fix)
- [ ] ...

## P2 (optional)
- [ ] ...

## Implementer Response
<!-- 구현 담당자가 리뷰 반영 후 이 섹션 채움 -->

## Verdict: REVISE
```

**Discord 웹훅 → 자동 리뷰 → Codex 재구현 플로우:**

Codex가 구현 완료 시 Discord 웹훅으로 Claude에게 알림:
```
Branch: feat/N-slug
Commit: <sha>
Repo: /path/to/worktrees/feat-N-slug
Review file: REVIEW-1.md
```

Claude는 웹훅 수신 시 자동으로:
1. 브랜치 diff 분석 + `pnpm verify` 실행
2. `REVIEW-{N}.md` 작성 (worktree 루트)
3. **p1_count > 0** → Codex 재구현 자동 트리거:
```bash
omc team 1:codex "Read REVIEW-{N}.md. Fix all unchecked P1 items. Run pnpm verify. If verify fails append failure output under '## Implementer Response' and note VERIFY_FAILED — do not commit. If passes, append what you fixed, commit, then use the discord-review-notify skill/script to complete the task and send the Claude review webhook mention. Do not call raw completed transition separately."
```
4. **p1_count = 0 (APPROVED)** → Git Manager 모드로 PR 생성

**규칙:**
- 리뷰 담당자(Claude)는 채팅만으로 끝내지 말고 worktree 루트의 `REVIEW-N.md`에 결과를 남긴다.
- YAML `status` + `## Verdict` 는 Claude가 작성한다.
- 구현 담당자(Codex)는 `## Implementer Response` 섹션만 갱신한다.
- 3사이클 후에도 P1 남으면 `status: ESCALATED` → 유저에게 에스컬레이션
- `REVIEW*.md`는 `.gitignore` 적용 (PR diff에 포함되지 않음)

### 파일 충돌 방지

이슈 생성 시 수정 대상 파일을 명시한다. 동시 진행 중인 이슈가 같은 파일을 수정하면 하나가 머지될 때까지 대기.

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

## Code Standards

**Easy-to-change code:** Readability · Predictability · Cohesion · Coupling

- Separate code that doesn't execute together (split by role/condition)
- Consistent return types across similar hooks
- Single responsibility per component and hook
- Extract only when a pattern repeats 3+ times
- Name complex conditions and magic numbers

**Conventions:**
- Functional components only. No `any`.
- CSS Modules for component-scoped styles.
- Union types for finite states: `'idle' | 'loading' | 'success' | 'error'`

**Tidy First:** structural changes (rename, extract) and behavioral changes (new logic) must be separate commits.
- Commit prefixes: `refactor:` (structural), `feat:` / `fix:` (behavioral)
- Only commit when all Vitest suites pass and TypeScript shows zero errors.

**Refactor when:** file > 200 lines · function > 50 lines · props drill 3+ levels · same code in 3+ places

**Domain rule:** 중복 티커 자동 제거 금지 — 다른 계좌에 동일 종목이 있을 수 있다.

## Review Mandate

**Claude (reviewer):** Codex 구현물을 검토. 관점: Tidy First 준수 · 테스트 커버리지 · `any` 없음 · API route 입력 검증 · architecture & data safety · performance

P1(blocker) → Codex가 수정 후 재검토. P2 → Claude 판단으로 반영 여부 결정.

## Deploy Configuration

- Platform: Vercel / auto-deploy on push to `main`
- Production URL: (Vercel 프로젝트 생성 후 기입)
- Pre-merge: `pnpm verify`

환경변수 (Vercel 대시보드):
- `ANTHROPIC_API_KEY` — Production + Preview 필수
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Production만 (없으면 rate limiting 비활성화, 정상 동작)

백로그는 GitHub Issues로 관리. 진행 이력은 `PROGRESS.md` 참고.
