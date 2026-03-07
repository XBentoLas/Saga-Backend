import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GenerateAvailabilityTemplateUseCase } from '../../application/use-cases/generate-availability-template.use-case';

@Controller('professores')
export class ProfessorController {
  constructor(
    private readonly generateTemplateUseCase: GenerateAvailabilityTemplateUseCase,
  ) {}

  @Get('template-disponibilidade')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.generateTemplateUseCase.execute();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="Template_Disponibilidade.xlsx"',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
