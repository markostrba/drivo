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
