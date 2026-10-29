import { Link, NavLink } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import logo from '../assets/logo.svg'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/builder', label: 'CV Builder' },
  { to: '/cover-letter', label: 'Cover Letter' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/blog', label: 'Blog' },
]

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b">
      <div className="flex items-center justify-between p-4 flex-wrap gap-y-2">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
          <img src={logo} alt="Etiquette logo" className="w-8 shrink-0" />
          <span className="font-bold text-xl text-brand">Etiquette</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
          {NAV.map((item) => (
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

          <Link
            to="/post-job"
            className="hidden sm:inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors whitespace-nowrap"
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
