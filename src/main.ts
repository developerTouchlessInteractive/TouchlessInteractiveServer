import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogService } from './logger/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LogService(),
  });
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('Touchless-Interactive Flow')
    .setDescription('CRUD APIs for flow-stage-task')
    .setVersion('1.0')
    .addTag('Creating --> Task  Stage Flow')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
