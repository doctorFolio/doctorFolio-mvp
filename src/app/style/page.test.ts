import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('StylePage source', () => {
  it('keeps the style selection flow while removing CSS Modules', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('.module.css')
    expect(source).toContain('투자 성향 퀴즈')
    expect(source).toContain('목표 배분 설정')
  })
})
