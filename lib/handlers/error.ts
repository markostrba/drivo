import { NextResponse } from "next/server";
import { RequestError, ValidationError } from "../http-errors";
import { ZodError } from "zod";

type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
) => {
  const response = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(response, { status: statusCode })
    : { statusCode, ...response };
};
const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );
  }
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>,
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }
  if (error instanceof Error) {
    return formatResponse(responseType, 500, error.message);
  }
  return formatResponse(responseType, 500, "An unexpected error occurred");
};
export default handleError;
