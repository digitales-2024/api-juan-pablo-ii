import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import {
  DetailedIncoming,
  Incoming,
  IncomingWithStorage,
} from '../entities/incoming.entity';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { UpdateIncomingDto } from '../dto/update-incoming.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateIncomingUseCase } from '../use-cases/create-incoming.use-case';
import { UpdateIncomingUseCase } from '../use-cases/update-incoming.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { incomingErrorMessages } from '../errors/errors-incoming';
import { DeleteIncomingDto } from '../dto';
import { DeleteIncomingUseCase, ReactivateIncomingUseCase } from '../use-cases';
import { CreateIncomingDtoStorage } from '../dto/create-incomingStorage.dto';
import { CreateTypeMovementUseCase } from '@inventory/inventory/type-movement/use-cases';
import { CreateMovementUseCase } from '@inventory/inventory/movement/use-cases';
import { StockService } from '@inventory/inventory/stock/services/stock.service';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class IncomingService {
  private readonly logger = new Logger(IncomingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly createIncomingUseCase: CreateIncomingUseCase,
    private readonly updateIncomingUseCase: UpdateIncomingUseCase,
    private readonly deleteIncomingUseCase: DeleteIncomingUseCase,
    private readonly reactivateIncomingUseCase: ReactivateIncomingUseCase,
    private readonly createTypeMovementUseCase: CreateTypeMovementUseCase,
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly stockService: StockService,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Incoming',
      incomingErrorMessages,
    );
  }

  /**
   * Crea un nuevo ingreso
   * @param createIncomingDto - DTO con los datos para crear el ingreso
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el ingreso creado
   * @throws {Error} Si ocurre un error al crear el ingreso
   */
  async create(
    createIncomingDto: CreateIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Incoming>> {
    try {
      return await this.createIncomingUseCase.execute(createIncomingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un ingreso existente
   * @param id - ID del ingreso a actualizar
   * @param updateIncomingDto - DTO con los datos para actualizar el ingreso
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el ingreso actualizado
   * @throws {Error} Si ocurre un error al actualizar el ingreso
   */
  async update(
    id: string,
    updateIncomingDto: UpdateIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming>> {
    try {
      const currentIncoming = await this.findById(id);

      if (!validateChanges(updateIncomingDto, currentIncoming)) {
        return {
          success: true,
          message: 'No se detectaron cambios en el ingreso',
          data: await this.incomingRepository.findDetailedIncomingById(id),
        };
      }

      return await this.updateIncomingUseCase.execute(
        id,
        updateIncomingDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un ingreso por su ID
   * @param id - ID del ingreso a buscar
   * @returns El ingreso encontrado
   * @throws {NotFoundException} Si el ingreso no existe
   */
  async findOne(id: string): Promise<Incoming> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los ingresos
   * @returns Una promesa que resuelve con una lista de todos los ingresos
   * @throws {Error} Si ocurre un error al obtener los ingresos
   */
  async findAll(): Promise<Incoming[]> {
    try {
      return this.incomingRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un ingreso por su ID
   * @param id - ID del ingreso a buscar
   * @returns Una promesa que resuelve con el ingreso encontrado
   * @throws {BadRequestException} Si el ingreso no existe
   */
  async findById(id: string): Promise<Incoming> {
    const incoming = await this.incomingRepository.findById(id);
    if (!incoming) {
      throw new BadRequestException('Ingreso no encontrado');
    }
    return incoming;
  }

  /**
   * Desactiva múltiples ingresos
   * @param deleteIncomingDto - DTO con los IDs de los ingresos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los ingresos desactivados
   * @throws {NotFoundException} Si algún ingreso no existe
   */
  async deleteMany(
    deleteIncomingDto: DeleteIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming[]>> {
    try {
      validateArray(deleteIncomingDto.ids, 'IDs de ingresos');
      return await this.deleteIncomingUseCase.execute(deleteIncomingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples ingresos
   * @param ids - Lista de IDs de los ingresos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los ingresos reactivados
   * @throws {NotFoundException} Si algún ingreso no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming[]>> {
    try {
      validateArray(ids, 'IDs de ingresos');
      return await this.reactivateIncomingUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  //crear ingreso de productos al alamacen
  /**
   * Crea un nuevo ingreso de productos al almacén.
   *
   * @param createIncomingDtoStorage - DTO que contiene los datos necesarios para crear el ingreso.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Una promesa que resuelve en una respuesta HTTP con un mensaje y el ID del nuevo ingreso.
   */
  async createIncoming(
    createIncomingDtoStorage: CreateIncomingDtoStorage,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming>> {
    try {
      // Extraer los datos necesarios del DTO
      const {
        movement: movementsList,
        state,
        name,
        storageId,
        date,
      } = createIncomingDtoStorage;
      const isIncoming = true;

      console.log('idIncoming', storageId);
      // Llamar a createIncomingUseCase y esperar el ID del registro del nuevo ingreso
      const incoming = await this.createIncomingUseCase.createIncomingStorage(
        createIncomingDtoStorage,
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
      //const movementData = this.extractProductoIdQuantity(movement);

      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        movementsList.map(async (item) => {
          const { productId, quantity, buyingPrice } = item;

          // Llamar a createMovementStorage
          const idMovement =
            await this.createMovementUseCase.createMovementStorage(
              {
                movementTypeId,
                incomingId: incoming.id,
                productId,
                quantity,
                buyingPrice,
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
      //const stockData = this.extractProductoIdQuantity(movement);
      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        movementsList.map(async (item) => {
          const { productId, quantity } = item;

          // Llamar a createMovementStorage
          const idStock = await this.stockService.createOrUpdateStockIncoming(
            storageId,
            productId,
            quantity,
            user,
          );

          console.log(`Movimiento creado con ID: ${idStock}`);
        }),
      );

      // const data: IncomingCreateResponseData = {
      //   incomingId,
      //   movementTypeId,
      // };
      return {
        success: true, // Código de estado HTTP 201
        message: 'Ingreso creado exitosamente',
        data: await this.incomingRepository.findDetailedIncomingById(
          incoming.id,
        ), // El ID del nuevo ingreso y el tipo de movimiento
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
  //   movement: Omit<Movement, 'id'>[],
  // ): { productId: string; quantity: number }[] {
  //   return movement.map((item) => ({
  //     productId: item.productId,
  //     quantity: item.quantity,
  //   }));
  // }

  /**
   * Obtiene un ingreso por su ID con detalles de sus relaciones.
   *
   * @param id - ID del ingreso a buscar.
   * @returns Una promesa que resuelve con el ingreso encontrado.
   * @throws {BadRequestException} Si el ingreso no existe.
   */
  async findByIdWithRelations(id: string): Promise<DetailedIncoming[]> {
    try {
      const incoming =
        await this.incomingRepository.findDetailedIncomingById(id);
      if (!incoming) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return [incoming];
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los ingresos con sus relaciones detalladas.
   *
   * @returns Una promesa que resuelve con una lista de ingresos detallados.
   * @throws {Error} Si ocurre un error al obtener los ingresos.
   */
  async findAllWithRelations(): Promise<DetailedIncoming[]> {
    try {
      const incomingData =
        await this.incomingRepository.getAllDetailedIncoming();
      if (!incomingData) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return incomingData;
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
  async getAllWithStorage(): Promise<IncomingWithStorage[]> {
    try {
      const incomingData = await this.incomingRepository.getAllWithStorage();
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
  async findWithStorageById(id: string): Promise<IncomingWithStorage[]> {
    try {
      const incoming = await this.incomingRepository.findWithStorageById(id);
      if (!incoming) {
        throw new BadRequestException('Ingreso no encontrado');
      }
      return [incoming];
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
