import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IPredioRepository } from './domain/repository/predio.repository.interface';
import { PrismaPredioRepository } from './infrastructure/database/prisma.predio.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IPredioRepository,
      useClass: PrismaPredioRepository,
    },
  ],
  exports: [IPredioRepository],
})
export class PredioModule {}
