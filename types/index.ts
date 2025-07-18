import { Models } from "node-appwrite";
import { ZodSchema } from "zod";

export type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
  status?: number;
};

export type ErrorResponse = ActionResponse<undefined> & { success: false };

export type ValidationParams<T> = {
  params?: T;
  schema?: ZodSchema<T>;
};

export type FileType = "document" | "image" | "video" | "audio" | "other";

export interface User extends Models.Document {
  $id: string;
  fullName: string;
  avatar: string;
  email: string;
  accountId: string;
}

export interface ActionType {
  label: string;
  icon: string;
  value: string;
}

export interface DocAnalytics {
  usedSpace: number;
  lastUpdate: string;
}
