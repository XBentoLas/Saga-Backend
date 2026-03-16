import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ICursoRepository } from '../../domain/repository/curso.repository.interface';
import { Curso } from '../../domain/curso';
import { CursoId } from '../../domain/identifier/curso-id';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

type CursoComRelacoes = Prisma.CursoGetPayload<{
  include: { disciplinas: true }; // 👈 Removido turmas
}>;

@Injectable()
export class PrismaCursoRepository implements ICursoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(curso: Curso): Promise<void> {
    const rawId = curso.id.toValue();
    const dataCurso = {
      nome: curso.nome,
      codigo_curso: curso.codigoCurso,
    };

    const disciplinasConnectInput = curso.disciplinaIds.map((id) => ({
      id_disciplina: id.toValue(),
    }));

    await this.prisma.curso.upsert({
      where: { id_curso: rawId !== 0 ? rawId : -1 },
      create: {
        ...dataCurso,
        disciplinas: { connect: disciplinasConnectInput },
      },
      update: {
        ...dataCurso,
        disciplinas: { set: disciplinasConnectInput },
      },
    });
  }

  async findById(id: CursoId): Promise<Curso | null> {
    const prismaCurso = await this.prisma.curso.findUnique({
      where: { id_curso: id.toValue() },
      include: { disciplinas: true },
    });
    if (!prismaCurso) return null;
    return this.toDomain(prismaCurso);
  }

  async findByCodigo(codigo: string): Promise<Curso | null> {
    const prismaCurso = await this.prisma.curso.findUnique({
      where: { codigo_curso: codigo },
      include: { disciplinas: true },
    });
    if (!prismaCurso) return null;
    return this.toDomain(prismaCurso);
  }

  async findAll(): Promise<Curso[]> {
    const prismaCursos = await this.prisma.curso.findMany({
      include: { disciplinas: true },
    });
    return prismaCursos.map((c) => this.toDomain(c));
  }

  async delete(id: CursoId): Promise<void> {
    await this.prisma.curso.delete({
      where: { id_curso: id.toValue() },
    });
  }

  private toDomain(prismaData: CursoComRelacoes): Curso {
    const disciplinasMapped = prismaData.disciplinas.map((d) => ({
      id_disciplina: d.id_disciplina,
    }));

    return Curso.restore(
      {
        nome: prismaData.nome,
        codigo_curso: prismaData.codigo_curso,
        disciplinas: disciplinasMapped,
      },
      CursoId.create(prismaData.id_curso),
    );
  }
}
