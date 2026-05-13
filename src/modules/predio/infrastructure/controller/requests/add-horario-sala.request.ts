import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { AddHorarioSalaCommand } from '../../../application/dtos/command/add-horario-sala.command';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    example: 'SEGUNDA',
    description: 'Dia da semana',
    enum: DIAS_VALIDOS,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(DIAS_VALIDOS, {
    message:
      'Dia da semana inválido. Valores aceitos: ' + DIAS_VALIDOS.join(', '),
  })
  diaSemana: string;

  @ApiProperty({
    example: 'MATUTINO',
    description: 'Turno do horário',
    enum: TURNOS_VALIDOS,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(TURNOS_VALIDOS, {
    message: 'Turno inválido. Valores aceitos: ' + TURNOS_VALIDOS.join(', '),
  })
  turno: string;

  @ApiProperty({
    example: '2024-01-01T08:00:00.000Z',
    description: 'Hora de início do horário (ISO 8601)',
    required: true,
  })
  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'A hora de início deve ser uma data ISO 8601 válida.' },
  )
  horaInicio: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Hora de fim do horário (ISO 8601)',
    required: true,
  })
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
