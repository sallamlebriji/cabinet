import { Router } from "express";
import { forgotPassword, login, logout, me, refreshToken, register, resetPassword } from "../controllers/auth.controller.js";
import { checkTenantActive, protect, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginValidator, registerValidator, resetPasswordValidator } from "../validators/auth.validators.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidator, validate, register);
authRoutes.post("/login", loginValidator, validate, login);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPasswordValidator, validate, resetPassword);
authRoutes.post("/logout", protect, scopeTenant, logout);
authRoutes.get("/me", protect, scopeTenant, checkTenantActive, me);
