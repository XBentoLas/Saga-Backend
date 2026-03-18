import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  IExcelTurmaParser,
  TurmaParsedData,
} from '../../application/ports/excel-turma-parser.interface';
import { Turno } from '../../domain/enums';

@Injectable()
export class NodeExcelTurmaParserService implements IExcelTurmaParser {
  constructor(
    @InjectPinoLogger(NodeExcelTurmaParserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async parse(buffer: Buffer): Promise<TurmaParsedData[]> {
    this.logger.info({
      msg: 'Lendo arquivo Excel (.xlsx) para extração e contagem de turmas',
    });

    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(buffer as any);
    } catch (error) {
      this.logger.error({
        msg: 'Falha ao carregar o buffer como arquivo Excel',
        err: error as Error,
      });
      throw new Error(
        'Falha ao ler o arquivo. Certifique-se de que é um Excel válido (.xlsx).',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('A planilha está vazia.');
    }

    let idxCodCurso = -1;
    let idxCodTurma = -1;
    let idxTurno = -1;
    let idxPeriodo = -1;
    let idxStatusCurso = -1;

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const val = cell.text.trim().toUpperCase();
      if (val === 'CODCURSO') idxCodCurso = colNumber;
      if (val === 'CODTURMA') idxCodTurma = colNumber;
      if (val === 'TURNO') idxTurno = colNumber;
      if (val === 'PERIODO') idxPeriodo = colNumber;
      if (val === 'STATUS_CURSO') idxStatusCurso = colNumber;
    });

    if (
      [idxCodCurso, idxCodTurma, idxTurno, idxPeriodo, idxStatusCurso].includes(
        -1,
      )
    ) {
      throw new Error(
        'Planilha inválida. Faltam colunas obrigatórias (CODCURSO, CODTURMA, TURNO, PERIODO, STATUS_CURSO).',
      );
    }

    const turmasMap = new Map<string, TurmaParsedData>();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return

      const codigoCurso = row.getCell(idxCodCurso).text.trim();
      const codigoTurma = row.getCell(idxCodTurma).text.trim();
      const turnoRaw = row.getCell(idxTurno).text.trim();
      const periodoStr = row.getCell(idxPeriodo).text.trim();
      const statusCurso = row.getCell(idxStatusCurso).text.trim();

      if (!codigoTurma || !codigoCurso) return;

      if (!turmasMap.has(codigoTurma)) {
        turmasMap.set(codigoTurma, {
          codigoTurma,
          codigoCurso,
          turno: this.mapTurno(turnoRaw),
          semestre: parseInt(periodoStr, 10) || 1,
          quantidadeAlunos: 0,
        });
      }

      if (statusCurso?.toUpperCase() === 'CURSANDO') {
        turmasMap.get(codigoTurma)!.quantidadeAlunos++;
      }
    });

    const resultado = Array.from(turmasMap.values());
    this.logger.info({
      msg: `Extração concluída. ${resultado.length} turmas únicas agrupadas no Excel.`,
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
