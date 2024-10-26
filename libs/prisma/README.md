# Librería Prisma

Esta librería brinda acceso a la base de datos de un proyecto
mediante Prisma. Es una dependencia de otras librerías
(por ejemplo, [login](/TiAcideLibrerias/login))

## Instalación

Dentro de un terminal, en un projecto de NestJS vacio:

- Crea una nueva librería llamada `prisma` e ingresa `@prisma` cuando el comando te pida ingresar el alias:

    ```bash
    $ nest g library prisma
    ? What prefix would you like...: @prisma
    ```

- Esto creará una carpeta `libs/prisma` con archivos de ejemplo.
- Elimina la carpeta `libs/prisma`
- Descarga el código de esta librería dentro de la carpeta `libs/prisma` con el comando:

    ```bash
    $ git clone --depth 1 https://github.com/TiAcideLibrerias/prisma libs/prisma
    ```

- Importa `PrismaModule` dentro del archivo `src/app.module.ts` del proyecto:

    ```tsx src/app.module.ts
    import {PrismaModule} from "@prisma/prisma";
    
    @Module({
    	imports: [
    		PrismaModule,
    		// otros imports
    	],
    	// otros controllers, providers
    })
    export class AppModule {}
    ```

- Ahora necesitas inicializar y configurar Prisma en el proyecto raiz. Define tu schema, crea las migraciones, y utiliza la clase `PrismaService` de esta librería para acceder a la base de datos.


## Uso

Ver documentación en Notion.


