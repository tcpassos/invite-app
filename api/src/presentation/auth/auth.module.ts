import { Module } from '@nestjs/common';
import { HostService } from '../../domain/host.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  controllers: [AuthController],
  providers: [HostService],
})
export class AuthModule {}
