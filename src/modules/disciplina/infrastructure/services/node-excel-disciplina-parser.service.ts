import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  IExcelDisciplinaParser,
  DisciplinaParsedData,
} from '../../application/ports/excel-disciplina-parser.interface';

@Injectable()
export class NodeExcelDisciplinaParserService implements IExcelDisciplinaParser {
  constructor(
    @InjectPinoLogger(NodeExcelDisciplinaParserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async parse(buffer: Buffer): Promise<DisciplinaParsedData[]> {
    this.logger.info({
      msg: 'Lendo arquivo Excel (.xlsx) para extração de disciplinas',
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

    let idxCodDisciplina = -1;
    let idxNomeDisciplina = -1;

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const val = cell.text.trim().toUpperCase();
      if (val === 'CODIGO' || val === 'CODDISCIPLINA')
        idxCodDisciplina = colNumber;
      if (val === 'NOME' || val === 'DISCIPLINA') idxNomeDisciplina = colNumber;
    });

    if (idxCodDisciplina === -1 || idxNomeDisciplina === -1) {
      throw new Error(
        'Planilha inválida. Faltam colunas obrigatórias (CODIGO, NOME) na primeira linha.',
      );
    }

    const disciplinasMap = new Map<string, string>();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pula a linha de cabeçalho

      const codigo = row.getCell(idxCodDisciplina).text.trim();
      const nome = row.getCell(idxNomeDisciplina).text.trim();

      if (codigo && nome && !disciplinasMap.has(codigo)) {
        disciplinasMap.set(codigo, nome);
      }
    });

    const parsedData: DisciplinaParsedData[] = Array.from(
      disciplinasMap.entries(),
    ).map(([codigo, nome]) => ({
      codigo,
      nome,
    }));

    this.logger.info({
      msg: `Extração concluída. ${parsedData.length} disciplinas únicas identificadas no Excel.`,
    });

    return parsedData;
  }
}
