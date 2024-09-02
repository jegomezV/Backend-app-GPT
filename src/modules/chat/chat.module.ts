import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entity/chat.entity';
import { Message } from './entity/message.entity';
import { UsersModule } from '../users/users.module';
import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]),
  UsersModule,
  OpenAiModule,
],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
