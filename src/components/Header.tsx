import { Link, NavLink } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import logo from '../assets/logo.svg'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

// Home is the logo; on phones all of these live in the bottom tab bar instead.
const LINKS = NAV_ITEMS.filter((item) => !item.end)

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
          <img src={logo} alt="Etiquette logo" className="w-8 shrink-0" />
          <span className="font-bold text-xl text-brand">Etiquette</span>
        </Link>

        <nav className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:flex items-center gap-5">
            {LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium whitespace-nowrap transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/post-job"
            className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors whitespace-nowrap"
          >
            Post a job
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
