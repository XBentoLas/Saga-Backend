import { Sala } from '../../../domain/sala';
import { HorarioSalaOutput } from './horario-sala.output';
import { ApiProperty } from '@nestjs/swagger';

export class SalaOutput {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'O-221' })
  numeroSala: string;

  @ApiProperty({ example: 40, nullable: true })
  capacidade: number | null;

  @ApiProperty({ example: 'Laboratório', nullable: true })
  tipoSala: string | null;

  @ApiProperty({ type: () => [HorarioSalaOutput] })
  horarios: HorarioSalaOutput[];

  static fromDomain(sala: Sala): SalaOutput {
    return {
      id: sala.id.toValue(),
      numeroSala: sala.numeroSala,
      capacidade: sala.capacidade,
      tipoSala: sala.tipoSala,
      horarios: sala.horarios.map(HorarioSalaOutput.fromDomain),
    };
  }
}
