import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  role: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;
}
