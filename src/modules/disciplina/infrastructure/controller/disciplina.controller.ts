import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportDisciplinaExcelUseCase } from '../../application/use-cases/import-disciplina-excel.use-case';
import { DeleteDisciplinaUseCase } from '../../application/use-cases/delete-disciplina.use-case';

@Controller('disciplinas')
export class DisciplinaController {
  constructor(
    private readonly importExcelUseCase: ImportDisciplinaExcelUseCase,
    private readonly deleteUseCase: DeleteDisciplinaUseCase,
  ) {}

  @Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Arquivo Excel não enviado.');
    }

    const isExcel =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx');

    if (!isExcel) {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser um Excel (.xlsx).',
      );
    }

    try {
      await this.importExcelUseCase.execute({ fileBuffer: file.buffer });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Erro inesperado ao importar disciplinas.');
    }

    return { message: 'Disciplinas importadas com sucesso!' };
  }

  @Delete(':id')
  async deleteDisciplina(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ disciplinaId: id });
    return { message: 'Disciplina removida com sucesso!' };
  }
}
