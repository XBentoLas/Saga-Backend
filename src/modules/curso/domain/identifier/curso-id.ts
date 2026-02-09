import { Identifier } from '../../../../common/domain/identifier';

export class CursoId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): CursoId {
    if (id < 0) throw new Error('O ID do curso não pode ser negativo.');
    return new CursoId(id);
  }

  public static newId(): CursoId {
    return new CursoId(0);
  }
}
