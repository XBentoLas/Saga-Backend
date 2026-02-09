import { Entity } from '../../../common/domain/entity';
import { TurmaId } from './identifier/turma-id';

export interface TurmaProps {
  semestre: number;
  quantidade: number | null;
}

export class Turma extends Entity<TurmaProps> {
  constructor(props: TurmaProps, id?: TurmaId) {
    super(props, id ?? TurmaId.newId());
  }

  get id(): TurmaId {
    return this._id as TurmaId;
  }

  get semestre(): number {
    return this.props.semestre;
  }
  get quantidade(): number | null {
    return this.props.quantidade;
  }

  // --- Factory: Create (Nova Turma) ---
  public static create(
    props: { semestre: number; quantidade?: number },
    id?: TurmaId,
  ): Turma {
    if (props.semestre <= 0) {
      throw new Error('O semestre deve ser maior que zero.');
    }

    return new Turma(
      {
        semestre: props.semestre,
        quantidade: props.quantidade || null,
      },
      id,
    );
  }

  // --- Factory: Restore (Do Banco) ---
  public static restore(
    props: {
      semestre: number;
      quantidade: number | null;
    },
    id: TurmaId,
  ): Turma {
    return new Turma(
      {
        semestre: props.semestre,
        quantidade: props.quantidade,
      },
      id,
    );
  }

  public atualizarQuantidade(novaQuantidade: number): void {
    if (novaQuantidade < 0)
      throw new Error('Quantidade não pode ser negativa.');
    this.props.quantidade = novaQuantidade;
  }
}
