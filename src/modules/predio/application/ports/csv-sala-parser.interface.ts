import { SalaImportDto} from '../dtos/command/sala-import.dto';

export abstract class ICsvSalaParser {
  abstract parse(buffer: Buffer): Promise<SalaImportDto[]>;
}
