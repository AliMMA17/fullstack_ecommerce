"use client";

type Props = {
  active: boolean;
  fullName: string;
  email: string;
  password: string;
  setFullName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  busy: boolean;
  err: string | null;
  msg: string | null;
  onSubmit: (e: React.FormEvent) => void;
};

const input =
  "w-full h-12 rounded-md px-11 bg-slate-100/80 border border-slate-200 " +
  "text-slate-900 placeholder:text-slate-400 " +
  "focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

export default function SignUp({
  active,
  fullName,
  email,
  password,
  setFullName,
  setEmail,
  setPassword,
  busy,
  err,
  msg,
  onSubmit,
}: Props) {
  return (
    <section
      className={`absolute top-0 right-0 h-full w-1/2 flex items-center justify-center transition-all duration-700
      ${active ? "opacity-100 translate-x-0 pointer-events-auto z-30" : "opacity-0 translate-x-6 pointer-events-none z-10"}`}
    >
      <div className="w-full max-w-sm px-10">
        <h2 className="text-4xl font-bold text-emerald-600 tracking-tight">Create Account</h2>

        {/* social row can stay as you have it */}

        <p className="text-sm text-slate-500 mt-4">or use your email for registration:</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="relative">
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21a8 8 0 10-16 0" strokeWidth="1.5" /><circle cx="12" cy="7" r="4" strokeWidth="1.5" />
            </svg>
            <input
              className={input}
              placeholder="Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16v12H4z" strokeWidth="1.5" /><path d="M22 6l-10 7L2 6" strokeWidth="1.5" />
            </svg>
            <input
              className={input}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="4" y="11" width="16" height="9" rx="2" strokeWidth="1.5" />
              <path d="M8 11V8a4 4 0 118 0v3" strokeWidth="1.5" />
            </svg>
            <input
              className={input}
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-emerald-700">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mx-auto block h-12 w-56 rounded-full bg-emerald-600 text-white font-semibold tracking-[0.2em]
                       hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {busy ? "Creating…" : "SIGN UP"}
          </button>
        </form>
      </div>
    </section>
  );
}
