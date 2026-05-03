import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarketBanner } from './MarketBanner'

describe('MarketBanner', () => {
  it('renders the macro summary link with Tailwind utility classes', () => {
    const html = renderToStaticMarkup(createElement(MarketBanner, { loading: true, market: null }))

    expect(html).toContain('오늘 시장 온도')
    expect(html).toContain('불러오는 중')
    expect(html).toContain('/market')
    expect(html).toContain('rounded')
  })
})
