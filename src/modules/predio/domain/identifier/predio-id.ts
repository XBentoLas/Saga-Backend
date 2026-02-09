import { Identifier } from '../../../../common/domain/identifier';

export class PredioId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): PredioId {
    if (id < 0) throw new Error('O ID do prédio não pode ser negativo.');
    return new PredioId(id);
  }

  public static newId(): PredioId {
    return new PredioId(0);
  }
}
