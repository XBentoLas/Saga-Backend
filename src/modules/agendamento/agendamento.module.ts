import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IAgendamentoRepository } from './domain/repository/agendamento.repository.interface';
import { PrismaAgendamentoRepository } from './infrastructure/database/prisma.agendamento.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IAgendamentoRepository,
      useClass: PrismaAgendamentoRepository,
    },
  ],
  exports: [IAgendamentoRepository],
})
export class AgendamentoModule {}
