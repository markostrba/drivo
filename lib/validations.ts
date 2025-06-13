import { z } from "zod";

export const SignUpSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters",
  }),
  email: z.string().email({ message: "Invalid email" }),
});

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});
