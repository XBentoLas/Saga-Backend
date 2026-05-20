import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@ApiTags('Agendamentos')
@Controller('agendamentos')
export class AgendamentoController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os agendamentos com dados enriquecidos' })
  @ApiQuery({ name: 'dia', required: false, enum: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'], description: 'Filtrar por dia da semana' })
  @ApiResponse({ status: 200, description: 'Agendamentos listados com sucesso.' })
  async getAll(@Query('dia') dia?: string) {
    const where = dia ? { dia_semana: dia as any } : {};

    return this.prisma.agendamento.findMany({
      where,
      orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
      include: {
        professor: {
          select: { id_professor: true, nome: true },
        },
        turma: {
          select: {
            id_turma: true,
            codigo_turma: true,
            turno: true,
            quantidade: true,
            semestre: true,
            curso: { select: { nome: true, codigo_curso: true } },
          },
        },
        sala: {
          select: {
            id_sala: true,
            numero_sala: true,
            capacidade: true,
            predio: { select: { nome: true } },
          },
        },
      },
    });
  }
}
