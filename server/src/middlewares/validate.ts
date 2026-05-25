import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}
