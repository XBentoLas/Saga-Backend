import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { GenerateAvailabilityTemplateUseCase } from '../../application/use-cases/generate-availability-template.use-case';
import { ImportProfessorExcelUseCase } from '../../application/use-cases/import-professor-excel.use-case';
import { DeleteProfessorUseCase } from '../../application/use-cases/delete-professor.use-case';

@Controller('professores')
export class ProfessorController {
  constructor(
    private readonly generateTemplateUseCase: GenerateAvailabilityTemplateUseCase,
    private readonly importProfessorExcelUseCase: ImportProfessorExcelUseCase,
    private readonly deleteProfessorUseCase: DeleteProfessorUseCase,
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
  @UseInterceptors(FileInterceptor('file'))
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

    try {
      await this.importProfessorExcelUseCase.execute({
        fileBuffer: file.buffer,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        'Erro inesperado ao importar a disponibilidade.',
      );
    }

    return { message: 'Disponibilidade do professor importada com sucesso!' };
  }
  @Delete(':id')
  async deleteProfessor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteProfessorUseCase.execute({ professorId: id });
    return { message: 'Professor removido com sucesso!' };
  }
}
