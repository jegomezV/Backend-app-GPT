import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticleService } from './articles.service';
import { Chat } from '../chat/entity/chat.entity';
import { User } from '../users/entity/users.entity';
import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    OpenAiModule,
    HttpModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticlesModule {}
