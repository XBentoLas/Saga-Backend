import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { CursoModule } from '../curso/curso.module';
import { ITurmaRepository } from './domain/repository/turma.repository.interface';
import { PrismaTurmaRepository } from './infrastructure/database/prisma.turma.repository';
import { ICsvTurmaParser } from './application/ports/csv-turma-parser.interface';
import { NodeCsvTurmaParserService } from './infrastructure/services/node-csv-turma-parser.service';
import { ImportTurmaCsvUseCase } from './application/use-cases/import-turma-csv.use-case';
import { DeleteTurmaUseCase } from './application/use-cases/delete-turma.use-case';
import { TurmaController } from './infrastructure/controller/turma.controller';

@Module({
  imports: [PrismaModule, CursoModule],
  controllers: [TurmaController],
  providers: [
    {
      provide: ITurmaRepository,
      useClass: PrismaTurmaRepository,
    },
    {
      provide: ICsvTurmaParser,
      useClass: NodeCsvTurmaParserService,
    },
    ImportTurmaCsvUseCase,
    DeleteTurmaUseCase,
  ],
  exports: [ITurmaRepository],
})
export class TurmaModule {}
