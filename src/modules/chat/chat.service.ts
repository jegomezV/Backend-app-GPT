import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entity/chat.entity';
import { User } from '../users/entity/users.entity';
import { NewChatDto } from 'src/modules/chat/dto/new-chat.dto';
import { Message } from './entity/message.entity';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly openAiService: OpenAiService,
  ) {}

  async nextMessage(id: number, message: string): Promise<Chat | null> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    // Usa los mensajes del chat para crear la respuesta
    const initialMsg = chat.messages[1];
    const reducedChat = chat.messages.length > 4
      ? [initialMsg, ...chat.messages.slice(-3)]
      : chat.messages;

    const response = await this.openAiService.nextMessageIA(message, reducedChat);

    const userMessage = this.messageRepository.create({
      content: message,
      role: 'user',
      chat: chat,
    });

    const assistantMessage = this.messageRepository.create({
      content: response,
      role: 'assistant',
      chat: chat,
    });

    // Guarda los mensajes en la base de datos
    await this.messageRepository.save([userMessage, assistantMessage]);

    // Actualiza el chat con los nuevos mensajes
    chat.messages.push(userMessage);
    chat.messages.push(assistantMessage);

    await this.chatRepository.save(chat);

    return chat;
  }

  async getAllChats(userId: number): Promise<Chat[]> {
    console.log('getAllChats called with userId:', userId);
    const chats = await this.chatRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
    });
    console.log('ALL CHATS:', chats);
    return chats;
}

  async getChat(id: number, userId: number): Promise<Chat | null> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user', 'messages'],
      });
      console.log('SINGLE CHAT:', chat);
      return chat;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new HttpException('Error fetching chat', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteChat(id: number): Promise<boolean> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) return false;
    await this.chatRepository.remove(chat);
    return true;
  }

  async archiveChat(id: number): Promise<Chat | null> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) return null;
    chat.hasArchive = !chat.hasArchive;
    await this.chatRepository.save(chat);
    return chat;
  }

  async createChat(createChatDto: NewChatDto): Promise<Chat> {
    const { userId, title, hasArchive } = createChatDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const chat = this.chatRepository.create({
      user,
      title,
      hasArchive: hasArchive ?? false,
    });
    return this.chatRepository.save(chat);
  }
}
