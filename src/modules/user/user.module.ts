import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { IUserRepository } from './domain/repository/user.repository.interface';
import { PrismaUserRepository } from './infrastructure/database/prisma.user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [IUserRepository],
})
export class UserModule {}
