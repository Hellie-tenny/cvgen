import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { auth } from "@/firebase/config";
import logo from "../assets/logo.svg";
import { btn, inputClass, Field, Notice } from "../components/admin/admin-ui";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Helmet>
        <title>Admin sign in — Etiquette</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src={logo} alt="" className="w-8" />
          <span className="font-semibold text-lg">Etiquette</span>
          <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-background border border-border rounded-xl p-6">
          <h1 className="text-xl font-bold">Sign in</h1>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>

          {error && (
            <Notice>
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </Notice>
          )}

          <button type="submit" disabled={loading} className={`${btn("primary")} w-full`}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
