import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IProfessorRepository } from './domain/repository/professor.repository.interface';
import { PrismaProfessorRepository } from './infrastructure/database/prisma.professor.repository';
import { IAvailabilityTemplateGenerator } from './application/services/availability-template-generator.interface';
import { ExcelAvailabilityTemplateService } from './infrastructure/services/excel-availability-template.service';
import { GenerateAvailabilityTemplateUseCase } from './application/use-cases/generate-availability-template.use-case';
import { ProfessorController } from './infrastructure/controller/professor.controller';
import { DisciplinaModule } from '../disciplina/disciplina.module';
import { IExcelProfessorParser } from './application/services/excel-professor-parser.interface';
import { NodeExcelProfessorParserService } from './infrastructure/services/node-excel-professor-parser.service';
import { ImportProfessorExcelUseCase } from './application/use-cases/import-professor-excel.use-case';

@Module({
  imports: [PrismaModule, DisciplinaModule],
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
    ImportProfessorExcelUseCase,
    {
      provide: IExcelProfessorParser,
      useClass: NodeExcelProfessorParserService,
    },
  ],
  exports: [IProfessorRepository],
})
export class ProfessorModule {}
