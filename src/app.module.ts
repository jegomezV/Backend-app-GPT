import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ArticlesModule,
    AuthModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
