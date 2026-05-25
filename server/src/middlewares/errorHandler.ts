import { StatusCodes } from "http-status-codes";
import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const notFound: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    message: err.message ?? "Erreur serveur",
    stack: env.nodeEnv === "development" ? err.stack : undefined
  });
};
