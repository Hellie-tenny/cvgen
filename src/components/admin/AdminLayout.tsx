import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ExternalLink, LogOut, Moon, Sun } from "lucide-react";
import { auth, db } from "@/firebase/config";
import { cn } from "@/lib/utils";
import logo from "../../assets/logo.svg";
import { useTheme } from "../theme-provider";
import type { AdminContext } from "./admin-ui";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
  );

/**
 * Frame for every signed-in admin page: a slim admin-only header instead of the public site nav.
 * Add new admin sections to the <nav> below and to the routes in App.tsx.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-muted/30">
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

          <nav className="flex items-center gap-1 ml-1" aria-label="Admin sections">
            <NavLink to="/admin" end className={navClass}>
              Jobs
              {pendingCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold"
                  aria-label={`${pendingCount} pending`}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/admin/articles" className={navClass}>
              Articles
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="View site (opens in a new tab)"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden md:inline">View site</span>
            </a>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet context={context} />
      </main>
    </div>
  );
}
