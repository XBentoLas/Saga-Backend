import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { CursoModule } from '../curso/curso.module';
import { ITurmaRepository } from './domain/repository/turma.repository.interface';
import { PrismaTurmaRepository } from './infrastructure/database/prisma.turma.repository';
import { IExcelTurmaParser } from './application/ports/excel-turma-parser.interface';
import { NodeExcelTurmaParserService } from './infrastructure/services/node-excel-turma-parser.service';
import { ImportTurmaExcelUseCase } from './application/use-cases/import-turma-excel.use-case';
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
      provide: IExcelTurmaParser,
      useClass: NodeExcelTurmaParserService,
    },
    ImportTurmaExcelUseCase,
    DeleteTurmaUseCase,
  ],
  exports: [ITurmaRepository],
})
export class TurmaModule {}
