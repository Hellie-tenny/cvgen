import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { NAV_ITEMS } from './nav-items'

const TABS = NAV_ITEMS.map((item) => ({ to: item.to, label: item.short, icon: item.icon, end: item.end }))

// Shared frame for every public page: header, content, footer, and the tab bar on phones (always visible).
export default function Layout() {
  const { pathname } = useLocation()

  // A new page should start at the top, like a normal website.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      {/* Keyed by path, so each page fades in when you navigate to it */}
      <main key={pathname} className="flex-1 anim-page">
        <Outlet />
      </main>
      <Footer />
      <BottomNav items={TABS} label="Main" />
    </div>
  )
}
