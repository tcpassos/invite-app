# migrations

Scripts de esquema do banco, aplicados pelo container `db` na inicialização.

O diretório é montado em `/docker-entrypoint-initdb.d` pelo `docker-compose.yml`. A imagem do PostgreSQL executa os arquivos `.sql` deste diretório em ordem alfabética, **e só quando o volume está vazio**.

| Arquivo | O que faz |
|---|---|
| `001-esquema-inicial.sql` | As sete tabelas da seção 8.3 do DAS |
| `002-carga-de-categorias.sql` | As cinco categorias alimentares da RN3 do UC006 |

Convenção de nome: `NNN-descricao.sql`, com o número em três dígitos e em sequência.

## Toda migração muda dois arquivos

O Kysely verifica as consultas contra a descrição do esquema em `api/src/data/schema.ts`, e não contra o banco (ADR-0014). Se uma migração nova não mudar aquele arquivo no mesmo PR, o código passa a ser verificado contra tabelas que não existem mais.

## O limite desta escolha

Uma migração acrescentada depois da primeira subida **não é aplicada sozinha**. Para aplicar, é preciso derrubar o volume e subir de novo, o que apaga os dados:

```bash
docker compose down -v
docker compose up db
```

Isso é aceitável enquanto o [ADR-0003](../docs/Sprints/Sprint-2/Decisões-Arquiteturais/0003-Ambiente-de-execução.md) valer, porque o ambiente é de desenvolvimento e não guarda dado que alguém precise conservar. A decisão e o custo estão na seção 8.1 do [Diagrama de Implantação](../docs/Sprints/Sprint-2/Diagrama-de-Implantação.md).

**No dia em que o projeto tiver dado que não pode ser perdido, esta escolha cai** e entra uma ferramenta de migração de verdade.
