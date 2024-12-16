import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceBillingDto {
  @IsNotEmpty()
  @IsString()
  consultaId: string;
}
