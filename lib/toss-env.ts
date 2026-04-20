'use client'

import { getOperationalEnvironment } from '@apps-in-toss/web-framework'

export function isTossEnvironment(): boolean {
  try {
    const env = getOperationalEnvironment()
    return env === 'toss' || env === 'sandbox'
  } catch {
    return false
  }
}
