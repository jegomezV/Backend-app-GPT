import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entity/users.entity';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface EmailData {
  email: string;
  name: string;
  token: string;
}

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = this.createTransporter();
  }

  private createTransporter() {
    return nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  private async decodeToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async findUserById(id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async validateUser(token: string): Promise<User | null> {
    const decoded = await this.decodeToken(token);
    return this.findUserById(Number(decoded.id));
  }

  async generateToken(userId: number): Promise<string> {
    const payload = { id: userId.toString() };
    return this.jwtService.sign(payload);
  }

  private async sendEmail(data: EmailData, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"Article Summarizer - Admin" <correo@articleSummarizer.com>',
        to: data.email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendRegistrationEmail(user: User) {
    const emailData: EmailData = {
      email: user.email,
      name: user.name,
      token: user.token,
    };
    console.log('User properties and values: AAAAAA', user);
    const html = `
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Hi: ${emailData.name} confirm your account on Article Summarizer</p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Your account is almost ready. You just have to confirm it by clicking the link below:</p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;"><a href="${this.configService.get<string>('FRONTEND_URL')}/auth/confirm/${emailData.token}" style="text-decoration: none; color: #007bff;">Confirm my account</a></p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">If you didn't create this account, you can ignore this message.</p>
    `;
    await this.sendEmail(emailData, 'Article Summarizer - Confirm your account', html);
  }

  async sendResetPasswordEmail(user: User) {
    const token = await this.generateToken(user.id);
    const emailData: EmailData = {
      email: user.email,
      name: user.name,
      token,
    };
    const html = `
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Hi: ${emailData.name}, you requested to reset your password on Article Summarizer</p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">You can reset your password by clicking the link below:</p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;"><a href="${this.configService.get<string>('FRONTEND_URL')}auth/reset-password/${emailData.token}" style="text-decoration: none; color: #007bff;">Reset my password</a></p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">If you didn't request this, you can ignore this message.</p>
    `;
    await this.sendEmail(emailData, 'Article Summarizer - Reset your password', html);
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const decoded = await this.decodeToken(token);
    return this.findUserById(Number(decoded.id));
  }
}
