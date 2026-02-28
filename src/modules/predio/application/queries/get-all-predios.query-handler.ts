import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  GetAllPrediosQueryOut,
  getAllPrediosInclude,
} from '../dtos/outputs/get-all-predios.query-out';

@Injectable()
export class GetAllPrediosQueryHandler {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(GetAllPrediosQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(): Promise<GetAllPrediosQueryOut[]> {
    this.logger.info({ msg: 'Listando todos os prédios (Query)' });

    const predios = await this.prisma.predio.findMany({
      include: getAllPrediosInclude,
      orderBy: { nome: 'asc' },
    });

    return predios.map(GetAllPrediosQueryOut.fromPrisma);
  }
}
