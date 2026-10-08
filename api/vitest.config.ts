import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    // A primeira subida do Nest, com cache frio, passa de 10 s no Windows. Sem folga,
    // o teste de ponta a ponta parece quebrado na primeira execução de cada máquina.
    hookTimeout: 60_000,
  },
});
