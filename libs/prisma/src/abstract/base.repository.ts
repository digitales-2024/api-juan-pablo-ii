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
  async delete(id: string): Promise<void> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    }

    await this.prisma.measureQuery(`delete${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).delete({
        where: { id },
      }),
    );
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

  /**
   * Valida que una entidad con el id proporcionado exista.
   * @param id - ID de la entidad a validar.
   * @throws {NotFoundException} Si la entidad no se encuentra.
   */
  protected async validateExists(id: string): Promise<void> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundException(
        `${String(this.modelName)} with id ${id} not found`,
      );
    }
  }
}
