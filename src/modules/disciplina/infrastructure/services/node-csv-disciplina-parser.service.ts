import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  ICsvDisciplinaParser,
  DisciplinaParsedData,
} from '../../application/ports/csv-disciplina-parser.interface';

@Injectable()
export class NodeCsvDisciplinaParserService implements ICsvDisciplinaParser {
  constructor(
    @InjectPinoLogger(NodeCsvDisciplinaParserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async parse(buffer: Buffer): Promise<DisciplinaParsedData[]> {
    this.logger.info({
      msg: 'Iniciando leitura do arquivo CSV de disciplinas',
    });

    const content = buffer.toString('utf-8');
    const lines = content.split('\n');
    const parsedData: DisciplinaParsedData[] = [];

    if (lines.length < 2) {
      this.logger.warn({ msg: 'Arquivo CSV vazio ou sem dados' });
      throw new Error(
        'O arquivo CSV deve conter um cabeçalho e ao menos uma linha de dados.',
      );
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(/[,;]/);

      if (columns.length < 2) {
        throw new Error(`Linha ${i + 1} inválida: Esperado "codigo,nome".`);
      }

      const codigo = columns[0].trim();
      const nome = columns[1].trim();

      if (!codigo || !nome) {
        throw new Error(
          `Linha ${i + 1} inválida: Código e Nome são obrigatórios.`,
        );
      }

      parsedData.push({ codigo, nome });
    }

    this.logger.info({
      msg: `CSV lido com sucesso. ${parsedData.length} disciplinas encontradas.`,
    });
    return parsedData;
  }
}
