# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer dépendances
RUN npm ci --only=production

# Copier code source
COPY . .

# Builder l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier build depuis builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier configuration NGINX
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer port 80
EXPOSE 80

# Démarrer NGINX
CMD ["nginx", "-g", "daemon off;"]
