import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: ['system', 'user', 'assistant'],
  })
  role: 'system' | 'user' | 'assistant';

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;
}
