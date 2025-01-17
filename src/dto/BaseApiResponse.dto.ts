import { ApiProperty } from '@nestjs/swagger';

export class BaseApiResponse<T> {
  @ApiProperty({ description: 'Estado de la operación' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  message: string;

  @ApiProperty({ description: 'Datos de la respuesta' })
  data: T;
}
