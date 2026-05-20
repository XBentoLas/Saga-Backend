import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ImportCursoExcelUseCase } from '../../application/use-cases/import-curso-excel.use-case';
import { DeleteCursoUseCase } from '../../application/use-cases/delete-curso.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@ApiTags('Cursos')
@Controller('cursos')
export class CursoController {
  constructor(
    private readonly importExcelUseCase: ImportCursoExcelUseCase,
    private readonly deleteUseCase: DeleteCursoUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os cursos' })
  @ApiResponse({ status: 200, description: 'Cursos listados com sucesso.' })
  async getAll() {
    return this.prisma.curso.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { turmas: true } } },
    });
  }

  @Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importa cursos a partir de uma planilha Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Planilha Excel (.xlsx) com os dados dos cursos',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'O arquivo .xlsx a ser importado.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Cursos importados com sucesso!' })
  @ApiResponse({
    status: 400,
    description:
      'Requisição inválida. Pode ser por arquivo não enviado, formato inválido ou dados incorretos na planilha.',
  })
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
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove um curso' })
  @ApiParam({
    name: 'id',
    description: 'ID do curso a ser removido',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Curso removido com sucesso!' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async deleteCurso(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteUseCase.execute({ cursoId: id });
    return { message: 'Curso removido com sucesso!' };
  }
}
