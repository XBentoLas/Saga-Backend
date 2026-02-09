import { Identifier } from '../../../../common/domain/identifier';

export class DisciplinaId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): DisciplinaId {
    if (id < 0) {
      throw new Error('O ID da disciplina não pode ser negativo.');
    }
    return new DisciplinaId(id);
  }

  public static newId(): DisciplinaId {
    return new DisciplinaId(0);
  }
}
