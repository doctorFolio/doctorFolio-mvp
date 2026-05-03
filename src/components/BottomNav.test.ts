import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/market',
}))

describe('BottomNav', () => {
  it('renders the active market navigation item with Tailwind utility classes', () => {
    const html = renderToStaticMarkup(createElement(BottomNav))

    expect(html).toContain('하단 주요 탐색')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('시장')
    expect(html).toContain('rounded')
  })
})
