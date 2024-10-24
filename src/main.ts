import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // Importar cookieParser
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';// Importar swagger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS con configuración específica
  app.enableCors({
    origin: process.env.WEB_URL,
    credentials: true,
  });

  // Usar cookie-parser para parsear cookies en las solicitudes
  app.use(cookieParser());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API') // Título de la documentación
    .setDescription('API description') // Descripción de la API
    .setVersion('1.0') // Versión de la API
    .addTag('API') // Etiqueta general para la API
    .build();

  // Crear el documento Swagger
  const document = SwaggerModule.createDocument(app, config);

  // Definir etiquetas específicas para la documentación
  document.tags = [
    { name: 'Auth', description: 'Operations about authentication' },
    { name: 'Admin', description: 'Operations about admin' },
    { name: 'Users', description: 'Operations about users' },
    { name: 'Rol', description: 'Operations about roles' },
    { name: 'Modules', description: 'Operations about modules' },
    { name: 'Permissions', description: 'Operations about permissions' },
    { name: 'Audit', description: 'Operations about audit' },
  ];

  // Configurar la ruta para acceder a la documentación Swagger
  SwaggerModule.setup('login', app, document);

  // Iniciar la aplicación en el puerto especificado en .env
  await app.listen(parseInt(process.env.PORT));
}
bootstrap();
