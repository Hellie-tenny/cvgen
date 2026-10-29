import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Briefcase, ExternalLink, LogOut, Moon, Newspaper, Sun } from "lucide-react";
import { auth, db } from "@/firebase/config";
import { cn } from "@/lib/utils";
import logo from "../../assets/logo.svg";
import BottomNav from "../BottomNav";
import { useTheme } from "../theme-provider";
import type { AdminContext } from "./admin-ui";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
  );

const iconButton =
  "flex items-center gap-1.5 p-2.5 md:px-2 md:py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors";

/**
 * Frame for every signed-in admin page: a slim admin-only header instead of the public site nav.
 * On desktop the sections sit in the header; on phones they move to a bottom tab bar.
 * To add an admin section: add a route in App.tsx, then add it to SECTIONS below.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);

  // One shared listener, so the badge is visible from every admin page.
  useEffect(() => {
    const q = query(collection(db, "jobListings"), where("status", "==", "pending"));
    return onSnapshot(q, (snapshot) => setPendingCount(snapshot.size));
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const context: AdminContext = { pendingCount };

  const SECTIONS = [
    { to: "/admin", label: "Jobs", icon: Briefcase, end: true, badge: pendingCount },
    { to: "/admin/articles", label: "Articles", icon: Newspaper, end: false, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="" className="w-6" />
            <span className="font-semibold hidden sm:inline">Etiquette</span>
            <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">Admin</span>
          </Link>

          {/* Desktop section links (phones use the bottom tab bar) */}
          <nav className="hidden md:flex items-center gap-1 ml-1" aria-label="Admin sections">
            {SECTIONS.map((section) => (
              <NavLink key={section.to} to={section.to} end={section.end} className={navClass}>
                {section.label}
                {section.badge > 0 && (
                  <span
                    key={section.badge}
                    className="anim-pop inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold"
                    aria-label={`${section.badge} pending`}
                  >
                    {section.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={iconButton}
              aria-label="View site (opens in a new tab)"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden md:inline">View site</span>
            </a>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={iconButton}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
            <button type="button" onClick={handleSignOut} className={iconButton} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main key={pathname} className="anim-page max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Outlet context={context} />
      </main>

      <BottomNav items={SECTIONS} label="Admin sections" tone="neutral" />
    </div>
  );
}
