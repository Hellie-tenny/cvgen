import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BottomNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Small count shown on the icon (e.g. pending listings) */
  badge?: number
}

/**
 * Mobile tab bar, shown below the md breakpoint only. It is always visible except while the on-screen keyboard
 * is open (so it can't squeeze the page while someone types).
 * - "brand" tone colours the active tab red (public site); "neutral" keeps admin free of brand red.
 * - Keyboard detection uses the real viewport size, not "a field is focused". Fields often stay focused after
 *   the keyboard is dismissed, which used to leave the bar hidden.
 * - While the keyboard is open, <html data-keyboard="open"> is set, so sticky bars that sit above this bar
 *   (see .above-tabbar in App.css) can drop to the screen edge.
 * - Respects the iPhone home-indicator area. This needs viewport-fit=cover in index.html to take effect.
 */
export default function BottomNav({
  items,
  label,
  tone = 'brand',
}: {
  items: BottomNavItem[]
  label: string
  tone?: 'brand' | 'neutral'
}) {
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return // can't tell, so never hide the bar

    const isField = (el: Element | null) =>
      el instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)

    // The tallest the visible area has been at this width: keyboard open means it has shrunk well below that.
    let baseline = Math.max(window.innerHeight, viewport.height)
    let lastWidth = window.innerWidth

    const update = () => {
      if (window.innerWidth !== lastWidth) {
        // Rotated or resized: start measuring again
        lastWidth = window.innerWidth
        baseline = Math.max(window.innerHeight, viewport.height)
      }
      baseline = Math.max(baseline, window.innerHeight, viewport.height)
      setKeyboardOpen(baseline - viewport.height > 150 && isField(document.activeElement))
    }

    viewport.addEventListener('resize', update)
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    return () => {
      viewport.removeEventListener('resize', update)
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (keyboardOpen) root.dataset.keyboard = 'open'
    else delete root.dataset.keyboard
    return () => {
      delete root.dataset.keyboard
    }
  }, [keyboardOpen])

  const activeText = tone === 'brand' ? 'text-brand' : 'text-foreground'
  const activePill = tone === 'brand' ? 'bg-brand/10' : 'bg-muted'

  return (
    <nav
      aria-label={label}
      className={cn(
        'tabbar-surface md:hidden fixed inset-x-0 bottom-0 z-50',
        'pb-[env(safe-area-inset-bottom)] transition-transform duration-200',
        keyboardOpen && 'translate-y-full'
      )}
    >
      <ul className="flex">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                    isActive ? activeText : 'text-muted-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* The active tab gets a soft pill behind its icon */}
                    <span
                      className={cn(
                        'relative flex h-7 w-14 items-center justify-center rounded-full transition-colors',
                        isActive && activePill
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.badge ? (
                        <span
                          key={item.badge}
                          className="anim-pop absolute right-1.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white"
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
