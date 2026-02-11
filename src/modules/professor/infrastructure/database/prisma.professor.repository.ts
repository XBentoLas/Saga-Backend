import { Prisma, PrismaClient } from '@prisma/client';
import { IProfessorRepository } from '../../domain/repository/professor.repository.interface';
import { Professor } from '../../domain/professor';
import { ProfessorId } from '../../domain/identifier/professor-id';
import { DiaSemana, Turno } from '../../domain/enums';

type ProfessorComRelacoes = Prisma.ProfessorGetPayload<{
  include: {
    horarios: true;
    disciplinas: true;
  };
}>;

export class PrismaProfessorRepository implements IProfessorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(professor: Professor): Promise<void> {
    const rawId = professor.id.toValue();
    const dataProfessor = { nome: professor.nome, email: professor.email };

    const horariosCreateInput = professor.horarios.map((h) => ({
      dia_semana: h.diaSemana as unknown as DiaSemana,
      turno: h.turno as unknown as Turno,
      hora_inicio: h.horaInicio,
      hora_fim: h.horaFim,
    }));

    const disciplinasConnectInput = professor.disciplinaIds.map((id) => ({
      id_disciplina: id.toValue(),
    }));

    await this.prisma.professor.upsert({
      where: { id_professor: rawId !== 0 ? rawId : -1 },
      create: {
        ...dataProfessor,
        horarios: { create: horariosCreateInput },
        disciplinas: { connect: disciplinasConnectInput },
      },
      update: {
        ...dataProfessor,
        horarios: { deleteMany: {}, create: horariosCreateInput },
        disciplinas: { set: disciplinasConnectInput },
      },
    });
  }

  async findById(id: ProfessorId): Promise<Professor | null> {
    const prismaProfessor = await this.prisma.professor.findUnique({
      where: { id_professor: id.toValue() },
      include: { horarios: true, disciplinas: true },
    });
    if (!prismaProfessor) return null;
    return this.toDomain(prismaProfessor);
  }

  async findByEmail(email: string): Promise<Professor | null> {
    const prismaProfessor = await this.prisma.professor.findUnique({
      where: { email: email },
      include: { horarios: true, disciplinas: true },
    });
    if (!prismaProfessor) return null;
    return this.toDomain(prismaProfessor);
  }

  private toDomain(prismaData: ProfessorComRelacoes): Professor {
    const disciplinasMapped = prismaData.disciplinas.map((d) => ({
      id_disciplina: d.id_disciplina,
    }));

    const horariosMapped = prismaData.horarios.map((h) => ({
      id_horario: h.id_horario,
      dia_semana: h.dia_semana as string,
      turno: h.turno as string,
      hora_inicio: h.hora_inicio,
      hora_fim: h.hora_fim,
    }));

    return Professor.restore(
      {
        nome: prismaData.nome,
        email: prismaData.email,
        horarios: horariosMapped,
        disciplinas: disciplinasMapped,
      },
      ProfessorId.create(prismaData.id_professor),
    );
  }
}
