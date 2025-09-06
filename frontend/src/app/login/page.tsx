"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/login/SignIn";
import SignUp from "@/components/login/SignUp";
import { apiFetch } from "@/lib/api";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const isSignIn = mode === "signin";

  // shared state across the two panels
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);

    try {
      const res = await apiFetch(isSignIn ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(
          isSignIn
            ? { email, password }
            : { email, password, full_name: fullName }
        ),
      });

      if (!res.ok) {
        let txt = "Request failed";
        try {
          const j = await res.json();
          txt = j?.error?.message || j?.message || txt;
        } catch {}
        throw new Error(txt);
      }

      if (isSignIn) {
        // cookies set by the backend are now in the browser;
        // you can optionally verify with /auth/me before redirecting.
        router.replace("/");
      } else {
        setMsg("Account created. You can sign in now.");
        setMode("signin");
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="relative w-full max-w-[1200px] h-[600px] px-6">
        {/* Card */}
        <div className="relative isolate h-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Forms */}
          <div className="absolute inset-0">
            <SignIn
              active={isSignIn}
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              busy={busy}
              err={err}
              msg={msg}
              onSubmit={submit}
            />
            <SignUp
              active={!isSignIn}
              fullName={fullName}
              email={email}
              password={password}
              setFullName={setFullName}
              setEmail={setEmail}
              setPassword={setPassword}
              busy={busy}
              err={err}
              msg={msg}
              onSubmit={submit}
            />
          </div>

          {/* Sliding teal overlay */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 bg-auth-teal text-white
                        overflow-hidden z-20 transition-transform duration-700 ease-in-out
                        ${isSignIn ? "translate-x-full" : "translate-x-0"}`}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="auth-shape-1" />
              <div className="auth-shape-2" />
            </div>

            {/* Welcome Back (visible in signup mode) */}
            <div
              className={`absolute inset-0 flex flex-col justify-center p-12 transition-transform duration-700 ease-in-out
                          ${isSignIn ? "-translate-x-full" : "translate-x-0"}`}
            >
              <h1 className="text-5xl font-extrabold leading-tight">Welcome Back!</h1>
              <p className="mt-4 text-white/90 max-w-sm">
                To keep connected with us please login with your personal info
              </p>
              <div className="mt-10">
                <button
                  onClick={() => setMode("signin")}
                  className="mx-auto block h-12 w-56 rounded-full
                             border-2 border-white text-white/95 tracking-[0.2em] font-semibold
                             hover:bg-white/10 hover:text-white
                             transition active:translate-y-[1px]"
                >
                  SIGN IN
                </button>
              </div>
            </div>

            {/* Hello, Friend (visible in signin mode) */}
            <div
              className={`absolute inset-0 flex flex-col items-end justify-center p-12 transition-transform duration-700 ease-in-out
                          ${isSignIn ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="text-right max-w-sm">
                <h1 className="text-5xl font-extrabold leading-tight">Hello, Friend!</h1>
                <p className="mt-4 text-white/90">
                  Enter your personal details and start your journey with us
                </p>
                <div className="mt-10">
                  <button
                    onClick={() => setMode("signup")}
                    className="mx-auto block h-12 w-56 rounded-full
                               border-2 border-white text-white/95 tracking-[0.2em] font-semibold
                               hover:bg-white/10 hover:text-white
                               transition active:translate-y-[1px]"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* /overlay */}
        </div>

        {/* soft shadow below the card */}
        <div className="absolute -bottom-6 left-6 right-6 h-6 rounded-full bg-black/5 blur-md" />
      </div>
    </div>
  );
}
