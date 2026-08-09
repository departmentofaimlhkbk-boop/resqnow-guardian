import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldPlus, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button, Screen } from "@/components/kit";
import { useResQ } from "@/hooks/useResQ";

function Field({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail }) {
  return (
    <div className="group flex h-14 items-center gap-3 rounded-2xl border border-border bg-white/[0.03] px-4 transition-colors focus-within:border-blue/60 focus-within:bg-blue/[0.06]">
      <Icon className="size-4.5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-blue-bright" />
      <input
        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
        {...props}
      />
    </div>
  );
}

export function Auth() {
  const { signIn, signUp, signInWithGoogle } = useResQ();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (!isLogin && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(fullName, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <Screen className="flex flex-col px-6 pb-8 pt-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="grid size-14 place-items-center rounded-[20px] bg-primary shadow-glow-red">
          <ShieldPlus className="size-7 text-white" />
        </span>
        <h1 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">
          {isLogin ? "Welcome Back!" : "Create Account"}
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {isLogin ? "Login to continue." : "Join the ResQNow response network."}
        </p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-white/[0.03] p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`h-10 rounded-xl text-[13px] font-semibold capitalize transition-all ${
              mode === m ? "bg-primary text-white shadow-glow-red" : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-3" onSubmit={submit}>
        {!isLogin && (
          <Field
            icon={User}
            placeholder="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <Field
          icon={Mail}
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <Field
            icon={Lock}
            type={show ? "text" : "password"}
            placeholder="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-primary/35 bg-primary/[0.08] p-3 text-[13px] text-primary">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" variant="emergency" className="mt-2" disabled={busy}>
          {busy ? <Loader2 className="size-4.5 animate-spin" /> : null}
          {isLogin ? "Login" : "Register"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> OR CONTINUE WITH <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" onClick={google} disabled={busy}>
        <svg viewBox="0 0 24 24" className="size-4.5">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c5.6 0 9.3-3.9 9.3-9.4 0-.6-.06-1-.15-1.5H12z"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-[12px] text-muted-foreground">
        Your account, contacts and incidents are stored securely in your ResQNow backend.
      </p>
    </Screen>
  );
}
