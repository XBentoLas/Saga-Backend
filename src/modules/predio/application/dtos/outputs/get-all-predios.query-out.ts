import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export const getAllPrediosInclude = {
  salas: {
    include: {
      horarios: true,
    },
  },
} satisfies Prisma.PredioInclude;

export type PredioWithRelationsPayload = Prisma.PredioGetPayload<{
  include: typeof getAllPrediosInclude;
}>;

type SalaPayload = PredioWithRelationsPayload['salas'][number];
type HorarioPayload = SalaPayload['horarios'][number];

export class HorarioSalaQueryOut {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SEGUNDA' })
  diaSemana: string;

  @ApiProperty({ example: 'MATUTINO' })
  turno: string;

  @ApiProperty({ example: '2024-01-01T08:00:00.000Z' })
  horaInicio: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  horaFim: string;

  static fromPrisma(this: void, horario: HorarioPayload): HorarioSalaQueryOut {
    return {
      id: horario.id_horario,
      diaSemana: horario.dia_semana,
      turno: horario.turno,
      horaInicio: horario.hora_inicio.toISOString(),
      horaFim: horario.hora_fim.toISOString(),
    };
  }
}

export class SalaQueryOut {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'O-221' })
  numeroSala: string;

  @ApiProperty({ example: 40, nullable: true })
  capacidade: number | null;

  @ApiProperty({ example: 'Laboratório', nullable: true })
  tipoSala: string | null;

  @ApiProperty({ type: () => [HorarioSalaQueryOut] })
  horarios: HorarioSalaQueryOut[];

  static fromPrisma(this: void, sala: SalaPayload): SalaQueryOut {
    return {
      id: sala.id_sala,
      numeroSala: sala.numero_sala,
      capacidade: sala.capacidade,
      tipoSala: sala.tipo_sala,
      horarios: sala.horarios.map(HorarioSalaQueryOut.fromPrisma),
    };
  }
}

export class GetAllPrediosQueryOut {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Delta' })
  nome: string;

  @ApiProperty({ type: () => [SalaQueryOut] })
  salas: SalaQueryOut[];

  static fromPrisma(
    this: void,
    predio: PredioWithRelationsPayload,
  ): GetAllPrediosQueryOut {
    return {
      id: predio.id_predio,
      nome: predio.nome,
      salas: predio.salas.map(SalaQueryOut.fromPrisma),
    };
  }
}
