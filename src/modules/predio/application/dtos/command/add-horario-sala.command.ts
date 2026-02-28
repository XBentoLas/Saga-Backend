export interface AddHorarioSalaCommand {
  predioId: number;
  salaId: number;
  diaSemana: string;
  turno: string;
  horaInicio: Date;
  horaFim: Date;
}
