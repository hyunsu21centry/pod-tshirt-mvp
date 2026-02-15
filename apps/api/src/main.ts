import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder().setTitle('POD MVP API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.API_PORT || 4000);
}

bootstrap();
