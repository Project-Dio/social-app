import { z } from "zod";

const MIN_AGE = 13; // change this to 18 if you need adults only

function getAge(dateString) {
  const today = new Date();
  const birth = new Date(dateString);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must be at most 50 characters")
      .regex(
        /^[\p{L}\s'-]+$/u,
        "Only letters, spaces, apostrophes and hyphens",
      ),

    // optional: empty string is allowed, otherwise must match the rules
    username: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z0-9_]{3,20}$/,
        "3-20 characters: letters, numbers and underscores only",
      )
      .or(z.literal("")),

    email: z.string().trim().email("Invalid email address"),

    gender: z.enum(["male", "female"], {
      message: "Please select your gender",
    }),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((v) => new Date(v) <= new Date(), "Date can't be in the future")
      .refine(
        (v) => getAge(v) >= MIN_AGE,
        `You must be at least ${MIN_AGE} years old`,
      )
      .refine((v) => getAge(v) <= 120, "Please enter a valid date of birth"),

    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
