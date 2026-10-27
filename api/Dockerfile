# Imagem do tier API (ADR-0002). É construída a partir da raiz do repositório,
# porque o build precisa do contract/, que é compilado para dentro dela (Guia, 10.3).
# Segredo nenhum entra em camada de imagem: tudo chega por variável de ambiente
# na execução (Guia, 10.4).
# O package.json do front entra só porque o npm ci confere o lockfile do monorepo
# inteiro. Código do front nenhum entra nesta imagem.

FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY contract/package.json contract/
COPY api/package.json api/
COPY front/package.json front/
RUN npm ci
COPY contract contract
COPY api api
RUN npm run build --workspace contract && npm run build --workspace api

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /repo
COPY package.json package-lock.json ./
COPY contract/package.json contract/
COPY api/package.json api/
COPY front/package.json front/
RUN npm ci --omit=dev --workspace api && npm cache clean --force
COPY --from=build /repo/contract/dist contract/dist
COPY --from=build /repo/api/dist api/dist
# Os scripts do banco vão junto só para o comando de pré-deploy da publicação, que os aplica
# num banco vazio (api/src/migrate.ts e ADR-0015). No compose quem aplica é o container db.
COPY migrations migrations
USER node
EXPOSE 3000
CMD ["node", "api/dist/main.js"]
