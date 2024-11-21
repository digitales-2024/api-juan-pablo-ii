import { Test, TestingModule } from '@nestjs/testing';
import { MedicalProcedureService } from './medical-procedure.service';

describe('MedicalProcedureService', () => {
  let service: MedicalProcedureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalProcedureService],
    }).compile();

    service = module.get<MedicalProcedureService>(MedicalProcedureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
