// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  serverActions: { bodySizeLimit: '5mb' },
}

export default config
