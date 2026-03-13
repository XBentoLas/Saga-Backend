import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IDisciplinaRepository } from './domain/repository/disciplina.repository.interface';
import { PrismaDisciplinaRepository } from './infrastructure/database/prisma.disciplina.repository';
import { ICsvDisciplinaParser } from './application/ports/csv-disciplina-parser.interface';
import { NodeCsvDisciplinaParserService } from './infrastructure/services/node-csv-disciplina-parser.service';
import { ImportDisciplinaCsvUseCase } from './application/use-cases/import-disciplina-csv.use-case';
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
      provide: ICsvDisciplinaParser,
      useClass: NodeCsvDisciplinaParserService,
    },
    ImportDisciplinaCsvUseCase,
    DeleteDisciplinaUseCase,
  ],
  exports: [IDisciplinaRepository],
})
export class DisciplinaModule {}
