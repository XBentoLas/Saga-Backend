import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IProfessorRepository } from './domain/repository/professor.repository.interface';
import { PrismaProfessorRepository } from './infrastructure/database/prisma.professor.repository';
import { IAvailabilityTemplateGenerator } from './application/services/availability-template-generator.interface';
import { ExcelAvailabilityTemplateService } from './infrastructure/services/excel-availability-template.service';
import { GenerateAvailabilityTemplateUseCase } from './application/use-cases/generate-availability-template.use-case';
import { ProfessorController } from './infrastructure/controller/professor.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessorController],
  providers: [
    {
      provide: IProfessorRepository,
      useClass: PrismaProfessorRepository,
    },
    {
      provide: IAvailabilityTemplateGenerator,
      useClass: ExcelAvailabilityTemplateService,
    },
    GenerateAvailabilityTemplateUseCase,
  ],
  exports: [
    IProfessorRepository,
  ],
})
export class ProfessorModule {}
