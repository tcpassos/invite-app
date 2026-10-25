// Os três repositórios da camada de Dados, disponíveis para os serviços do Domínio de
// qualquer módulo.
import { Global, Module } from '@nestjs/common';
import { InviteRepository } from './invite.repository.js';
import { HostRepository } from './host.repository.js';
import { DietaryCategoryRepository } from './dietary-category.repository.js';

@Global()
@Module({
  providers: [InviteRepository, HostRepository, DietaryCategoryRepository],
  exports: [InviteRepository, HostRepository, DietaryCategoryRepository],
})
export class DataModule {}
