export type AIBrowser = 'chrome' | 'edge' | 'unsupported'

interface NavigatorWithBrands extends Navigator {
  userAgentData?: { brands?: Array<{ brand: string }> }
  brave?: unknown
}

export const detectAIBrowser = (): AIBrowser => {
  if (typeof navigator === 'undefined') return 'unsupported'
  const nav = navigator as NavigatorWithBrands

  if (nav.brave) return 'unsupported'

  const brands = nav.userAgentData?.brands
  if (brands?.length) {
    if (brands.some(({ brand }) => brand === 'Microsoft Edge')) return 'edge'
    if (brands.some(({ brand }) => brand === 'Google Chrome')) return 'chrome'
    return 'unsupported'
  }

  if (/Edg\//.test(nav.userAgent)) return 'edge'
  if (/Chrome\//.test(nav.userAgent) && !/OPR\/|Brave/.test(nav.userAgent)) return 'chrome'
  return 'unsupported'
}
