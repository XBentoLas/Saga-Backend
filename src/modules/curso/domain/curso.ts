import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { CursoId } from './identifier/curso-id';
import { Turma } from './turma';
import { TurmaId } from './identifier/turma-id';
import { DisciplinaId } from '../../disciplina/domain/identifier/disciplina-id';

export interface CursoProps {
  nome: string;
  codigoCurso: string;
  turmas: Turma[]; // Entidade Filha (One-to-Many)
  disciplinaIds: DisciplinaId[]; // Referência Externa (Many-to-Many)
}

export class Curso extends AggregateRoot<CursoProps> {
  constructor(props: CursoProps, id?: CursoId) {
    super(props, id ?? CursoId.newId());

    // Valida apenas se for novo
    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): CursoId {
    return this._id as CursoId;
  }
  get nome(): string {
    return this.props.nome;
  }
  get codigoCurso(): string {
    return this.props.codigoCurso;
  }
  get turmas(): Turma[] {
    return this.props.turmas;
  }
  get disciplinaIds(): DisciplinaId[] {
    return this.props.disciplinaIds;
  }

  // --- Factory: Create ---
  public static create(
    props: { nome: string; codigoCurso: string },
    id?: CursoId,
  ): Curso {
    return new Curso(
      {
        nome: props.nome,
        codigoCurso: props.codigoCurso,
        turmas: [],
        disciplinaIds: [],
      },
      id,
    );
  }

  // --- Factory: Restore ---
  public static restore(
    props: {
      nome: string;
      codigo_curso: string;
      // Lista de Turmas (Filhas)
      turmas?: {
        id_turma: number;
        semestre: number;
        quantidade: number | null;
      }[];
      // Lista da Tabela Pivot (Many-to-Many)
      disciplinas?: {
        id_disciplina: number;
      }[];
    },
    id: CursoId,
  ): Curso {
    // 1. Restaura Turmas
    const turmasDomain = (props.turmas || []).map((t) =>
      Turma.restore(
        {
          semestre: t.semestre,
          quantidade: t.quantidade,
        },
        TurmaId.create(t.id_turma),
      ),
    );

    // 2. Restaura IDs de Disciplinas
    const disciplinasIdsDomain = (props.disciplinas || []).map((d) =>
      DisciplinaId.create(d.id_disciplina),
    );

    return new Curso(
      {
        nome: props.nome,
        codigoCurso: props.codigo_curso,
        turmas: turmasDomain,
        disciplinaIds: disciplinasIdsDomain,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 3) {
      throw new Error('O nome do curso deve ter pelo menos 3 caracteres.');
    }
    if (!this.props.codigoCurso) {
      throw new Error('O código do curso é obrigatório.');
    }
  }

  // --- Comportamentos: Turmas ---

  public adicionarTurma(semestre: number, quantidade?: number): void {
    // Regra: Não pode haver duas turmas para o mesmo semestre? (Depende do seu negócio)
    // Vamos supor que pode, senão você faria um .some() aqui para validar.

    const novaTurma = Turma.create({ semestre, quantidade });
    this.props.turmas.push(novaTurma);
  }

  public removerTurma(idTurma: number): void {
    this.props.turmas = this.props.turmas.filter(
      (t) => t.id.toValue() !== idTurma,
    );
  }

  // --- Comportamentos: Disciplinas ---

  public associarDisciplina(idDisciplina: number): void {
    const exists = this.props.disciplinaIds.some(
      (d) => d.toValue() === idDisciplina,
    );
    if (!exists) {
      this.props.disciplinaIds.push(DisciplinaId.create(idDisciplina));
    }
  }

  public desassociarDisciplina(idDisciplina: number): void {
    this.props.disciplinaIds = this.props.disciplinaIds.filter(
      (d) => d.toValue() !== idDisciplina,
    );
  }
}
