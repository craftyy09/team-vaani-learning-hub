// Role definitions. Real role checks must happen server-side (separate user_roles table) once auth is added.
export type AppRole = "teacher" | "student" | "admin";

export const ROLES: { id: AppRole; label: string; description: string; path: "/teacher" | "/student" | "/admin" }[] = [
  { id: "teacher", label: "Teacher", description: "Teach in your preferred language and manage classes.", path: "/teacher" },
  { id: "student", label: "Student", description: "Learn in your regional language.", path: "/student" },
  { id: "admin", label: "Admin", description: "Manage users, classes and the platform.", path: "/admin" },
];
