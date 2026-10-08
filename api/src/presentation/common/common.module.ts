// As peças da Apresentação que todos os controllers usam: a sessão do anfitrião e o
// limite de taxa. Global, para nenhum módulo de rota precisar importar.
import { Global, Module, type DynamicModule } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.js';
import { SESSION_SECRET, SessionCookie, SessionGuard } from './session.js';

@Global()
@Module({})
export class CommonModule {
  static forRoot(sessionSecret: string): DynamicModule {
    return {
      module: CommonModule,
      providers: [
        { provide: SESSION_SECRET, useValue: sessionSecret },
        SessionCookie,
        SessionGuard,
        // Uma instância só para a API inteira, senão cada módulo contaria a própria janela.
        RateLimitGuard,
      ],
      exports: [SessionCookie, SessionGuard, RateLimitGuard],
    };
  }
}
