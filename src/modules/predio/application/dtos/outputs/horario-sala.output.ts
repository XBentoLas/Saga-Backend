import { HorarioSala } from '../../../domain/horario-sala';

export class HorarioSalaOutput {
  id: number;
  diaSemana: string;
  turno: string;
  horaInicio: Date;
  horaFim: Date;

  static fromDomain(horario: HorarioSala): HorarioSalaOutput {
    return {
      id: horario.id.toValue(),
      diaSemana: horario.diaSemana,
      turno: horario.turno,
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim,
    };
  }
}
