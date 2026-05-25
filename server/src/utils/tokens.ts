import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import type { IUser } from "../models/User.js";
import { env } from "../config/env.js";

export function signAccessToken(user: IUser) {
  return jwt.sign({ sub: user.id, userId: user.id, role: user.role, tenantId: user.tenant ? String(user.tenant) : undefined }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as StringValue
  });
}

export function signRefreshToken(user: IUser, tokenVersion: number) {
  return jwt.sign({ sub: user.id, tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as StringValue
  });
}
