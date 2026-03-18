import { Injectable, NotFoundException } from '@nestjs/common';
import { ICursoRepository } from '../../domain/repository/curso.repository.interface';
import { DeleteCursoCommand } from '../dtos/command/delete-curso.command';
import { CursoId } from '../../domain/identifier/curso-id';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteCursoUseCase {
  constructor(
    private readonly cursoRepository: ICursoRepository,
    @InjectPinoLogger(DeleteCursoUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: DeleteCursoCommand): Promise<void> {
    const id = CursoId.create(command.cursoId);

    const cursoExists = await this.cursoRepository.findById(id);

    if (!cursoExists) {
      this.logger.warn({
        msg: 'Tentativa de deletar curso inexistente',
        id: command.cursoId,
      });
      throw new NotFoundException('Curso não encontrado.');
    }

    try {
      await this.cursoRepository.delete(id);
      this.logger.info({
        msg: 'Curso deletado com sucesso',
        id: command.cursoId,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Erro inesperado ao deletar o curso no banco de dados',
        cursoId: command.cursoId,
        err: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    }
  }
}
