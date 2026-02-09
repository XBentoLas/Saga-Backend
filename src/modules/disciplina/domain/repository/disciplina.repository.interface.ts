import { Disciplina } from '../disciplina';
import { DisciplinaId } from '../identifier/disciplina-id';

export abstract class IDisciplinaRepository {
  abstract save(disciplina: Disciplina): Promise<void>;

  abstract findById(id: DisciplinaId): Promise<Disciplina | null>;

  abstract findByCodigo(codigo: string): Promise<Disciplina | null>;

  abstract findByCursoId(cursoId: number): Promise<Disciplina[]>;
}
