import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/users.entity';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    return user.checkPassword(password);
  }

  async findByToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { token },
    });
  }

  async confirmUser(user: User): Promise<void> {
    user.confirm = true;
    await this.userRepository.save(user);
  }

  async resetPassword(user: User, newPassword: string): Promise<void> {
    user.password = newPassword; // Ensure password is hashed
    await this.userRepository.save(user);
  }

  generateToken(): string {
    return uuidv4(); // Generar un token único
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
