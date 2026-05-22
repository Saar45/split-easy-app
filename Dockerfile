# ----- Stage 1 : build -----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# ----- Stage 2 : serve -----
FROM nginx:1.27-alpine

# nginx config (SPA fallback + headers de sécurité)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build Angular (sortie www/ avec le builder browser legacy)
COPY --from=builder /app/www /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
