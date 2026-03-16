import { AggregateRoot } from '../../../common/domain/aggregate-root';
import { CursoId } from './identifier/curso-id';
import { DisciplinaId } from '../../disciplina/domain/identifier/disciplina-id';

export interface CursoProps {
  nome: string;
  codigoCurso: string;
  disciplinaIds: DisciplinaId[];
}

export class Curso extends AggregateRoot<CursoProps> {
  constructor(props: CursoProps, id?: CursoId) {
    super(props, id ?? CursoId.newId());

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
  get disciplinaIds(): DisciplinaId[] {
    return this.props.disciplinaIds;
  }

  public static create(
    props: { nome: string; codigoCurso: string },
    id?: CursoId,
  ): Curso {
    return new Curso(
      { nome: props.nome, codigoCurso: props.codigoCurso, disciplinaIds: [] },
      id,
    );
  }

  public static restore(
    props: {
      nome: string;
      codigo_curso: string;
      disciplinas?: { id_disciplina: number }[];
    },
    id: CursoId,
  ): Curso {
    const disciplinasIdsDomain = (props.disciplinas || []).map((d) =>
      DisciplinaId.create(d.id_disciplina),
    );

    return new Curso(
      {
        nome: props.nome,
        codigoCurso: props.codigo_curso,
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

  public updateNome(nome: string): void {
    this.props.nome = nome;
    this.validate();
  }

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
