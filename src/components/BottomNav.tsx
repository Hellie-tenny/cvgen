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
 * Mobile tab bar, shown below the md breakpoint only.
 * - "brand" tone colours the active tab red (public site); "neutral" keeps admin free of brand red.
 * - Hides itself while a text field is focused, so it never sits on top of the on-screen keyboard.
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
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true)
    const onOut = () => setTyping(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  const activeText = tone === 'brand' ? 'text-brand' : 'text-foreground'
  const activeBar = tone === 'brand' ? 'bg-brand' : 'bg-foreground'

  return (
    <nav
      aria-label={label}
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur',
        'pb-[env(safe-area-inset-bottom)] transition-transform duration-200',
        typing && 'translate-y-full'
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
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors active:bg-muted/60',
                    isActive ? activeText : 'text-muted-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute top-0 h-0.5 w-8 rounded-full transition-opacity',
                        activeBar,
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.badge ? (
                        <span
                          key={item.badge}
                          className="anim-pop absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white"
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
