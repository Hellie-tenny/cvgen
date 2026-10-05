import { Link } from 'react-router-dom'

const linkClass = 'text-sm text-muted-foreground hover:text-foreground transition-colors'

export default function Footer() {
  return (
    <div className='p-4 text-center w-full'>
      <nav className='flex items-center justify-center gap-x-5 gap-y-1 flex-wrap mb-2'>
        <Link to='/about' className={linkClass}>About</Link>
        <Link to='/contact' className={linkClass}>Contact</Link>
        <Link to='/privacy' className={linkClass}>Privacy Policy</Link>
      </nav>
      Powered by Rocket Web &copy; 2026
    </div>
  )
}
