# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# ---------- Runtime stage ----------
FROM nginx:alpine

# OpenShift runs with random non-root UID -> fix permissions + use 8080
RUN rm -rf /usr/share/nginx/html/* \
    && mkdir -p /var/cache/nginx /var/run /var/log/nginx /tmp/nginx \
    && chgrp -R 0 /var/cache/nginx /var/run /var/log/nginx /etc/nginx /usr/share/nginx/html /tmp/nginx \
    && chmod -R g+rwX /var/cache/nginx /var/run /var/log/nginx /etc/nginx /usr/share/nginx/html /tmp/nginx

# Copy Angular build output
COPY --from=build /app/dist/eventplanner-frontend/browser /usr/share/nginx/html

# Use the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# IMPORTANT: use 8080 in OpenShift
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
