import { Turma } from '../turma';
import { TurmaId } from '../identifier/turma-id';

export abstract class ITurmaRepository {
  abstract save(turma: Turma): Promise<void>;
  abstract findById(id: TurmaId): Promise<Turma | null>;
  abstract findByCodigo(codigo: string): Promise<Turma | null>;
  abstract delete(id: TurmaId): Promise<void>;
}
