import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { DisciplinaId } from './identifier/disciplina-id';
import { CursoId } from './identifier/curso-id';
import { ProfessorId } from '../../professor/domain/identifier/professor-id';

export interface DisciplinaProps {
  codigoDisciplina: string;
  nome: string;
  // Arrays de IDs para representar as tabelas de ligação
  cursoIds: CursoId[];
  professorIds: ProfessorId[];
}

export class Disciplina extends AggregateRoot<DisciplinaProps> {
  constructor(props: DisciplinaProps, id?: DisciplinaId) {
    super(props, id ?? DisciplinaId.newId());

    if (this.id.toValue() === 0) {
      this.validate();
    }
  }

  get id(): DisciplinaId {
    return this._id as DisciplinaId;
  }

  // --- Factory: Create (Nova Disciplina) ---
  public static create(
    props: { codigoDisciplina: string; nome: string },
    id?: DisciplinaId,
  ): Disciplina {
    return new Disciplina(
      {
        codigoDisciplina: props.codigoDisciplina,
        nome: props.nome,
        cursoIds: [], // Inicia sem cursos vinculados
        professorIds: [], // Inicia sem professores vinculados
      },
      id,
    );
  }

  // --- Factory: Restore (Do Banco) ---
  public static restore(
    props: {
      codigo_disciplina: string;
      nome: string;
      // Dados vindos da tabela pivot 'disciplina_curso'
      cursos?: { id_curso: number }[];
      // Dados vindos da tabela pivot 'disciplina_professor'
      professores?: { id_professor: number }[];
    },
    id: DisciplinaId,
  ): Disciplina {
    // 1. Reconstrói IDs de Cursos (Mapeia da tabela pivot para Domain IDs)
    const cursosIdsDomain = (props.cursos || []).map((c) =>
      CursoId.create(c.id_curso),
    );

    // 2. Reconstrói IDs de Professores (Mapeia da tabela pivot para Domain IDs)
    const professoresIdsDomain = (props.professores || []).map((p) =>
      ProfessorId.create(p.id_professor),
    );

    return new Disciplina(
      {
        codigoDisciplina: props.codigo_disciplina,
        nome: props.nome,
        cursoIds: cursosIdsDomain,
        professorIds: professoresIdsDomain,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.nome || this.props.nome.trim().length < 3) {
      throw new Error('O nome da disciplina deve ter pelo menos 3 caracteres.');
    }
    if (
      !this.props.codigoDisciplina ||
      this.props.codigoDisciplina.trim().length === 0
    ) {
      throw new Error('O código da disciplina é obrigatório.');
    }
  }

  // --- Getters ---
  get nome(): string {
    return this.props.nome;
  }
  get codigoDisciplina(): string {
    return this.props.codigoDisciplina;
  }
  get cursoIds(): CursoId[] {
    return this.props.cursoIds;
  }
  get professorIds(): ProfessorId[] {
    return this.props.professorIds;
  }

  // --- Comportamentos (Updates básicos) ---
  public updateNome(nome: string): void {
    this.props.nome = nome;
    this.validate();
  }

  public updateCodigo(codigo: string): void {
    this.props.codigoDisciplina = codigo;
    this.validate();
  }

  // --- Comportamentos (Relacionamento com Cursos) ---

  public associarCurso(idCurso: number): void {
    // Evita duplicatas: só adiciona se já não estiver na lista
    const exists = this.props.cursoIds.some((c) => c.toValue() === idCurso);
    if (!exists) {
      this.props.cursoIds.push(CursoId.create(idCurso));
    }
  }

  public desassociarCurso(idCurso: number): void {
    this.props.cursoIds = this.props.cursoIds.filter(
      (c) => c.toValue() !== idCurso,
    );
  }

  // --- Comportamentos (Relacionamento com Professores) ---

  public associarProfessor(idProfessor: number): void {
    const exists = this.props.professorIds.some(
      (p) => p.toValue() === idProfessor,
    );
    if (!exists) {
      this.props.professorIds.push(ProfessorId.create(idProfessor));
    }
  }

  public desassociarProfessor(idProfessor: number): void {
    this.props.professorIds = this.props.professorIds.filter(
      (p) => p.toValue() !== idProfessor,
    );
  }
}
