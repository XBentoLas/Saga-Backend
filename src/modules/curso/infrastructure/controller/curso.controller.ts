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
import { ImportCursoExcelUseCase } from '../../application/use-cases/import-curso-excel.use-case';
import { DeleteCursoUseCase } from '../../application/use-cases/delete-curso.use-case';


@Controller('cursos')
export class CursoController {
  constructor(
    private readonly importExcelUseCase: ImportCursoExcelUseCase,
    private readonly deleteUseCase: DeleteCursoUseCase,
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
        'Formato inválido. O arquivo deve ser uma planilha Excel (.xlsx).',
      );
    }

    try {
      await this.importExcelUseCase.execute({ fileBuffer: file.buffer });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Erro inesperado ao importar cursos.');
    }

    return { message: 'Cursos importados com sucesso!' };
  }

  @Delete(':id')
  async deleteCurso(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ cursoId: id });
    return { message: 'Curso removido com sucesso!' };
  }
}
