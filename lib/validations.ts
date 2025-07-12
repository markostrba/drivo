import { z } from "zod";

export const SignUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, {
      message: "Full name must be at least 2 characters",
    })
    .transform((val) => val.trim()),
  email: z.string().email({ message: "Invalid email" }),
});

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

export const VerifyEmailOTPSchema = z.object({
  accountId: z.string(),
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const SendEmailOTPSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

export const GetFilesSchema = z.object({
  currentUserId: z.string(),
  currentUserEmail: z.string().email({ message: "Invalid email" }),
  type: z.array(z.enum(["document", "image", "video", "audio", "other"])),
  searchText: z.string().optional(),
});

export const RenameFileSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  extension: z.string(),
  pathname: z.string(),
});

export const ShareFileSchema = z.object({
  fileId: z.string(),
  email: z.string().email(),
  pathname: z.string(),
});

export const DeleteFileSchema = z.object({
  fileId: z.string(),
  userId: z.string(),
  bucketFileId: z.string(),
  pathname: z.string(),
});
