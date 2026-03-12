import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IDisciplinaRepository } from '../../domain/repository/disciplina.repository.interface';
import { Disciplina } from '../../domain/disciplina';
import { DisciplinaId } from '../../domain/identifier/disciplina-id';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

type DisciplinaComRelacoes = Prisma.DisciplinaGetPayload<{
  include: {
    cursos: true;
    professores: true;
  };
}>;

@Injectable()
export class PrismaDisciplinaRepository implements IDisciplinaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(disciplina: Disciplina): Promise<void> {
    const rawId = disciplina.id.toValue();

    const dataDisciplina = {
      nome: disciplina.nome,
      codigo_disciplina: disciplina.codigoDisciplina,
    };

    const cursosConnectInput = disciplina.cursoIds.map((id) => ({
      id_curso: id.toValue(),
    }));

    const professoresConnectInput = disciplina.professorIds.map((id) => ({
      id_professor: id.toValue(),
    }));

    await this.prisma.disciplina.upsert({
      where: { id_disciplina: rawId !== 0 ? rawId : -1 },
      create: {
        ...dataDisciplina,
        cursos: {
          connect: cursosConnectInput,
        },
        professores: {
          connect: professoresConnectInput,
        },
      },
      update: {
        ...dataDisciplina,
        cursos: {
          set: cursosConnectInput,
        },
        professores: {
          set: professoresConnectInput,
        },
      },
    });
  }

  async findById(id: DisciplinaId): Promise<Disciplina | null> {
    const prismaDisciplina = await this.prisma.disciplina.findUnique({
      where: { id_disciplina: id.toValue() },
      include: {
        cursos: true,
        professores: true,
      },
    });

    if (!prismaDisciplina) return null;

    return this.toDomain(prismaDisciplina);
  }

  async findByCodigo(codigo: string): Promise<Disciplina | null> {
    const prismaDisciplina = await this.prisma.disciplina.findUnique({
      where: { codigo_disciplina: codigo },
      include: {
        cursos: true,
        professores: true,
      },
    });

    if (!prismaDisciplina) return null;

    return this.toDomain(prismaDisciplina);
  }

  async findByCursoId(cursoId: number): Promise<Disciplina[]> {
    const prismaDisciplinas = await this.prisma.disciplina.findMany({
      where: {
        cursos: {
          some: {
            id_curso: cursoId,
          },
        },
      },
      include: {
        cursos: true,
        professores: true,
      },
    });

    return prismaDisciplinas.map((d) => this.toDomain(d));
  }

  private toDomain(prismaData: DisciplinaComRelacoes): Disciplina {
    const cursosMapped = prismaData.cursos.map((c) => ({
      id_curso: c.id_curso,
    }));

    const professoresMapped = prismaData.professores.map((p) => ({
      id_professor: p.id_professor,
    }));

    return Disciplina.restore(
      {
        codigo_disciplina: prismaData.codigo_disciplina,
        nome: prismaData.nome,
        cursos: cursosMapped,
        professores: professoresMapped,
      },
      DisciplinaId.create(prismaData.id_disciplina),
    );
  }
}
