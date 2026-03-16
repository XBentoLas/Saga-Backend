import { Injectable, NotFoundException } from '@nestjs/common';
import { ITurmaRepository } from '../../domain/repository/turma.repository.interface';
import { DeleteTurmaCommand } from '../dtos/command/delete-turma.command';
import { TurmaId } from '../../domain/identifier/turma-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteTurmaUseCase {
  constructor(
    private readonly turmaRepository: ITurmaRepository,
    @InjectPinoLogger(DeleteTurmaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: DeleteTurmaCommand): Promise<void> {
    const id = TurmaId.create(command.turmaId);

    const turmaExists = await this.turmaRepository.findById(id);

    if (!turmaExists) {
      this.logger.warn({
        msg: 'Tentativa de deletar turma inexistente',
        id: command.turmaId,
      });
      throw new NotFoundException('Turma não encontrada.');
    }

    try {
      await this.turmaRepository.delete(id);
      this.logger.info({
        msg: 'Turma deletada com sucesso',
        id: command.turmaId,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Erro inesperado ao deletar a turma no banco de dados',
        turmaId: command.turmaId,
        err: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    }
  }
}
