import { Injectable, Logger } from '@nestjs/common';
import { StaffScheduleRepository } from '../repositories/staff-schedule.repository';
import { FindStaffSchedulesQueryDto } from '../dto/find-staff-schedule-query.dto';
import { StaffSchedule } from '../entities/staff-schedule.entity';

@Injectable()
export class FindStaffSchedulesByFilterUseCase {
    private readonly logger = new Logger(FindStaffSchedulesByFilterUseCase.name);

    constructor(
        private readonly staffScheduleRepository: StaffScheduleRepository,
    ) { }

    async execute(query: FindStaffSchedulesQueryDto): Promise<StaffSchedule[]> {
        this.logger.warn(`[DEBUG] Ejecutando use case con query: ${JSON.stringify(query)}`);

        try {
            const result = await this.staffScheduleRepository.findWithRelations({
                where: {
                    AND: [
                        query.staffId ? { staffId: query.staffId } : {},
                        query.branchId ? { branchId: query.branchId } : {},
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            this.logger.warn(`[DEBUG] Resultados crudos del repositorio: ${result.length}`);
            this.logger.warn(`[DEBUG] Filtros aplicados: staffId=${query.staffId}, branchId=${query.branchId}`);
            return result;

        } catch (error) {
            this.logger.warn(`[DEBUG-ERROR] Error en repositorio: ${error.message}`);
            throw error;
        }
    }
} 