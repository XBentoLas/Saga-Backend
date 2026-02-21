import { Injectable, NotFoundException } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { AddHorarioSalaCommand } from '../dtos/command/add-horario-sala.command';
import { PredioOutput } from '../dtos/outputs/predio.output';
import { PredioId } from '../../domain/identifier/predio-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AddHorarioSalaUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(AddHorarioSalaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: AddHorarioSalaCommand): Promise<PredioOutput> {
    this.logger.info({ msg: 'Adicionando horário à sala', ...command });

    const predio = await this.predioRepository.findById(
      PredioId.create(command.predioId),
    );

    if (!predio) {
      throw new NotFoundException(`Prédio não encontrado.`);
    }

    const sala = predio.getSala(command.salaId);

    if (!sala) {
      throw new NotFoundException(
        `Sala com ID ${command.salaId} não encontrada neste prédio.`,
      );
    }

    sala.adicionarHorario({
      diaSemana: command.diaSemana,
      turno: command.turno,
      horaInicio: command.horaInicio,
      horaFim: command.horaFim,
    });

    await this.predioRepository.save(predio);

    return PredioOutput.fromDomain(predio);
  }
}
