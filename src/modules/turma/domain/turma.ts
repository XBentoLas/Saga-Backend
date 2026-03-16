import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { TurmaId } from './identifier/turma-id';
import { CursoId } from '../../curso/domain/identifier/curso-id';
import { Turno } from './enums';

export interface TurmaProps {
  codigoTurma: string;
  turno: Turno;
  quantidade: number | null;
  semestre: number;
  cursoId: CursoId;
}

export class Turma extends AggregateRoot<TurmaProps> {
  constructor(props: TurmaProps, id?: TurmaId) {
    super(props, id ?? TurmaId.newId());

    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): TurmaId {
    return this._id as TurmaId;
  }
  get codigoTurma(): string {
    return this.props.codigoTurma;
  }
  get turno(): Turno {
    return this.props.turno;
  }
  get quantidade(): number | null {
    return this.props.quantidade;
  }
  get semestre(): number {
    return this.props.semestre;
  }
  get cursoId(): CursoId {
    return this.props.cursoId;
  }

  public static create(
    props: {
      codigoTurma: string;
      turno: Turno;
      quantidade?: number;
      semestre: number;
      cursoId: number;
    },
    id?: TurmaId,
  ): Turma {
    return new Turma(
      {
        codigoTurma: props.codigoTurma,
        turno: props.turno,
        quantidade: props.quantidade || null,
        semestre: props.semestre,
        cursoId: CursoId.create(props.cursoId),
      },
      id,
    );
  }

  public static restore(
    props: {
      codigo_turma: string;
      turno: string;
      quantidade: number | null;
      semestre: number;
      id_curso: number;
    },
    id: TurmaId,
  ): Turma {
    return new Turma(
      {
        codigoTurma: props.codigo_turma,
        turno: props.turno as Turno,
        quantidade: props.quantidade,
        semestre: props.semestre,
        cursoId: CursoId.create(props.id_curso),
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.codigoTurma) {
      throw new Error('O código da turma é obrigatório.');
    }
    if (this.props.semestre <= 0) {
      throw new Error('O semestre deve ser maior que zero.');
    }
  }

  public atualizarQuantidade(novaQuantidade: number): void {
    if (novaQuantidade < 0)
      throw new Error('Quantidade de alunos não pode ser negativa.');
    this.props.quantidade = novaQuantidade;
  }
}
