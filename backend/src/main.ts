import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  // Global API prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'https://futsal.webtezza.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation
=======
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

>>>>>>> 94bed344dab7862169a2fdbc300ef6882d81b191
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

<<<<<<< HEAD
  // Swagger configuration
=======
>>>>>>> 94bed344dab7862169a2fdbc300ef6882d81b191
  const config = new DocumentBuilder()
    .setTitle('Futsal Booking API')
    .setDescription('Futsal & Sports Booking Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
<<<<<<< HEAD

  SwaggerModule.setup('api/docs', app, document);

  // Hostinger provides PORT automatically in many Node.js deployments
  const port = process.env.PORT || 3001;

  // Listen on all network interfaces
  await app.listen(port, '0.0.0.0');

  console.log(`Application running on port ${port}`);
  console.log(`API available at /api`);
  console.log(`Swagger docs available at /api/docs`);
}

bootstrap();
=======
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}/api`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
>>>>>>> 94bed344dab7862169a2fdbc300ef6882d81b191
