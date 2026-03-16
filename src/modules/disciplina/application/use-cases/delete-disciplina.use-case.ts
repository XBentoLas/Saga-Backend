import { Injectable, NotFoundException } from '@nestjs/common';
import { IDisciplinaRepository } from '../../domain/repository/disciplina.repository.interface';
import { DeleteDisciplinaCommand } from '../dtos/command/delete-disciplina.command';
import { DisciplinaId } from '../../domain/identifier/disciplina-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteDisciplinaUseCase {
  constructor(
    private readonly disciplinaRepository: IDisciplinaRepository,
    @InjectPinoLogger(DeleteDisciplinaUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: DeleteDisciplinaCommand): Promise<void> {
    const id = DisciplinaId.create(command.disciplinaId);

    const disciplinaExists = await this.disciplinaRepository.findById(id);

    if (!disciplinaExists) {
      this.logger.warn({
        msg: 'Tentativa de deletar disciplina inexistente',
        id: command.disciplinaId,
      });
      throw new NotFoundException('Disciplina não encontrada.');
    }

    await this.disciplinaRepository.delete(id);
    this.logger.info({
      msg: 'Disciplina deletada com sucesso',
      id: command.disciplinaId,
    });
  }
}
