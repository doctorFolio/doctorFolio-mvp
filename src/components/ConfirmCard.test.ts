import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmCard } from './ConfirmCard'

const position = {
  assetClass: '국내주식' as const,
  avgCost: 90000,
  code: '005930',
  currentPrice: 100000,
  id: 'position-1',
  name: '삼성전자',
  qty: 1,
  sector: '반도체',
  sourceImage: 1,
  value: 100000,
}

describe('ConfirmCard', () => {
  it('renders editable position fields with Tailwind utility classes', () => {
    const html = renderToStaticMarkup(
      createElement(ConfirmCard, {
        asRow: false,
        isDuplicate: true,
        onAssetClassChange: vi.fn(),
        onDelete: vi.fn(),
        onFieldChange: vi.fn(),
        onSectorChange: vi.fn(),
        pct: 42.5,
        position,
      }),
    )

    expect(html).toContain('삼성전자')
    expect(html).toContain('42.5%')
    expect(html).toContain('중복')
    expect(html).toContain('rounded')
  })
})
