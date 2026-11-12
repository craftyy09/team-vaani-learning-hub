import { describe, expect, it } from "vitest";
import { validateAuth } from "@/lib/validation/auth";

describe("validateAuth", () => {
  it("rejects empty email", () => expect(validateAuth({ email: "", password: "x" }, false).email).toBeDefined());
  it("rejects invalid email format", () => expect(validateAuth({ email: "abc@", password: "x" }, false).email).toBeDefined());
  it("requires name on register", () => expect(validateAuth({ name: " ", email: "a@b.co", password: "12345678" }, true).name).toBeDefined());
  it("requires 8+ char password on register", () => expect(validateAuth({ name: "A", email: "a@b.co", password: "1234567" }, true).password).toBeDefined());
  it("accepts valid registration", () => expect(validateAuth({ name: "A", email: "a@b.co", password: "12345678" }, true)).toEqual({}));
});
