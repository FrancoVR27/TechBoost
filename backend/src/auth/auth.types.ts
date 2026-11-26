import type { Request } from 'express';
import type { JwtPayload } from './jwt.js';

export type Rol = 'Admin' | 'Cliente';

export type AuthUser = JwtPayload;

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
