import { Controller, Post, Body, Res, HttpStatus, Param, Get, Put, Headers } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { AuthenticateUserDto } from '../../common/dto/authenticate-user.dto';
import { ResetPasswordDto } from '../../common/dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const { email } = createUserDto;
    const existUser = await this.usersService.findByEmail(email);
  
    if (existUser) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Email already registered', error: true });
    }
  
    try {
      const user = await this.usersService.create(createUserDto);
      const token = this.usersService.generateToken(); // Generar el token
      user.token = token; // Asignar el token al usuario
      await this.usersService.save(user); // Guardar el usuario con el token
      await this.authService.sendRegistrationEmail(user); // Enviar el token en el correo electrónico
      return res.json({ msg: 'User created correctly, check your email to confirm the account', user });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong', error: true });
    }
  }

  @Post('authenticate')
  async authenticate(@Body() authenticateUserDto: AuthenticateUserDto, @Res() res: Response) {
    const { email, password } = authenticateUserDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ msg: 'User not found', error: true });
    }

    if (!user.confirm) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ msg: 'Your account is not confirmed', error: true });
    }

    if (await this.usersService.checkPassword(user, password)) {
      const token = await this.authService.generateToken(user.id);
      return res.json({ id: user.id, name: user.name, email: user.email, token });
    } else {
      return res.status(HttpStatus.FORBIDDEN).json({ msg: 'Incorrect password', error: true });
    }
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string, @Res() res: Response) {
  console.log("Received token:", token);

  const userConfirm = await this.usersService.findByToken(token);
  console.log("User found:", userConfirm);
  console.log("Received token:", token);

  if (!userConfirm) {
    console.log("Invalid token");
    return res.status(HttpStatus.FORBIDDEN).json({ msg: 'Invalid Token', error: true });
  }

  try {
    userConfirm.confirm = true;
    userConfirm.token = ""; // Clear the token after confirmation
    console.log("User confirmation status updated:", userConfirm);

    await this.usersService.save(userConfirm); // Save the user with the updated confirmation status
    console.log("User saved successfully");

    return res.json({ msg: 'User confirmed correctly' });
  } catch (err) {
    console.error('Error confirming user:', err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong', error: true });
  }
}

  @Post('lost-password')
  async lostPwd(@Body('email') email: string, @Res() res: Response) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ msg: 'User not exist', error: true });
    }

    try {
      // await this.usersService.generateResetToken(user);
      await this.authService.sendResetPasswordEmail(user);
      return res.json({ msg: 'We have sent an email with instructions' });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong', error: true });
    }
  }

  @Get('check-token/:token')
  async checkToken(@Param('token') token: string, @Res() res: Response) {
    const validToken = await this.usersService.findByToken(token);

    if (validToken) {
      return res.json({ msg: 'Token is valid and the user exist' });
    } else {
      return res.status(HttpStatus.NOT_FOUND).json({ msg: 'Invalid token', error: true });
    }
  }

  @Put('reset-password/:token')
  async newPwd(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    const user = await this.usersService.findByToken(token);

    if (user) {
      try {
        await this.usersService.resetPassword(user, resetPasswordDto.password);
        return res.json({ msg: 'Password has been changed successfully' });
      } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong', error: true });
      }
    } else {
      return res.status(HttpStatus.NOT_FOUND).json({ msg: 'Invalid token', error: true });
    }
  }

  @Get('profile')
  async profile(@Headers('authorization') authHeader: string, @Res() res: Response) {
    const token = authHeader?.split(' ')[1];
    const user = await this.authService.getUserFromToken(token);
    return res.status(HttpStatus.OK).json({ user });
  }
}
