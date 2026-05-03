import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionItem } from './ActionItem'

describe('ActionItem', () => {
  it('renders a sell action with migrated style classes', () => {
    const html = renderToStaticMarkup(
      createElement(ActionItem, {
        action: {
          action: 'sell',
          estimatedAmount: 120000,
          name: '삼성전자',
          quantity: 2,
          ticker: '005930',
          taxEstimate: 3000,
        },
      }),
    )

    expect(html).toContain('삼성전자')
    expect(html).toContain('매도 2주')
    expect(html).toContain('actionItem__item')
  })
})
