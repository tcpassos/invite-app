import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';
import { readConfig } from './config.js';

async function main(): Promise<void> {
  const config = readConfig(process.env);
  // O log de requisição sai pelo requestContext, uma linha JSON por requisição (ADR-0012).
  // O logger do framework fica só com aviso e erro, para não misturar formatos.
  const app = await NestFactory.create(AppModule.forRoot(config), { logger: ['error', 'warn'] });
  configureApp(app, { frontOrigin: config.frontOrigin });
  // Fecha o pool do banco quando o container recebe o sinal de parada.
  app.enableShutdownHooks();
  await app.listen(config.port);
}

await main();
