import { Test, TestingModule } from '@nestjs/testing';
import { DocAppointmentService } from './doc-appointment.service';

describe('DocAppointmentService', () => {
  let service: DocAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocAppointmentService],
    }).compile();

    service = module.get<DocAppointmentService>(DocAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
