import { DiaSemana, Turno } from '../../../domain/enums';

export interface AddHorarioSalaCommand {
  predioId: number;
  salaId: number;
  diaSemana: DiaSemana;
  turno: Turno;
  horaInicio: Date;
  horaFim: Date;
}
