import { Controller, Get, Patch, Delete, Body, Param, Req, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('/')
  async getAllChats(@Req() req: Request) {
    const user = req.user;
    console.log('USERERR:', user);

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    console.log('Calling chatService.getAllChats');
    const chats = await this.chatService.getAllChats(user.id);
    console.log('ALL CHATS:', chats);

    return { chats };
  }

  @Get('/:id')
  async getChat(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    try {
      const user = req.user;

      console.log('Requested chat ID:', id);
      console.log('USEEER !!!:', user);

      if (!user) {
        console.error('User not found');
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const chat = await this.chatService.getChat(id, user.id);
      console.log('CHAT CONTENTE:', chat);

      if (!chat) {
        console.error('Chat not found for ID:', id, 'and User ID:', user.id);
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }
      console.log('CHAT CONTENTE: 2 ', chat);
      return { chat };
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('/:id')
  async nextMessage(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const { message } = body;
    const chat = await this.chatService.nextMessage(id, message);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    return { chat };
  }

  @Delete('/:id')
  async deleteChat(@Param('id', ParseIntPipe) id: number) {
    const result = await this.chatService.deleteChat(id);

    if (!result) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { msg: 'Chat deleted' };
  }

  @Patch('/:id/archive')
  async archiveChat(@Param('id', ParseIntPipe) id: number) {
    const chat = await this.chatService.archiveChat(id);

    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { msg: 'Chat archived' };
  }
}
