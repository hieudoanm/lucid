import { INestApplication, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3000;

const buildDocument = (app: INestApplication) => {
  app.setGlobalPrefix('v1');
  app.enableVersioning({ type: VersioningType.URI });

  const config = new DocumentBuilder()
    .setTitle('Micro Core Banking')
    .setDescription('Micro Core Banking API')
    .setVersion('0.1')
    .addTag('Accounts')
    .addTag('Transactions')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api/docs', app, documentFactory);
};

const bootstrap = async () => {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.use(compression());
  app.use(cookieParser());
  app.use(helmet());
  buildDocument(app);
  await app.listen(PORT);
};

bootstrap().catch((error) =>
  console.error('Error during app bootstrap:', error),
);
