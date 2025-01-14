import { Controller, Post, Body, Res, Req, Get, Head } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { RefreshAuth } from './decorators';

@ApiTags('Auth')
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'Login user' })
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.authService.login(loginAuthDto, res);
  }

  @ApiCreatedResponse({ description: 'Logout user' })
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    return this.authService.logout(res);
  }

  @ApiCreatedResponse({ description: 'Update password' })
  @Post('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.authService.updatePasswordTemp(updatePasswordDto, res);
  }

  @ApiCreatedResponse({ description: 'Refresh token' })
  @Post('refresh-token')
  @RefreshAuth()
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.refreshToken(req, res);
  }

  @ApiCreatedResponse({ description: 'Verify token' })
  @Get('verify')
  async verify(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.verify(req, res);
  }

  @ApiCreatedResponse({ description: 'Quick token verification' })
  @Head('verify')
  async verifyQuick(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.verifyQuick(req, res);
  }
}
