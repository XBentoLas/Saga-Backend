import { Controller, Get, Post, Delete, Query, Body, Param, ParseIntPipe, HttpCode, ConflictException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CreateAgendamentoDto } from '../../application/dto/create-agendamento.dto';

const AGENDAMENTO_INCLUDE = {
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
} as const;

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
      include: AGENDAMENTO_INCLUDE,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo agendamento com verificação de conflitos' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Conflito de horário detectado.' })
  async create(@Body() dto: CreateAgendamentoDto) {
    const inicioDate = new Date(`1970-01-01T${dto.hora_inicio}:00.000Z`);
    const fimDate = new Date(`1970-01-01T${dto.hora_fim}:00.000Z`);

    const timeOverlap = {
      AND: [
        { hora_inicio: { lt: fimDate } },
        { hora_fim: { gt: inicioDate } },
      ],
    };

    const salaConflict = await this.prisma.agendamento.findFirst({
      where: {
        id_sala: dto.id_sala,
        dia_semana: dto.dia_semana as any,
        ...timeOverlap,
      },
    });

    if (salaConflict) {
      throw new ConflictException('Conflito de horário: a sala já está ocupada neste dia e horário.');
    }

    const professorConflict = await this.prisma.agendamento.findFirst({
      where: {
        id_professor: dto.id_professor,
        dia_semana: dto.dia_semana as any,
        ...timeOverlap,
      },
    });

    if (professorConflict) {
      throw new ConflictException('Conflito de horário: o professor já possui aula neste dia e horário.');
    }

    const turmaConflict = await this.prisma.agendamento.findFirst({
      where: {
        id_turma: dto.id_turma,
        dia_semana: dto.dia_semana as any,
        ...timeOverlap,
      },
    });

    if (turmaConflict) {
      throw new ConflictException('Conflito de horário: a turma já possui aula neste dia e horário.');
    }

    return this.prisma.agendamento.create({
      data: {
        id_professor: dto.id_professor,
        id_turma: dto.id_turma,
        id_sala: dto.id_sala,
        dia_semana: dto.dia_semana as any,
        hora_inicio: inicioDate,
        hora_fim: fimDate,
      },
      include: AGENDAMENTO_INCLUDE,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um agendamento pelo ID' })
  @ApiResponse({ status: 204, description: 'Agendamento removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.prisma.agendamento.findUnique({
      where: { id_agendamento: id },
    });

    if (!existing) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado.`);
    }

    await this.prisma.agendamento.delete({
      where: { id_agendamento: id },
    });
  }
}
