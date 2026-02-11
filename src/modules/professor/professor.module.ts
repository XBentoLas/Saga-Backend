import { Module } from '@nestjs/common';
import { IProfessorRepository } from './domain/repository/professor.repository.interface';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { PrismaProfessorRepository } from './infrastructure/database/prisma.professor.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IProfessorRepository,
      useClass: PrismaProfessorRepository,
    },
  ],
  exports: [IProfessorRepository],
})
export class ProfessorModule {}
