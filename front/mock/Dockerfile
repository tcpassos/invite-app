# Imagem do mock da API, para ver as telas no compose antes das rotas da API ficarem
# prontas. Entra no lugar do serviço api pelo docker-compose.mock.yml e nunca vai para
# a imagem do front. É construída a partir da raiz, porque o mock lê o contract/.

FROM node:24-alpine
WORKDIR /repo
ENV NODE_ENV=development
COPY package.json package-lock.json tsconfig.base.json ./
COPY contract/package.json contract/
COPY api/package.json api/
COPY front/package.json front/
RUN npm ci --workspace contract --include-workspace-root && npm cache clean --force
COPY contract contract
RUN npm run build --workspace contract
COPY front/mock front/mock
# O Node roda o TypeScript do mock apagando os tipos, sem passo de compilação.
ENV MOCK_HOST=0.0.0.0 MOCK_PORT=3000
USER node
EXPOSE 3000
CMD ["node", "front/mock/mock-api.ts"]
