import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Auth } from '../auth/decorators';
import { UpdateUserDto } from './dto';
import { SendEmailDto } from './dto/send-email.dto';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserData, UserPayload } from '@login/login/interfaces';
import { DeleteUsersDto } from './dto/delete-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@ApiTags('Users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBadRequestResponse({ description: 'Bad request' })
@Controller({
  path: 'users',
  version: '1',
})
@Auth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}
  @ApiOkResponse({
    description: 'Usuarios obtenidos correctamente',
    type: [UserResponseDto],
  })
  @Get()
  findAll(@GetUser() user: UserPayload): Promise<UserResponseDto[]> {
    return this.usersService.findAll(user);
  }

  @ApiOkResponse({
    description: 'Usuario obtenido correctamente',
    type: [UserResponseDto],
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @ApiOkResponse({
    description: 'Usuario creado correctamente',
    type: BaseApiResponse<UserResponseDto>,
  })
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UserResponseDto>> {
    return this.usersService.create(createUserDto, user);
  }

  @ApiOkResponse({
    description: 'Usuario actualizado correctamente',
    type: BaseApiResponse<UserResponseDto>,
  })
  @Patch(':id')
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UserResponseDto>> {
    return this.usersService.update(updateUserDto, id, user);
  }

  @ApiOkResponse({
    description: 'Usuario eliminado correctamente',
    type: BaseApiResponse<null>,
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<null>> {
    return this.usersService.remove(id, user);
  }

  @ApiOkResponse({ description: 'Users deactivated' })
  @Delete('deactivate/all')
  deactivate(
    @Body() users: DeleteUsersDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<null>> {
    return this.usersService.deactivate(users, user);
  }

  @ApiOkResponse({ description: 'Users reactivated' })
  @Patch('reactivate/all')
  reactivateAll(@GetUser() user: UserData, @Body() users: DeleteUsersDto) {
    return this.usersService.reactivateAll(user, users);
  }

  @ApiOkResponse({
    description: 'User reactivated',
    type: BaseApiResponse<null>,
  })
  @Patch('reactivate/:id')
  reactivate(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<null>> {
    return this.usersService.reactivate(id, user);
  }

  @ApiOkResponse({
    description: 'Contraseña generada correctamente',
    type: BaseApiResponse<{ password: string }>,
  })
  @Post('generate-password')
  generatePassword(): Promise<BaseApiResponse<{ password: string }>> {
    return this.usersService.generatePassword();
  }

  @ApiOkResponse({
    description: 'Nueva contraseña enviada correctamente',
    type: BaseApiResponse<null>,
  })
  @Post('send-new-password')
  sendNewPassword(
    @Body() sendEmailDto: SendEmailDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<null>> {
    return this.usersService.sendNewPassword(sendEmailDto, user);
  }
}
