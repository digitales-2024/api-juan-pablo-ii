import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import {
  DetailedOutgoing,
  Outgoing,
  OutgoingWithStorage,
} from '../entities/outgoing.entity';
import { CreateOutgoingDto } from '../dto/create-outgoing.dto';
import { UpdateOutgoingDto } from '../dto/update-outgoing.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateOutgoingUseCase } from '../use-cases/create-outgoing.use-case';
import { UpdateOutgoingUseCase } from '../use-cases/update-outgoing.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { outgoingErrorMessages } from '../errors/errors-outgoing';
import { DeleteOutgoingDto } from '../dto';
import { DeleteOutgoingUseCase, ReactivateOutgoingUseCase } from '../use-cases';
import { CreateOutgoingDtoStorage } from '../dto/create-outgoingStorage.dto';
import { CreateTypeMovementUseCase } from '@inventory/inventory/type-movement/use-cases';
import { CreateMovementUseCase } from '@inventory/inventory/movement/use-cases';
import { StockService } from '@inventory/inventory/stock/services/stock.service';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class OutgoingService {
  private readonly logger = new Logger(OutgoingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly createOutgoingUseCase: CreateOutgoingUseCase,
    private readonly updateOutgoingUseCase: UpdateOutgoingUseCase,
    private readonly deleteOutgoingUseCase: DeleteOutgoingUseCase,
    private readonly reactivateOutgoingUseCase: ReactivateOutgoingUseCase,
    private readonly createTypeMovementUseCase: CreateTypeMovementUseCase,
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly stockService: StockService,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Outgoing',
      outgoingErrorMessages,
    );
  }

  /**
   * Crea una nueva salida
   * @param createOutgoingDto - DTO con los datos para crear la salida
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la salida creada
   * @throws {Error} Si ocurre un error al crear la salida
   */
  async create(
    createOutgoingDto: CreateOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Outgoing>> {
    try {
      return await this.createOutgoingUseCase.execute(createOutgoingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error;
    }
  }

  /**
   * Actualiza una salida existente
   * @param id - ID de la salida a actualizar
   * @param updateOutgoingDto - DTO con los datos para actualizar la salida
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la salida actualizada
   * @throws {Error} Si ocurre un error al actualizar la salida
   */
  async update(
    id: string,
    updateOutgoingDto: UpdateOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing>> {
    try {
      const currentOutgoing = await this.findById(id);

      if (!validateChanges(updateOutgoingDto, currentOutgoing)) {
        return {
          success: true,
          message: 'No se detectaron cambios en la salida',
          data: await this.outgoingRepository.findDetailedOutgoingById(id),
        };
      }

      return await this.updateOutgoingUseCase.execute(
        id,
        updateOutgoingDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca una salida por su ID
   * @param id - ID de la salida a buscar
   * @returns La salida encontrada
   * @throws {NotFoundException} Si la salida no existe
   */
  async findOne(id: string): Promise<Outgoing> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todas las salidas
   * @returns Una promesa que resuelve con una lista de todas las salidas
   * @throws {Error} Si ocurre un error al obtener las salidas
   */
  async findAll(): Promise<Outgoing[]> {
    try {
      return this.outgoingRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una salida por su ID
   * @param id - ID de la salida a buscar
   * @returns Una promesa que resuelve con la salida encontrada
   * @throws {BadRequestException} Si la salida no existe
   */
  async findById(id: string): Promise<Outgoing> {
    const outgoing = await this.outgoingRepository.findById(id);
    if (!outgoing) {
      throw new BadRequestException('Salida no encontrada');
    }
    return outgoing;
  }

  /**
   * Desactiva múltiples salidas
   * @param deleteOutgoingDto - DTO con los IDs de las salidas a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las salidas desactivadas
   * @throws {NotFoundException} Si alguna salida no existe
   */
  async deleteMany(
    deleteOutgoingDto: DeleteOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing[]>> {
    try {
      validateArray(deleteOutgoingDto.ids, 'IDs de salidas');
      return await this.deleteOutgoingUseCase.execute(deleteOutgoingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples salidas
   * @param ids - Lista de IDs de las salidas a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las salidas reactivadas
   * @throws {NotFoundException} Si alguna salida no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing[]>> {
    try {
      validateArray(ids, 'IDs de salidas');
      return await this.reactivateOutgoingUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }

  //crear ingreso de productos al alamacen
  /**
   * Crea una nueva salida de productos del almacén.
   *
   * @param createOutgoingDtoStorage - DTO que contiene los datos necesarios para crear la salida.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Una promesa que resuelve en una respuesta HTTP con un mensaje y el ID de la nueva salida.
   */
  async createOutgoing(
    createOutgoingDtoStorage: CreateOutgoingDtoStorage,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing>> {
    try {
      // Extraer los datos necesarios del DTO
      const {
        movement: movementsList,
        state,
        name,
        storageId,
        date,
      } = createOutgoingDtoStorage;
      const isIncoming = false;

      // Llamar a createIncomingUseCase y esperar el ID del registro del nuevo ingreso
      const outgoing = await this.createOutgoingUseCase.createOugoingStorage(
        createOutgoingDtoStorage,
        user,
      );

      // Llamar a createTypeMovementUseCase y esperar el ID del nuevo tipo movimiento
      const movementTypeId =
        await this.createTypeMovementUseCase.createTypeMovementStorage(
          {
            name,
            state,
            isIncoming,
          },
          user,
        );

      // Extraer los datos de movement y usarlos en createMovementStorage
      //const movementData = await this.extractProductoIdQuantity(movement);

      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        movementsList.map(async (item) => {
          const { productId, quantity } = item;

          // Llamar a createMovementStorage
          const idMovement =
            await this.createMovementUseCase.createMovementStorage(
              {
                movementTypeId,
                outgoingId: outgoing.id,
                productId,
                quantity,
                date,
                state,
              },
              user,
            );

          console.log(`Movimiento creado con ID: ${idMovement}`);
        }),
      );
      //registra y sumar ingreso al alamacen y al stock
      // Extraer los datos de movement y usarlos en createMovementStorage
      //const stockData = await this.extractProductoIdQuantity(movement);
      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        movementsList.map(async (item) => {
          const { productId, quantity } = item;

          // Llamar a createMovementStorage
          const idStock = await this.stockService.updateStockOutgoing(
            storageId,
            productId,
            quantity,
            user,
          );

          console.log(`Movimiento creado con ID: ${idStock}`);
        }),
      );
      // const data = {
      //   outgoingId,
      //   movementTypeId,
      // };
      return {
        success: true, // Código de estado HTTP 201
        message: 'Salida creada exitosamente',
        data: await this.outgoingRepository.findDetailedOutgoingById(
          outgoing.id,
        ), // El ID del nuevo ingreso
      };
      //
      //
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }
  /**
   * Extrae los IDs de productos y sus cantidades de un array de movimientos.
   *
   * @param movement - Un array de objetos que contienen `productId` y `quantity`.
   * @returns Un array de objetos con `productId` y `quantity`.
   */
  // private extractProductoIdQuantity(
  //   movement: Array<{ productId: string; quantity: number }>,
  // ): { productId: string; quantity: number }[] {
  //   return movement.map((item) => ({
  //     productId: item.productId,
  //     quantity: item.quantity,
  //   }));
  // }

  /**
   * Obtiene una salida por su ID con detalles de sus relaciones.
   *
   * @param id - ID de la salida a buscar.
   * @returns Una promesa que resuelve con la salida encontrado.
   * @throws {BadRequestException} Si la salida no existe.
   */
  async findByIdWithRelations(id: string): Promise<DetailedOutgoing[]> {
    try {
      const outgoing =
        await this.outgoingRepository.findDetailedOutgoingById(id);
      if (!outgoing) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return [outgoing];
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos las salidas con sus relaciones detalladas.
   *
   * @returns Una promesa que resuelve con una lista de salidas detallados.
   * @throws {Error} Si ocurre un error al obtener los salidas.
   */
  async findAllWithRelations(): Promise<DetailedOutgoing[]> {
    try {
      const outgoingData =
        await this.outgoingRepository.getAllDetailedOutgoing();
      if (!outgoingData) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return outgoingData;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los registros de ingreso con su respectivo almacenamiento.
   *
   * @returns {Promise<IncomingWithStorage[]>} Una promesa que resuelve con una lista de objetos IncomingWithStorage.
   * @throws {BadRequestException} Si no se encuentran datos de ingreso.
   * @throws {Error} Si ocurre un error al obtener los datos.
   */
  async getAllWithStorage(): Promise<OutgoingWithStorage[]> {
    try {
      const incomingData = await this.outgoingRepository.getAllWithStorage();
      if (!incomingData) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return incomingData;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un ingreso con almacenamiento por su ID.
   *
   * @param {string} id - El ID del ingreso a buscar.
   * @returns {Promise<IncomingWithStorage[]>} Una promesa que resuelve con un array que contiene el ingreso con almacenamiento.
   * @throws {BadRequestException} Si no se encuentra el ingreso.
   */
  async findWithStorageById(id: string): Promise<OutgoingWithStorage[]> {
    try {
      const incoming = await this.outgoingRepository.findWithStorageById(id);
      if (!incoming) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return [incoming];
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
