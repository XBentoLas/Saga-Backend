import { Injectable } from '@nestjs/common';
import { ITurmaRepository } from '../../domain/repository/turma.repository.interface';
import { ICursoRepository } from '../../../curso/domain/repository/curso.repository.interface';
import { IExcelTurmaParser } from '../ports/excel-turma-parser.interface';
import { ImportTurmaExcelCommand } from '../dtos/command/import-turma-excel.command';
import { Turma } from '../../domain/turma';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportTurmaExcelUseCase {
  constructor(
    private readonly turmaRepository: ITurmaRepository,
    private readonly cursoRepository: ICursoRepository,
    private readonly excelParser: IExcelTurmaParser,
    @InjectPinoLogger(ImportTurmaExcelUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ImportTurmaExcelCommand): Promise<void> {
    this.logger.info({
      msg: 'Iniciando importação de Turmas via Excel da TOTVS',
    });

    try {
      const turmasData = await this.excelParser.parse(command.fileBuffer);

      let inseridas = 0;
      let atualizadas = 0;

      for (const data of turmasData) {
        const curso = await this.cursoRepository.findByCodigo(data.codigoCurso);

        if (!curso) {
          this.logger.warn({
            msg: 'Curso não encontrado. Turma ignorada.',
            codigoCurso: data.codigoCurso,
            codigoTurma: data.codigoTurma,
          });
          continue;
        }

        let turma = await this.turmaRepository.findByCodigo(data.codigoTurma);

        if (!turma) {
          turma = Turma.create({
            codigoTurma: data.codigoTurma,
            turno: data.turno,
            semestre: data.semestre,
            quantidade: data.quantidadeAlunos,
            cursoId: curso.id.toValue(),
          });
          inseridas++;
        } else {
          turma.atualizarQuantidade(data.quantidadeAlunos);
          atualizadas++;
        }

        await this.turmaRepository.save(turma);
      }

      this.logger.info({
        msg: 'Importação de turmas concluída com sucesso',
        inseridas,
        atualizadas,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Falha crítica durante a importação de turmas',
        err: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }
}
