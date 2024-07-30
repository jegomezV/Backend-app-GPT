import { Controller, Get, Patch, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/')
  async getAllChats(@Req() req: Request) {
    const user = req.user;
    console.log('User:', user);

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.chatService.getAllChats(user.id);
  }

  @Get('/:id')
  async getChat(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;

    const chat = await this.chatService.getChat(Number(id), user.id);

    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { chat };
  }

  @Patch('/:id')
  async nextMessage(@Param('id') id: string, @Body() body: any) {
    const { message } = body;

    const chat = await this.chatService.nextMessage(Number(id), message);

    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { chat };
  }

  @Delete('/:id')
  async deleteChat(@Param('id') id: string) {
    const result = await this.chatService.deleteChat(Number(id));

    if (!result) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { msg: 'Chat deleted' };
  }

  @Patch('/:id/archive')
  async archiveChat(@Param('id') id: string) {
    const chat = await this.chatService.archiveChat(Number(id));

    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    return { msg: 'Chat archived' };
  }
}
