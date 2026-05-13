import { HorarioSala } from '../../../domain/horario-sala';
import { ApiProperty } from '@nestjs/swagger';

export class HorarioSalaOutput {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SEGUNDA' })
  diaSemana: string;

  @ApiProperty({ example: 'MATUTINO' })
  turno: string;

  @ApiProperty({ example: '2024-01-01T08:00:00.000Z' })
  horaInicio: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
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
