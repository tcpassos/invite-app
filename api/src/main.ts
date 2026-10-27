import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';
import { readConfig } from './config.js';

async function main(): Promise<void> {
  const config = readConfig(process.env);
  // O log de requisição sai pelo requestContext, uma linha JSON por requisição (ADR-0012).
  // O logger do framework fica só com aviso e erro, para não misturar formatos.
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(config), {
    logger: ['error', 'warn'],
  });
  // Atrás do proxy da publicação, o IP do socket é o do proxy, e o limite de tráfego por
  // origem contaria todo mundo junto. Com TRUST_PROXY, o Express lê o X-Forwarded-For.
  if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy);
  configureApp(app, { frontOrigin: config.frontOrigin });
  // Fecha o pool do banco quando o container recebe o sinal de parada.
  app.enableShutdownHooks();
  await app.listen(config.port);
  // Uma linha só na subida, no mesmo formato JSON do log de requisição (ADR-0012). Sem ela,
  // uma API no ar e um container que não subiu a API deixam o mesmo log vazio.
  console.log(JSON.stringify({ level: 'info', message: 'API escutando', port: config.port }));
}

await main();
