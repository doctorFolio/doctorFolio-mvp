import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('DiagnosisPage source', () => {
  it('removes action-item based buy/sell recommendations and keeps prototype-style sections', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain("from '@/components/ActionItem'")
    expect(source).not.toContain('권장 조치')
    expect(source).toContain('포트폴리오 개선 보기')
    expect(source).toContain('종목 시그널 분석 보기')
    expect(source).toContain('다시 진단')
  })

  it('uses Tailwind styles that keep the navy header and allocation panel', async () => {
    const { tailwindStyles } = await import('../../lib/tailwindStyles')

    expect(tailwindStyles.allocationPanel).toContain('rounded')
    expect(tailwindStyles.retryBtn).toContain('rounded')
    expect(tailwindStyles.healthScoreDot).toContain('rounded')
  })
})
