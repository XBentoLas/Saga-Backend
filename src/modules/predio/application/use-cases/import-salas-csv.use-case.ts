import { Injectable } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { ICsvSalaParser } from '../ports/csv-sala-parser.interface';
import { Predio } from '../../domain/predio';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ImportSalasCsvUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    private readonly csvParser: ICsvSalaParser,
    @InjectPinoLogger(ImportSalasCsvUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(fileBuffer: Buffer): Promise<void> {
    this.logger.info({ msg: 'Iniciando importação de salas via CSV' });

    const salasData = await this.csvParser.parse(fileBuffer);

    const prediosMap = new Map<string, typeof salasData>();

    for (const salaDto of salasData) {
      if (!prediosMap.has(salaDto.predio)) {
        prediosMap.set(salaDto.predio, []);
      }
      prediosMap.get(salaDto.predio)!.push(salaDto);
    }

    try {
      for (const [nomePredio, salasDoPredio] of prediosMap.entries()) {
        let predio = await this.predioRepository.findByName(nomePredio);

        if (!predio) {
          this.logger.info({
            msg: 'Criando novo prédio a partir da importação',
            nomePredio,
          });
          predio = Predio.create({ nome: nomePredio });
        }

        for (const s of salasDoPredio) {
          predio.adicionarSala(s.numeroSala, s.capacidade, s.tipoSala);
        }

        await this.predioRepository.save(predio);
      }

      this.logger.info({ msg: 'Importação finalizada com sucesso' });
    } catch (error) {
      this.logger.error({
        msg: 'Erro crítico ao tentar persistir os prédios importados no banco de dados',
        err: error as Error,
      });
      throw error;
    }
  }
}
