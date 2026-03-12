import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { GenerateAvailabilityTemplateUseCase } from '../../application/use-cases/generate-availability-template.use-case';
import { ImportProfessorExcelUseCase } from '../../application/use-cases/import-professor-excel.use-case';

@Controller('professores')
export class ProfessorController {
  constructor(
    private readonly generateTemplateUseCase: GenerateAvailabilityTemplateUseCase,
    // 👇 1. Injetamos o novo Use Case aqui
    private readonly importProfessorExcelUseCase: ImportProfessorExcelUseCase,
  ) {}

  @Get('template-disponibilidade')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.generateTemplateUseCase.execute();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="Template_Disponibilidade.xlsx"',
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  @Post('importar-disponibilidade')
  @UseInterceptors(FileInterceptor('file')) // 'file' será a chave no Postman
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    const isExcel =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx');

    if (!isExcel) {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser uma planilha Excel (.xlsx).',
      );
    }

    await this.importProfessorExcelUseCase.execute({
      fileBuffer: file.buffer,
    });

    return { message: 'Disponibilidade do professor importada com sucesso!' };
  }
}
