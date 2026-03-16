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
import { ImportDisciplinaCsvUseCase } from '../../application/use-cases/import-disciplina-csv.use-case';
import { DeleteDisciplinaUseCase } from '../../application/use-cases/delete-disciplina.use-case';

@Controller('disciplinas')
export class DisciplinaController {
  constructor(
    private readonly importCsvUseCase: ImportDisciplinaCsvUseCase,
    private readonly deleteUseCase: DeleteDisciplinaUseCase,
  ) {}

  @Post('importar-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importarCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Arquivo CSV não enviado.');
    }

    if (!file.originalname.endsWith('.csv') && file.mimetype !== 'text/csv') {
      throw new BadRequestException(
        'Formato inválido. O arquivo deve ser um CSV (.csv).',
      );
    }

    try {
      await this.importCsvUseCase.execute({ fileBuffer: file.buffer });
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
