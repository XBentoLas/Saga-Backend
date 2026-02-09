import { Entity } from '../../../common/domain/entity';
import { Identifier } from '../../../common/domain/identifier';
import { DiaSemana, Turno } from './enums';

export interface HorarioSalaProps {
  diaSemana: DiaSemana;
  turno: Turno;
  horaInicio: Date;
  horaFim: Date;
}

export class HorarioSala extends Entity<HorarioSalaProps> {
  constructor(props: HorarioSalaProps, id?: Identifier) {
    super(props, id ?? new Identifier(0));
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

  public static create(props: HorarioSalaProps, id?: number): HorarioSala {
    return new HorarioSala(props, new Identifier(id ?? 0));
  }
}
