# migrations

Scripts de esquema do banco, aplicados pelo container `db` na inicialização.

O diretório é montado em `/docker-entrypoint-initdb.d` pelo `docker-compose.yml`. A imagem do PostgreSQL executa os arquivos `.sql` deste diretório em ordem alfabética, **e só quando o volume está vazio**.

Convenção de nome: `NNN-descricao.sql`, com o número em três dígitos e em sequência. Por exemplo `001-esquema-inicial.sql` e `002-carga-de-categorias.sql`.

## O limite desta escolha

Uma migração acrescentada depois da primeira subida **não é aplicada sozinha**. A imagem só roda este diretório quando inicializa um volume vazio. Para aplicar, é preciso derrubar o volume e subir de novo, o que apaga os dados:

```bash
docker compose down -v
docker compose up db
```

Isso é aceitável enquanto o [ADR-0003](../docs/Diretrizes-do-Projeto/Decisões-Arquiteturais/0003-Ambiente-de-execução.md) valer, porque o ambiente é de desenvolvimento e não guarda dado que alguém precise conservar. A decisão e o custo estão na seção 8.1 do [Diagrama de Implantação](../docs/Sprints/Sprint-2/Diagrama-de-Implantação.md).

**No dia em que o projeto tiver dado que não pode ser perdido, esta escolha cai** e entra uma ferramenta de migração de verdade.

## O que ainda não existe

Nenhum `.sql` foi escrito. O esquema sai do [Diagrama de Classes](../docs/Sprints/Sprint-2/Diagrama-de-Classes.md) e é trabalho da Sprint 3. A carga inicial de `dietary_category` também, e ela depende de uma pendência aberta: as cinco categorias alimentares não estão congeladas por regra em artefato nenhum.
