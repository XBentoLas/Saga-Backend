import { Injectable } from '@nestjs/common';
import { ICursoRepository } from '../../domain/repository/curso.repository.interface';
import { IExcelCursoParser } from '../ports/excel-curso-parser.interface';
import { ImportCursoExcelCommand } from '../dtos/command/import-curso-excel.command';
import { Curso } from '../../domain/curso';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportCursoExcelUseCase {
  constructor(
    private readonly cursoRepository: ICursoRepository,
    private readonly csvParser: IExcelCursoParser,
    @InjectPinoLogger(ImportCursoExcelUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ImportCursoExcelCommand): Promise<void> {
    this.logger.info({
      msg: 'Iniciando extração e importação de Cursos via Excel da TOTVS',
    });

    try {
      const cursosData = await this.csvParser.parse(command.fileBuffer);

      let inseridos = 0;
      let atualizados = 0;

      for (const data of cursosData) {
        let curso = await this.cursoRepository.findByCodigo(data.codigoCurso);

        if (!curso) {
          curso = Curso.create({
            codigoCurso: data.codigoCurso,
            nome: data.nome,
          });
          inseridos++;
        } else {
          curso.updateNome(data.nome);
          atualizados++;
        }

        await this.cursoRepository.save(curso);
      }

      this.logger.info({
        msg: 'Importação de cursos concluída com sucesso',
        inseridos,
        atualizados,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Falha crítica durante a importação de cursos',
        err: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    }
  }
}
