import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { ProfessorId } from './identifier/professor-id';
import { DisciplinaId } from './identifier/disciplina-id';
import { HorarioProfessor, HorarioProfessorProps } from './horario-professor';

export interface ProfessorProps {
  nome: string;
  email: string;
  horarios: HorarioProfessor[];
  disciplinaIds: DisciplinaId[];
}

export class Professor extends AggregateRoot<ProfessorProps> {
  constructor(props: ProfessorProps, id?: ProfessorId) {
    super(props, id ?? ProfessorId.newId());

    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): ProfessorId {
    return this._id as ProfessorId;
  }

  // --- Factory: Create ---
  public static create(
    props: { nome: string; email: string },
    id?: ProfessorId,
  ): Professor {
    return new Professor(
      {
        nome: props.nome,
        email: props.email,
        horarios: [],
        disciplinaIds: [],
      },
      id,
    );
  }

  // --- Factory: Restore ---
  public static restore(
    props: {
      nome: string;
      email: string;
      // Note que a tipagem aqui reflete os dados crus (snake_case)
      horarios?: {
        id_horario: number;
        dia_semana: string;
        turno: string;
        hora_inicio: Date;
        hora_fim: Date;
      }[];
      disciplinas?: {
        id_disciplina: number;
      }[];
    },
    id: ProfessorId,
  ): Professor {
    // 1. Delega a reconstrução para o método restore do filho
    const horariosDomain = (props.horarios || []).map((h) =>
      HorarioProfessor.restore(h, h.id_horario),
    );

    // 2. Reconstrói os IDs das Disciplinas
    const disciplinasIdsDomain = (props.disciplinas || []).map((d) =>
      DisciplinaId.create(d.id_disciplina),
    );

    return new Professor(
      {
        nome: props.nome,
        email: props.email,
        horarios: horariosDomain,
        disciplinaIds: disciplinasIdsDomain,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new Error('O nome do professor é inválido.');
    }
    if (!this.props.email || !this.props.email.includes('@')) {
      throw new Error('Email inválido.');
    }
  }

  // --- Getters ---
  get nome(): string {
    return this.props.nome;
  }
  get email(): string {
    return this.props.email;
  }
  get horarios(): HorarioProfessor[] {
    return this.props.horarios;
  }
  get disciplinaIds(): DisciplinaId[] {
    return this.props.disciplinaIds;
  }

  // --- Comportamentos (Horários) ---
  public adicionarHorario(horario: HorarioProfessorProps): void {
    const novoHorario = HorarioProfessor.create(horario);
    this.props.horarios.push(novoHorario);
  }

  public removerHorario(idHorario: number): void {
    this.props.horarios = this.props.horarios.filter(
      (h) => h.id.toValue() !== idHorario,
    );
  }

  // --- Comportamentos (Disciplinas) ---
  public associarDisciplina(idDisciplina: number): void {
    const exists = this.props.disciplinaIds.some(
      (id) => id.toValue() === idDisciplina,
    );
    if (!exists) {
      this.props.disciplinaIds.push(DisciplinaId.create(idDisciplina));
    }
  }

  public desassociarDisciplina(idDisciplina: number): void {
    this.props.disciplinaIds = this.props.disciplinaIds.filter(
      (id) => id.toValue() !== idDisciplina,
    );
  }
}
