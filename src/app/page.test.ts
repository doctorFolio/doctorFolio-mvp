import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('HomePage source', () => {
  it('migrates the upload page away from CSS Modules', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('.module.css')
    expect(source).toContain('MTS 주식잔고 캡처 올리기')
  })
})
