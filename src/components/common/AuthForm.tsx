import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./Logo";
import { ROLES, type AppRole } from "@/lib/roles";
import { LANGUAGES } from "@/lib/languages";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState<AppRole>("student");
  const [notice, setNotice] = useState("");
  const isRegister = mode === "register";
  const submit = (e: FormEvent) => { e.preventDefault(); setNotice("Accounts aren't available yet — this form is a preview."); };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-end bg-hero p-12 text-hero-foreground md:flex">
        <h2 className="text-4xl font-semibold">Every voice, every language.</h2>
        <p className="mt-3 opacity-80">Teachers teach in their language. Students learn in theirs.</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <Logo />
          <div>
            <h1 className="text-3xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{isRegister ? "Join as a teacher or student." : "Log in to continue learning."}</p>
          </div>
          {isRegister && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">I am a</legend>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.filter((r) => r.id !== "admin").map((r) => (
                  <button type="button" key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id}
                    className={`rounded-lg border p-3 text-sm ${role === r.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {isRegister && <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" required /></div>}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
          <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={8} /></div>
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="lang">Preferred language</Label>
              <select id="lang" className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native} ({l.name})</option>)}
              </select>
            </div>
          )}
          {isRegister && role === "student" && <p className="text-xs text-muted-foreground">Your class will be assigned by your teacher.</p>}
          <Button type="submit" className="w-full">{isRegister ? "Create account" : "Log in"}</Button>
          {notice && <p role="status" className="rounded-md bg-secondary p-3 text-sm">{notice}</p>}
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? <>Already have an account? <Link to="/login" className="text-primary underline">Log in</Link></>
              : <>New here? <Link to="/register" className="text-primary underline">Create an account</Link></>}
          </p>
        </form>
      </main>
    </div>
  );
}
