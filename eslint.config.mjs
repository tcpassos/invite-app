// Configuração de lint do repositório inteiro.
// A parte que mais importa é a regra de camadas no fim do arquivo: ela transforma
// a regra de dependência do ADR-0001 em erro de lint, em vez de depender de revisão.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';

const camada = (pasta) => `./api/src/${pasta}`;
const pacoteDoFront = (pasta) => `./front/src/${pasta}`;

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'docs/**', 'trabalhos/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { 'import-x': importX },
    languageOptions: { globals: { ...globals.node } },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
    rules: {
      // Parâmetro ou variável começando com _ é não usado de propósito.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            // ADR-0001: Domínio e Dados nunca dependem da Apresentação.
            {
              target: camada('domain'),
              from: camada('presentation'),
              message: 'Domínio não importa da Apresentação (ADR-0001).',
            },
            {
              target: camada('data'),
              from: camada('presentation'),
              message: 'Dados não importa da Apresentação (ADR-0001).',
            },
            // DAS 5.1: Dados não importa do Domínio, senão nasce o ciclo dominio e dados.
            {
              target: camada('data'),
              from: camada('domain'),
              message: 'Dados não importa do Domínio (DAS, seção 5.1).',
            },
            // DAS 5.1: model é a base que as outras camadas usam, e não depende de nenhuma.
            {
              target: camada('model'),
              from: [camada('presentation'), camada('domain'), camada('data')],
              message: 'model não importa de nenhuma camada (DAS, seção 5.1).',
            },
            // Guia da Arquitetura, seção 6.2: a Apresentação nunca chama a camada de Dados.
            {
              target: camada('presentation'),
              from: camada('data'),
              message: 'A Apresentação não chama a camada de Dados (Guia da Arquitetura, 6.2).',
            },
            // O front fala com a API só por HTTP, e o contract é compartilhado e não depende de ninguém.
            {
              target: './front',
              from: './api',
              message: 'O front não importa código da API. A conversa é por HTTP.',
            },
            // DAS 5.1: no front, a view usa o controller e o controller não conhece a view.
            {
              target: pacoteDoFront('controller'),
              from: pacoteDoFront('view'),
              message: 'O controller não importa da view (DAS, seção 5.1).',
            },
            // DAS 5.1: templates é ativo estático e não depende de código nenhum.
            {
              target: pacoteDoFront('templates'),
              from: [pacoteDoFront('view'), pacoteDoFront('controller'), pacoteDoFront('app')],
              message: 'templates é ativo estático e não importa código (DAS, seção 5.1).',
            },
            {
              target: './contract',
              from: ['./api', './front'],
              message: 'O contract é compartilhado e não importa da API nem do front.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['front/**/*.{ts,tsx,js,mjs}'],
    plugins: { '@next/next': nextPlugin },
    languageOptions: { globals: { ...globals.browser } },
    settings: { next: { rootDir: 'front/' } },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Guia da Arquitetura, 10.5: o front não fala com o banco, e a rede não impede.
      'no-restricted-imports': [
        'error',
        {
          paths: ['pg', 'kysely'].map((name) => ({
            name,
            message: 'O front não fala com o banco (Guia da Arquitetura, 10.5).',
          })),
        },
      ],
      // ADR-0004 e Guia, 6.4: Next.js é front-end apenas, sem server actions.
      'no-restricted-syntax': [
        'error',
        {
          selector: "ExpressionStatement[directive='use server']",
          message: 'Sem server actions no front (ADR-0004). A regra de negócio fica na API.',
        },
      ],
    },
  },
  prettier,
);
