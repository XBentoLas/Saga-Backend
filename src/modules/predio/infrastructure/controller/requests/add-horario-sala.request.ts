import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { AddHorarioSalaCommand } from '../../../application/dtos/command/add-horario-sala.command';

const DIAS_VALIDOS = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
  'DOMINGO',
];
const TURNOS_VALIDOS = ['MATUTINO', 'VESPERTINO', 'NOTURNO'];

export class AddHorarioSalaRequest {
  @IsNotEmpty()
  @IsString()
  @IsIn(DIAS_VALIDOS, {
    message:
      'Dia da semana inválido. Valores aceitos: ' + DIAS_VALIDOS.join(', '),
  })
  diaSemana: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(TURNOS_VALIDOS, {
    message: 'Turno inválido. Valores aceitos: ' + TURNOS_VALIDOS.join(', '),
  })
  turno: string;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'A hora de início deve ser uma data ISO 8601 válida.' },
  )
  horaInicio: string;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'A hora de fim deve ser uma data ISO 8601 válida.' },
  )
  horaFim: string;

  toCommand(predioId: number, salaId: number): AddHorarioSalaCommand {
    return {
      predioId,
      salaId,
      diaSemana: this.diaSemana,
      turno: this.turno,
      horaInicio: new Date(this.horaInicio),
      horaFim: new Date(this.horaFim),
    };
  }
}
