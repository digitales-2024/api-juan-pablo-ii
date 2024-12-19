export class StockDto {
  productId: string;
  totalStock: number;
  storageId?: string; // Opcional para diferenciar por almacén
}

export class StockTransactionDto {
  type: 'incoming' | 'outgoing' | 'movement';
  productId: string;
  quantity: number;
  storageId?: string;
  targetStorageId?: string; // Para movimientos
}
