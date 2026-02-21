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
    this.logger.info({ msg: 'Criando novo prédio', nome: command.nome });

    const predio = Predio.create({ nome: command.nome });

    await this.predioRepository.save(predio);

    return PredioOutput.fromDomain(predio);
  }
}
