import { useTheme } from './theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import logo from '../assets/logo.svg';

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between p-4">
      <div className='flex items-center'>
        <img src={logo} alt="ettiquette_logo" className='w-8'/>
        <h1 className='font-bold text-xl'><span className='text-red-500'>Etiquette</span><span>CV</span></h1>
        
      </div>
      
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
  )
}
