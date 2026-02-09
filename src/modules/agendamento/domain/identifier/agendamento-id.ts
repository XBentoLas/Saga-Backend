import { Identifier } from '../../../../common/domain/identifier';

export class AgendamentoId extends Identifier {
  private constructor(id: number) {
    super(id);
  }

  public static create(id: number): AgendamentoId {
    if (id < 0) throw new Error('O ID do agendamento não pode ser negativo.');
    return new AgendamentoId(id);
  }

  public static newId(): AgendamentoId {
    return new AgendamentoId(0);
  }
}
