import { Predio } from '../predio';
import { PredioId } from '../identifier/predio-id';

export abstract class IPredioRepository {
  abstract save(predio: Predio): Promise<void>;

  abstract findById(id: PredioId): Promise<Predio | null>;

  abstract findAll(): Promise<Predio[]>;
}
