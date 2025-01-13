import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsUUID } from 'class-validator';

export class UserProfileResponseDto extends OmitType(CreateUserDto, [
  'password',
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
}
