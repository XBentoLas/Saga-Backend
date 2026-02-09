import { Identifier } from '../../../../common/domain/identifier';

export class SalaId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): SalaId {
    if (id < 0) throw new Error('O ID da sala não pode ser negativo.');
    return new SalaId(id);
  }

  public static newId(): SalaId {
    return new SalaId(0);
  }
}
