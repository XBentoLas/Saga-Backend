import { Injectable } from '@nestjs/common';
import { Turno as PrismaTurno, Turma as PrismaTurma } from '@prisma/client';
import { ITurmaRepository } from '../../domain/repository/turma.repository.interface';
import { Turma } from '../../domain/turma';
import { TurmaId } from '../../domain/identifier/turma-id';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class PrismaTurmaRepository implements ITurmaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(turma: Turma): Promise<void> {
    const rawId = turma.id.toValue();

    const dataTurma = {
      codigo_turma: turma.codigoTurma,
      turno: turma.turno as string as PrismaTurno,
      quantidade: turma.quantidade,
      semestre: turma.semestre,
      id_curso: turma.cursoId.toValue(),
    };

    await this.prisma.turma.upsert({
      where: { id_turma: rawId !== 0 ? rawId : -1 },
      create: dataTurma,
      update: dataTurma,
    });
  }

  async findById(id: TurmaId): Promise<Turma | null> {
    const prismaTurma = await this.prisma.turma.findUnique({
      where: { id_turma: id.toValue() },
    });

    if (!prismaTurma) return null;

    return this.toDomain(prismaTurma);
  }

  async findByCodigo(codigo: string): Promise<Turma | null> {
    const prismaTurma = await this.prisma.turma.findUnique({
      where: { codigo_turma: codigo },
    });

    if (!prismaTurma) return null;

    return this.toDomain(prismaTurma);
  }

  async delete(id: TurmaId): Promise<void> {
    await this.prisma.turma.delete({
      where: { id_turma: id.toValue() },
    });
  }

  private toDomain(prismaData: PrismaTurma): Turma {
    return Turma.restore(
      {
        codigo_turma: prismaData.codigo_turma,
        turno: prismaData.turno as string,
        quantidade: prismaData.quantidade,
        semestre: prismaData.semestre,
        id_curso: prismaData.id_curso,
      },
      TurmaId.create(prismaData.id_turma),
    );
  }
}
