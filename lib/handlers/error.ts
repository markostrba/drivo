import { RequestError, ValidationError } from "../http-errors";
import { ZodError } from "zod";

const formatResponse = (
  statusCode: number,
  message: string,
  // eslint-disable-next-line prettier/prettier
  errors?: Record<string, string[]> | undefined
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
      // eslint-disable-next-line prettier/prettier
      error.flatten().fieldErrors as Record<string, string[]>
    );

    return formatResponse(
      validationError.statusCode,
      validationError.message,
      // eslint-disable-next-line prettier/prettier
      validationError.errors
    );
  }
  if (error instanceof Error) {
    return formatResponse(500, error.message);
  }
  return formatResponse(500, "An unexpected error occurred");
};
export default handleError;
