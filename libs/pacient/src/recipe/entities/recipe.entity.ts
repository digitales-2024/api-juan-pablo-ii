// entities/recipe.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class Recipe {
  @ApiProperty()
  id: string;

  @ApiProperty()
  updateHistoriaId: string;

  @ApiProperty()
  sucursalId: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  pacienteId: string;

  @ApiProperty()
  fechaRegistro: Date;

  @ApiProperty()
  receta: string;

  @ApiProperty()
  descripcion?: string;

  @ApiProperty()
  ordenCompraId?: string;
}
