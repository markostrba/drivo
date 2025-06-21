import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "./http-errors";
import { ValidationParams } from "@/types/global";

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
