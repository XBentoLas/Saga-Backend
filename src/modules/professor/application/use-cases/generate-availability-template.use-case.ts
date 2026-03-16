import { Injectable } from '@nestjs/common';
import { IAvailabilityTemplateGenerator } from '../ports/availability-template-generator.interface';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class GenerateAvailabilityTemplateUseCase {
  constructor(
    private readonly templateGenerator: IAvailabilityTemplateGenerator,
    @InjectPinoLogger(GenerateAvailabilityTemplateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(): Promise<Buffer> {
    this.logger.info({
      msg: 'Gerando template de disponibilidade do professor',
    });

    const buffer = await this.templateGenerator.generateTemplate();

    return buffer;
  }
}
