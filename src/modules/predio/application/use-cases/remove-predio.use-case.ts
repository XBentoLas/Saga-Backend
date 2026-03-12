import { Injectable, NotFoundException } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { RemovePredioCommand } from '../dtos/command/remove-predio.command';
import { PredioId } from '../../domain/identifier/predio-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class RemovePredioUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(RemovePredioUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RemovePredioCommand): Promise<void> {
    this.logger.info({
      msg: 'Iniciando remoção do prédio e suas dependências',
      predioId: command.predioId,
    });

    const predioId = PredioId.create(command.predioId);

    const predio = await this.predioRepository.findById(predioId);

    if (!predio) {
      throw new NotFoundException(
        `Prédio com ID ${command.predioId} não encontrado.`,
      );
    }

    await this.predioRepository.delete(predioId);

    this.logger.info({
      msg: 'Prédio e salas associadas removidos com sucesso',
      predioId: command.predioId,
    });
  }
}
