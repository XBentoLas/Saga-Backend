import { Module } from '@nestjs/common';
import { IPredioRepository } from './domain/repository/predio.repository.interface';
import { PrismaPredioRepository } from './infrastructure/database/prisma.predio.repository';
import { PredioController } from './infrastructure/controller/predio.controller';
import { CreatePredioUseCase } from './application/use-cases/create-predio.use-case';
import { AddSalaUseCase } from './application/use-cases/add-sala.use-case';
import { AddHorarioSalaUseCase } from './application/use-cases/add-horario-sala.use-case';
import { GetAllPrediosQueryHandler } from './application/queries/get-all-predios.query-handler';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { RemoveSalaUseCase } from './application/use-cases/remove-sala.use-case';
import { RemoveHorarioSalaUseCase} from './application/use-cases/remove-horario-sala.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [PredioController],
  providers: [
    {
      provide: IPredioRepository,
      useClass: PrismaPredioRepository,
    },
    CreatePredioUseCase,
    AddSalaUseCase,
    AddHorarioSalaUseCase,
    GetAllPrediosQueryHandler,
    RemoveSalaUseCase,
    RemoveHorarioSalaUseCase,
  ],
  exports: [IPredioRepository],
})
export class PredioModule {}
