import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ICursoRepository } from '../curso/domain/repository/curso.repository.interface'
import { PrismaCursoRepository } from '../curso/infrastructure/database/prisma.curso.repository'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ICursoRepository,
      useClass: PrismaCursoRepository,
    },
  ],
  exports: [ICursoRepository],
})
export class CursoModule {}
