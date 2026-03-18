export interface DisciplinaParsedData {
  codigo: string;
  nome: string;
}

export abstract class IExcelDisciplinaParser {
  abstract parse(buffer: Buffer): Promise<DisciplinaParsedData[]>;
}
