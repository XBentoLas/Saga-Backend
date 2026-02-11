import { Prisma, PrismaClient } from '@prisma/client';
import { IDisciplinaRepository } from '../../domain/repository/disciplina.repository.interface';
import { Disciplina } from '../../domain/disciplina';
import { DisciplinaId } from '../../domain/identifier/disciplina-id';


// Definição do tipo retornado pelo Prisma com os includes necessários
type DisciplinaComRelacoes = Prisma.DisciplinaGetPayload<{
  include: {
    cursos: true; // Tabela de Junção/Relação
    professores: true; // Tabela de Junção/Relação
  };
}>;

export class PrismaDisciplinaRepository implements IDisciplinaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(disciplina: Disciplina): Promise<void> {
    const rawId = disciplina.id.toValue();

    const dataDisciplina = {
      nome: disciplina.nome,
      codigo_disciplina: disciplina.codigoDisciplina,
    };

    // Prepara os arrays de conexão para o Prisma (Many-to-Many)
    // O Prisma espera array de { id_coluna: valor }
    const cursosConnectInput = disciplina.cursoIds.map((id) => ({
      id_curso: id.toValue(),
    }));

    const professoresConnectInput = disciplina.professorIds.map((id) => ({
      id_professor: id.toValue(),
    }));

    await this.prisma.disciplina.upsert({
      where: { id_disciplina: rawId !== 0 ? rawId : -1 },

      // --- CREATE ---
      create: {
        ...dataDisciplina,
        cursos: {
          connect: cursosConnectInput,
        },
        professores: {
          connect: professoresConnectInput,
        },
      },

      // --- UPDATE ---
      update: {
        ...dataDisciplina,
        // 'set' substitui todas as relações anteriores pelas atuais.
        // O que não estiver na lista nova é removido do banco.
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
    // Busca todas as disciplinas que possuem o curso X na sua lista de cursos
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
    // 1. Mapeia array de Cursos do Prisma para { id_curso: number }[]
    // A entidade não precisa dos dados completos do curso, apenas da referência
    const cursosMapped = prismaData.cursos.map((c) => ({
      id_curso: c.id_curso,
    }));

    // 2. Mapeia array de Professores do Prisma para { id_professor: number }[]
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
