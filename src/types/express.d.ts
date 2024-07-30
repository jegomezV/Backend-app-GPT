import { User } from '../modules/users/entity/users.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
