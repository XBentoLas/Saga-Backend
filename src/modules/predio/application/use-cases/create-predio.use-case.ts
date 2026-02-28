import { Injectable } from '@nestjs/common';
import { IPredioRepository } from '../../domain/repository/predio.repository.interface';
import { CreatePredioCommand } from '../dtos/command/create-predio.command';
import { PredioOutput } from '../dtos/outputs/predio.output';
import { Predio } from '../../domain/predio';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CreatePredioUseCase {
  constructor(
    private readonly predioRepository: IPredioRepository,
    @InjectPinoLogger(CreatePredioUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreatePredioCommand): Promise<PredioOutput> {
    this.logger.info({
      msg: 'Iniciando criação de novo prédio',
      nome: command.nome,
    });

    const predio = Predio.create({ nome: command.nome });

    try {
      await this.predioRepository.save(predio);

      this.logger.info({
        msg: 'Prédio criado com sucesso',
        id: predio.id.toValue(),
        nome: predio.nome,
      });

      return PredioOutput.fromDomain(predio);
    } catch (error) {
      this.logger.error({
        msg: 'Erro crítico ao persistir novo prédio no banco de dados',
        err: error,
        nome: command.nome,
      });
      throw error;
    }
  }
}
