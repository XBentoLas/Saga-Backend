import { Professor } from '../professor'; // Importa a Classe de Domínio
import { ProfessorId } from '../identifier/professor-id';

export abstract class IProfessorRepository {
  abstract save(professor: Professor): Promise<void>;

  abstract findById(id: ProfessorId): Promise<Professor | null>;

  abstract findByEmail(email: string): Promise<Professor | null>;

  abstract delete(id: ProfessorId): Promise<void>;
}
