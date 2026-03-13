import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  ICsvTurmaParser,
  TurmaParsedData,
} from '../../application/ports/csv-turma-parser.interface';
import { Turno } from '../../../professor/domain/enums';

@Injectable()
export class NodeCsvTurmaParserService implements ICsvTurmaParser {
  constructor(
    @InjectPinoLogger(NodeCsvTurmaParserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async parse(buffer: Buffer): Promise<TurmaParsedData[]> {
    this.logger.info({
      msg: 'A iniciar leitura do ficheiro CSV de turmas da TOTVS',
    });

    const content = buffer.toString('utf-8');
    const lines = content.split('\n');

    if (lines.length < 2) {
      throw new Error('O ficheiro CSV está vazio ou não possui dados.');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toUpperCase());

    const idxCodCurso = headers.indexOf('CODCURSO');
    const idxCodTurma = headers.indexOf('CODTURMA');
    const idxTurno = headers.indexOf('TURNO');
    const idxPeriodo = headers.indexOf('PERIODO');
    const idxStatusCurso = headers.indexOf('STATUS_CURSO');

    if (
      [idxCodCurso, idxCodTurma, idxTurno, idxPeriodo, idxStatusCurso].includes(
        -1,
      )
    ) {
      throw new Error(
        'Ficheiro inválido. Faltam colunas obrigatórias (CODCURSO, CODTURMA, TURNO, PERIODO, STATUS_CURSO).',
      );
    }

    const turmasMap = new Map<string, TurmaParsedData>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');

      const codigoCurso = columns[idxCodCurso]?.trim();
      const codigoTurma = columns[idxCodTurma]?.trim();
      const turnoRaw = columns[idxTurno]?.trim();
      const periodoStr = columns[idxPeriodo]?.trim();
      const statusCurso = columns[idxStatusCurso]?.trim();

      if (!codigoTurma || !codigoCurso) continue;

      if (!turmasMap.has(codigoTurma)) {
        turmasMap.set(codigoTurma, {
          codigoTurma,
          codigoCurso,
          turno: this.mapTurno(turnoRaw),
          semestre: parseInt(periodoStr, 10) || 1,
          quantidadeAlunos: 0, // Começa a zero
        });
      }

      if (statusCurso?.toUpperCase() === 'CURSANDO') {
        turmasMap.get(codigoTurma)!.quantidadeAlunos++;
      }
    }

    const resultado = Array.from(turmasMap.values());
    this.logger.info({
      msg: `CSV processado com sucesso. ${resultado.length} turmas únicas encontradas.`,
    });

    return resultado;
  }

  private mapTurno(turnoRaw: string): Turno {
    const t = turnoRaw?.toUpperCase() || '';
    if (t.includes('MANHA') || t.includes('MATUTINO')) return Turno.MATUTINO;
    if (t.includes('TARDE') || t.includes('VESPERTINO'))
      return Turno.VESPERTINO;
    return Turno.NOTURNO;
  }
}
