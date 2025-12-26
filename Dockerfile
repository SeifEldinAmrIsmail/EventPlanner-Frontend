# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# ---------- Runtime stage (OpenShift compatible) ----------
FROM nginxinc/nginx-unprivileged:alpine

# Copy Angular browser build
COPY --from=build /app/dist/eventplanner-frontend/browser /usr/share/nginx/html

# Custom nginx config (note: unprivileged image reads from /etc/nginx/conf.d/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# OpenShift-friendly port
EXPOSE 8080
