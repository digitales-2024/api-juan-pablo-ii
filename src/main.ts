import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS mejorada
  const whitelist = [process.env.WEB_URL, 'http://localhost:3000'];

  const corsOptions = {
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar si el origen está en la lista blanca
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Middleware adicional para cabeceras CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (whitelist.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    next();
  });

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger basada en entorno
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Juan Pablo API')
      .setDescription('API for Juan Pablo')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    document.tags = [
      { name: 'Auth', description: 'Operations about authentication' },
      { name: 'Admin', description: 'Operations about admin' },
      { name: 'Users', description: 'Operations about users' },
      { name: 'Rol', description: 'Operations about roles' },
      { name: 'Modules', description: 'Operations about modules' },
      { name: 'Permissions', description: 'Operations about permissions' },
      { name: 'Audit', description: 'Operations about audit' },
      { name: 'Business', description: 'Operations about the business' },
      { name: 'Quotation', description: 'Operations about quotations' },
      { name: 'Levels', description: 'Operations about levels' },
    ];

    SwaggerModule.setup('api', app, document);

    app.use(
      '/reference',
      apiReference({
        spec: {
          content: document,
        },
      }),
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Log de información útil
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed origins: ${whitelist.join(', ')}`);
}

bootstrap();
