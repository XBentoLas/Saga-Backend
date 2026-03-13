import { DiaSemana, Turno } from '../../domain/enums';

export interface HorarioParsedData {
  diaSemana: DiaSemana;
  turno: Turno;
  horaInicio: Date;
  horaFim: Date;
}

export interface ProfessorParsedData {
  nome: string;
  email: string;
  disciplinasCodigos: string[];
  horarios: HorarioParsedData[];
}

export abstract class IExcelProfessorParser {
  abstract parse(buffer: Buffer): Promise<ProfessorParsedData>;
}
