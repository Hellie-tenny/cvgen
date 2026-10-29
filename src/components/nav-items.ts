import { BookOpen, Briefcase, FileText, Home, PenLine, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  /** Full label, used in the desktop header */
  label: string
  /** Short label, used under the icon in the mobile tab bar */
  short: string
  icon: LucideIcon
  /** Match the exact path only (needed for Home) */
  end?: boolean
}

// The single source of truth for public navigation. Add a page here and both the header and the tab bar get it.
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', short: 'Home', icon: Home, end: true },
  { to: '/builder', label: 'CV Builder', short: 'CV', icon: FileText },
  { to: '/cover-letter', label: 'Cover Letter', short: 'Letter', icon: PenLine },
  { to: '/jobs', label: 'Jobs', short: 'Jobs', icon: Briefcase },
  { to: '/blog', label: 'Blog', short: 'Blog', icon: BookOpen },
]
