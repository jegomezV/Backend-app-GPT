import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Article } from '../modules/articles/entity/article.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Article],
  synchronize: true,
  logging: true,
};
