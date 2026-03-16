import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { PredioModule } from './modules/predio/predio.module';
import { DisciplinaModule } from './modules/disciplina/disciplina.module';
import { CursoModule } from './modules/curso/curso.module';
import { UserModule } from './modules/user/user.module';
import { AgendamentoModule } from './modules/agendamento/agendamento.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PrismaModule,
    ProfessorModule,
    PredioModule,
    DisciplinaModule,
    CursoModule,
    UserModule,
    AgendamentoModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'SYS:standard',
                  singleLine: true,
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
