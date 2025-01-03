import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { Outgoing } from '../entities/outgoing.entity';
import { CreateOutgoingDto } from '../dto/create-outgoing.dto';
import { UpdateOutgoingDto } from '../dto/update-outgoing.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
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
  ): Promise<HttpResponse<Outgoing>> {
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
  ): Promise<HttpResponse<Outgoing>> {
    try {
      const currentOutgoing = await this.findById(id);

      if (!validateChanges(updateOutgoingDto, currentOutgoing)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la salida',
          data: currentOutgoing,
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
  ): Promise<HttpResponse<Outgoing[]>> {
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
  ): Promise<HttpResponse<Outgoing[]>> {
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
  ): Promise<HttpResponse<string>> {
    try {
      // Extraer los datos necesarios del DTO
      const { movement, state, name, storageId, date } =
        createOutgoingDtoStorage;
      const isIncoming = false;

      console.log('idIncoming', storageId);
      // Llamar a createIncomingUseCase y esperar el ID del registro del nuevo ingreso
      const outgoingId = await this.createOutgoingUseCase.createOugoingStorage(
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
      const movementData = await this.extractProductoIdQuantity(movement);

      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        movementData.map(async (item) => {
          const { productId, quantity } = item;

          // Llamar a createMovementStorage
          const idMovement =
            await this.createMovementUseCase.createMovementStorage(
              {
                movementTypeId,
                outgoingId,
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
      const stockData = await this.extractProductoIdQuantity(movement);
      // Recorrer los datos extraídos y llamar a createMovementStorage para cada producto y su cantidad
      await Promise.all(
        stockData.map(async (item) => {
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
      return {
        statusCode: HttpStatus.CREATED, // Código de estado HTTP 201
        message: 'Salida creada exitosamente',
        data: `${outgoingId} -  ${movementTypeId}} `, // El ID del nuevo ingreso
      };
      //
      //
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');

      // Retornar un objeto de error con un código de estado adecuado
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // o el código que consideres apropiado
        message: 'Error al crear la salida',
        data: null, // o puedes incluir más información sobre el error si es necesario
      };
    }
  }
  /**
 * Extrae los IDs de productos y sus cantidades de un array de movimientos.
 *
 * @param movement - Un array de objetos que contienen `productId` y `quantity`.
 * @returns Un array de objetos con `productId` y `quantity`.
 */
  private extractProductoIdQuantity(
    movement: Array<{ productId: string; quantity: number }>,
  ): { productId: string; quantity: number }[] {
    return movement.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  }
}
