import { NextResponse } from "next/server";
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
export type APIErrorResponse = NextResponse<ErrorResponse>;

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
  stripeCustomerId: string;
  plan: string;
  otp: string;
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

export enum UserDialogAction {
  Default = "Settings",
  Account = "Account",
  Subscription = "Subscription",
}
