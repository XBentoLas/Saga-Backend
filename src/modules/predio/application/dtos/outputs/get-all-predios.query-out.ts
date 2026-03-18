import { Prisma } from '@prisma/client';

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
  id: number;
  diaSemana: string;
  turno: string;
  horaInicio: string;
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
  id: number;
  numeroSala: string;
  capacidade: number | null;
  tipoSala: string | null;
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
  id: number;
  nome: string;
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
