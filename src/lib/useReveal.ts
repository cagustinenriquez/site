import { useEffect, type CSSProperties, type DependencyList } from 'react'

// Elements with the "reveal" class fade and slide in the first time they scroll into view.
// Pass deps when the elements show up later (for example after data loads).
export function useReveal(deps: DependencyList = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Stagger delay for items in a list (used by the .reveal transition)
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties
