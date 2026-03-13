export interface DisciplinaParsedData {
  codigo: string;
  nome: string;
}

export abstract class ICsvDisciplinaParser {
  abstract parse(buffer: Buffer): Promise<DisciplinaParsedData[]>;
}
