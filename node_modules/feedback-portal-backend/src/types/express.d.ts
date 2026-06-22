import { Profile } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Profile;
      userId?: string;
    }
  }
}
