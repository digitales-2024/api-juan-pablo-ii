import { Test, TestingModule } from '@nestjs/testing';
import { MedicalConsultationService } from './medical-consultation.service';

describe('MedicalConsultationService', () => {
  let service: MedicalConsultationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalConsultationService],
    }).compile();

    service = module.get<MedicalConsultationService>(MedicalConsultationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
