# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# ---------- Runtime stage ----------
FROM nginxinc/nginx-unprivileged:alpine

# Copy Angular build
COPY --from=build /app/dist/eventplanner-frontend/browser /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx-unprivileged listens on 8080
EXPOSE 8080
