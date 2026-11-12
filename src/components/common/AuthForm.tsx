import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Info, Presentation, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { FormField } from "./FormField";
import { LanguageSelector, LanguageStrip } from "./LanguageSelector";
import { type AppRole } from "@/lib/roles";
import { validateAuth, type AuthErrors } from "@/lib/validation/auth";

const roleOptions = [
  { id: "teacher" as AppRole, label: "Teacher", icon: Presentation },
  { id: "student" as AppRole, label: "Student", icon: GraduationCap },
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [role, setRole] = useState<AppRole>("student");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [notice, setNotice] = useState("");
  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => setFields({ ...fields, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAuth(fields, isRegister);
    setErrors(errs);
    setNotice(Object.keys(errs).length ? "" : "Accounts aren't available yet — this form is a preview.");
  };
  const aria = (k: keyof AuthErrors) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-hero p-12 text-hero-foreground md:flex">
        <Logo />
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Learn in your language.<br />Teach without barriers.</h2>
          <p className="mt-3 opacity-80">Teachers teach in their language. Students learn in theirs.</p>
          <LanguageStrip className="mt-8 opacity-90" />
        </div>
      </aside>
      <main className="flex items-center justify-center p-6">
        <form onSubmit={submit} noValidate className="animate-rise w-full max-w-sm space-y-5">
          <div className="md:hidden"><Logo /></div>
          <div>
            <h1 className="text-3xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{isRegister ? "Join as a teacher or student." : "Log in to continue learning."}</p>
          </div>
          {isRegister && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">I am a</legend>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((r) => (
                  <button type="button" key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${role === r.id ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card hover:border-primary"}`}>
                    <r.icon className="h-4 w-4" />{r.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {isRegister && <FormField id="name" label="Full name" error={errors.name}><Input id="name" autoComplete="name" maxLength={100} value={fields.name} onChange={set("name")} {...aria("name")} /></FormField>}
          <FormField id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" maxLength={255} value={fields.email} onChange={set("email")} {...aria("email")} /></FormField>
          <FormField id="password" label="Password" error={errors.password} hint={isRegister ? "At least 8 characters." : undefined}>
            <Input id="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={fields.password} onChange={set("password")} {...aria("password")} />
          </FormField>
          {isRegister && <FormField id="lang" label="Preferred language"><LanguageSelector id="lang" /></FormField>}
          {isRegister && role === "student" && (
            <p className="flex gap-2 rounded-xl bg-secondary p-3 text-xs text-secondary-foreground"><Info className="h-4 w-4 shrink-0" />Your class will be assigned by your teacher. Once confirmed, only your teacher can change it.</p>
          )}
          <Button type="submit" size="lg" className="w-full">{isRegister ? "Create account" : "Log in"}</Button>
          {notice && <p role="status" className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">{notice}</p>}
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? <>Already have an account? <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">Log in</Link></>
              : <>New here? <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">Create an account</Link></>}
          </p>
        </form>
      </main>
    </div>
  );
}
