// Os repositórios da camada de Dados, disponíveis para todos os módulos do Domínio.
// Cada parte acrescenta aqui o repositório que criar.
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
