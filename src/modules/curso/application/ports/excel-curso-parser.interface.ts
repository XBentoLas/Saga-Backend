export interface CursoParsedData {
  codigoCurso: string;
  nome: string;
}

export abstract class IExcelCursoParser {
  abstract parse(buffer: Buffer): Promise<CursoParsedData[]>;
}
