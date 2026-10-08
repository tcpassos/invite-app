-- Esquema inicial, conforme a seção 8.3 do DAS.
-- Tabela e coluna em snake_case. A tradução para os nomes do modelo é feita
-- nos repositórios da camada de Dados (DAS, seção 8.2).

CREATE TABLE host (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  password_hash text NOT NULL
);

-- Email único sem diferenciar maiúscula (UC001 RN3).
CREATE UNIQUE INDEX host_email_unique ON host (lower(email));

CREATE TABLE invite (
  id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  host_id                  bigint NOT NULL REFERENCES host (id),
  event_name               text NOT NULL,
  event_starts_at          timestamptz NOT NULL,
  location                 text NOT NULL,
  status                   text NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
  public_token             text UNIQUE,
  capacity_limit           integer CHECK (capacity_limit > 0),
  max_companions_per_guest integer CHECK (max_companions_per_guest >= 0)
);

-- color_overrides guarda um objeto { papel: valor }. O objeto impede o mesmo papel
-- de cor aparecer duas vezes, e o padrão {} é o documento vazio do DAS.
-- template_code não tem chave estrangeira, porque o catálogo mora no código (estratégia 4).
CREATE TABLE invite_customization (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invite_id       bigint NOT NULL UNIQUE REFERENCES invite (id) ON DELETE CASCADE,
  template_code   text NOT NULL,
  color_overrides jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE guest (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invite_id       bigint NOT NULL REFERENCES invite (id) ON DELETE CASCADE,
  name            text NOT NULL,
  status          text NOT NULL CHECK (status IN ('ACCEPTED', 'DECLINED', 'MAYBE')),
  companion_count integer NOT NULL DEFAULT 0 CHECK (companion_count >= 0),
  personal_token  text NOT NULL UNIQUE,
  responded_at    timestamptz NOT NULL
);

-- Teto de capacidade na transação e as três projeções do painel filtram por
-- convite e por status.
CREATE INDEX guest_invite_status ON guest (invite_id, status);

CREATE TABLE dietary_note (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id  bigint NOT NULL UNIQUE REFERENCES guest (id) ON DELETE CASCADE,
  free_text text
);

CREATE TABLE dietary_category (
  code                 text PRIMARY KEY,
  display_name         text NOT NULL,
  requires_description boolean NOT NULL
);

-- Tabela de associação, sem classe no modelo (estratégia 2).
CREATE TABLE dietary_note_category (
  dietary_note_id bigint NOT NULL REFERENCES dietary_note (id) ON DELETE CASCADE,
  category_code   text NOT NULL REFERENCES dietary_category (code),
  PRIMARY KEY (dietary_note_id, category_code)
);
