import { Injectable } from '@nestjs/common';
import { IDisciplinaRepository } from '../../domain/repository/disciplina.repository.interface';
import { ICsvDisciplinaParser } from '../ports/csv-disciplina-parser.interface';
import { ImportDisciplinaCsvCommand } from '../dtos/command/import-disciplina-csv.command';
import { Disciplina } from '../../domain/disciplina';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportDisciplinaCsvUseCase {
  constructor(
    private readonly disciplinaRepository: IDisciplinaRepository,
    private readonly csvParser: ICsvDisciplinaParser,
    @InjectPinoLogger(ImportDisciplinaCsvUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ImportDisciplinaCsvCommand): Promise<void> {
    this.logger.info({ msg: 'Processando importação em lote de disciplinas' });

    const disciplinasData = await this.csvParser.parse(command.fileBuffer);

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
      msg: 'Importação concluída',
      inseridas,
      atualizadas,
    });
  }
}
