import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ArticleService } from './articles.service';
import { Chat } from '../chat/entity/chat.entity';
import { User } from '../users/entity/users.entity';
import { OpenAiService } from '../openai/openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Controller('articles')
export class ArticlesController {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    private readonly articleService: ArticleService,
    private readonly openAiService: OpenAiService,
  ) {}

  @Post('summary')
  async getSummary(@Body() body: any, @Req() req: Request) {
    const { url } = body;
    const user = req.user as User;

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!url) throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);

    const article = await this.articleService.getArticle(url);

    if (!article) throw new HttpException('Failed to parse the article, try with another link', HttpStatus.BAD_REQUEST);
    if (article.body.length < 100) throw new HttpException('Article is too short', HttpStatus.BAD_REQUEST);

    const summary = await this.openAiService.firstMessage(article.body.slice(0, 50000));

    if (!summary) throw new HttpException('Failed to summarize the article, error with the AI model', HttpStatus.INTERNAL_SERVER_ERROR);

    const chat = this.chatRepository.create({
      user: { id: user.id } as User,
      messages: [
        { content: url, role: 'user' },
        { content: summary, role: 'assistant' },
      ],
      title: article.title ?? article.body.slice(0, 20),
    });

    console.log('CHAT CONTROLLER:', chat);
    console.log('CHAT MESSAGES:', chat.messages);

    try {
      await this.chatRepository.save(chat);
      
      // Verificar que el chat se guardó correctamente
      const savedChat = await this.chatRepository.findOneBy({ id: chat.id });
      if (!savedChat) {
        throw new Error('El chat no se guardó correctamente en la base de datos');
      }
    
      console.log('Chat guardado correctamente:', savedChat);
    } catch (error) {
      console.error('Error al guardar el chat en la base de datos:', error);
      throw new HttpException('No se pudo guardar el chat en la base de datos', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return chat;
  }
}
