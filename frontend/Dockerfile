FROM node:22-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY data ./data
COPY frontend ./frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
# Browser-side URLs are baked into the JS bundle at build time.
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.js ./next.config.js
USER nextjs
ENV HOSTNAME=0.0.0.0
# Listen port comes from compose env (PORT). EXPOSE is just documentation;
# override at build time with `--build-arg PORT=...` if you need a different
# default for raw `docker run`.
ARG PORT=3000
EXPOSE $PORT
CMD ["npm", "start"]
