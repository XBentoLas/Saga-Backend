import { Predio } from '../predio';
import { PredioId } from '../identifier/predio-id';

export abstract class IPredioRepository {
  abstract save(predio: Predio): Promise<void>;

  abstract findById(id: PredioId): Promise<Predio | null>;

  abstract findAll(): Promise<Predio[]>;

  abstract findByName(nome: string): Promise<Predio | null>;

  abstract delete(id: PredioId): Promise<void>;
}
