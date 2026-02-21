import { Injectable, NotFoundException } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { RemoveSalaCommand } from '../dtos/command/remove-sala.command';
import { PredioId } from '../../domain/identifier/predio-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class RemoveSalaUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(RemoveSalaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RemoveSalaCommand): Promise<void> {
    this.logger.info({ msg: 'Removendo sala', ...command });

    const predioId = PredioId.create(command.predioId);
    const predio = await this.predioRepository.findById(predioId);

    if (!predio) {
      throw new NotFoundException(
        `Prédio com ID ${command.predioId} não encontrado.`,
      );
    }

    predio.removerSala(command.salaId);

    await this.predioRepository.save(predio);
  }
}
