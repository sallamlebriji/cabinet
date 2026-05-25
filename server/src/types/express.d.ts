import type { IUser } from "../models/User.js";
import type { ITenant } from "../models/Tenant.js";
import type { ISubscription } from "../models/Subscription.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenant?: ITenant;
      tenantId?: string;
      subscription?: ISubscription | null;
    }
  }
}

export {};
