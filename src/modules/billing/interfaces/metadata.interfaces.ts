export interface BaseServiceItem {
  id: string;
  name: string;
  quantity: number;
  subtotal: number;
}

export interface ProductMovement {
  productId: string;
  quantity: number;
}

export interface BaseOrderMetadata {
  services: BaseServiceItem[];
  orderDetails: {
    transactionType:
      | 'SALE'
      | 'PURCHASE'
      | 'MEDICAL_CONSULTATION'
      | 'PRESCRIPTION';
    storageId?: string;
    branchId: string;
    products?: ProductMovement[];
  };
  transactionDetails?: {
    paymentDueDate?: Date;
    discounts?: {
      type: string;
      amount: number;
      description?: string;
    }[];
    subtotal;
    tax;
    total;
  };
  customFields?: Record<string, any>;
}

export interface ProductSaleMetadata extends BaseOrderMetadata {
  orderDetails: {
    transactionType: 'SALE';
    storageId: string;
    branchId: string;
    products: ProductMovement[];
  };
  inventory?: {
    location: string;
    batch?: string;
  };
}

export interface ProductPurchaseMetadata extends BaseOrderMetadata {
  orderDetails: {
    transactionType: 'PURCHASE';
    storageId: string;
    branchId: string;
    products: ProductMovement[];
    supplierId: string;
  };
  purchaseDetails?: {
    purchaseOrder?: string;
    expectedDeliveryDate?: Date;
    deliveryInstructions?: string;
  };
}

// Keep existing interfaces for other types
export interface MedicalConsultationMetadata extends BaseOrderMetadata {
  orderDetails: {
    transactionType: 'MEDICAL_CONSULTATION';
    branchId: string;
    doctorId: string;
    patientId: string;
    consultationDate: Date;
  };
  medicalDetails?: {
    consultationType: string;
    specialty: string;
    diagnosis?: string;
    observations?: string;
  };
}

export interface MedicalPrescriptionMetadata extends BaseOrderMetadata {
  orderDetails: {
    transactionType: 'PRESCRIPTION';
    branchId: string;
    doctorId: string;
    patientId: string;
    prescriptionDate: Date;
  };
  prescriptionDetails?: {
    prescriptionType: string;
    diagnosis: string;
    instructions?: string;
    validUntil?: Date;
  };
}
