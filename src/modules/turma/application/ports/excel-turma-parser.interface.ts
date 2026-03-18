import { Turno } from '../../../professor/domain/enums';

export interface TurmaParsedData {
  codigoTurma: string;
  codigoCurso: string;
  turno: Turno;
  semestre: number;
  quantidadeAlunos: number;
}

export abstract class IExcelTurmaParser {
  abstract parse(buffer: Buffer): Promise<TurmaParsedData[]>;
}
