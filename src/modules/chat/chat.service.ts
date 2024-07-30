import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entity/chat.entity';
import { User } from '../users/entity/users.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllChats(userId: number): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getChat(id: number, userId: number): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async nextMessage(id: number, message: string): Promise<Chat | null> {
    const chat = await this.chatRepository.findOne({
      where: { id },
    });

    if (!chat) return null;

    // Lógica para manejar el próximo mensaje...
    await this.chatRepository.save(chat);

    return chat;
  }

  async deleteChat(id: number): Promise<boolean> {
    const chat = await this.chatRepository.findOne({
      where: { id },
    });

    if (!chat) return false;

    await this.chatRepository.remove(chat);

    return true;
  }

  async archiveChat(id: number): Promise<Chat | null> {
    const chat = await this.chatRepository.findOne({
      where: { id },
    });

    if (!chat) return null;

    chat.hasArchive = !chat.hasArchive;
    await this.chatRepository.save(chat);

    return chat;
  }
}
