import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "./http-errors";
import { ValidationParams } from "@/types/global";
import { appwriteConfig } from "./appwrite/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function validate<T>({
  params,
  schema,
}: ValidationParams<T>): Promise<
  { params: T; schema: ZodSchema<T> } | ValidationError | Error
> {
  if (schema && params) {
    try {
      schema.parse(params);
      return { params, schema };
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>,
        );
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  return new Error("No schema or params provided");
}

export function getFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return { type: "other", extension: "" };

  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "xls",
    "xlsx",
    "csv",
    "rtf",
    "ods",
    "ppt",
    "odp",
    "md",
    "html",
    "htm",
    "epub",
    "pages",
    "fig",
    "psd",
    "ai",
    "indd",
    "xd",
    "sketch",
    "afdesign",
    "afphoto",
    "afphoto",
  ];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];

  if (documentExtensions.includes(extension))
    return { type: "document", extension };
  if (imageExtensions.includes(extension)) return { type: "image", extension };
  if (videoExtensions.includes(extension)) return { type: "video", extension };
  if (audioExtensions.includes(extension)) return { type: "audio", extension };

  return { type: "other", extension };
}

export function generateImageUrl(bucketFieldId: string) {
  return `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFieldId}/view?project=${appwriteConfig.projectId}`;
}

export function convertFileToUrl(file: File) {
  return URL.createObjectURL(file);
}
