// Client-side form checks. Server-side validation must be added with the backend.
export type AuthFields = { name?: string; email: string; password: string };
export type AuthErrors = Partial<Record<keyof AuthFields, string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateAuth(f: AuthFields, register: boolean): AuthErrors {
  const e: AuthErrors = {};
  if (register && !f.name?.trim()) e.name = "Please enter your full name.";
  else if (register && f.name!.trim().length > 100) e.name = "Name must be under 100 characters.";
  const email = f.email.trim();
  if (!email) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email) || email.length > 255) e.email = "Please enter a valid email address.";
  if (!f.password) e.password = "Please enter your password.";
  else if (register && f.password.length < 8) e.password = "Password must be at least 8 characters.";
  return e;
}
