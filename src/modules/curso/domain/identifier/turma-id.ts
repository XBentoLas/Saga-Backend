import { Identifier } from '../../../../common/domain/identifier';

export class TurmaId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): TurmaId {
    if (id < 0) throw new Error('O ID da turma não pode ser negativo.');
    return new TurmaId(id);
  }

  public static newId(): TurmaId {
    return new TurmaId(0);
  }
}
