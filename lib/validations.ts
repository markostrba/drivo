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
  userId: z.string().optional(),
});

export const GetFilesSchema = z.object({
  currentUserId: z.string(),
  currentUserEmail: z.string().email({ message: "Invalid email" }),
  type: z.array(z.enum(["document", "image", "video", "audio", "other"])),
  searchText: z.string().optional(),
  sort: z.string().optional(),
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

export const UpdateAvatarSchema = z.object({
  newAvatar: z
    .any()
    .refine((file): file is File => file instanceof File, {
      message: "Invalid input: not a file.",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File is too large. Max size is 5MB.",
    })
    .refine(
      (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      {
        message:
          "Invalid file type. Only PNG, JPG, and JPEG files are allowed.",
      },
    ),
  pathname: z.string(),
});

export const UpdateEmailSchema = z.object({
  newEmail: z.string().email({ message: "Invalid email" }),
  pathname: z.string(),
  userId: z.string(),
  otp: z.string(),
});
