import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IPredioRepository } from '../../../domain/repository/predio.repository.interface';
import { ChangeStatusSalaCommand } from './change-status-sala.command';
import { PredioId } from '../../../domain/identifier/predio-id';

@Injectable()
export class ChangeStatusSalaUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(ChangeStatusSalaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ChangeStatusSalaCommand): Promise<void> {
    const predioId = PredioId.create(command.predioId);

    const predio = await this.predioRepository.findById(predioId);

    if (!predio) {
      throw new NotFoundException('Prédio não encontrado.');
    }

    try {
      predio.alterarStatusSala(command.salaId, command.isActive);
    } catch (error) {
      throw new NotFoundException(
        error instanceof Error ? error.message : 'Sala não encontrada',
      );
    }

    try {
      await this.predioRepository.save(predio);
      this.logger.info({
        msg: `Status da sala alterado com sucesso`,
        salaId: command.salaId,
        novoStatus: command.isActive ? 'Ativa' : 'Inativa',
      });
    } catch (error) {
      this.logger.error({
        msg: 'Erro ao salvar o status da sala no banco de dados',
        salaId: command.salaId,
        err: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    }
  }
}
