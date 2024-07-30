import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = (typeof req.query.token === 'string' ? req.query.token : null) || 
                  (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]);

    // Imprimir el JWT en la terminal
    console.log('Authorization Header:', authHeader);
    console.log('Request Body:', req.body);
    console.log('Token from query:', req.query.token);
    console.log('Extracted Token TOKEEEEEEEEN:', token);

    if (token) {
      try {
        const user = await this.authService.validateUser(token);

        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }

        req.user = user;
        return next();
      } catch (err) {
        return res.status(401).json({ msg: 'Invalid Token: ' + err.message });
      }
    }

    return res.status(401).json({ msg: 'Token not provided' });
  }
}
