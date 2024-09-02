import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class NewChatDto {
  @IsNumber()
  userId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  hasArchive?: boolean;
}
