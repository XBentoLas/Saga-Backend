import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IDisciplinaRepository } from '../disciplina/domain/repository/disciplina.repository.interface';
import { PrismaDisciplinaRepository } from '../disciplina/infrastructure/database/prisma.disciplina.repository'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IDisciplinaRepository,
      useClass: PrismaDisciplinaRepository,
    },
  ],
  exports: [IDisciplinaRepository],
})
export class DisciplinaModule {}
