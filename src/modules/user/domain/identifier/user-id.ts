import { Identifier } from '../../../../common/domain/identifier';

export class UserId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): UserId {
    if (id < 0) {
      throw new Error('O ID do usuário não pode ser negativo.');
    }
    return new UserId(id);
  }

  public static newId(): UserId {
    return new UserId(0);
  }
}
