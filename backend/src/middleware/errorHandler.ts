import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    message: "Route not found",
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Request validation failed",
      details: error.flatten(),
    });
    return;
  }

  const apiError: ApiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, "An unexpected error occurred.");

  if (!(error instanceof ApiError)) {
    console.error("Unhandled error", error);
  }

  res.status(apiError.statusCode).json({
    message: apiError.message,
  });
}
