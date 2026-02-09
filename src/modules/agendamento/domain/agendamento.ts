import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { AgendamentoId } from './identifier/agendamento-id';
import { DiaSemana } from './enums';
import { ProfessorId } from '../../professor/domain/identifier/professor-id';
import { TurmaId } from '../../curso/domain/identifier/turma-id';
import { SalaId } from '../../predio/domain/identifier/sala-id';

export interface AgendamentoProps {
  professorId: ProfessorId;
  turmaId: TurmaId;
  salaId: SalaId;
  diaSemana: DiaSemana;
  horaInicio: Date;
  horaFim: Date;
}

export class Agendamento extends AggregateRoot<AgendamentoProps> {
  constructor(props: AgendamentoProps, id?: AgendamentoId) {
    super(props, id ?? AgendamentoId.newId());

    // Valida na criação apenas se for novo
    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): AgendamentoId {
    return this._id as AgendamentoId;
  }

  // Getters para as Props
  get professorId(): ProfessorId {
    return this.props.professorId;
  }
  get turmaId(): TurmaId {
    return this.props.turmaId;
  }
  get salaId(): SalaId {
    return this.props.salaId;
  }
  get diaSemana(): DiaSemana {
    return this.props.diaSemana;
  }
  get horaInicio(): Date {
    return this.props.horaInicio;
  }
  get horaFim(): Date {
    return this.props.horaFim;
  }

  // --- Factory: Create (Novo Agendamento) ---
  public static create(
    props: {
      idProfessor: number;
      idTurma: number;
      idSala: number;
      diaSemana: DiaSemana;
      horaInicio: Date;
      horaFim: Date;
    },
    id?: AgendamentoId,
  ): Agendamento {
    return new Agendamento(
      {
        professorId: ProfessorId.create(props.idProfessor),
        turmaId: TurmaId.create(props.idTurma),
        salaId: SalaId.create(props.idSala),
        diaSemana: props.diaSemana,
        horaInicio: props.horaInicio,
        horaFim: props.horaFim,
      },
      id,
    );
  }

  // --- Factory: Restore (Do Banco) ---
  public static restore(
    props: {
      id_professor: number;
      id_turma: number;
      id_sala: number;
      dia_semana: string; // Vem como string/enum do banco
      hora_inicio: Date;
      hora_fim: Date;
    },
    id: AgendamentoId,
  ): Agendamento {
    return new Agendamento(
      {
        professorId: ProfessorId.create(props.id_professor),
        turmaId: TurmaId.create(props.id_turma),
        salaId: SalaId.create(props.id_sala),
        diaSemana: props.dia_semana as DiaSemana,
        horaInicio: props.hora_inicio,
        horaFim: props.hora_fim,
      },
      id,
    );
  }

  public validate(): void {
    // Regra de Domínio básica: O fim não pode ser antes do início
    if (this.props.horaInicio >= this.props.horaFim) {
      throw new Error('A hora final deve ser posterior à hora inicial.');
    }

    // Validar se IDs são positivos é feito dentro de cada Classe ID (.create)
  }

  // --- Comportamentos ---

  public alterarHorario(novoInicio: Date, novoFim: Date): void {
    this.props.horaInicio = novoInicio;
    this.props.horaFim = novoFim;
    this.validate();
  }

  public alterarSala(novaSalaId: number): void {
    this.props.salaId = SalaId.create(novaSalaId);
  }
}
