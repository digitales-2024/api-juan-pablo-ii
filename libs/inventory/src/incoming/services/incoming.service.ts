import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { Incoming } from '../entities/incoming.entity';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { UpdateIncomingDto } from '../dto/update-incoming.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
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
  ): Promise<HttpResponse<Incoming>> {
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
  ): Promise<HttpResponse<Incoming>> {
    try {
      const currentIncoming = await this.findById(id);

      if (!validateChanges(updateIncomingDto, currentIncoming)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el ingreso',
          data: currentIncoming,
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
  ): Promise<HttpResponse<Incoming[]>> {
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
  ): Promise<HttpResponse<Incoming[]>> {
    try {
      validateArray(ids, 'IDs de ingresos');
      return await this.reactivateIncomingUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  //crear ingreso de productos al alamacen

  async createIncoming(
    createIncomingDtoStorage: CreateIncomingDtoStorage,
    user: UserData,
  ): Promise<HttpResponse<string>> {
    try {
      // Extraer los datos necesarios del DTO
      const { movement, state, name, storageId, date } =
        createIncomingDtoStorage;
      const isIncoming = true;

      console.log('idIncoming', storageId);
      // Llamar a createIncomingUseCase y esperar el ID del registro del nuevo ingreso
      const incomingId = await this.createIncomingUseCase.createIncomingStorage(
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
                incomingId,
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
          const idStock = await this.stockService.createOrUpdateStockIncoming(
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
        message: 'Ingreso creado exitosamente',
        data: `${incomingId} -  ${movementTypeId}} `, // El ID del nuevo ingreso
      };
      //
      //
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');

      // Retornar un objeto de error con un código de estado adecuado
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // o el código que consideres apropiado
        message: 'Error al crear el ingreso',
        data: null, // o puedes incluir más información sobre el error si es necesario
      };
    }
  }
  private extractProductoIdQuantity(
    movement: Array<{ productId: string; quantity: number }>,
  ): { productId: string; quantity: number }[] {
    return movement.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  }
  
}
