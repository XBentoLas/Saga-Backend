import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o módulo disponível globalmente
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // Exporta para que outros serviços usem o banco
})
export class PrismaModule {}