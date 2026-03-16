import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/repository/professor.repository.interface';
import { DeleteProfessorCommand } from '../dtos/command/delete-professor.command';
import { ProfessorId } from '../../domain/identifier/professor-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteProfessorUseCase {
  constructor(
    private readonly professorRepository: IProfessorRepository,
    @InjectPinoLogger(DeleteProfessorUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: DeleteProfessorCommand): Promise<void> {
    const id = ProfessorId.create(command.professorId);

    const professorExists = await this.professorRepository.findById(id);

    if (!professorExists) {
      this.logger.warn({
        msg: 'Tentativa de deletar professor inexistente',
        id: command.professorId,
      });
      throw new NotFoundException('Professor não encontrado.');
    }

    await this.professorRepository.delete(id);

    this.logger.info({
      msg: 'Professor deletado com sucesso',
      id: command.professorId,
    });
  }
}
