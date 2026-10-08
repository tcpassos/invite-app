// Os repositórios da camada de Dados, disponíveis para todos os módulos do Domínio.
// Cada parte acrescenta aqui o repositório que criar.
import { Global, Module } from '@nestjs/common';
import { InviteRepository } from './invite.repository.js';

@Global()
@Module({
  providers: [InviteRepository],
  exports: [InviteRepository],
})
export class DataModule {}
