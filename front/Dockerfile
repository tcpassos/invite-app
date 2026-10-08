# Imagem do tier Front (ADR-0002). É construída a partir da raiz do repositório,
# porque o build precisa do contract/, que é compilado para dentro dela (Guia, 10.3).
# Nada da API entra aqui: o front fala com ela só por HTTP.

FROM node:24-alpine AS build
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json tsconfig.base.json ./
COPY contract/package.json contract/
COPY api/package.json api/
COPY front/package.json front/
RUN npm ci
COPY contract contract
COPY front front
# O Next.js congela NEXT_PUBLIC_* no bundle do navegador durante o build, então o
# endereço da API como o navegador a alcança precisa chegar aqui (Guia, 10.4).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build --workspace contract && npm run build --workspace front

FROM node:24-alpine
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0
WORKDIR /repo
# A saída standalone já traz o servidor e só as dependências que ele usa.
COPY --from=build /repo/front/.next/standalone ./
COPY --from=build /repo/front/.next/static front/.next/static
COPY --from=build /repo/front/public front/public
USER node
EXPOSE 3000
CMD ["node", "front/server.js"]
