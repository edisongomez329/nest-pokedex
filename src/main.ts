import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,

      //convierte los datos recibidos en nuestros end-points, toca tener cuidado de usarlos por que esto hace que sea mas el consumo de memoria
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  await app.listen(process.env.PORT);
  console.log(`Aplication running on PORT ${process.env.PORT}`);
}
bootstrap();
