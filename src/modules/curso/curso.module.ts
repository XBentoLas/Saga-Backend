import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ICursoRepository } from './domain/repository/curso.repository.interface';
import { PrismaCursoRepository } from './infrastructure/database/prisma.curso.repository';
import { IExcelCursoParser } from './application/ports/excel-curso-parser.interface';
import { NodeExcelCursoParserService } from './infrastructure/services/node-excel-curso-parser.services';
import { ImportCursoExcelUseCase } from './application/use-cases/import-curso-excel.use-case';
import { DeleteCursoUseCase } from './application/use-cases/delete-curso.use-case';
import { CursoController } from './infrastructure/controller/curso.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CursoController],
  providers: [
    {
      provide: ICursoRepository,
      useClass: PrismaCursoRepository,
    },
    {
      provide: IExcelCursoParser,
      useClass: NodeExcelCursoParserService,
    },
    ImportCursoExcelUseCase,
    DeleteCursoUseCase,
  ],
  exports: [ICursoRepository],
})
export class CursoModule {}
