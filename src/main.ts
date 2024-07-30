import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  app.enableCors();

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
