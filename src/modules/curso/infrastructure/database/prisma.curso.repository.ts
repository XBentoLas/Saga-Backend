import { Prisma, PrismaClient } from '@prisma/client';
import { ICursoRepository } from '../../domain/repository/curso.repository.interface';
import { Curso } from '../../domain/curso';
import { CursoId } from '../../domain/identifier/curso-id';

// Tipo auxiliar para retorno do Prisma com as relações carregadas
type CursoComRelacoes = Prisma.CursoGetPayload<{
  include: {
    turmas: true;
    disciplinas: true;
  };
}>;

export class PrismaCursoRepository implements ICursoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(curso: Curso): Promise<void> {
    const rawId = curso.id.toValue();

    const dataCurso = {
      nome: curso.nome,
      codigo_curso: curso.codigoCurso,
    };

    // 1. Mapeamento de Turmas (1:N - Entidade Filha)
    // Prepara os dados para criação das turmas
    const turmasCreateInput = curso.turmas.map((t) => ({
      semestre: t.semestre,
      quantidade: t.quantidade,
    }));

    // 2. Mapeamento de Disciplinas (N:N - Referência)
    // Prepara os IDs para conexão na tabela pivot
    const disciplinasConnectInput = curso.disciplinaIds.map((id) => ({
      id_disciplina: id.toValue(),
    }));

    await this.prisma.curso.upsert({
      where: { id_curso: rawId !== 0 ? rawId : -1 },

      // --- CRIAÇÃO ---
      create: {
        ...dataCurso,
        // Cria as turmas filhas
        turmas: {
          create: turmasCreateInput,
        },
        // Conecta as disciplinas existentes
        disciplinas: {
          connect: disciplinasConnectInput,
        },
      },

      // --- ATUALIZAÇÃO ---
      update: {
        ...dataCurso,
        // Estratégia de substituição total para Turmas (Igual ao Professor)
        // Remove as antigas e cria as novas para garantir integridade com o objeto de domínio
        turmas: {
          deleteMany: {},
          create: turmasCreateInput,
        },
        // Atualiza a lista de disciplinas conectadas
        disciplinas: {
          set: disciplinasConnectInput,
        },
      },
    });
  }

  async findById(id: CursoId): Promise<Curso | null> {
    const prismaCurso = await this.prisma.curso.findUnique({
      where: { id_curso: id.toValue() },
      include: {
        turmas: true,
        disciplinas: true,
      },
    });

    if (!prismaCurso) return null;

    return this.toDomain(prismaCurso);
  }

  async findByCodigo(codigo: string): Promise<Curso | null> {
    const prismaCurso = await this.prisma.curso.findUnique({
      where: { codigo_curso: codigo },
      include: {
        turmas: true,
        disciplinas: true,
      },
    });

    if (!prismaCurso) return null;

    return this.toDomain(prismaCurso);
  }

  async findAll(): Promise<Curso[]> {
    const prismaCursos = await this.prisma.curso.findMany({
      include: {
        turmas: true,
        disciplinas: true,
      },
    });

    return prismaCursos.map((c) => this.toDomain(c));
  }

  private toDomain(prismaData: CursoComRelacoes): Curso {
    // 1. Mapeia Turmas para o formato esperado pelo restore ({ id, semestre, quantidade })
    const turmasMapped = prismaData.turmas.map((t) => ({
      id_turma: t.id_turma,
      semestre: t.semestre,
      quantidade: t.quantidade,
    }));

    // 2. Mapeia Disciplinas para o formato esperado pelo restore ({ id_disciplina })
    const disciplinasMapped = prismaData.disciplinas.map((d) => ({
      id_disciplina: d.id_disciplina,
    }));

    // 3. Reconstrói o Agregado
    return Curso.restore(
      {
        nome: prismaData.nome,
        codigo_curso: prismaData.codigo_curso,
        turmas: turmasMapped,
        disciplinas: disciplinasMapped,
      },
      CursoId.create(prismaData.id_curso),
    );
  }
}
