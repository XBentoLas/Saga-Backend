import { Injectable, NotFoundException } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { RemoveHorarioSalaCommand } from '../dtos/command/remove-horario-sala.command';
import { PredioId } from '../../domain/identifier/predio-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class RemoveHorarioSalaUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(RemoveHorarioSalaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RemoveHorarioSalaCommand): Promise<void> {
    this.logger.info({ msg: 'Removendo horário da sala', ...command });

    const predio = await this.predioRepository.findById(
      PredioId.create(command.predioId),
    );

    if (!predio) {
      throw new NotFoundException(`Prédio não encontrado.`);
    }

    const sala = predio.getSala(command.salaId);
    if (!sala) {
      throw new NotFoundException(`Sala não encontrada.`);
    }

    sala.removerHorario(command.horarioId);

    await this.predioRepository.save(predio);
  }
}
