import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  IExcelCursoParser,
  CursoParsedData,
} from '../../application/ports/excel-curso-parser.interface';

@Injectable()
export class NodeExcelCursoParserService implements IExcelCursoParser {
  constructor(
    @InjectPinoLogger(NodeExcelCursoParserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async parse(buffer: Buffer): Promise<CursoParsedData[]> {
    this.logger.info({
      msg: 'Lendo arquivo Excel (.xlsx) para extração de cursos únicos',
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
    let idxNomeCurso = -1;

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const val = cell.text.trim().toUpperCase();
      if (val === 'CODCURSO') idxCodCurso = colNumber;
      if (val === 'CURSO') idxNomeCurso = colNumber;
    });

    if (idxCodCurso === -1 || idxNomeCurso === -1) {
      throw new Error(
        'Planilha inválida. Faltam colunas obrigatórias (CODCURSO, CURSO) na primeira linha.',
      );
    }

    const cursosUnicosMap = new Map<string, string>();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const codigoCurso = row.getCell(idxCodCurso).text.trim();
      const nomeCurso = row.getCell(idxNomeCurso).text.trim();

      if (codigoCurso && nomeCurso && !cursosUnicosMap.has(codigoCurso)) {
        cursosUnicosMap.set(codigoCurso, nomeCurso);
      }
    });

    const resultado: CursoParsedData[] = Array.from(
      cursosUnicosMap.entries(),
    ).map(([codigo, nome]) => ({
      codigoCurso: codigo,
      nome: nome,
    }));

    this.logger.info({
      msg: `Extração concluída. ${resultado.length} cursos únicos identificados no Excel.`,
    });

    return resultado;
  }
}
