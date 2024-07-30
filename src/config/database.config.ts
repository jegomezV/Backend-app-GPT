import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entity/users.entity';
import { Chat } from '../modules/chat/entity/chat.entity';
import { Message } from '../modules/chat/entity/message.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Chat, Message],
  synchronize: true,
  logging: true,
};
