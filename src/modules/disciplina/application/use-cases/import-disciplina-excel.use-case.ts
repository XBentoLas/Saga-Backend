import { Injectable } from '@nestjs/common';
import { IDisciplinaRepository } from '../../domain/repository/disciplina.repository.interface';
import { IExcelDisciplinaParser } from '../ports/excel-disciplina-parser.interface';
import { ImportDisciplinaExcelCommand } from '../dtos/command/import-disciplina-excel.command';
import { Disciplina } from '../../domain/disciplina';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportDisciplinaExcelUseCase {
  constructor(
    private readonly disciplinaRepository: IDisciplinaRepository,
    private readonly excelParser: IExcelDisciplinaParser,
    @InjectPinoLogger(ImportDisciplinaExcelUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ImportDisciplinaExcelCommand): Promise<void> {
    this.logger.info({
      msg: 'Processando importação em lote de disciplinas via Excel',
    });

    try {
      const disciplinasData = await this.excelParser.parse(command.fileBuffer);

      let inseridas = 0;
      let atualizadas = 0;

      for (const data of disciplinasData) {
        let disciplina = await this.disciplinaRepository.findByCodigo(
          data.codigo,
        );

        if (!disciplina) {
          disciplina = Disciplina.create({
            codigoDisciplina: data.codigo,
            nome: data.nome,
          });
          inseridas++;
        } else {
          disciplina.updateNome(data.nome);
          atualizadas++;
        }

        await this.disciplinaRepository.save(disciplina);
      }

      this.logger.info({
        msg: 'Importação concluída com sucesso',
        inseridas,
        atualizadas,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Falha crítica durante a importação de disciplinas',
        err: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    }
  }
}
