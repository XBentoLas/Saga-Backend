import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IDisciplinaRepository } from './domain/repository/disciplina.repository.interface';
import { PrismaDisciplinaRepository } from './infrastructure/database/prisma.disciplina.repository';
import { IExcelDisciplinaParser } from './application/ports/excel-disciplina-parser.interface';
import { NodeExcelDisciplinaParserService } from './infrastructure/services/node-excel-disciplina-parser.service';
import { ImportDisciplinaExcelUseCase } from './application/use-cases/import-disciplina-excel.use-case';
import { DeleteDisciplinaUseCase } from './application/use-cases/delete-disciplina.use-case';
import { DisciplinaController } from './infrastructure/controller/disciplina.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DisciplinaController],
  providers: [
    {
      provide: IDisciplinaRepository,
      useClass: PrismaDisciplinaRepository,
    },
    {
      provide: IExcelDisciplinaParser,
      useClass: NodeExcelDisciplinaParserService,
    },
    ImportDisciplinaExcelUseCase,
    DeleteDisciplinaUseCase,
  ],
  exports: [IDisciplinaRepository],
})
export class DisciplinaModule {}
