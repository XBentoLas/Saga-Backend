import { Identifier } from '../../../../common/domain/identifier';

export class ProfessorId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): ProfessorId {
    if (id < 0) {
      throw new Error('O ID do professor não pode ser negativo.');
    }
    return new ProfessorId(id);
  }

  public static newId(): ProfessorId {
    return new ProfessorId(0);
  }
}
