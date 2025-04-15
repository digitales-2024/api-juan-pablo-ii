import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { handleException } from '@login/login/utils';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Inicia la sesión del usuario
   * @param loginAuthDto  Datos para iniciar sesión
   * @param res  Respuesta HTTP
   */
  async login(loginAuthDto: LoginAuthDto, res: Response): Promise<void> {
    try {
      const { email, password } = loginAuthDto;

      // Buscamos el usuario por email
      const userDB = await this.userService.findByEmail(email);

      if (!userDB) {
        throw new NotFoundException('User not registered');
      }

      // Comparamos la contraseña ingresada con la contraseña encriptada
      if (!bcrypt.compareSync(password, userDB.password)) {
        throw new UnauthorizedException('Password incorrect');
      }

      // Actualizamos el ultimo login del usuario
      await this.userService.updateLastLogin(userDB.id);

      // Genera el token
      const token = this.getJwtToken({ id: userDB.id });

      // Configura la cookie HttpOnly
      res.cookie('access_token', token, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get('COOKIE_EXPIRES_IN'),
        domain: process.env.WEB_DOMAIN,
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_EXPIRES_IN'),
        ),
      });

      res.cookie('logged_in', true, {
        httpOnly: false,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        maxAge: this.configService.get('COOKIE_EXPIRES_IN'),
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_EXPIRES_IN'),
        ),
      });

      // Genera el refresh token
      const refreshToken = this.getJwtRefreshToken({ id: userDB.id });

      // Configura la cookie HttpOnly para el refresh token
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get('COOKIE_REFRESH_EXPIRES_IN'), // Asegúrate de que esta configuración exista
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_REFRESH_EXPIRES_IN'),
        ),
      });

      // Buscar branchId si es necesario
      let branchId: string | null = null;
      let isStaff = false;

      // Todos los usuarios que no son superAdmin intentamos buscarlos como personal
      if (!userDB.isSuperAdmin) {
        this.logger.log(
          `Usuario ${userDB.email} no es superAdmin, buscando como staff...`,
        );

        const staff = await this.prisma.staff.findFirst({
          where: {
            userId: userDB.id,
            isActive: true,
          },
          select: {
            id: true,
            branchId: true,
            name: true,
          },
        });

        if (staff) {
          isStaff = true;
          branchId = staff.branchId;
          this.logger.log(
            `Usuario ${userDB.email} encontrado como staff: ${staff.name}, branchId: ${branchId}`,
          );
        } else {
          this.logger.log(
            `Usuario ${userDB.email} no tiene perfil de staff asociado`,
          );
        }
      } else {
        this.logger.log(
          `Usuario ${userDB.email} es superAdmin, no requiere branchId`,
        );
      }

      // Datos de contexto para el logging
      console.log(
        'CONTEXTO DE AUTENTICACIÓN:',
        JSON.stringify(
          {
            userId: userDB.id,
            email: userDB.email,
            isSuperAdmin: userDB.isSuperAdmin,
            isStaff: isStaff,
            branchId: branchId,
            roles: userDB.roles,
          },
          null,
          2,
        ),
      );

      res.json({
        id: userDB.id,
        name: userDB.name,
        email: userDB.email,
        phone: userDB.phone,
        isSuperAdmin: userDB.isSuperAdmin,
        roles: userDB.roles,
        token: token,
        branchId, // Esto ya estaba implementado correctamente
        isStaff, // Añadimos esta información adicional
      });
    } catch (error) {
      this.logger.error(
        `Error logging in for email: ${loginAuthDto.email}`,
        error.stack,
      );
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      handleException(error, 'Error logging in');
    }
  }

  /**
   * Cierra la sesión del usuario
   * @param res Respuesta HTTP
   */
  async logout(res: Response): Promise<void> {
    // Borra la cookie que contiene el token JWT
    res.cookie('access_token', '', {
      httpOnly: true,
      domain: process.env.WEB_DOMAIN,
      expires: new Date(0), // Establece la fecha de expiración a una fecha pasada para eliminar la cookie
    });

    // Borra la cookie que contiene el refresh token
    res.cookie('refresh_token', '', {
      httpOnly: true,
      domain: process.env.WEB_DOMAIN,
      expires: new Date(0), // Establece la fecha de expiración a una fecha pasada para eliminar la cookie
    });

    // Borra la cookie que indica que el usuario está logueado
    res.cookie('logged_in', '', {
      httpOnly: false,
      domain: process.env.WEB_DOMAIN,
      expires: new Date(0), // Establece la fecha de expiración a una fecha pasada para eliminar la cookie
    });

    // Enviar una respuesta de éxito
    res.status(200).json({ message: 'Logout successful' });
  }

  /**
   * Actualiza la contraseña temporal del usuario
   * @param updatePasswordDto Datos para actualizar la contraseña
   * @returns Datos del usuario logueado
   */
  async updatePasswordTemp(
    updatePasswordDto: UpdatePasswordDto,
    res: Response,
  ): Promise<void> {
    try {
      const { email, password, newPassword, confirmPassword } =
        updatePasswordDto;

      const userDB = await this.userService.findByEmail(email);

      const isPasswordMatching = await bcrypt.compare(
        password,
        userDB.password,
      );

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Password current do not match');
      }

      if (newPassword === password) {
        throw new ForbiddenException(
          'The new password must be different from the current one',
        );
      }

      if (newPassword !== confirmPassword) {
        throw new ForbiddenException('Passwords do not match');
      }

      await this.userService.updatePasswordTemp(userDB.id, updatePasswordDto);

      // Genera el token
      const token = this.getJwtToken({ id: userDB.id });

      // Configura la cookie HttpOnly
      res.cookie('access_token', token, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get('COOKIE_EXPIRES_IN'),
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_EXPIRES_IN'),
        ),
      });

      // Genera el refresh_token
      const refreshToken = this.getJwtRefreshToken({ id: userDB.id });

      // Configura la cookie HttpOnly
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get('COOKIE_REFRESH_EXPIRES_IN'),
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_REFRESH_EXPIRES_IN'),
        ),
      });

      res.json({
        id: userDB.id,
        name: userDB.name,
        email: userDB.email,
        phone: userDB.phone,
        isSuperAdmin: userDB.isSuperAdmin,
        roles: userDB.roles,
      });
    } catch (error) {
      this.logger.error('Error updating password', error.stack);
      handleException(error, 'Error updating password');
    }
  }

  /**
   * Genera un access_token JWT
   * @param payload Payload para generar el token
   * @returns  Token generado
   */
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
    return token;
  }

  /**
   * Genera un refresh_token JWT
   * @param payload Payload para generar el token
   * @returns  Token generado
   */
  private getJwtRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  /**
   * Verifica si el token es válido
   * @param token Token a verificar
   * @returns  Datos del token
   */
  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  /**
   * Verifica si el refresh_token es válido
   * @param token Token a verificar
   * @returns  Datos del token
   */
  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * Actualizar un token JWT
   * @param res Respuesta HTTP
   * @param req Petición HTTP
   * @returns Datos del usuario logueado
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const message = 'Could not refresh access token';
      const refresh_token = req.cookies.refresh_token as string;
      const payload = this.verifyRefreshToken(refresh_token);

      if (!payload) {
        throw new UnauthorizedException(message);
      }

      // Verifica si el usuario existe en la base de datos y si está activo
      const userDB = await this.userService.findById(payload.id);

      if (!userDB) {
        throw new UnauthorizedException(message);
      }

      if (!userDB.isActive) {
        throw new UnauthorizedException(message);
      }

      const newAccessToken = this.getJwtToken({ id: payload.id });

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get<number>('COOKIE_EXPIRES_IN'), // tiempo corto para el access_token
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_EXPIRES_IN'),
        ),
      });

      const newRefreshToken = this.getJwtRefreshToken({ id: payload.id });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        path: '/',
        maxAge: this.configService.get<number>('COOKIE_REFRESH_EXPIRES_IN'), // tiempo largo para el refresh_token
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_REFRESH_EXPIRES_IN'),
        ),
      });

      res.cookie('logged_in', true, {
        httpOnly: false,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging',
        domain: process.env.WEB_DOMAIN,
        sameSite: 'strict',
        maxAge: this.configService.get('COOKIE_EXPIRES_IN'),
        expires: new Date(
          Date.now() + this.configService.get('COOKIE_EXPIRES_IN'),
        ),
      });

      res.status(200).json({
        status: 'success',
        access_token: newAccessToken,
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const access_token = req.cookies.access_token;
      const refresh_token = req.cookies.refresh_token;

      if (!access_token) {
        if (!refresh_token) {
          throw new UnauthorizedException('No token provided');
        }

        // Si no hay access token pero hay refresh token, intentar refresh
        return this.refreshToken(req, res);
      }

      try {
        // Verificar el token
        const payload = this.verifyToken(access_token);

        // Verificar si el usuario existe y está activo
        const userDB = await this.userService.findById(payload.id);

        if (!userDB) {
          throw new UnauthorizedException('Usuario no encontrado');
        }

        if (!userDB.isActive) {
          throw new UnauthorizedException('Usuario inactivo');
        }

        // Devolver información del usuario
        res.json({
          id: userDB.id,
          name: userDB.name,
          email: userDB.email,
          phone: userDB.phone,
          isSuperAdmin: userDB.isSuperAdmin,
          roles: userDB.roles,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Si el token no es válido o está expirado, intentar refresh
        if (refresh_token) {
          return this.refreshToken(req, res);
        }

        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      this.logger.error('Error verificando token:', error.stack);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      handleException(error, 'Error verificando token');
    }
  }

  async verifyQuick(req: Request, res: Response): Promise<void> {
    try {
      const access_token = req.cookies.access_token;

      if (!access_token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload = this.verifyToken(access_token);
        const userDB = await this.userService.findById(payload.id);

        if (!userDB || !userDB.isActive) {
          throw new UnauthorizedException('Invalid user');
        }

        res.sendStatus(200);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      this.logger.error('Error en verificación rápida:', error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      handleException(error, 'Error en verificación rápida');
    }
  }
}
