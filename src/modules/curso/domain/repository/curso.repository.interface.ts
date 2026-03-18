import { Curso } from '../curso';
import { CursoId } from '../identifier/curso-id';

export abstract class ICursoRepository {
  abstract save(curso: Curso): Promise<void>;

  abstract findById(id: CursoId): Promise<Curso | null>;

  abstract findByCodigo(codigo: string): Promise<Curso | null>;

  abstract findAll(): Promise<Curso[]>;

  abstract delete(id: CursoId): Promise<void>;
}
