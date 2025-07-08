import { RequestError, ValidationError } from "../http-errors";
import { ZodError } from "zod";

const formatResponse = (
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

  return { statusCode, ...response };
};
const handleError = (error: unknown) => {
  if (error instanceof RequestError) {
    return formatResponse(error.statusCode, error.message, error.errors);
  }
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>,
    );

    return formatResponse(
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }
  if (error instanceof Error) {
    return formatResponse(500, error.message);
  }
  return formatResponse(500, "An unexpected error occurred");
};
export default handleError;
