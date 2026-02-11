import { Prisma, PrismaClient } from '@prisma/client';
import { DiaSemana as PrismaDiaSemana } from '@prisma/client';
import { IAgendamentoRepository } from '../../domain/repository/agendamento.repository.interface';
import { Agendamento } from '../../domain/agendamento';
import { AgendamentoId } from '../../domain/identifier/agendamento-id';
import { DiaSemana } from '../../domain/enums';

export class PrismaAgendamentoRepository implements IAgendamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(agendamento: Agendamento): Promise<void> {
    const rawId = agendamento.id.toValue();

    const dataAgendamento = {
      id_professor: agendamento.professorId.toValue(),
      id_turma: agendamento.turmaId.toValue(),
      id_sala: agendamento.salaId.toValue(),
      // Cast necessário entre o Enum do Domínio e o do Prisma
      dia_semana: agendamento.diaSemana as unknown as PrismaDiaSemana,
      hora_inicio: agendamento.horaInicio,
      hora_fim: agendamento.horaFim,
    };

    await this.prisma.agendamento.upsert({
      where: { id_agendamento: rawId !== 0 ? rawId : -1 },

      // Agendamento é um agregado raiz "flat" (sem filhos diretos no save),
      // então create e update são idênticos nos dados.
      create: dataAgendamento,
      update: dataAgendamento,
    });
  }

  async findById(id: AgendamentoId): Promise<Agendamento | null> {
    const prismaAgendamento = await this.prisma.agendamento.findUnique({
      where: { id_agendamento: id.toValue() },
    });

    if (!prismaAgendamento) return null;

    return this.toDomain(prismaAgendamento);
  }

  // --- Métodos de Verificação de Conflito ---

  async findConflitoSala(
    salaId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null> {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        id_sala: salaId,
        dia_semana: dia as unknown as PrismaDiaSemana,
        // Lógica de Sobreposição de Horário
        AND: [
          { hora_inicio: { lt: fim } }, // Começa antes do novo terminar
          { hora_fim: { gt: inicio } }, // Termina depois do novo começar
        ],
      },
    });

    return conflito ? this.toDomain(conflito) : null;
  }

  async findConflitoProfessor(
    professorId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null> {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        id_professor: professorId,
        dia_semana: dia as unknown as PrismaDiaSemana,
        AND: [{ hora_inicio: { lt: fim } }, { hora_fim: { gt: inicio } }],
      },
    });

    return conflito ? this.toDomain(conflito) : null;
  }

  async findConflitoTurma(
    turmaId: number,
    dia: DiaSemana,
    inicio: Date,
    fim: Date,
  ): Promise<Agendamento | null> {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        id_turma: turmaId,
        dia_semana: dia as unknown as PrismaDiaSemana,
        AND: [{ hora_inicio: { lt: fim } }, { hora_fim: { gt: inicio } }],
      },
    });

    return conflito ? this.toDomain(conflito) : null;
  }

  private toDomain(prismaData: Prisma.AgendamentoGetPayload<{}>): Agendamento {
    return Agendamento.restore(
      {
        id_professor: prismaData.id_professor,
        id_turma: prismaData.id_turma,
        id_sala: prismaData.id_sala,
        dia_semana: prismaData.dia_semana as string, // Restore converte string -> Enum
        hora_inicio: prismaData.hora_inicio,
        hora_fim: prismaData.hora_fim,
      },
      AgendamentoId.create(prismaData.id_agendamento),
    );
  }
}
