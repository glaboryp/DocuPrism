interface NavigatorWithBrands extends Navigator {
  userAgentData?: { brands?: Array<{ brand: string }> }
  brave?: unknown
}

export const isGoogleChrome = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as NavigatorWithBrands

  if (nav.brave) return false

  const brands = nav.userAgentData?.brands
  if (brands?.length) {
    return brands.some(({ brand }) => brand === 'Google Chrome')
  }

  return /Chrome\//.test(nav.userAgent) && !/Edg\/|OPR\/|Brave/.test(nav.userAgent)
}
