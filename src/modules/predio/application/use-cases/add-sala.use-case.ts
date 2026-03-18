import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { AddSalaCommand } from '../dtos/command/add-sala.command';
import { PredioOutput } from '../dtos/outputs/predio.output';
import { PredioId } from '../../domain/identifier/predio-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AddSalaUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(AddSalaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: AddSalaCommand): Promise<PredioOutput> {
    this.logger.info({ msg: 'Adicionando sala ao prédio', ...command });

    const predio = await this.predioRepository.findById(
      PredioId.create(command.predioId),
    );

    if (!predio) {
      throw new NotFoundException(
        `Prédio com ID ${command.predioId} não encontrado.`,
      );
    }

    try {
      predio.adicionarSala(
        command.numeroSala,
        command.capacidade,
        command.tipoSala,
      );
    } catch (error) {
      this.logger.warn({
        msg: 'Regra de negócio impediu a criação da sala',
        erroDominio:
          error instanceof Error ? error.message : 'Erro desconhecido',
        predioId: command.predioId,
        numeroSalaTentado: command.numeroSala,
      });

      throw new BadRequestException(
        'A letra inicial do número da sala deve corresponder à inicial do prédio selecionado.',
      );
    }

    await this.predioRepository.save(predio);
    // ...

    return PredioOutput.fromDomain(predio);
  }
}
