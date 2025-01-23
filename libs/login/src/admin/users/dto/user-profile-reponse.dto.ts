import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsUUID } from 'class-validator';
import { RolResponseDto } from '../../rol/dto/rol-response.dto';

export class UserProfileResponseDto extends OmitType(CreateUserDto, [
  'password',
  'roles',
]) {
  @ApiProperty({
    name: 'id',
    type: String,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    name: 'isSuperAdmin',
    type: Boolean,
  })
  @IsBoolean()
  isSuperAdmin: boolean;

  @ApiProperty({
    name: 'roles',
    description: 'Roles del usuario',
    example: [{ id: '123e4567-e89b-12d3-a456-426614174000', name: 'admin' }],
    type: [RolResponseDto],
  })
  roles: RolResponseDto[];
}
