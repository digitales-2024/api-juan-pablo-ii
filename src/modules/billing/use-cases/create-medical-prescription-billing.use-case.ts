import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
import { CreateMedicalPrescriptionBillingDto, PrescriptionProductItemDto } from '../dto/create-medical-prescription-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
    PaymentMethod,
    PaymentStatus,
    PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { PacientService } from '@pacient/pacient/pacient/services/pacient.service';
import { MedicalPrescriptionGenerator } from '../generators/medical-prescription.generator';
import { ProductService } from '@inventory/inventory/product/services/product.service';
import { StockService } from '@inventory/inventory/stock/services/stock.service';
import { AppointmentService } from 'src/modules/appointments/services/appointment.service';

@Injectable()
export class CreateMedicalPrescriptionUseCase {
    private readonly logger = new Logger(CreateMedicalPrescriptionUseCase.name);

    constructor(
        private readonly orderService: OrderService,
        private readonly orderRepository: OrderRepository,
        private readonly auditService: AuditService,
        private readonly paymentService: PaymentService,
        private readonly productService: ProductService,
        private readonly stockService: StockService,
        private readonly patientService: PacientService,
        private readonly appointmentService: AppointmentService,
        private readonly prescriptionGenerator: MedicalPrescriptionGenerator,
    ) { }

    async execute(
        createDto: CreateMedicalPrescriptionBillingDto,
        user: UserData,
    ): Promise<BaseApiResponse<Order | { unavailableProducts: any[] }>> {
        return await this.orderRepository.transaction(async () => {
            // Verificar que el paciente existe
            const patient = await this.patientService.findOne(createDto.patientId);
            if (!patient) {
                throw new BadRequestException(`Paciente con ID ${createDto.patientId} no encontrado`);
            }

            // Log de los datos del paciente
            this.logger.log(`Datos del paciente: ${JSON.stringify(patient)}`);

            // Verificar disponibilidad de stock para todos los productos
            const unavailableProducts = await this.checkProductsAvailability(createDto.products);
            if (unavailableProducts.length > 0) {
                return {
                    success: false,
                    message: 'Algunos productos no tienen suficiente stock',
                    data: {
                        unavailableProducts,
                    },
                };
            }

            // Verificar que todas las citas existen
            const appointmentsData = await this.validateAndGetAppointments(createDto.appointmentIds);

            // Crear metadata vacía usando el generador
            const metadata = this.prescriptionGenerator.createEmptyMetadata(createDto);

            // Llenar los detalles del paciente
            metadata.patientDetails.fullName = `${patient.name} ${patient.lastName || ''}`.trim();
            metadata.patientDetails.dni = patient.dni;
            metadata.patientDetails.address = patient.address;
            metadata.patientDetails.phone = patient.phone;

            // Calcular el subtotal, impuestos y detalles de los productos
            const productTotals = await this.calculateProductTotals(createDto.products);

            // Calcular el subtotal, impuestos y detalles de las citas
            const appointmentTotals = await this.calculateAppointmentTotals(appointmentsData);

            // Combinar totales
            const subtotal = productTotals.subtotal + appointmentTotals.subtotal;
            const tax = productTotals.tax + appointmentTotals.tax;
            const total = productTotals.total + appointmentTotals.total;

            // Actualiza el metadata con los valores calculados
            metadata.orderDetails.transactionDetails = {
                subtotal,
                tax,
                total,
            };

            // Agregar productos al metadata
            metadata.orderDetails.products = productTotals.productDetails.map(product => ({
                productId: product.id,
                name: product.name,
                quantity: product.quantity,
                price: product.price,
                subtotal: product.subtotal,
            }));

            // Agregar servicios (citas) al metadata
            metadata.orderDetails.services = appointmentsData.map(appointment => ({
                id: appointment.id,
                name: appointment.serviceName || 'Consulta médica',
                quantity: 1,
            }));

            // Agregar información del médico
            if (appointmentsData.length > 0 && appointmentsData[0].doctor) {
                metadata.orderDetails.staffId = appointmentsData[0].doctor.id;
            }

            // Log de la metadata completa
            this.logger.log(`Metadata: ${JSON.stringify(metadata)}`);

            // Crear la orden
            const order = await this.orderService.createOrder(
                OrderType.MEDICAL_PRESCRIPTION_ORDER,
                {
                    ...createDto,
                    metadata,
                    type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
                    status: OrderStatus.PENDING,
                    currency: createDto.currency || 'PEN',
                    subtotal,
                    tax,
                    total,
                },
            );

            // Actualizar la orden con los totales calculados y metadata
            const updatedOrder = await this.orderRepository.update(order.id, {
                subtotal,
                tax,
                total,
                metadata,
            });

            // Crear pago pendiente con el total calculado
            await this.paymentService.create(
                {
                    orderId: order.id,
                    amount: total,
                    status: PaymentStatus.PENDING,
                    type: PaymentType.REGULAR,
                    description: `Pago pendiente para receta médica - ${order.code}`,
                    date: new Date(),
                    paymentMethod: createDto.paymentMethod ?? PaymentMethod.CASH,
                },
                user,
            );

            // Registrar auditoría
            await this.auditService.create({
                entityId: order.id,
                entityType: 'order',
                action: AuditActionType.CREATE,
                performedById: user.id,
                createdAt: new Date(),
            });

            return {
                success: true,
                message: 'Orden de receta médica creada exitosamente',
                data: updatedOrder,
            };
        });
    }

    /**
     * Verifica la disponibilidad de stock para todos los productos
     */
    private async checkProductsAvailability(products: PrescriptionProductItemDto[]) {
        const unavailableProducts = [];

        for (const product of products) {
            const stockInStorage = await this.stockService.getStockByStorageProduct(
                product.storageId,
                product.productId,
            );
            const productStock = stockInStorage[0]?.stock.find(
                (item) => item.idProduct === product.productId,
            );

            if (!productStock || productStock.stock < product.quantity) {
                const productName = productStock
                    ? productStock.name
                    : product.productId;
                const storageName = stockInStorage[0]?.name || product.storageId;

                unavailableProducts.push({
                    productId: product.productId,
                    productName: productName,
                    storageName: storageName,
                    requestedQuantity: product.quantity,
                    availableQuantity: productStock ? productStock.stock : 0,
                });
            } else {
                this.logger.log(
                    `Disponibilidad de stock para el producto ${product.productId} en el almacén ${product.storageId}: Suficiente`,
                );
            }
        }

        return unavailableProducts;
    }

    /**
     * Valida y obtiene información de todas las citas
     */
    private async validateAndGetAppointments(appointmentIds: string[]) {
        const appointmentsData = [];

        for (const appointmentId of appointmentIds) {
            const appointment = await this.appointmentService.findOne(appointmentId);
            if (!appointment) {
                throw new BadRequestException(`Cita médica con ID ${appointmentId} no encontrada`);
            }
            appointmentsData.push(appointment);
        }

        return appointmentsData;
    }

    /**
     * Calcula los totales para los productos
     */
    private async calculateProductTotals(products: PrescriptionProductItemDto[]) {
        let subtotal = 0;
        const productDetails = [];
        const taxRate = 0.18; // 18% impuesto

        for (const product of products) {
            const priceWithTax = await this.productService.getProductPriceById(
                product.productId,
            );
            if (!priceWithTax) {
                throw new BadRequestException(
                    `No se pudo obtener el precio del producto ${product.productId}`,
                );
            }

            // Calcular el subtotal sin impuesto (precio base)
            const productSubtotal = (priceWithTax / (1 + taxRate)) * product.quantity;
            subtotal += productSubtotal;

            const productInfo = await this.productService.findById(product.productId);
            productDetails.push({
                id: product.productId,
                name: productInfo.name,
                quantity: product.quantity,
                price: priceWithTax, // Mostrar el precio con impuesto al usuario
                subtotal: productSubtotal, // Subtotal sin impuesto para cálculos internos
            });
        }

        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            productDetails,
        };
    }

    /**
     * Calcula los totales para las citas
     */
    private async calculateAppointmentTotals(appointments: any[]) {
        let subtotal = 0;
        const appointmentDetails = [];
        const taxRate = 0.18; // 18% impuesto

        for (const appointment of appointments) {
            // Obtener el precio del servicio asociado a la cita
            const servicePrice = await this.appointmentService.getServicePriceByAppointmentId(appointment.id);
            if (!servicePrice) {
                throw new BadRequestException(`No se pudo obtener el precio del servicio con ID ${appointment.serviceId}`);
            }

            // Calcular el subtotal sin impuesto (precio base)
            const appointmentSubtotal = servicePrice / (1 + taxRate);
            subtotal += appointmentSubtotal;

            appointmentDetails.push({
                id: appointment.id,
                serviceId: appointment.serviceId,
                serviceName: appointment.serviceName || 'Servicio médico',
                date: appointment.date,
                price: servicePrice, // Precio con impuesto
                subtotal: appointmentSubtotal, // Subtotal sin impuesto
            });
        }

        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            appointmentDetails,
        };
    }
} 