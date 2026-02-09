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
}
