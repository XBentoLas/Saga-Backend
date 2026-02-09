import { Agendamento } from '../agendamento';
import { AgendamentoId } from '../identifier/agendamento-id';
import { DiaSemana } from '../enums';

export abstract class IAgendamentoRepository {
  abstract save(agendamento: Agendamento): Promise<void>;

  abstract findById(id: AgendamentoId): Promise<Agendamento | null>;

  abstract findConflitoSala(
    salaId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null>;

  abstract findConflitoProfessor(
    professorId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null>;


  abstract findConflitoTurma(
    turmaId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null>;
}
