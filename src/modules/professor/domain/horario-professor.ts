import { DiaSemana, Turno } from './enums';
import { Entity } from '../../../common/domain/entity'; // Ajuste o caminho se necessário
import { Identifier } from '../../../common/domain/identifier'; // Ajuste o caminho se necessário

export interface HorarioProfessorProps {
  diaSemana: DiaSemana;
  turno: Turno;
  horaInicio: Date;
  horaFim: Date;
}

export class HorarioProfessor extends Entity<HorarioProfessorProps> {
  constructor(props: HorarioProfessorProps, id?: Identifier) {
    super(props, id ?? new Identifier(0));
  }

  // Getter para facilitar o acesso ao ID numérico
  get id(): Identifier {
    return this._id;
  }

  get diaSemana(): DiaSemana {
    return this.props.diaSemana;
  }
  get turno(): Turno {
    return this.props.turno;
  }
  get horaInicio(): Date {
    return this.props.horaInicio;
  }
  get horaFim(): Date {
    return this.props.horaFim;
  }

  public static create(
    props: HorarioProfessorProps,
    id?: number,
  ): HorarioProfessor {
    return new HorarioProfessor(props, new Identifier(id ?? 0));
  }

  public static restore(
    props: {
      dia_semana: string;
      turno: string;
      hora_inicio: Date;
      hora_fim: Date;
    },
    id: number
  ): HorarioProfessor {
    return new HorarioProfessor(
      {
        diaSemana: props.dia_semana as DiaSemana,
        turno: props.turno as Turno,
        horaInicio: props.hora_inicio,
        horaFim: props.hora_fim,
      },
      new Identifier(id)
    );
  }
}
