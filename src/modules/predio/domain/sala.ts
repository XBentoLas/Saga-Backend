import { Entity } from '../../../common/domain/entity';
import { SalaId } from './identifier/sala-id';
import { HorarioSala, HorarioSalaProps } from './horario-sala';
import { DiaSemana, Turno } from './enums';

export interface SalaProps {
  numeroSala: number;
  capacidade: number | null;
  tipoSala: string | null;
  horarios: HorarioSala[];
}

export class Sala extends Entity<SalaProps> {
  constructor(props: SalaProps, id?: SalaId) {
    super(props, id ?? SalaId.newId());
  }

  get id(): SalaId {
    return this._id as SalaId;
  }
  get numeroSala(): number {
    return this.props.numeroSala;
  }
  get capacidade(): number | null {
    return this.props.capacidade;
  }
  get tipoSala(): string | null {
    return this.props.tipoSala;
  }
  get horarios(): HorarioSala[] {
    return this.props.horarios;
  }

  // --- Factory: Create (Nova Sala) ---
  public static create(
    props: { numeroSala: number; capacidade?: number; tipoSala?: string },
    id?: SalaId,
  ): Sala {
    return new Sala(
      {
        numeroSala: props.numeroSala,
        capacidade: props.capacidade || null,
        tipoSala: props.tipoSala || null,
        horarios: [],
      },
      id,
    );
  }

  // --- Factory: Restore (Do Banco) ---
  // A Sala precisa saber restaurar a si mesma e seus horários filhos
  public static restore(
    props: {
      numero_sala: number;
      capacidade: number | null;
      tipo_sala: string | null;
      horarios?: {
        id_horario: number;
        dia_semana: string;
        turno: string;
        hora_inicio: Date;
        hora_fim: Date;
      }[];
    },
    id: SalaId,
  ): Sala {
    const horariosDomain = (props.horarios || []).map((h) =>
      HorarioSala.create(
        {
          diaSemana: h.dia_semana as DiaSemana,
          turno: h.turno as Turno,
          horaInicio: h.hora_inicio,
          horaFim: h.hora_fim,
        },
        h.id_horario,
      ),
    );

    return new Sala(
      {
        numeroSala: props.numero_sala,
        capacidade: props.capacidade,
        tipoSala: props.tipo_sala,
        horarios: horariosDomain,
      },
      id,
    );
  }

  // --- Comportamentos ---
  public adicionarHorario(horario: HorarioSalaProps): void {
    const novoHorario = HorarioSala.create(horario);
    this.props.horarios.push(novoHorario);
  }

  public removerHorario(idHorario: number): void {
    this.props.horarios = this.props.horarios.filter(
      (h) => h.id.toValue() !== idHorario,
    );
  }
}
