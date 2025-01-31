import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Stock } from '../entities/stock.entity';

@Injectable()
export class StockRepository extends BaseRepository<Stock> {
  constructor(prisma: PrismaService) {
    super(prisma, 'stock'); // Tabla del esquema de prisma
  }

  // Función principal para obtener el stock de un producto en un almacén específico o todos los productos en un almacén
  async getStockByStorageAndProduct(
    storageId: string,
    productId: string,
  ): Promise<{ stock: number } | null> {
    // Permitir retorno de null
    const stockRecord = await this.prisma.stock.findUnique({
      where: {
        storageId_productId: {
          storageId: storageId,
          productId: productId,
        },
      },
      select: { stock: true },
    });

    // Si no se encuentra el registro, retornar null
    if (!stockRecord) {
      return null; // Retorna null si no se encuentra el stock
    }

    return { stock: stockRecord.stock }; // Retorna el stock encontrado
  }

  //obtener precio del producto
  async getPriceProduct(productId: string): Promise<{ price: number } | null> {
    // Permitir retorno de null
    const productRecord = await this.prisma.producto.findUnique({
      where: {
        id: productId,
      },
      select: { precio: true },
    });

    // Si no se encuentra el registro, retornar null
    if (!productRecord) {
      return null; // Retorna null si no se encuentra el producto
    }

    return { price: productRecord.precio }; // Retorna el precio encontrado
  }

  //obtener el id del stock
  async getByIdStock(
    storageId: string,
    productId: string,
  ): Promise<{ id: string } | null> {
    // Permitir retorno de null
    const stockRecord = await this.prisma.stock.findUnique({
      where: {
        storageId_productId: {
          storageId: storageId,
          productId: productId,
        },
      },
      select: { id: true },
    });

    // Si no se encuentra el registro, retornar null
    if (!stockRecord) {
      return null; // Retorna null si no se encuentra el stock
    }

    return { id: stockRecord.id }; // Retorna el ID del stock encontrado
  }

  //no tocar
  // Función principal para obtener el stock de un producto en un almacén específico o todos los productos en un almacén
  async getStockByIdStorageByIdProduct(
    storageId?: string,
    productId?: string,
  ): Promise<any> {
    if (!storageId && !productId) {
      return this.getAllStoragesWithProducts();
    }

    if (!storageId && productId) {
      return this.getAllStoragesWithSpecificProduct(productId);
    }

    return this.getSpecificStorageWithProducts(storageId, productId);
  }

  // Función privada para obtener todos los almacenes con sus productos
  private async getAllStoragesWithProducts(): Promise<any> {
    const allStorages = await this.prisma.storage.findMany({
      where: { isActive: true },
      select: { id: true, name: true, location: true, typeStorageId: true },
    });

    const stockByStorage = [];

    for (const storage of allStorages) {
      const typeStorage = await this.fetchTypeStorage(storage.typeStorageId);
      const branch = await this.fetchBranch(typeStorage.branchId);
      const staff = await this.fetchStaff(typeStorage.staffId);

      stockByStorage.push({
        idStorage: storage.id,
        name: storage.name,
        location: storage.location,
        address: branch.address,
        staff: staff.name,
        description: typeStorage.description,
        stock: await this.getStockByStorage(storage.id),
      });
    }

    return { almacenes: stockByStorage };
  }

  // Función privada para obtener todos los almacenes con un producto específico
  private async getAllStoragesWithSpecificProduct(
    productId: string,
  ): Promise<any> {
    const allStorages = await this.prisma.storage.findMany({
      where: { isActive: true },
      select: { id: true, name: true, location: true, typeStorageId: true },
    });

    const stockByStorage = [];

    for (const storage of allStorages) {
      const typeStorage = await this.fetchTypeStorage(storage.typeStorageId);
      const branch = await this.fetchBranch(typeStorage.branchId);
      const staff = await this.fetchStaff(typeStorage.staffId);

      stockByStorage.push({
        idStorage: storage.id,
        name: storage.name,
        location: storage.location,
        address: branch.address,
        staff: staff.name,
        description: typeStorage.description,
        stock: await this.getStockByStorage(storage.id, productId),
      });
    }

    return { almacenes: stockByStorage };
  }

  // Función privada para obtener un almacén específico con sus productos
  private async getSpecificStorageWithProducts(
    storageId: string,
    productId?: string,
  ): Promise<any> {
    const storage = await this.fetchStorageById(storageId);
    const stockByStorage = [];

    const typeStorage = await this.fetchTypeStorage(storage.typeStorageId);
    const branch = await this.fetchBranch(typeStorage.branchId);
    const staff = await this.fetchStaff(typeStorage.staffId);

    stockByStorage.push({
      idStorage: storage.id,
      name: storage.name,
      location: storage.location,
      address: branch.address,
      staff: staff.name,
      description: typeStorage.description,
      stock: await this.getStockByStorage(storageId, productId),
    });

    return { almacenes: stockByStorage };
  }

  // Función privada para obtener el stock de un producto en un almacén específico
  private async getStockByStorage(
    storageId?: string,
    productId?: string,
  ): Promise<any> {
    const stockRecords = await this.getStockRecords(storageId, productId);
    const productsWithDetails = await this.getProductsDetails(stockRecords);
    return this.createStockJson(productsWithDetails);
  }

  // Función privada para obtener los registros de stock
  private async getStockRecords(
    storageId?: string,
    productId?: string,
  ): Promise<any[]> {
    return this.prisma.stock.findMany({
      where: {
        ...(storageId ? { storageId: storageId } : {}),
        ...(productId ? { productId: productId } : {}),
      },
      select: {
        productId: true,
        stock: true,
        price: true,
      },
    });
  }

  // Función privada para obtener los detalles de los productos
  private async getProductsDetails(stockRecords: any[]): Promise<any[]> {
    return Promise.all(
      stockRecords.map(async (record) => {
        const productDetails = await this.prisma.producto.findUnique({
          where: {
            id: record.productId,
          },
          select: {
            name: true,
            unidadMedida: true,
            precio: true,
          },
        });

        return {
          productId: record.productId,
          name: productDetails.name,
          unit: productDetails.unidadMedida,
          price: productDetails.precio,
          stock: record.stock,
          totalPrice: record.price,
        };
      }),
    );
  }

  // Función privada para crear el JSON con la estructura especificada
  private createStockJson(productsWithDetails: any[]): any {
    return productsWithDetails.map((product) => ({
      idProduct: product.productId,
      name: product.name,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
      totalPrice: product.totalPrice,
    }));
  }

  // Función privada para obtener un almacén por su ID
  private async fetchStorageById(storageId: string) {
    return await this.prisma.storage.findUnique({
      where: { id: storageId, isActive: true },
      select: { id: true, name: true, location: true, typeStorageId: true },
    });
  }

  // Función privada para obtener los datos de TypeStorage
  private async fetchTypeStorage(typeStorageId: string) {
    return await this.prisma.typeStorage.findUnique({
      where: { id: typeStorageId },
      select: { description: true, branchId: true, staffId: true },
    });
  }

  // Función privada para obtener los datos de Sucursal
  private async fetchBranch(branchId: string) {
    return await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { address: true },
    });
  }

  // Función privada para obtener los datos de Personal
  private async fetchStaff(staffId: string) {
    return await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: { name: true },
    });
  }
  //fin funciones privadas
}
