import { BadRequestException, Injectable } from '@nestjs/common';
import { Branch } from '../entities/branch.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class BranchRepository extends BaseRepository<Branch> {
  constructor(prisma: PrismaService) {
    super(prisma, 'sucursal'); // Matches the model name in schema.prisma
  }
  /**
   * Busca una Sucursal por su ID (método interno)
   * @param id - ID del servicio a buscar
   * @returns Sucursal no encontrado
   * @throws {BadRequestException} Si la sucursal no existe
   * @internal
   */
  async findBranchById(id: string): Promise<Branch> {
    const branch = await this.findById(id);
    if (!branch) {
      throw new BadRequestException(`Sucursal no encontrado`);
    }
    return branch;
  }
}
