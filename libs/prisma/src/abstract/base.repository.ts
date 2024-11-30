import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PrismaTransaction, QueryParams, CreateDto, UpdateDto } from '../types';

/**
 * Clase base abstracta que implementa operaciones CRUD genéricas.
 * Proporciona una capa de abstracción sobre Prisma.
 *
 * @abstract
 * @class
 * @template T - Tipo de entidad que maneja el repositorio
 */
@Injectable()
export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: keyof PrismaService,
  ) {}

  /**
   * Crea una nueva entidad en la base de datos
   * @param createDto - DTO con los datos para crear la entidad
   * @throws {ValidationError} Si los datos no son válidos
   */
  async create(createDto: CreateDto<T>): Promise<T> {
    return this.prisma.measureQuery(`create${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).create({
        data: this.mapDtoToEntity(createDto),
      }),
    );
  }

  /**
   * Busca múltiples registros con filtros opcionales
   * @param params - Parámetros de búsqueda, ordenamiento y paginación
   */
  async findMany(params?: QueryParams): Promise<T[]> {
    return this.prisma.measureQuery(`findMany${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).findMany(params),
    );
  }

  /**
   * Busca un registro por parámetros.
   * @param params - Parámetros de búsqueda.
   * @returns El registro encontrado o null si no se encuentra.
   */
  async findOne(params: QueryParams): Promise<T | null> {
    return this.prisma.measureQuery(`findOne${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).findFirst(params),
    );
  }

  /**
   * Busca un registro por su id.
   * @param id - ID del registro a buscar.
   * @param include - Relaciones a incluir.
   * @returns El registro encontrado o null si no se encuentra.
   */
  async findById(
    id: string,
    include?: Record<string, boolean>,
  ): Promise<T | null> {
    return this.prisma.measureQuery(`findById${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).findUnique({
        where: { id },
        include,
      }),
    );
  }

  /**
   * Actualiza un registro existente.
   * @param id - ID del registro a actualizar.
   * @param updateDto - DTO con los datos para actualizar.
   * @returns El registro actualizado.
   * @throws {NotFoundException} Si el registro no se encuentra.
   */
  async update(id: string, updateDto: UpdateDto<T>): Promise<T> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    }

    return this.prisma.measureQuery(`update${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).update({
        where: { id },
        data: this.mapDtoToEntity(updateDto),
      }),
    );
  }

  /**
   * Elimina un registro por su id.
   * @param id - ID del registro a eliminar.
   * @throws {NotFoundException} Si el registro no se encuentra.
   */
  async delete(id: string): Promise<T> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    }

    return await this.prisma.measureQuery(
      `delete${String(this.modelName)}`,
      () =>
        (this.prisma[this.modelName] as any).delete({
          where: { id },
        }),
    );
  }

  /**
   * Elimina múltiples registros por sus IDs.
   * @param ids - Array de IDs de los registros a eliminar
   * @returns Array con los registros eliminados
   * @throws {NotFoundException} Si alguno de los registros no se encuentra
   */
  async deleteMany(ids: string[]): Promise<T[]> {
    // Verifica que todos los registros existan
    const existingRecords = await this.findMany({
      where: { id: { in: ids } },
    });

    if (existingRecords.length !== ids.length) {
      const missingIds = ids.filter(
        (id) => !existingRecords.find((record) => record.id === id),
      );
      throw new NotFoundException(
        `${String(this.modelName)} with ids ${missingIds.join(', ')} not found`,
      );
    }

    // Elimina todos los registros y retorna los eliminados
    await this.prisma.measureQuery(`deleteMany${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).deleteMany({
        where: { id: { in: ids } },
      }),
    );

    // Retorna los registros que fueron eliminados
    return existingRecords;
  }

  /**
   * Elimina lógicamente un registro por su id.
   * @param id - ID del registro a eliminar lógicamente.
   * @returns El registro eliminado lógicamente.
   * @throws {NotFoundException} Si el registro no se encuentra.
   */
  async softDelete(id: string): Promise<T> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    }

    return this.prisma.measureQuery(`softDelete${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).update({
        where: { id },
        data: { isActive: false },
      }),
    );
  }

  /**
   * Elimina múltiples registros lógicamente
   * @param ids - Array de IDs de los registros a desactivar
   * @returns Array con los registros desactivados exitosamente
   */
  async softDeleteMany(ids: string[]): Promise<T[]> {
    // Buscar registros que existen y están activos
    const existingRecords = await this.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
    });

    // Si no hay registros activos para procesar, termina
    if (existingRecords.length === 0) {
      return [];
    }

    // Obtiene solo los IDs de los registros activos
    const activeIds = existingRecords.map((record) => record.id);

    // Actualiza todos los registros activos encontrados
    await this.prisma.measureQuery(
      `softDeleteMany${String(this.modelName)}`,
      () =>
        (this.prisma[this.modelName] as any).updateMany({
          where: { id: { in: activeIds } },
          data: { isActive: false },
        }),
    );

    // Retorna los registros que fueron desactivados
    return existingRecords;
  }

  /**
   * Reactiva un registro previamente desactivado.
   * @param id - ID del registro a reactivar
   * @returns El registro reactivado
   * @throws {NotFoundException} Si el registro no se encuentra
   */
  async reactivate(id: string): Promise<T> {
    const exists = await this.findOne({
      where: { id, isActive: false },
    });

    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found or is already active`,
      );
    }

    return this.prisma.measureQuery(`reactivate${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).update({
        where: { id },
        data: { isActive: true },
      }),
    );
  }

  /**
   * Reactiva múltiples registros previamente desactivados.
   * @param ids - Array de IDs de los registros a reactivar
   * @returns Array con los registros reactivados exitosamente
   */
  async reactivateMany(ids: string[]): Promise<T[]> {
    // Buscar registros que existen y están inactivos
    const existingRecords = await this.findMany({
      where: {
        id: { in: ids },
        isActive: false,
      },
    });

    // Si no hay registros inactivos para procesar, termina
    if (existingRecords.length === 0) {
      return [];
    }

    // Obtiene solo los IDs de los registros inactivos
    const inactiveIds = existingRecords.map((record) => record.id);

    // Reactiva todos los registros inactivos encontrados
    await this.prisma.measureQuery(
      `reactivateMany${String(this.modelName)}`,
      () =>
        (this.prisma[this.modelName] as any).updateMany({
          where: { id: { in: inactiveIds } },
          data: { isActive: true },
        }),
    );

    // Obtiene y retorna los registros reactivados
    return this.findMany({
      where: { id: { in: inactiveIds } },
    });
  }
  /**
   * Ejecuta una transacción con la base de datos.
   * @param operation - Función que contiene las operaciones a ejecutar dentro de la transacción.
   * @returns El resultado de la transacción.
   */
  async transaction<R>(
    operation: (transaction: PrismaTransaction) => Promise<R>,
  ): Promise<R> {
    return this.prisma.withTransaction(operation);
  }

  /**
   * Mapea un DTO a una entidad.
   * @param dto - DTO a mapear.
   * @returns La entidad mapeada.
   */
  protected mapDtoToEntity<D>(dto: D): any {
    return dto;
  }
}
