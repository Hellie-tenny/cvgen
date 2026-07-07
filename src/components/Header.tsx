import { Link } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import logo from '../assets/logo.svg'

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between p-4">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="ettiquette_logo" className="w-8" />
        <h1 className="font-bold text-xl">
          <span className="text-red-500">Etiquette</span>
          <span>CV</span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Blog
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
      </div>
    </div>
  )
}
