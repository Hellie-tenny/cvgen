import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

const TABS = NAV_ITEMS.map((item) => ({ to: item.to, label: item.short, icon: item.icon, end: item.end }))

// Screens that bring their own pinned bottom bar. The tab bar steps aside there, because two stacked bars would
// take a fifth of a phone screen. (The CV builder has Back / Preview / Next.)
const FOCUS_MODE_PATHS = ['/builder']

// Shared frame for every public page: header, content, footer, and the tab bar on phones.
export default function Layout() {
  const { pathname } = useLocation()
  const showTabs = !FOCUS_MODE_PATHS.some((path) => pathname.startsWith(path))

  // A new page should start at the top, like a normal website.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        showTabs && 'pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0'
      )}
    >
      <Header />
      {/* Keyed by path, so each page fades in when you navigate to it */}
      <main key={pathname} className="flex-1 anim-page">
        <Outlet />
      </main>
      <Footer />
      {showTabs && <BottomNav items={TABS} label="Main" />}
    </div>
  )
}
