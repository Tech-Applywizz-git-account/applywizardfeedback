import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { prisma } from '../config/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // Fetch profile from DB
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile) {
      res.status(401).json({ success: false, message: 'User profile not found' });
      return;
    }

    if (!profile.isActive) {
      res.status(403).json({ success: false, message: 'Account has been disabled' });
      return;
    }

    req.user = profile;
    req.userId = profile.id;
    next();
  } catch (err) {
    next(err);
  }
};
